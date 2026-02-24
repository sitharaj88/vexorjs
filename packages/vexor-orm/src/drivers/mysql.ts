/**
 * MySQL Driver
 *
 * MySQL/MariaDB database driver using mysql2.
 * Supports connection pooling, prepared statements, and transactions.
 */

import type {
  DatabaseConfig,
  DatabaseDriver,
  QueryResult,
  Transaction,
} from '../core/types.js';

// ============================================================================
// Types
// ============================================================================

export interface MySQLConfig extends DatabaseConfig {
  driver: 'mysql';
  /** MySQL host */
  host?: string;
  /** MySQL port (default: 3306) */
  port?: number;
  /** Database name */
  database?: string;
  /** Username */
  user?: string;
  /** Password */
  password?: string;
  /** Connection string (alternative to individual params) */
  connectionString?: string;
  /** SSL configuration */
  ssl?: boolean | MySQLSSLConfig;
  /** Connection timeout in ms */
  connectTimeout?: number;
  /** Enable multiple statements */
  multipleStatements?: boolean;
  /** Timezone */
  timezone?: string;
  /** Character set */
  charset?: string;
  /** Date strings instead of Date objects */
  dateStrings?: boolean;
  /** Enable JSON column type */
  jsonSupport?: boolean;
}

export interface MySQLSSLConfig {
  /** Path to CA certificate */
  ca?: string;
  /** Path to client certificate */
  cert?: string;
  /** Path to client key */
  key?: string;
  /** Reject unauthorized certificates */
  rejectUnauthorized?: boolean;
}

export interface MySQLPoolConfig extends MySQLConfig {
  /** Minimum pool size */
  minConnections?: number;
  /** Maximum pool size */
  maxConnections?: number;
  /** Connection idle timeout in ms */
  idleTimeout?: number;
  /** Queue timeout in ms */
  queueTimeout?: number;
}

// MySQL result types
interface MySQLQueryResult {
  affectedRows?: number;
  insertId?: number;
  changedRows?: number;
}

interface MySQLFieldInfo {
  name: string;
  type: number;
  length: number;
  db: string;
  table: string;
}

// Type mapping for MySQL data types
const MYSQL_TYPES: Record<number, string> = {
  0: 'decimal',
  1: 'tinyint',
  2: 'smallint',
  3: 'int',
  4: 'float',
  5: 'double',
  6: 'null',
  7: 'timestamp',
  8: 'bigint',
  9: 'mediumint',
  10: 'date',
  11: 'time',
  12: 'datetime',
  13: 'year',
  14: 'date',
  15: 'varchar',
  16: 'bit',
  245: 'json',
  246: 'decimal',
  247: 'enum',
  248: 'set',
  249: 'tinyblob',
  250: 'mediumblob',
  251: 'longblob',
  252: 'blob',
  253: 'varchar',
  254: 'char',
  255: 'geometry',
};

function getMySQLType(typeId: number): string {
  return MYSQL_TYPES[typeId] || 'unknown';
}

// ============================================================================
// MySQL Driver Factory
// ============================================================================

/**
 * Create MySQL driver factory
 * Note: Requires mysql2 package to be installed
 */
export function createMySQLDriverFactory(config: MySQLConfig) {
  return async (): Promise<DatabaseDriver> => {
    // Dynamic import of mysql2
    let mysql: any;
    try {
      mysql = await import('mysql2/promise' as string);
    } catch {
      throw new Error(
        'mysql2 package is required for MySQL driver. Install it with: npm install mysql2'
      );
    }

    // Parse connection string if provided
    let connectionConfig: any;
    if (config.connectionString) {
      const url = new URL(config.connectionString);
      connectionConfig = {
        host: url.hostname,
        port: parseInt(url.port) || 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1),
      };
    } else {
      connectionConfig = {
        host: config.host || 'localhost',
        port: config.port || 3306,
        user: config.user,
        password: config.password,
        database: config.database,
      };
    }

    // Add optional config
    if (config.ssl) {
      connectionConfig.ssl =
        typeof config.ssl === 'boolean' ? {} : config.ssl;
    }
    if (config.connectTimeout) {
      connectionConfig.connectTimeout = config.connectTimeout;
    }
    if (config.multipleStatements) {
      connectionConfig.multipleStatements = config.multipleStatements;
    }
    if (config.timezone) {
      connectionConfig.timezone = config.timezone;
    }
    if (config.charset) {
      connectionConfig.charset = config.charset;
    }
    if (config.dateStrings !== undefined) {
      connectionConfig.dateStrings = config.dateStrings;
    }

    // Create connection
    const connection = await mysql.createConnection(connectionConfig);

    const driver: DatabaseDriver = {
      async query<T = Record<string, unknown>>(
        sql: string,
        params?: unknown[]
      ): Promise<QueryResult<T>> {
        try {
          const [rows, fields] = await connection.execute(sql, params || []);

          // Handle INSERT/UPDATE/DELETE results
          if (!Array.isArray(rows)) {
            const result = rows as MySQLQueryResult;
            return {
              rows: [] as T[],
              rowCount: result.affectedRows || 0,
              lastInsertId: result.insertId,
            };
          }

          return {
            rows: rows as T[],
            rowCount: rows.length,
            fields: (fields as MySQLFieldInfo[])?.map((f) => ({
              name: f.name,
              type: getMySQLType(f.type),
            })),
          };
        } catch (error) {
          throw error;
        }
      },

      async close(): Promise<void> {
        await connection.end();
      },
    };

    return driver;
  };
}

// ============================================================================
// Transaction Support
// ============================================================================

/**
 * Create a transaction from a MySQL connection
 */
export async function createMySQLTransaction(
  connection: any
): Promise<Transaction> {
  await connection.beginTransaction();

  return {
    async query<T = unknown>(
      sql: string,
      params?: unknown[]
    ): Promise<QueryResult<T>> {
      const [rows, fields] = await connection.execute(sql, params || []);

      if (!Array.isArray(rows)) {
        const result = rows as MySQLQueryResult;
        return {
          rows: [] as T[],
          rowCount: result.affectedRows || 0,
          lastInsertId: result.insertId,
        };
      }

      return {
        rows: rows as T[],
        rowCount: rows.length,
        fields: (fields as MySQLFieldInfo[])?.map((f) => ({
          name: f.name,
          type: getMySQLType(f.type),
        })),
      };
    },

    async execute<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
      const [rows] = await connection.execute(sql, params || []);
      return Array.isArray(rows) ? rows : [];
    },

    async commit(): Promise<void> {
      await connection.commit();
    },

    async rollback(): Promise<void> {
      await connection.rollback();
    },
  };
}

// ============================================================================
// Connection Pool Factory
// ============================================================================

/**
 * MySQL pool interface
 */
export interface MySQLPool {
  getConnection(): Promise<DatabaseDriver>;
  query<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[]
  ): Promise<QueryResult<T>>;
  close(): Promise<void>;
}

/**
 * Create MySQL connection pool
 */
export function createMySQLPool(config: MySQLPoolConfig) {
  return async (): Promise<MySQLPool> => {
    let mysql: any;
    try {
      mysql = await import('mysql2/promise' as string);
    } catch {
      throw new Error(
        'mysql2 package is required for MySQL driver. Install it with: npm install mysql2'
      );
    }

    // Build pool config
    let poolConfig: any;
    if (config.connectionString) {
      const url = new URL(config.connectionString);
      poolConfig = {
        host: url.hostname,
        port: parseInt(url.port) || 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1),
      };
    } else {
      poolConfig = {
        host: config.host || 'localhost',
        port: config.port || 3306,
        user: config.user,
        password: config.password,
        database: config.database,
      };
    }

    // Pool-specific options
    poolConfig.waitForConnections = true;
    poolConfig.connectionLimit = config.maxConnections || 10;
    poolConfig.queueLimit = 0;

    if (config.idleTimeout) {
      poolConfig.idleTimeout = config.idleTimeout;
    }

    // Add optional config
    if (config.ssl) {
      poolConfig.ssl = typeof config.ssl === 'boolean' ? {} : config.ssl;
    }
    if (config.timezone) {
      poolConfig.timezone = config.timezone;
    }
    if (config.charset) {
      poolConfig.charset = config.charset;
    }

    const pool = mysql.createPool(poolConfig);

    return {
      async getConnection(): Promise<DatabaseDriver> {
        const connection = await pool.getConnection();

        const driver: DatabaseDriver = {
          async query<T = Record<string, unknown>>(
            sql: string,
            params?: unknown[]
          ): Promise<QueryResult<T>> {
            const [rows, fields] = await connection.execute(sql, params || []);

            if (!Array.isArray(rows)) {
              const result = rows as MySQLQueryResult;
              return {
                rows: [] as T[],
                rowCount: result.affectedRows || 0,
                lastInsertId: result.insertId,
              };
            }

            return {
              rows: rows as T[],
              rowCount: rows.length,
              fields: (fields as MySQLFieldInfo[])?.map((f) => ({
                name: f.name,
                type: getMySQLType(f.type),
              })),
            };
          },

          async close(): Promise<void> {
            connection.release();
          },
        };

        return driver;
      },

      async query<T = Record<string, unknown>>(
        sql: string,
        params?: unknown[]
      ): Promise<QueryResult<T>> {
        const [rows, fields] = await pool.execute(sql, params || []);

        if (!Array.isArray(rows)) {
          const result = rows as MySQLQueryResult;
          return {
            rows: [] as T[],
            rowCount: result.affectedRows || 0,
            lastInsertId: result.insertId,
          };
        }

        return {
          rows: rows as T[],
          rowCount: rows.length,
          fields: (fields as MySQLFieldInfo[])?.map((f) => ({
            name: f.name,
            type: getMySQLType(f.type),
          })),
        };
      },

      async close(): Promise<void> {
        await pool.end();
      },
    };
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert PostgreSQL-style $1, $2 placeholders to MySQL ? placeholders
 */
export function convertPlaceholders(sql: string): string {
  let index = 0;
  return sql.replace(/\$\d+/g, () => {
    index++;
    return '?';
  });
}

/**
 * Escape identifier for MySQL
 */
export function escapeIdentifier(identifier: string): string {
  return '`' + identifier.replace(/`/g, '``') + '`';
}

/**
 * Format value for MySQL
 */
export function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }
  if (typeof value === 'number') {
    return String(value);
  }
  if (value instanceof Date) {
    return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
  }
  if (typeof value === 'object') {
    return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}
