/**
 * PostgreSQL Driver Tests
 *
 * The `pg` package is not installed in this workspace, so connection paths
 * are exercised only via the not-installed error. Pure helpers (parameter
 * normalization, type parsing, prepared statement caching, connection config)
 * are tested directly via the driver instance.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  PostgresDriver,
  createPostgresDriver,
  createPostgresDriverFactory,
  type PostgresConfig,
} from '../drivers/postgres.js';

const baseConfig: PostgresConfig = {
  driver: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'test',
  user: 'test',
  password: 'test',
};

// Access private methods/state for unit testing
type AnyDriver = PostgresDriver & {
  normalizeParam(p: unknown): unknown;
  parseValue(v: unknown, oid: number): unknown;
  parseRow<T>(row: unknown, fields: { name: string; dataTypeID: number }[]): T;
  oidToType(oid: number): string;
  buildConnectionConfig(): Record<string, unknown>;
  getOrCreatePreparedStatement(sql: string, count: number): {
    name: string;
    sql: string;
    paramCount: number;
    usageCount: number;
    lastUsed: Date;
  };
  preparedStatements: Map<string, unknown>;
  config: PostgresConfig;
};

describe('PostgresDriver', () => {
  let driver: AnyDriver;

  beforeEach(() => {
    driver = new PostgresDriver(baseConfig) as AnyDriver;
  });

  describe('constructor', () => {
    it('applies default prepared statement caching', () => {
      expect(driver.config.preparedStatementCache).toBe(true);
      expect(driver.config.maxCachedStatements).toBe(100);
    });

    it('preserves explicit config overrides', () => {
      const d = new PostgresDriver({
        ...baseConfig,
        preparedStatementCache: false,
        maxCachedStatements: 25,
      }) as AnyDriver;

      expect(d.config.preparedStatementCache).toBe(false);
      expect(d.config.maxCachedStatements).toBe(25);
    });
  });

  describe('normalizeParam', () => {
    it('converts undefined to null', () => {
      expect(driver.normalizeParam(undefined)).toBeNull();
    });

    it('preserves null', () => {
      expect(driver.normalizeParam(null)).toBeNull();
    });

    it('converts Date to ISO string', () => {
      const d = new Date('2024-01-15T12:00:00.000Z');
      expect(driver.normalizeParam(d)).toBe('2024-01-15T12:00:00.000Z');
    });

    it('serializes plain objects to JSON', () => {
      expect(driver.normalizeParam({ a: 1, b: 'x' })).toBe('{"a":1,"b":"x"}');
    });

    it('passes arrays through unchanged', () => {
      const arr = [1, 2, 3];
      expect(driver.normalizeParam(arr)).toBe(arr);
    });

    it('passes primitives through unchanged', () => {
      expect(driver.normalizeParam('hello')).toBe('hello');
      expect(driver.normalizeParam(42)).toBe(42);
      expect(driver.normalizeParam(true)).toBe(true);
    });
  });

  describe('parseValue', () => {
    // OIDs from the driver's internal map
    const BOOL = 16;
    const INT4 = 23;
    const INT8 = 20;
    const FLOAT8 = 701;
    const NUMERIC = 1700;
    const TIMESTAMP = 1114;
    const JSON_OID = 114;
    const JSONB = 3802;
    const TEXT = 25;
    const UUID = 2950;

    it('returns null for null/undefined regardless of OID', () => {
      expect(driver.parseValue(null, INT4)).toBeNull();
      expect(driver.parseValue(undefined, INT4)).toBeNull();
    });

    it('parses booleans', () => {
      expect(driver.parseValue(true, BOOL)).toBe(true);
      expect(driver.parseValue(0, BOOL)).toBe(false);
      expect(driver.parseValue(1, BOOL)).toBe(true);
    });

    it('parses int2/int4 from string', () => {
      expect(driver.parseValue('42', INT4)).toBe(42);
      expect(driver.parseValue(7, INT4)).toBe(7);
    });

    it('keeps int8 (bigint) as string to avoid precision loss', () => {
      expect(driver.parseValue('9007199254740993', INT8)).toBe('9007199254740993');
      expect(driver.parseValue(123, INT8)).toBe('123');
    });

    it('parses float/numeric to number', () => {
      expect(driver.parseValue('3.14', FLOAT8)).toBeCloseTo(3.14);
      expect(driver.parseValue('99.99', NUMERIC)).toBeCloseTo(99.99);
    });

    it('parses timestamps to Date', () => {
      const result = driver.parseValue('2024-01-15T12:00:00Z', TIMESTAMP);
      expect(result).toBeInstanceOf(Date);
      expect((result as Date).toISOString()).toBe('2024-01-15T12:00:00.000Z');
    });

    it('returns existing Date for timestamp OID', () => {
      const d = new Date('2024-01-15T12:00:00Z');
      expect(driver.parseValue(d, TIMESTAMP)).toBe(d);
    });

    it('parses JSON / JSONB strings', () => {
      expect(driver.parseValue('{"a":1}', JSON_OID)).toEqual({ a: 1 });
      expect(driver.parseValue('[1,2]', JSONB)).toEqual([1, 2]);
    });

    it('returns raw string when JSON is invalid', () => {
      expect(driver.parseValue('not-json', JSON_OID)).toBe('not-json');
    });

    it('passes through values for unhandled OIDs', () => {
      expect(driver.parseValue('hello', TEXT)).toBe('hello');
      expect(driver.parseValue('uuid-value', UUID)).toBe('uuid-value');
    });
  });

  describe('parseRow', () => {
    it('maps fields by name and applies type parsing', () => {
      const row = { id: '5', flag: 1, payload: '{"k":"v"}' };
      const fields = [
        { name: 'id', dataTypeID: 23 }, // INT4
        { name: 'flag', dataTypeID: 16 }, // BOOL
        { name: 'payload', dataTypeID: 3802 }, // JSONB
      ];

      expect(driver.parseRow(row, fields)).toEqual({
        id: 5,
        flag: true,
        payload: { k: 'v' },
      });
    });

    it('returns row unchanged when not an object', () => {
      const fields: { name: string; dataTypeID: number }[] = [];
      expect(driver.parseRow('scalar', fields)).toBe('scalar');
      expect(driver.parseRow(null, fields)).toBeNull();
    });
  });

  describe('oidToType', () => {
    it('maps known OIDs to type names', () => {
      expect(driver.oidToType(16)).toBe('boolean');
      expect(driver.oidToType(23)).toBe('integer');
      expect(driver.oidToType(20)).toBe('bigint');
      expect(driver.oidToType(701)).toBe('double');
      expect(driver.oidToType(1700)).toBe('decimal');
      expect(driver.oidToType(25)).toBe('text');
      expect(driver.oidToType(1043)).toBe('varchar');
      expect(driver.oidToType(1184)).toBe('timestamptz');
      expect(driver.oidToType(3802)).toBe('jsonb');
      expect(driver.oidToType(2950)).toBe('uuid');
    });

    it('returns "unknown" for unrecognized OIDs', () => {
      expect(driver.oidToType(99999)).toBe('unknown');
    });
  });

  describe('buildConnectionConfig', () => {
    it('uses connectionString when provided', () => {
      const d = new PostgresDriver({
        ...baseConfig,
        connectionString: 'postgres://u:p@host/db',
      }) as AnyDriver;

      const cfg = d.buildConnectionConfig();
      expect(cfg.connectionString).toBe('postgres://u:p@host/db');
      expect(cfg.host).toBeUndefined();
    });

    it('uses individual fields with defaults when no connectionString', () => {
      const d = new PostgresDriver({ driver: 'postgres' }) as AnyDriver;
      const cfg = d.buildConnectionConfig();

      expect(cfg.host).toBe('localhost');
      expect(cfg.port).toBe(5432);
    });

    it('passes through ssl / applicationName / queryTimeout', () => {
      const d = new PostgresDriver({
        ...baseConfig,
        ssl: { rejectUnauthorized: false },
        applicationName: 'vexor-test',
        queryTimeout: 1000,
      }) as AnyDriver;

      const cfg = d.buildConnectionConfig();
      expect(cfg.ssl).toEqual({ rejectUnauthorized: false });
      expect(cfg.application_name).toBe('vexor-test');
      expect(cfg.query_timeout).toBe(1000);
    });
  });

  describe('prepared statement cache', () => {
    it('reuses cached statements for identical SQL/param count', () => {
      const a = driver.getOrCreatePreparedStatement('SELECT 1 WHERE x = $1', 1);
      const b = driver.getOrCreatePreparedStatement('SELECT 1 WHERE x = $1', 1);

      expect(a).toBe(b);
      expect(driver.preparedStatements.size).toBe(1);
    });

    it('creates distinct statements for different SQL', () => {
      driver.getOrCreatePreparedStatement('SELECT 1', 0);
      driver.getOrCreatePreparedStatement('SELECT 2', 0);

      expect(driver.preparedStatements.size).toBe(2);
    });

    it('evicts the oldest statement when at capacity', () => {
      const d = new PostgresDriver({
        ...baseConfig,
        maxCachedStatements: 2,
      }) as AnyDriver;

      const first = d.getOrCreatePreparedStatement('SELECT 1', 0);
      // Make first artificially older
      first.lastUsed = new Date(0);

      d.getOrCreatePreparedStatement('SELECT 2', 0);
      d.getOrCreatePreparedStatement('SELECT 3', 0);

      expect(d.preparedStatements.size).toBe(2);
      expect(d.preparedStatements.has('SELECT 1:0')).toBe(false);
    });
  });

  describe('lifecycle errors', () => {
    it('query throws when not connected', async () => {
      await expect(driver.query('SELECT 1')).rejects.toThrow('Not connected');
    });

    it('close is a no-op when not connected', async () => {
      await expect(driver.close()).resolves.toBeUndefined();
    });

    it('connect throws when pg is not installed', async () => {
      // pg isn't a dependency in this workspace
      await expect(driver.connect()).rejects.toThrow(/pg.*not installed/i);
    });
  });

  describe('factories', () => {
    it('createPostgresDriver returns a PostgresDriver instance', () => {
      const d = createPostgresDriver(baseConfig);
      expect(d).toBeInstanceOf(PostgresDriver);
    });

    it('createPostgresDriverFactory returns an async factory', async () => {
      const factory = createPostgresDriverFactory(baseConfig);
      expect(typeof factory).toBe('function');
      // Calling it should attempt to connect, which will fail (pg missing)
      await expect(factory()).rejects.toThrow(/pg.*not installed/i);
    });
  });
});
