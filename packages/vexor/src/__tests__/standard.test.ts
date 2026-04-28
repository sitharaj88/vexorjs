/**
 * Standard Schema Tests
 *
 * Verifies the Standard Schema (https://github.com/standard-schema/standard-schema)
 * compliance helpers used for interop with Zod, Valibot, ArkType, and others.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  STANDARD_SCHEMA_VERSION,
  isStandardSchema,
  toStandardSchema,
  createResult,
  createResultWithIssues,
  createIssue,
  validate,
  hasIssues,
  getErrors,
  type StandardSchema,
  type StandardSchemaResult,
} from '../schema/standard.js';
import type { TSchema } from '../schema/types.js';

describe('STANDARD_SCHEMA_VERSION', () => {
  it('is the spec version 1', () => {
    expect(STANDARD_SCHEMA_VERSION).toBe(1);
  });
});

describe('isStandardSchema', () => {
  it('returns true for a properly shaped standard schema', () => {
    const schema: StandardSchema<string> = {
      '~standard': {
        version: STANDARD_SCHEMA_VERSION,
        vendor: 'vexor',
        validate: (data) => ({ value: data as string }),
      },
    };
    expect(isStandardSchema(schema)).toBe(true);
  });

  it('returns false when the version is wrong', () => {
    const schema = {
      '~standard': {
        version: 2,
        vendor: 'vexor',
        validate: () => ({ value: null }),
      },
    };
    expect(isStandardSchema(schema)).toBe(false);
  });

  it('returns false when ~standard key is missing', () => {
    expect(isStandardSchema({})).toBe(false);
    expect(isStandardSchema({ vendor: 'vexor' })).toBe(false);
  });

  it('returns false for null and primitives', () => {
    expect(isStandardSchema(null)).toBe(false);
    expect(isStandardSchema(undefined)).toBe(false);
    expect(isStandardSchema('string')).toBe(false);
    expect(isStandardSchema(42)).toBe(false);
    expect(isStandardSchema(true)).toBe(false);
  });

  it('returns false when ~standard is not an object', () => {
    expect(isStandardSchema({ '~standard': 'invalid' })).toBe(false);
  });
});

describe('toStandardSchema', () => {
  const baseSchema: TSchema = { type: 'string' };

  it('attaches a ~standard property with the correct version and vendor', () => {
    const validateFn = (data: unknown): StandardSchemaResult<string> => ({
      value: String(data),
    });

    const wrapped = toStandardSchema<string>(baseSchema, validateFn);

    expect(wrapped['~standard'].version).toBe(STANDARD_SCHEMA_VERSION);
    expect(wrapped['~standard'].vendor).toBe('vexor');
    expect(wrapped['~standard'].validate).toBe(validateFn);
  });

  it('preserves the original schema fields', () => {
    const wrapped = toStandardSchema(
      { type: 'string', minLength: 1, maxLength: 100 } as TSchema,
      (data) => ({ value: data as string })
    );

    expect(wrapped.type).toBe('string');
    expect((wrapped as TSchema & { minLength?: number }).minLength).toBe(1);
    expect((wrapped as TSchema & { maxLength?: number }).maxLength).toBe(100);
  });

  it('produces a value detected as a standard schema', () => {
    const wrapped = toStandardSchema(baseSchema, (data) => ({
      value: data as string,
    }));
    expect(isStandardSchema(wrapped)).toBe(true);
  });
});

describe('createResult', () => {
  it('wraps a value with no issues', () => {
    const result = createResult('hello');
    expect(result).toEqual({ value: 'hello' });
    expect(result.issues).toBeUndefined();
  });

  it('preserves the value type', () => {
    const result = createResult({ id: 1 });
    expect(result.value).toEqual({ id: 1 });
  });
});

describe('createResultWithIssues', () => {
  it('wraps a value with issues', () => {
    const result = createResultWithIssues('partial', [
      { message: 'too short' },
    ]);

    expect(result.value).toBe('partial');
    expect(result.issues).toEqual([{ message: 'too short' }]);
  });

  it('handles an empty issues array', () => {
    const result = createResultWithIssues('value', []);
    expect(result.issues).toEqual([]);
  });
});

describe('createIssue', () => {
  it('creates an issue with just a message when no path is given', () => {
    const issue = createIssue('required');
    expect(issue).toEqual({ message: 'required' });
    expect(issue.path).toBeUndefined();
  });

  it('attaches the path when provided', () => {
    const issue = createIssue('invalid email', ['user', 'email']);
    expect(issue.message).toBe('invalid email');
    expect(issue.path).toEqual(['user', 'email']);
  });

  it('supports numeric path segments (array indices)', () => {
    const issue = createIssue('expected number', ['items', 0, 'qty']);
    expect(issue.path).toEqual(['items', 0, 'qty']);
  });
});

describe('validate', () => {
  it('delegates to the schema\'s validate function', () => {
    const validateFn = vi.fn().mockReturnValue({ value: 'parsed' });
    const schema: StandardSchema<string> = {
      '~standard': {
        version: STANDARD_SCHEMA_VERSION,
        vendor: 'vexor',
        validate: validateFn,
      },
    };

    const result = validate(schema, 'input');
    expect(validateFn).toHaveBeenCalledWith('input');
    expect(result).toEqual({ value: 'parsed' });
  });
});

describe('hasIssues', () => {
  it('returns false when issues is undefined', () => {
    expect(hasIssues({ value: 'ok' })).toBe(false);
  });

  it('returns false when issues is an empty array', () => {
    expect(hasIssues({ value: 'ok', issues: [] })).toBe(false);
  });

  it('returns true when issues are present', () => {
    expect(
      hasIssues({ value: null, issues: [{ message: 'bad' }] })
    ).toBe(true);
  });
});

describe('getErrors', () => {
  it('returns an empty array when there are no issues', () => {
    expect(getErrors({ value: 'ok' })).toEqual([]);
    expect(getErrors({ value: 'ok', issues: [] })).toEqual([]);
  });

  it('returns plain messages when issues have no path', () => {
    const errors = getErrors({
      value: null,
      issues: [{ message: 'required' }, { message: 'invalid' }],
    });
    expect(errors).toEqual(['required', 'invalid']);
  });

  it('joins path segments with "." when present', () => {
    const errors = getErrors({
      value: null,
      issues: [
        { message: 'must be a string', path: ['user', 'name'] },
        { message: 'must be positive', path: ['items', 0, 'qty'] },
      ],
    });

    expect(errors).toEqual([
      'user.name: must be a string',
      'items.0.qty: must be positive',
    ]);
  });

  it('omits the prefix when the path is an empty array', () => {
    const errors = getErrors({
      value: null,
      issues: [{ message: 'top-level error', path: [] }],
    });
    expect(errors).toEqual(['top-level error']);
  });
});

describe('end-to-end', () => {
  it('a wrapped schema validates and reports errors via the public helpers', () => {
    const minLength3 = toStandardSchema<string>(
      { type: 'string' },
      (data) => {
        if (typeof data !== 'string') {
          return createResultWithIssues(data as string, [
            createIssue('expected string'),
          ]);
        }
        if (data.length < 3) {
          return createResultWithIssues(data, [
            createIssue('must be at least 3 characters', ['value']),
          ]);
        }
        return createResult(data);
      }
    );

    const ok = validate(minLength3, 'hello');
    expect(hasIssues(ok)).toBe(false);
    expect(getErrors(ok)).toEqual([]);

    const tooShort = validate(minLength3, 'hi');
    expect(hasIssues(tooShort)).toBe(true);
    expect(getErrors(tooShort)).toEqual(['value: must be at least 3 characters']);

    const wrongType = validate(minLength3, 42);
    expect(hasIssues(wrongType)).toBe(true);
    expect(getErrors(wrongType)).toEqual(['expected string']);
  });
});
