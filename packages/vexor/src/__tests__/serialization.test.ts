/**
 * Serialization Compiler Tests
 *
 * Tests for the JIT serialization compiler
 */

import { describe, it, expect } from 'vitest';
import { Type } from '../schema/type.js';
import { compileSerializer, createSerializer, stringify, FastJSON } from '../serialization/compiler.js';

describe('Serialization Compiler', () => {
  describe('Primitive Serialization', () => {
    it('should serialize string', () => {
      const serializer = compileSerializer(Type.String());
      expect(serializer('hello')).toBe('"hello"');
    });

    it('should serialize string with special characters', () => {
      const serializer = compileSerializer(Type.String());
      expect(serializer('hello\nworld')).toBe('"hello\\nworld"');
      expect(serializer('quotes: "test"')).toBe('"quotes: \\"test\\""');
    });

    it('should serialize number', () => {
      const serializer = compileSerializer(Type.Number());
      expect(serializer(42)).toBe('42');
      expect(serializer(3.14)).toBe('3.14');
    });

    it('should serialize boolean', () => {
      const serializer = compileSerializer(Type.Boolean());
      expect(serializer(true)).toBe('true');
      expect(serializer(false)).toBe('false');
    });

    it('should serialize null', () => {
      const serializer = compileSerializer(Type.Null());
      expect(serializer(null)).toBe('null');
    });
  });

  describe('Literal Serialization', () => {
    it('should serialize literal value', () => {
      const serializer = compileSerializer(Type.Literal('fixed'));
      expect(serializer('fixed')).toBe('"fixed"');
    });
  });

  describe('Array Serialization', () => {
    it('should serialize string array', () => {
      const serializer = compileSerializer(Type.Array(Type.String()));
      expect(serializer(['a', 'b', 'c'])).toBe('["a","b","c"]');
    });

    it('should serialize number array', () => {
      const serializer = compileSerializer(Type.Array(Type.Number()));
      expect(serializer([1, 2, 3])).toBe('[1,2,3]');
    });

    it('should serialize empty array', () => {
      const serializer = compileSerializer(Type.Array(Type.String()));
      expect(serializer([])).toBe('[]');
    });

    it('should serialize nested arrays', () => {
      const serializer = compileSerializer(Type.Array(Type.Array(Type.Number())));
      expect(serializer([[1, 2], [3, 4]])).toBe('[[1,2],[3,4]]');
    });
  });

  describe('Object Serialization', () => {
    it('should serialize simple object', () => {
      const serializer = compileSerializer(Type.Object({
        name: Type.String(),
        age: Type.Number(),
      }));
      const result = serializer({ name: 'John', age: 25 });
      const parsed = JSON.parse(result);
      expect(parsed).toEqual({ name: 'John', age: 25 });
    });

    it('should serialize nested object', () => {
      const serializer = compileSerializer(Type.Object({
        user: Type.Object({
          name: Type.String(),
        }),
      }));
      const result = serializer({ user: { name: 'John' } });
      const parsed = JSON.parse(result);
      expect(parsed).toEqual({ user: { name: 'John' } });
    });

    it('should serialize empty object', () => {
      const serializer = compileSerializer(Type.Object({}));
      expect(serializer({})).toBe('{}');
    });
  });

  describe('createSerializer', () => {
    it('should create serializer with stringify method', () => {
      const serializer = createSerializer(Type.Object({
        name: Type.String(),
      }));
      const result = serializer.stringify({ name: 'John' });
      expect(JSON.parse(result)).toEqual({ name: 'John' });
    });

    it('should expose schema', () => {
      const schema = Type.Object({ name: Type.String() });
      const serializer = createSerializer(schema);
      expect(serializer.schema).toBe(schema);
    });
  });

  describe('stringify helper', () => {
    it('should serialize with schema', () => {
      const result = stringify(Type.String(), 'hello');
      expect(result).toBe('"hello"');
    });
  });

  describe('FastJSON utilities', () => {
    it('should stringify string', () => {
      expect(FastJSON.stringifyString('hello')).toBe('"hello"');
    });

    it('should stringify number', () => {
      expect(FastJSON.stringifyNumber(42)).toBe('42');
      expect(FastJSON.stringifyNumber(Infinity)).toBe('null');
    });

    it('should stringify boolean', () => {
      expect(FastJSON.stringifyBoolean(true)).toBe('true');
      expect(FastJSON.stringifyBoolean(false)).toBe('false');
    });

    it('should stringify null', () => {
      expect(FastJSON.stringifyNull()).toBe('null');
    });

    it('should stringify primitive array', () => {
      expect(FastJSON.stringifyPrimitiveArray(['a', 'b'], 'string')).toBe('["a","b"]');
      expect(FastJSON.stringifyPrimitiveArray([1, 2], 'number')).toBe('[1,2]');
    });
  });

  describe('Complex Schemas', () => {
    it('should serialize object with arrays', () => {
      const serializer = compileSerializer(Type.Object({
        tags: Type.Array(Type.String()),
        scores: Type.Array(Type.Number()),
      }));
      const result = serializer({ tags: ['a', 'b'], scores: [1, 2] });
      const parsed = JSON.parse(result);
      expect(parsed).toEqual({ tags: ['a', 'b'], scores: [1, 2] });
    });

    it('should serialize array of objects', () => {
      const serializer = compileSerializer(Type.Array(Type.Object({
        id: Type.Number(),
        name: Type.String(),
      })));
      const result = serializer([
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
      ]);
      const parsed = JSON.parse(result);
      expect(parsed).toEqual([
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
      ]);
    });
  });

  describe('Performance', () => {
    it('should produce valid JSON for flat objects', () => {
      const serializer = compileSerializer(Type.Object({
        name: Type.String(),
        age: Type.Number(),
        active: Type.Boolean(),
      }));

      const data = {
        name: 'Test',
        age: 25,
        active: true,
      };

      const result = serializer(data);

      // Should be valid JSON
      expect(() => JSON.parse(result)).not.toThrow();

      // Should match data structure
      const parsed = JSON.parse(result);
      expect(parsed.name).toBe('Test');
      expect(parsed.age).toBe(25);
      expect(parsed.active).toBe(true);
    });
  });
});
