/**
 * SQLite Driver
 *
 * High-performance SQLite driver with support for both
 * better-sqlite3 (sync) and sql.js (async/WASM).
 */

import type { DatabaseConfig, DatabaseDriver, QueryResult } from '../core/types.js';

/**
 * SQLite specific configuration
 */
export interface SQLiteConfig extends DatabaseConfig {
  driver: 'sqlite';
  /** Database file path or :memory: */
  filename: string;
  /** Use WAL mode for better concurrency */
  walMode?: boolean;
  /** Enable foreign keys */
  foreignKeys?: boolean;
  /** Busy timeout in ms */
  busyTimeout?: number;
  /** Use synchronous mode */
  synchronous?: 'OFF' | 'NORMAL' | 'FULL' | 'EXTRA';
  /** Cache size in KB */
  cacheSize?: number;
  /** Use sql.js (WASM) instead of better-sqlite3 */
  useWasm?: boolean;
}

/**
 * better-sqlite3 interfaces
 */
interface BetterSQLite3Database {
  prepare(sql: string): BetterSQLite3Statement;
  exec(sql: string): void;
  pragma(pragma: string): unknown;
  close(): void;
}

interface BetterSQLite3Statement {
  run(...params: unknown[]): BetterSQLite3RunResult;
  all(...params: unknown[]): unknown[];
  get(...params: unknown[]): unknown;
  columns(): Array<{ name: string; type: string | null }>;
}

interface BetterSQLite3RunResult {
  changes: number;
  lastInsertRowid: number | bigint;
}

/**
 * sql.js (WASM) interfaces
 */
interface SqlJsDatabase {
  run(sql: string, params?: unknown[]): void;
  exec(sql: string): SqlJsExecResult[];
  prepare(sql: string): SqlJsStatement;
  close(): void;
}

interface SqlJsExecResult {
  columns: string[];
  values: unknown[][];
}

interface SqlJsStatement {
  bind(params?: unknown[]): boolean;
  step(): boolean;
  getAsObject(): Record<string, unknown>;
  getColumnNames(): string[];
  free(): void;
}

/**
 * SQLite Driver Implementation
 */
export class SQLiteDriver implements DatabaseDriver {
  private config: SQLiteConfig;
  private db: BetterSQLite3Database | SqlJsDatabase | null = null;
  private isWasm = false;
  private statementCache: Map<string, BetterSQLite3Statement> = new Map();

  constructor(config: SQLiteConfig) {
    this.config = {
      walMode: true,
      foreignKeys: true,
      busyTimeout: 5000,
      synchronous: 'NORMAL',
      cacheSize: 2000,
      ...config,
    };
    this.isWasm = config.useWasm ?? false;
  }

  /**
   * Connect to SQLite database
   */
  async connect(): Promise<void> {
    if (this.isWasm) {
      await this.connectWasm();
    } else {
      await this.connectNative();
    }

    // Configure database
    await this.configurePragmas();
  }

  /**
   * Execute a query
   */
  async query<T = unknown>(
    sql: string,
    params?: unknown[]
  ): Promise<QueryResult<T>> {
    if (!this.db) {
      throw new Error('Not connected to SQLite');
    }

    const normalizedParams = params?.map((p) => this.normalizeParam(p));

    if (this.isWasm) {
      return this.queryWasm<T>(sql, normalizedParams);
    } else {
      return this.queryNative<T>(sql, normalizedParams);
    }
  }

  /**
   * Close connection
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.statementCache.clear();
  }

  /**
   * Connect using better-sqlite3 (native)
   */
  private async connectNative(): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mod = await (Function('return import("better-sqlite3")')() as Promise<any>);
      const Database = mod.default;
      this.db = new Database(this.config.filename) as unknown as BetterSQLite3Database;
    } catch {
      throw new Error(
        'SQLite driver (better-sqlite3) not installed. Run: npm install better-sqlite3'
      );
    }
  }

  /**
   * Connect using sql.js (WASM)
   */
  private async connectWasm(): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mod = await (Function('return import("sql.js")')() as Promise<any>);
      const initSqlJs = mod.default;
      const SQL = await initSqlJs();

      if (this.config.filename === ':memory:') {
        this.db = new SQL.Database() as unknown as SqlJsDatabase;
      } else {
        // Load from file would need fs
        throw new Error('sql.js file-based databases not supported in browser');
      }
    } catch (error) {
      if ((error as Error).message.includes('not supported')) {
        throw error;
      }
      throw new Error(
        'SQLite WASM driver (sql.js) not installed. Run: npm install sql.js'
      );
    }
  }

  /**
   * Configure SQLite pragmas
   */
  private async configurePragmas(): Promise<void> {
    if (!this.db) return;

    const pragmas: string[] = [];

    if (this.config.walMode) {
      pragmas.push('PRAGMA journal_mode = WAL');
    }

    if (this.config.foreignKeys) {
      pragmas.push('PRAGMA foreign_keys = ON');
    }

    if (this.config.busyTimeout) {
      pragmas.push(`PRAGMA busy_timeout = ${this.config.busyTimeout}`);
    }

    if (this.config.synchronous) {
      pragmas.push(`PRAGMA synchronous = ${this.config.synchronous}`);
    }

    if (this.config.cacheSize) {
      pragmas.push(`PRAGMA cache_size = -${this.config.cacheSize}`);
    }

    for (const pragma of pragmas) {
      await this.query(pragma);
    }
  }

  /**
   * Execute query using better-sqlite3
   */
  private queryNative<T>(
    sql: string,
    params?: unknown[]
  ): QueryResult<T> {
    const db = this.db as BetterSQLite3Database;

    // Check if this is a SELECT query
    const trimmedSql = sql.trim().toUpperCase();
    const isSelect =
      trimmedSql.startsWith('SELECT') ||
      trimmedSql.startsWith('PRAGMA') ||
      trimmedSql.startsWith('EXPLAIN');

    // Get or create prepared statement
    let stmt = this.statementCache.get(sql);
    if (!stmt) {
      stmt = db.prepare(sql);
      // Only cache frequently used statements
      if (this.statementCache.size < 100) {
        this.statementCache.set(sql, stmt);
      }
    }

    if (isSelect) {
      const rows = params ? stmt.all(...params) : stmt.all();
      const columns = stmt.columns();

      return {
        rows: rows.map((row) => this.parseRow<T>(row as Record<string, unknown>)),
        rowCount: rows.length,
        fields: columns.map((col) => ({
          name: col.name,
          type: col.type ?? 'unknown',
        })),
      };
    } else {
      const result = params ? stmt.run(...params) : stmt.run();

      return {
        rows: [] as T[],
        rowCount: result.changes,
        fields: [],
        lastInsertId:
          typeof result.lastInsertRowid === 'bigint'
            ? Number(result.lastInsertRowid)
            : result.lastInsertRowid,
      };
    }
  }

  /**
   * Execute query using sql.js (WASM)
   */
  private queryWasm<T>(
    sql: string,
    params?: unknown[]
  ): QueryResult<T> {
    const db = this.db as SqlJsDatabase;

    const trimmedSql = sql.trim().toUpperCase();
    const isSelect =
      trimmedSql.startsWith('SELECT') ||
      trimmedSql.startsWith('PRAGMA') ||
      trimmedSql.startsWith('EXPLAIN');

    if (isSelect) {
      const stmt = db.prepare(sql);
      if (params) {
        stmt.bind(params);
      }

      const rows: T[] = [];
      const columnNames = stmt.getColumnNames();

      while (stmt.step()) {
        const row = stmt.getAsObject() as T;
        rows.push(this.parseRow<T>(row as Record<string, unknown>));
      }
      stmt.free();

      return {
        rows,
        rowCount: rows.length,
        fields: columnNames.map((name) => ({
          name,
          type: 'unknown',
        })),
      };
    } else {
      db.run(sql, params);

      // sql.js doesn't provide changes/lastInsertRowid easily
      // Would need to query it separately
      return {
        rows: [] as T[],
        rowCount: 0,
        fields: [],
      };
    }
  }

  /**
   * Normalize parameter for SQLite
   */
  private normalizeParam(param: unknown): unknown {
    if (param === undefined) {
      return null;
    }

    if (param instanceof Date) {
      return param.toISOString();
    }

    if (typeof param === 'boolean') {
      return param ? 1 : 0;
    }

    if (typeof param === 'object' && param !== null && !Array.isArray(param)) {
      return JSON.stringify(param);
    }

    return param;
  }

  /**
   * Parse a row with type conversion
   */
  private parseRow<T>(row: Record<string, unknown>): T {
    const parsed: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(row)) {
      parsed[key] = this.parseValue(value);
    }

    return parsed as T;
  }

  /**
   * Parse a value with type inference
   */
  private parseValue(value: unknown): unknown {
    if (value === null || value === undefined) {
      return null;
    }

    // SQLite stores booleans as integers
    if (typeof value === 'number' && (value === 0 || value === 1)) {
      // Can't reliably determine if it's a boolean or number
      // Return as-is and let the caller handle it
      return value;
    }

    // Try to parse JSON for text that looks like JSON
    if (typeof value === 'string') {
      if (
        (value.startsWith('{') && value.endsWith('}')) ||
        (value.startsWith('[') && value.endsWith(']'))
      ) {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }

      // Try to parse ISO date strings
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }

    return value;
  }

  /**
   * Get last insert rowid
   */
  async getLastInsertId(): Promise<number> {
    const result = await this.query<{ id: number }>('SELECT last_insert_rowid() as id');
    return result.rows[0]?.id ?? 0;
  }

  /**
   * Get number of changes from last query
   */
  async getChanges(): Promise<number> {
    const result = await this.query<{ changes: number }>('SELECT changes() as changes');
    return result.rows[0]?.changes ?? 0;
  }
}

/**
 * Create a SQLite driver
 */
export function createSQLiteDriver(config: SQLiteConfig): SQLiteDriver {
  return new SQLiteDriver(config);
}

/**
 * Create a SQLite driver factory for connection pool
 */
export function createSQLiteDriverFactory(
  config: SQLiteConfig
): () => Promise<SQLiteDriver> {
  return async () => {
    const driver = new SQLiteDriver(config);
    await driver.connect();
    return driver;
  };
}

/**
 * Create an in-memory SQLite database (useful for testing)
 */
export async function createMemoryDatabase(): Promise<SQLiteDriver> {
  const driver = new SQLiteDriver({
    driver: 'sqlite',
    filename: ':memory:',
  });
  await driver.connect();
  return driver;
}
