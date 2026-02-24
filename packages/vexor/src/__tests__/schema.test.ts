/**
 * Schema Module Tests
 *
 * Tests for the TypeBox-compatible schema builder
 */

import { describe, it, expect } from 'vitest';
import { Type } from '../schema/type.js';
import type { Static } from '../schema/static.js';

describe('Type Schema Builder', () => {
  describe('Primitive Types', () => {
    it('should create string schema', () => {
      const schema = Type.String();
      expect(schema.type).toBe('string');
    });

    it('should create string schema with options', () => {
      const schema = Type.String({ minLength: 1, maxLength: 100, format: 'email' });
      expect(schema.type).toBe('string');
      expect(schema.minLength).toBe(1);
      expect(schema.maxLength).toBe(100);
      expect(schema.format).toBe('email');
    });

    it('should create number schema', () => {
      const schema = Type.Number();
      expect(schema.type).toBe('number');
    });

    it('should create number schema with constraints', () => {
      const schema = Type.Number({ minimum: 0, maximum: 100 });
      expect(schema.minimum).toBe(0);
      expect(schema.maximum).toBe(100);
    });

    it('should create integer schema', () => {
      const schema = Type.Integer();
      expect(schema.type).toBe('integer');
    });

    it('should create boolean schema', () => {
      const schema = Type.Boolean();
      expect(schema.type).toBe('boolean');
    });

    it('should create null schema', () => {
      const schema = Type.Null();
      expect(schema.type).toBe('null');
    });
  });

  describe('Literal Types', () => {
    it('should create string literal', () => {
      const schema = Type.Literal('hello');
      expect(schema.const).toBe('hello');
    });

    it('should create number literal', () => {
      const schema = Type.Literal(42);
      expect(schema.const).toBe(42);
    });

    it('should create boolean literal', () => {
      const schema = Type.Literal(true);
      expect(schema.const).toBe(true);
    });
  });

  describe('Array Types', () => {
    it('should create array schema', () => {
      const schema = Type.Array(Type.String());
      expect(schema.type).toBe('array');
      expect(schema.items.type).toBe('string');
    });

    it('should create array with constraints', () => {
      const schema = Type.Array(Type.Number(), { minItems: 1, maxItems: 10 });
      expect(schema.minItems).toBe(1);
      expect(schema.maxItems).toBe(10);
    });
  });

  describe('Tuple Types', () => {
    it('should create tuple schema', () => {
      const schema = Type.Tuple([Type.String(), Type.Number()]);
      expect(schema.type).toBe('array');
      expect(schema.minItems).toBe(2);
      expect(schema.maxItems).toBe(2);
    });
  });

  describe('Object Types', () => {
    it('should create object schema', () => {
      const schema = Type.Object({
        name: Type.String(),
        age: Type.Number(),
      });
      expect(schema.type).toBe('object');
      expect(schema.properties.name.type).toBe('string');
      expect(schema.properties.age.type).toBe('number');
    });

    it('should create strict object schema', () => {
      const schema = Type.Strict({
        name: Type.String(),
      });
      expect(schema.additionalProperties).toBe(false);
      expect(schema.required).toContain('name');
    });

    it('should create partial object schema', () => {
      const schema = Type.Partial({
        name: Type.String(),
      });
      expect(schema.required).toEqual([]);
    });
  });

  describe('Union Types', () => {
    it('should create union schema', () => {
      const schema = Type.Union([Type.String(), Type.Number()]);
      expect(schema.anyOf).toHaveLength(2);
    });
  });

  describe('Optional and Nullable', () => {
    it('should create optional schema', () => {
      const schema = Type.Optional(Type.String());
      expect(schema).toHaveProperty('wrapped');
    });

    it('should create nullable schema', () => {
      const schema = Type.Nullable(Type.String());
      expect(schema.anyOf).toHaveLength(2);
    });
  });

  describe('Enum Types', () => {
    it('should create enum from values', () => {
      const schema = Type.Enum(['red', 'green', 'blue']);
      expect(schema.enum).toEqual(['red', 'green', 'blue']);
    });

    it('should create enum from object', () => {
      enum Color {
        Red = 'red',
        Green = 'green',
      }
      const schema = Type.EnumFromObject(Color);
      expect(schema.enum).toContain('red');
      expect(schema.enum).toContain('green');
    });
  });

  describe('Format Helpers', () => {
    it('should create email schema', () => {
      const schema = Type.Email();
      expect(schema.format).toBe('email');
    });

    it('should create uri schema', () => {
      const schema = Type.Uri();
      expect(schema.format).toBe('uri');
    });

    it('should create uuid schema', () => {
      const schema = Type.Uuid();
      expect(schema.format).toBe('uuid');
    });

    it('should create date schema', () => {
      const schema = Type.Date();
      expect(schema.format).toBe('date');
    });

    it('should create datetime schema', () => {
      const schema = Type.DateTime();
      expect(schema.format).toBe('date-time');
    });
  });

  describe('Object Utilities', () => {
    it('should pick properties', () => {
      const base = Type.Object({
        name: Type.String(),
        age: Type.Number(),
        email: Type.String(),
      });
      const picked = Type.Pick(base, ['name', 'email']);
      expect(picked.properties).toHaveProperty('name');
      expect(picked.properties).toHaveProperty('email');
      expect(picked.properties).not.toHaveProperty('age');
    });

    it('should omit properties', () => {
      const base = Type.Object({
        name: Type.String(),
        age: Type.Number(),
        email: Type.String(),
      });
      const omitted = Type.Omit(base, ['age']);
      expect(omitted.properties).toHaveProperty('name');
      expect(omitted.properties).toHaveProperty('email');
      expect(omitted.properties).not.toHaveProperty('age');
    });

    it('should extend object', () => {
      const base = Type.Object({
        name: Type.String(),
      });
      const extended = Type.Extend(base, {
        age: Type.Number(),
      });
      expect(extended.properties).toHaveProperty('name');
      expect(extended.properties).toHaveProperty('age');
    });
  });

  describe('Type Inference', () => {
    it('should infer primitive types', () => {
      const schema = Type.Object({
        name: Type.String(),
        age: Type.Number(),
        active: Type.Boolean(),
      });

      // Type-level test - this compiles correctly if types work
      type Inferred = Static<typeof schema>;
      const value: Inferred = {
        name: 'test',
        age: 25,
        active: true,
      };
      expect(value.name).toBe('test');
    });

    it('should infer array types', () => {
      const schema = Type.Array(Type.String());
      type Inferred = Static<typeof schema>;
      const value: Inferred = ['a', 'b', 'c'];
      expect(value).toHaveLength(3);
    });

    it('should infer literal types', () => {
      const schema = Type.Literal('hello');
      type Inferred = Static<typeof schema>;
      const value: Inferred = 'hello';
      expect(value).toBe('hello');
    });
  });
});
