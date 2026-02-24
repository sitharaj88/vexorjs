/**
 * PostgreSQL Driver
 *
 * High-performance PostgreSQL driver with prepared statement caching,
 * connection pooling integration, and full type support.
 */

import type { DatabaseConfig, DatabaseDriver, QueryResult } from '../core/types.js';

/**
 * PostgreSQL specific configuration
 */
export interface PostgresConfig extends DatabaseConfig {
  driver: 'postgres';
  /** SSL mode */
  ssl?: boolean | PostgresSSLConfig;
  /** Application name for monitoring */
  applicationName?: string;
  /** Statement timeout in ms */
  statementTimeout?: number;
  /** Query timeout in ms */
  queryTimeout?: number;
  /** Enable prepared statement caching */
  preparedStatementCache?: boolean;
  /** Max prepared statements to cache */
  maxCachedStatements?: number;
}

/**
 * SSL configuration
 */
export interface PostgresSSLConfig {
  rejectUnauthorized?: boolean;
  ca?: string;
  cert?: string;
  key?: string;
}

/**
 * Cached prepared statement
 */
interface PreparedStatement {
  name: string;
  sql: string;
  paramCount: number;
  usageCount: number;
  lastUsed: Date;
}

/**
 * PostgreSQL connection interface
 * This is the interface we expect from pg library
 */
interface PgClient {
  query(sql: string, params?: unknown[]): Promise<PgQueryResult>;
  query(config: { name?: string; text: string; values?: unknown[] }): Promise<PgQueryResult>;
  end(): Promise<void>;
  on(event: string, listener: (...args: unknown[]) => void): void;
}

interface PgQueryResult {
  rows: unknown[];
  rowCount: number | null;
  fields: Array<{ name: string; dataTypeID: number }>;
}

interface PgPool {
  connect(): Promise<PgClient>;
  end(): Promise<void>;
  on(event: string, listener: (...args: unknown[]) => void): void;
}

/**
 * PostgreSQL type OIDs for common types
 */
const PG_TYPE_OIDS = {
  BOOL: 16,
  INT2: 21,
  INT4: 23,
  INT8: 20,
  FLOAT4: 700,
  FLOAT8: 701,
  NUMERIC: 1700,
  TEXT: 25,
  VARCHAR: 1043,
  CHAR: 1042,
  DATE: 1082,
  TIME: 1083,
  TIMESTAMP: 1114,
  TIMESTAMPTZ: 1184,
  JSON: 114,
  JSONB: 3802,
  UUID: 2950,
  BYTEA: 17,
  ARRAY: 1007,
} as const;

/**
 * PostgreSQL module type (loaded dynamically)
 */
interface PgModule {
  Pool: new (config: Record<string, unknown>) => PgPool;
  Client: new (config: Record<string, unknown>) => PgClient & { connect(): Promise<void> };
}

/**
 * PostgreSQL Driver Implementation
 */
export class PostgresDriver implements DatabaseDriver {
  private config: PostgresConfig;
  private client: PgClient | null = null;
  private pool: PgPool | null = null;
  private preparedStatements: Map<string, PreparedStatement> = new Map();
  private statementCounter = 0;
  private pg: PgModule | null = null;

  constructor(config: PostgresConfig) {
    this.config = {
      preparedStatementCache: true,
      maxCachedStatements: 100,
      ...config,
    };
  }

  /**
   * Connect to PostgreSQL
   */
  async connect(): Promise<void> {
    // Dynamically import pg
    this.pg = await this.loadPgDriver();

    const connectionConfig = this.buildConnectionConfig();

    if (this.config.pool === true) {
      // Use connection pool
      this.pool = new this.pg.Pool(connectionConfig);
      this.client = await this.pool.connect();
    } else {
      // Direct connection
      const client = new this.pg.Client(connectionConfig);
      await client.connect();
      this.client = client;
    }

    // Set statement timeout if configured
    if (this.config.statementTimeout) {
      await this.query(`SET statement_timeout = ${this.config.statementTimeout}`);
    }
  }

  /**
   * Execute a query
   */
  async query<T = unknown>(
    sql: string,
    params?: unknown[]
  ): Promise<QueryResult<T>> {
    if (!this.client) {
      throw new Error('Not connected to PostgreSQL');
    }

    const normalizedParams = params?.map((p) => this.normalizeParam(p));

    let result: PgQueryResult;

    // Use prepared statement if caching is enabled and query is parameterized
    if (
      this.config.preparedStatementCache &&
      normalizedParams &&
      normalizedParams.length > 0
    ) {
      const prepared = this.getOrCreatePreparedStatement(
        sql,
        normalizedParams.length
      );
      result = await this.client.query({
        name: prepared.name,
        text: sql,
        values: normalizedParams,
      });
      prepared.usageCount++;
      prepared.lastUsed = new Date();
    } else {
      result = await this.client.query(sql, normalizedParams);
    }

    return {
      rows: result.rows.map((row) => this.parseRow<T>(row, result.fields)),
      rowCount: result.rowCount ?? 0,
      fields: result.fields.map((f) => ({
        name: f.name,
        type: this.oidToType(f.dataTypeID),
      })),
    };
  }

  /**
   * Close connection
   */
  async close(): Promise<void> {
    if (this.client) {
      await this.client.end();
      this.client = null;
    }
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
    this.preparedStatements.clear();
  }

  /**
   * Load pg driver dynamically
   */
  private async loadPgDriver(): Promise<PgModule> {
    try {
      // Use Function to avoid TypeScript trying to resolve the module
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (Function('return import("pg")')() as Promise<any>);
    } catch {
      throw new Error(
        'PostgreSQL driver (pg) not installed. Run: npm install pg'
      );
    }
  }

  /**
   * Build connection configuration
   */
  private buildConnectionConfig(): Record<string, unknown> {
    const config: Record<string, unknown> = {};

    if (this.config.connectionString) {
      config.connectionString = this.config.connectionString;
    } else {
      config.host = this.config.host ?? 'localhost';
      config.port = this.config.port ?? 5432;
      config.database = this.config.database;
      config.user = this.config.user;
      config.password = this.config.password;
    }

    if (this.config.ssl !== undefined) {
      config.ssl = this.config.ssl;
    }

    if (this.config.applicationName) {
      config.application_name = this.config.applicationName;
    }

    if (this.config.queryTimeout) {
      config.query_timeout = this.config.queryTimeout;
    }

    return config;
  }

  /**
   * Get or create a prepared statement
   */
  private getOrCreatePreparedStatement(
    sql: string,
    paramCount: number
  ): PreparedStatement {
    const key = `${sql}:${paramCount}`;

    if (this.preparedStatements.has(key)) {
      return this.preparedStatements.get(key)!;
    }

    // Evict old statements if at capacity
    if (this.preparedStatements.size >= (this.config.maxCachedStatements ?? 100)) {
      this.evictOldestStatement();
    }

    const statement: PreparedStatement = {
      name: `stmt_${++this.statementCounter}`,
      sql,
      paramCount,
      usageCount: 0,
      lastUsed: new Date(),
    };

    this.preparedStatements.set(key, statement);
    return statement;
  }

  /**
   * Evict the oldest statement from cache
   */
  private evictOldestStatement(): void {
    let oldest: [string, PreparedStatement] | null = null;

    for (const entry of this.preparedStatements.entries()) {
      if (!oldest || entry[1].lastUsed < oldest[1].lastUsed) {
        oldest = entry;
      }
    }

    if (oldest) {
      this.preparedStatements.delete(oldest[0]);
    }
  }

  /**
   * Normalize parameter for PostgreSQL
   */
  private normalizeParam(param: unknown): unknown {
    if (param === undefined) {
      return null;
    }

    if (param instanceof Date) {
      return param.toISOString();
    }

    if (typeof param === 'object' && param !== null && !Array.isArray(param)) {
      return JSON.stringify(param);
    }

    return param;
  }

  /**
   * Parse a row with type conversion
   */
  private parseRow<T>(
    row: unknown,
    fields: Array<{ name: string; dataTypeID: number }>
  ): T {
    if (typeof row !== 'object' || row === null) {
      return row as T;
    }

    const parsed: Record<string, unknown> = {};

    for (const field of fields) {
      const value = (row as Record<string, unknown>)[field.name];
      parsed[field.name] = this.parseValue(value, field.dataTypeID);
    }

    return parsed as T;
  }

  /**
   * Parse a value based on PostgreSQL type OID
   */
  private parseValue(value: unknown, typeOid: number): unknown {
    if (value === null || value === undefined) {
      return null;
    }

    switch (typeOid) {
      case PG_TYPE_OIDS.BOOL:
        return Boolean(value);

      case PG_TYPE_OIDS.INT2:
      case PG_TYPE_OIDS.INT4:
        return typeof value === 'string' ? parseInt(value, 10) : Number(value);

      case PG_TYPE_OIDS.INT8:
        // Keep as string for bigint to avoid precision loss
        return typeof value === 'string' ? value : String(value);

      case PG_TYPE_OIDS.FLOAT4:
      case PG_TYPE_OIDS.FLOAT8:
      case PG_TYPE_OIDS.NUMERIC:
        return typeof value === 'string' ? parseFloat(value) : Number(value);

      case PG_TYPE_OIDS.DATE:
      case PG_TYPE_OIDS.TIMESTAMP:
      case PG_TYPE_OIDS.TIMESTAMPTZ:
        return value instanceof Date ? value : new Date(value as string);

      case PG_TYPE_OIDS.JSON:
      case PG_TYPE_OIDS.JSONB:
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch {
            return value;
          }
        }
        return value;

      default:
        return value;
    }
  }

  /**
   * Convert PostgreSQL type OID to string type name
   */
  private oidToType(oid: number): string {
    const typeMap: Record<number, string> = {
      [PG_TYPE_OIDS.BOOL]: 'boolean',
      [PG_TYPE_OIDS.INT2]: 'integer',
      [PG_TYPE_OIDS.INT4]: 'integer',
      [PG_TYPE_OIDS.INT8]: 'bigint',
      [PG_TYPE_OIDS.FLOAT4]: 'float',
      [PG_TYPE_OIDS.FLOAT8]: 'double',
      [PG_TYPE_OIDS.NUMERIC]: 'decimal',
      [PG_TYPE_OIDS.TEXT]: 'text',
      [PG_TYPE_OIDS.VARCHAR]: 'varchar',
      [PG_TYPE_OIDS.CHAR]: 'char',
      [PG_TYPE_OIDS.DATE]: 'date',
      [PG_TYPE_OIDS.TIME]: 'time',
      [PG_TYPE_OIDS.TIMESTAMP]: 'timestamp',
      [PG_TYPE_OIDS.TIMESTAMPTZ]: 'timestamptz',
      [PG_TYPE_OIDS.JSON]: 'json',
      [PG_TYPE_OIDS.JSONB]: 'jsonb',
      [PG_TYPE_OIDS.UUID]: 'uuid',
      [PG_TYPE_OIDS.BYTEA]: 'bytea',
    };

    return typeMap[oid] ?? 'unknown';
  }
}

/**
 * Create a PostgreSQL driver
 */
export function createPostgresDriver(config: PostgresConfig): PostgresDriver {
  return new PostgresDriver(config);
}

/**
 * Create a PostgreSQL driver factory for connection pool
 */
export function createPostgresDriverFactory(
  config: PostgresConfig
): () => Promise<PostgresDriver> {
  return async () => {
    const driver = new PostgresDriver(config);
    await driver.connect();
    return driver;
  };
}
