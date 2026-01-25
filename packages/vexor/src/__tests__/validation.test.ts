/**
 * Validation Compiler Tests
 *
 * Tests for the JIT validation compiler
 */

import { describe, it, expect } from 'vitest';
import { Type } from '../schema/type.js';
import { compile, createValidator, ValidationError } from '../validation/compiler.js';

describe('Validation Compiler', () => {
  describe('String Validation', () => {
    it('should validate string', () => {
      const validator = compile(Type.String());
      const result = validator('hello');
      expect(result.value).toBe('hello');
      expect(result.issues).toBeUndefined();
    });

    it('should reject non-string', () => {
      const validator = compile(Type.String());
      const result = validator(123);
      expect(result.issues).toBeDefined();
      expect(result.issues).toHaveLength(1);
    });

    it('should validate minLength', () => {
      const validator = compile(Type.String({ minLength: 3 }));

      const valid = validator('hello');
      expect(valid.issues).toBeUndefined();

      const invalid = validator('hi');
      expect(invalid.issues).toBeDefined();
    });

    it('should validate maxLength', () => {
      const validator = compile(Type.String({ maxLength: 5 }));

      const valid = validator('hi');
      expect(valid.issues).toBeUndefined();

      const invalid = validator('hello world');
      expect(invalid.issues).toBeDefined();
    });

    it('should validate pattern', () => {
      const validator = compile(Type.String({ pattern: '^[a-z]+$' }));

      const valid = validator('hello');
      expect(valid.issues).toBeUndefined();

      const invalid = validator('Hello123');
      expect(invalid.issues).toBeDefined();
    });

    it('should validate email format', () => {
      const validator = compile(Type.Email());

      const valid = validator('test@example.com');
      expect(valid.issues).toBeUndefined();

      const invalid = validator('invalid-email');
      expect(invalid.issues).toBeDefined();
    });

    it('should validate uuid format', () => {
      const validator = compile(Type.Uuid());

      const valid = validator('550e8400-e29b-41d4-a716-446655440000');
      expect(valid.issues).toBeUndefined();

      const invalid = validator('not-a-uuid');
      expect(invalid.issues).toBeDefined();
    });
  });

  describe('Number Validation', () => {
    it('should validate number', () => {
      const validator = compile(Type.Number());
      const result = validator(42);
      expect(result.value).toBe(42);
      expect(result.issues).toBeUndefined();
    });

    it('should reject non-number', () => {
      const validator = compile(Type.Number());
      const result = validator('42');
      expect(result.issues).toBeDefined();
    });

    it('should validate minimum', () => {
      const validator = compile(Type.Number({ minimum: 10 }));

      const valid = validator(15);
      expect(valid.issues).toBeUndefined();

      const invalid = validator(5);
      expect(invalid.issues).toBeDefined();
    });

    it('should validate maximum', () => {
      const validator = compile(Type.Number({ maximum: 100 }));

      const valid = validator(50);
      expect(valid.issues).toBeUndefined();

      const invalid = validator(150);
      expect(invalid.issues).toBeDefined();
    });
  });

  describe('Integer Validation', () => {
    it('should validate integer', () => {
      const validator = compile(Type.Integer());

      const valid = validator(42);
      expect(valid.issues).toBeUndefined();

      const invalid = validator(42.5);
      expect(invalid.issues).toBeDefined();
    });
  });

  describe('Boolean Validation', () => {
    it('should validate boolean', () => {
      const validator = compile(Type.Boolean());

      expect(validator(true).issues).toBeUndefined();
      expect(validator(false).issues).toBeUndefined();
      expect(validator('true').issues).toBeDefined();
    });
  });

  describe('Null Validation', () => {
    it('should validate null', () => {
      const validator = compile(Type.Null());

      expect(validator(null).issues).toBeUndefined();
      expect(validator(undefined).issues).toBeDefined();
    });
  });

  describe('Literal Validation', () => {
    it('should validate literal string', () => {
      const validator = compile(Type.Literal('hello'));

      expect(validator('hello').issues).toBeUndefined();
      expect(validator('world').issues).toBeDefined();
    });

    it('should validate literal number', () => {
      const validator = compile(Type.Literal(42));

      expect(validator(42).issues).toBeUndefined();
      expect(validator(43).issues).toBeDefined();
    });
  });

  describe('Array Validation', () => {
    it('should validate array', () => {
      const validator = compile(Type.Array(Type.String()));

      expect(validator(['a', 'b']).issues).toBeUndefined();
      expect(validator('not-array').issues).toBeDefined();
    });

    it('should validate array items', () => {
      const validator = compile(Type.Array(Type.Number()));

      expect(validator([1, 2, 3]).issues).toBeUndefined();
      expect(validator([1, 'two', 3]).issues).toBeDefined();
    });

    it('should validate minItems', () => {
      const validator = compile(Type.Array(Type.String(), { minItems: 2 }));

      expect(validator(['a', 'b']).issues).toBeUndefined();
      expect(validator(['a']).issues).toBeDefined();
    });

    it('should validate maxItems', () => {
      const validator = compile(Type.Array(Type.String(), { maxItems: 2 }));

      expect(validator(['a']).issues).toBeUndefined();
      expect(validator(['a', 'b', 'c']).issues).toBeDefined();
    });
  });

  describe('Object Validation', () => {
    it('should validate object', () => {
      const validator = compile(Type.Object({
        name: Type.String(),
        age: Type.Number(),
      }));

      expect(validator({ name: 'John', age: 25 }).issues).toBeUndefined();
      expect(validator('not-object').issues).toBeDefined();
    });

    it('should validate object properties', () => {
      const validator = compile(Type.Object({
        name: Type.String(),
        age: Type.Number(),
      }));

      const result = validator({ name: 'John', age: 'not-number' });
      expect(result.issues).toBeDefined();
    });

    it('should validate required properties', () => {
      const validator = compile(Type.Strict({
        name: Type.String(),
        age: Type.Number(),
      }));

      const result = validator({ name: 'John' });
      expect(result.issues).toBeDefined();
    });
  });

  describe('Union Validation', () => {
    it('should validate union', () => {
      const validator = compile(Type.Union([Type.String(), Type.Number()]));

      expect(validator('hello').issues).toBeUndefined();
      expect(validator(42).issues).toBeUndefined();
      expect(validator(true).issues).toBeDefined();
    });
  });

  describe('Optional Validation', () => {
    it('should allow undefined for optional', () => {
      const validator = compile(Type.Optional(Type.String()));

      expect(validator(undefined).issues).toBeUndefined();
      expect(validator('hello').issues).toBeUndefined();
    });
  });

  describe('Enum Validation', () => {
    it('should validate enum values', () => {
      const validator = compile(Type.Enum(['red', 'green', 'blue']));

      expect(validator('red').issues).toBeUndefined();
      expect(validator('yellow').issues).toBeDefined();
    });
  });

  describe('createValidator', () => {
    it('should create validator with parse method', () => {
      const validator = createValidator<{ name: string }>(Type.Object({
        name: Type.String(),
      }));

      const result = validator.parse({ name: 'John' });
      expect(result.name).toBe('John');
    });

    it('should throw ValidationError on invalid data', () => {
      const validator = createValidator<{ name: string }>(Type.Object({
        name: Type.String(),
      }));

      expect(() => validator.parse({ name: 123 })).toThrow(ValidationError);
    });

    it('should have safeParse method', () => {
      const validator = createValidator<{ name: string }>(Type.Object({
        name: Type.String(),
      }));

      const valid = validator.safeParse({ name: 'John' });
      expect(valid.issues).toBeUndefined();

      const invalid = validator.safeParse({ name: 123 });
      expect(invalid.issues).toBeDefined();
    });
  });

  describe('Nested Validation', () => {
    it('should validate deeply nested objects', () => {
      const validator = compile(Type.Object({
        user: Type.Object({
          profile: Type.Object({
            name: Type.String(),
            age: Type.Number(),
          }),
        }),
      }));

      const valid = { user: { profile: { name: 'John', age: 25 } } };
      expect(validator(valid).issues).toBeUndefined();

      const invalid = { user: { profile: { name: 'John', age: 'not-number' } } };
      expect(validator(invalid).issues).toBeDefined();
    });

    it('should provide path in validation errors', () => {
      const validator = compile(Type.Object({
        user: Type.Object({
          name: Type.String(),
        }),
      }));

      const result = validator({ user: { name: 123 } });
      expect(result.issues).toBeDefined();
      expect(result.issues?.[0].path).toBeDefined();
    });
  });
});
