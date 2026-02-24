/**
 * Configuration Loader Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Config, ConfigLoader, env } from '../config/loader.js';
import type { ConfigSource } from '../config/loader.js';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
describe('Config', () => {
  function makeConfig(
    data: Record<string, unknown>,
    sources: Map<string, ConfigSource> = new Map(),
    options = {}
  ) {
    return new Config(data, sources, options);
  }

  it('should get top-level value', () => {
    const config = makeConfig({ port: 3000, host: 'localhost' });
    expect(config.get('port')).toBe(3000);
    expect(config.get('host')).toBe('localhost');
  });

  it('should get nested values using dot notation', () => {
    const config = makeConfig({
      db: { host: '127.0.0.1', port: 5432 },
    });
    expect(config.get('db.host')).toBe('127.0.0.1');
    expect(config.get('db.port')).toBe(5432);
  });

  it('should return undefined for missing keys', () => {
    const config = makeConfig({ a: 1 });
    expect(config.get('missing')).toBeUndefined();
  });

  it('should check key existence with has()', () => {
    const config = makeConfig({ exists: true });
    expect(config.has('exists')).toBe(true);
    expect(config.has('nope')).toBe(false);
  });

  it('should return default value when key is missing', () => {
    const config = makeConfig({});
    expect(config.getOrDefault('missing', 42)).toBe(42);
  });

  it('should return actual value instead of default when key exists', () => {
    const config = makeConfig({ key: 'real' });
    expect(config.getOrDefault('key', 'fallback')).toBe('real');
  });

  it('should throw from getRequired when key is missing', () => {
    const config = makeConfig({});
    expect(() => config.getRequired('DATABASE_URL')).toThrow(
      'Required configuration key "DATABASE_URL" is not set'
    );
  });

  it('should return value from getRequired when key exists', () => {
    const config = makeConfig({ DATABASE_URL: 'postgres://...' });
    expect(config.getRequired('DATABASE_URL')).toBe('postgres://...');
  });

  it('should expose environment helpers', () => {
    const config = makeConfig({}, new Map(), { env: 'production' });
    expect(config.env).toBe('production');
    expect(config.isProduction).toBe(true);
    expect(config.isDevelopment).toBe(false);
    expect(config.isTest).toBe(false);
  });

  it('should default to development environment', () => {
    const config = makeConfig({}, new Map(), {});
    expect(config.env).toBe('development');
    expect(config.isDevelopment).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// ConfigLoader
// ---------------------------------------------------------------------------
describe('ConfigLoader', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('loadEnv', () => {
    it('should load prefixed environment variables', async () => {
      process.env.APP_PORT = '8080';
      process.env.APP_HOST = 'localhost';
      process.env.UNRELATED = 'skip';

      const loader = new ConfigLoader({
        envOptions: { prefix: 'APP', separator: '__', transform: 'upper' },
      });
      const config = await loader.load();

      expect(config.get('port')).toBe(8080);
      expect(config.get('host')).toBe('localhost');
    });

    it('should parse boolean values from env', async () => {
      process.env.MYAPP_DEBUG = 'true';
      process.env.MYAPP_VERBOSE = 'false';

      const loader = new ConfigLoader({
        envOptions: { prefix: 'MYAPP', separator: '__', transform: 'upper' },
      });
      const config = await loader.load();

      expect(config.get('debug')).toBe(true);
      expect(config.get('verbose')).toBe(false);
    });

    it('should parse numeric values from env', async () => {
      process.env.MYAPP_PORT = '3000';
      process.env.MYAPP_RATIO = '0.5';

      const loader = new ConfigLoader({
        envOptions: { prefix: 'MYAPP', separator: '__', transform: 'upper' },
      });
      const config = await loader.load();

      expect(config.get('port')).toBe(3000);
      expect(config.get('ratio')).toBe(0.5);
    });

    it('should parse null from env', async () => {
      process.env.MYAPP_EMPTY = 'null';

      const loader = new ConfigLoader({
        envOptions: { prefix: 'MYAPP', separator: '__', transform: 'upper' },
      });
      const config = await loader.load();

      expect(config.get('empty')).toBeNull();
    });

    it('should create nested keys with __ separator', async () => {
      process.env.APP_DB__HOST = 'dbhost';
      process.env.APP_DB__PORT = '5432';

      const loader = new ConfigLoader({
        envOptions: { prefix: 'APP', separator: '__', transform: 'upper' },
      });
      const config = await loader.load();

      expect(config.get('db.host')).toBe('dbhost');
      expect(config.get('db.port')).toBe(5432);
    });
  });

  describe('defaults and overrides', () => {
    it('should apply default values', async () => {
      const loader = new ConfigLoader({
        defaults: { port: 3000, host: 'localhost' },
        envOptions: { prefix: 'NOPREFIX_XYZ', separator: '__', transform: 'upper' },
      });
      const config = await loader.load();

      expect(config.get('port')).toBe(3000);
      expect(config.get('host')).toBe('localhost');
    });

    it('should override defaults with env', async () => {
      process.env.TESTCFG_PORT = '9000';

      const loader = new ConfigLoader({
        defaults: { port: 3000 },
        envOptions: { prefix: 'TESTCFG', separator: '__', transform: 'upper' },
      });
      const config = await loader.load();

      expect(config.get('port')).toBe(9000);
    });

    it('should apply overrides last', async () => {
      process.env.TESTCFG_PORT = '9000';

      const loader = new ConfigLoader({
        defaults: { port: 3000 },
        overrides: { port: 4000 },
        envOptions: { prefix: 'TESTCFG', separator: '__', transform: 'upper' },
      });
      const config = await loader.load();

      expect(config.get('port')).toBe(4000);
    });
  });
});

// ---------------------------------------------------------------------------
// env helpers
// ---------------------------------------------------------------------------
describe('env helpers', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should get environment variable', () => {
    process.env.MY_VAR = 'hello';
    expect(env.get('MY_VAR')).toBe('hello');
    expect(env.get('NONEXISTENT')).toBeUndefined();
  });

  it('should throw on getRequired for missing var', () => {
    expect(() => env.getRequired('MISSING_REQUIRED')).toThrow(
      'Required environment variable "MISSING_REQUIRED" is not set'
    );
  });

  it('should return value from getRequired when set', () => {
    process.env.EXISTS = 'yes';
    expect(env.getRequired('EXISTS')).toBe('yes');
  });

  it('should return default value with getOrDefault', () => {
    expect(env.getOrDefault('MISSING', 'default')).toBe('default');
    process.env.SET_VAR = 'actual';
    expect(env.getOrDefault('SET_VAR', 'default')).toBe('actual');
  });

  it('should parse number', () => {
    process.env.NUM = '42';
    expect(env.getNumber('NUM')).toBe(42);
    expect(env.getNumber('MISSING')).toBeUndefined();
    process.env.NOT_NUM = 'abc';
    expect(env.getNumber('NOT_NUM')).toBeUndefined();
  });

  it('should parse boolean', () => {
    process.env.BOOL_TRUE = 'true';
    process.env.BOOL_ONE = '1';
    process.env.BOOL_FALSE = 'false';

    expect(env.getBoolean('BOOL_TRUE')).toBe(true);
    expect(env.getBoolean('BOOL_ONE')).toBe(true);
    expect(env.getBoolean('BOOL_FALSE')).toBe(false);
    expect(env.getBoolean('MISSING')).toBeUndefined();
  });

  it('should check has()', () => {
    process.env.EXISTS = 'yes';
    expect(env.has('EXISTS')).toBe(true);
    expect(env.has('NOPE')).toBe(false);
  });
});
