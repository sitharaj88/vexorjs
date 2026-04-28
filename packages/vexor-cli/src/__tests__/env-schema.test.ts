/**
 * env-schema tests — pure validation + parser logic.
 */

import { describe, it, expect } from 'vitest';
import {
  validateEnv,
  parseDotEnv,
  type EnvSchema,
} from '../commands/env-schema.js';

describe('parseDotEnv', () => {
  it('parses key=value pairs', () => {
    expect(parseDotEnv('PORT=3000\nNAME=app')).toEqual({
      PORT: '3000',
      NAME: 'app',
    });
  });

  it('strips wrapping quotes', () => {
    expect(parseDotEnv('A="hello"\nB=\'world\'')).toEqual({
      A: 'hello',
      B: 'world',
    });
  });

  it('skips comments and blank lines', () => {
    expect(parseDotEnv('# comment\n\nFOO=bar\n')).toEqual({ FOO: 'bar' });
  });

  it('ignores malformed lines', () => {
    expect(parseDotEnv('not a kv\nVALID=ok')).toEqual({ VALID: 'ok' });
  });
});

describe('validateEnv', () => {
  describe('required + defaults', () => {
    it('reports missing required values', () => {
      const schema: EnvSchema = {
        DATABASE_URL: { type: 'url', required: true },
      };
      const result = validateEnv({}, schema);
      expect(result.ok).toBe(false);
      expect(result.issues[0].key).toBe('DATABASE_URL');
    });

    it('treats empty string as missing', () => {
      const schema: EnvSchema = {
        SECRET: { type: 'string', required: true },
      };
      const result = validateEnv({ SECRET: '' }, schema);
      expect(result.ok).toBe(false);
    });

    it('applies defaults when value is missing', () => {
      const schema: EnvSchema = {
        NODE_ENV: {
          type: 'enum',
          values: ['development', 'production'],
          default: 'development',
        },
      };
      const result = validateEnv({}, schema);
      expect(result.ok).toBe(true);
      expect(result.values.NODE_ENV).toBe('development');
    });

    it('skips optional fields without defaults', () => {
      const schema: EnvSchema = {
        OPTIONAL: { type: 'string' },
      };
      const result = validateEnv({}, schema);
      expect(result.ok).toBe(true);
      expect(result.values.OPTIONAL).toBeUndefined();
    });
  });

  describe('integer', () => {
    it('coerces numeric strings to numbers', () => {
      const result = validateEnv({ PORT: '3000' }, {
        PORT: { type: 'integer' },
      });
      expect(result.values.PORT).toBe(3000);
    });

    it('rejects non-integer strings', () => {
      const result = validateEnv({ PORT: '3.14' }, {
        PORT: { type: 'integer' },
      });
      expect(result.ok).toBe(false);
    });

    it('respects min/max', () => {
      const schema: EnvSchema = {
        PORT: { type: 'integer', min: 1, max: 65535 },
      };
      expect(validateEnv({ PORT: '0' }, schema).ok).toBe(false);
      expect(validateEnv({ PORT: '70000' }, schema).ok).toBe(false);
      expect(validateEnv({ PORT: '8080' }, schema).ok).toBe(true);
    });
  });

  describe('number', () => {
    it('accepts decimals', () => {
      const result = validateEnv({ RATE: '1.5' }, {
        RATE: { type: 'number' },
      });
      expect(result.values.RATE).toBe(1.5);
    });

    it('rejects non-numeric strings', () => {
      expect(
        validateEnv({ RATE: 'abc' }, { RATE: { type: 'number' } }).ok
      ).toBe(false);
    });
  });

  describe('boolean', () => {
    it.each([
      ['true', true],
      ['1', true],
      ['yes', true],
      ['on', true],
      ['false', false],
      ['0', false],
      ['no', false],
      ['off', false],
    ])('coerces %s', (input, expected) => {
      const result = validateEnv({ FLAG: input }, {
        FLAG: { type: 'boolean' },
      });
      expect(result.values.FLAG).toBe(expected);
    });

    it('rejects unknown values', () => {
      const result = validateEnv({ FLAG: 'maybe' }, {
        FLAG: { type: 'boolean' },
      });
      expect(result.ok).toBe(false);
    });
  });

  describe('url', () => {
    it('accepts a valid URL', () => {
      const result = validateEnv(
        { DB: 'postgres://u:p@h/d' },
        { DB: { type: 'url' } }
      );
      expect(result.ok).toBe(true);
    });

    it('rejects invalid URLs', () => {
      const result = validateEnv({ DB: 'not-a-url' }, {
        DB: { type: 'url' },
      });
      expect(result.ok).toBe(false);
    });
  });

  describe('email', () => {
    it('accepts valid emails', () => {
      expect(
        validateEnv({ E: 'a@b.com' }, { E: { type: 'email' } }).ok
      ).toBe(true);
    });

    it('rejects invalid emails', () => {
      expect(
        validateEnv({ E: 'not-an-email' }, { E: { type: 'email' } }).ok
      ).toBe(false);
    });
  });

  describe('enum', () => {
    it('accepts a value in the set', () => {
      const result = validateEnv({ ENV: 'production' }, {
        ENV: { type: 'enum', values: ['development', 'production'] },
      });
      expect(result.ok).toBe(true);
    });

    it('rejects values outside the set', () => {
      const result = validateEnv({ ENV: 'staging' }, {
        ENV: { type: 'enum', values: ['development', 'production'] },
      });
      expect(result.ok).toBe(false);
    });

    it('errors when values is missing', () => {
      const result = validateEnv({ X: 'a' }, {
        X: { type: 'enum' },
      });
      expect(result.ok).toBe(false);
    });
  });

  describe('string', () => {
    it('respects minLength/maxLength', () => {
      const schema: EnvSchema = {
        SECRET: { type: 'string', minLength: 8, maxLength: 64 },
      };
      expect(validateEnv({ SECRET: 'short' }, schema).ok).toBe(false);
      expect(validateEnv({ SECRET: 'long-enough' }, schema).ok).toBe(true);
    });

    it('respects pattern', () => {
      const schema: EnvSchema = {
        ID: { type: 'string', pattern: '^[a-z0-9-]+$' },
      };
      expect(validateEnv({ ID: 'GOOD' }, schema).ok).toBe(false);
      expect(validateEnv({ ID: 'good-1' }, schema).ok).toBe(true);
    });
  });

  it('reports multiple issues per call', () => {
    const schema: EnvSchema = {
      A: { type: 'integer', required: true },
      B: { type: 'url', required: true },
    };
    const result = validateEnv({ A: 'oops', B: 'bad' }, schema);
    expect(result.ok).toBe(false);
    expect(result.issues).toHaveLength(2);
  });
});
