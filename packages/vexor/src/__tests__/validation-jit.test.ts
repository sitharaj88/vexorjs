/**
 * JIT validator parity tests: the code-generated validator must produce
 * byte-identical results (values, issues, messages, paths) to the
 * tree-walking interpreter for every schema shape and input.
 */

import { describe, it, expect } from 'vitest';
import { Type } from '../schema/type.js';
import { compile, compileInterpreted } from '../validation/compiler.js';
import type { TSchema } from '../schema/types.js';

function expectParity(schema: TSchema, inputs: unknown[]): void {
  const jit = compile(schema);
  const interpreted = compileInterpreted(schema);

  for (const input of inputs) {
    const a = jit(input);
    const b = interpreted(input);
    expect(JSON.stringify(a.issues ?? null), `input: ${JSON.stringify(input)}`).toBe(
      JSON.stringify(b.issues ?? null)
    );
  }
}

describe('JIT/interpreter parity', () => {
  it('strings with all constraints', () => {
    expectParity(Type.String({ minLength: 2, maxLength: 5, pattern: '^[a-z]+$' }), [
      'abc',
      'a',
      'toolongvalue',
      'ABC',
      42,
      null,
      undefined,
      {},
    ]);
  });

  it('string formats', () => {
    expectParity(Type.String({ format: 'email' }), ['a@b.co', 'nope', '']);
    expectParity(Type.String({ format: 'uuid' }), [
      '123e4567-e89b-12d3-a456-426614174000',
      'not-a-uuid',
    ]);
    expectParity(Type.String({ format: 'ipv4' }), ['1.2.3.4', '999.1.1.1', 'x']);
  });

  it('numbers and integers with bounds', () => {
    expectParity(Type.Number({ minimum: 0, maximum: 10, multipleOf: 2 }), [
      4,
      3,
      -1,
      11,
      'x',
      Number.NaN,
    ]);
    expectParity(Type.Integer({ minimum: 0 }), [5, 5.5, -2, 'x']);
    expectParity(
      Type.Number({ exclusiveMinimum: 0, exclusiveMaximum: 1 }),
      [0.5, 0, 1, -1, 2]
    );
  });

  it('booleans, nulls, literals', () => {
    expectParity(Type.Boolean(), [true, false, 'true', 0, null]);
    expectParity(Type.Null(), [null, undefined, 0, '']);
    expectParity(Type.Literal('admin'), ['admin', 'user', 42, null]);
    expectParity(Type.Literal(42), [42, 43, '42']);
  });

  it('enums', () => {
    expectParity(Type.Enum(['a', 'b', 'c']), ['a', 'z', 1, null]);
    expectParity(Type.String({ enum: ['x', 'y'] }), ['x', 'z', 3]);
  });

  it('arrays with constraints and typed items', () => {
    expectParity(Type.Array(Type.String(), { minItems: 1, maxItems: 3 }), [
      ['a'],
      [],
      ['a', 'b', 'c', 'd'],
      ['a', 1, 'c'],
      'not-array',
      [['nested']],
    ]);
    expectParity(Type.Array(Type.Number(), { uniqueItems: true }), [
      [1, 2],
      [1, 1],
      [1, 'x'],
    ]);
  });

  it('objects: required, optional, nested, additionalProperties', () => {
    const schema = Type.Object(
      {
        name: Type.String({ minLength: 1 }),
        age: Type.Optional(Type.Integer({ minimum: 0 })),
        address: Type.Object({
          city: Type.String(),
          zip: Type.Optional(Type.String({ pattern: '^\\d{5}$' })),
        }),
      },
      { additionalProperties: false }
    );

    expectParity(schema, [
      { name: 'ada', address: { city: 'London' } },
      { name: 'ada', age: 3, address: { city: 'London', zip: '12345' } },
      {},
      { name: '', address: { city: 5 } },
      { name: 'ada', address: { city: 'x' }, extra: true },
      { name: 'ada', age: -1, address: { city: 'x', zip: 'abc' } },
      'not-object',
      [],
      null,
    ]);
  });

  it('unions', () => {
    const schema = Type.Union([
      Type.String(),
      Type.Object({ id: Type.Number() }),
      Type.Null(),
    ]);
    expectParity(schema, ['str', { id: 1 }, null, { id: 'x' }, 42, []]);
  });

  it('arrays of objects (dynamic paths)', () => {
    const schema = Type.Array(
      Type.Object({ id: Type.Number(), tag: Type.Optional(Type.String()) })
    );
    expectParity(schema, [
      [{ id: 1 }, { id: 2, tag: 'x' }],
      [{ id: 'bad' }, { id: 2, tag: 3 }],
      [{}, null],
    ]);
  });

  it('any/unknown pass everything', () => {
    expectParity(Type.Any(), [1, 'x', null, undefined, {}, []]);
    expectParity(Type.Unknown(), [1, 'x', null, undefined, {}, []]);
  });

  it('deeply nested combinations', () => {
    const schema = Type.Object({
      users: Type.Array(
        Type.Object({
          email: Type.String({ format: 'email' }),
          roles: Type.Array(Type.Enum(['admin', 'user'])),
        })
      ),
    });

    expectParity(schema, [
      { users: [{ email: 'a@b.co', roles: ['admin'] }] },
      { users: [{ email: 'bad', roles: ['nope'] }] },
      { users: 'not-array' },
      { users: [{ roles: [] }] },
    ]);
  });

  it('JIT is actually active on this runtime', () => {
    // compile() should NOT be the interpreter here (Node allows codegen)
    const schema = Type.Object({ a: Type.String() });
    const jit = compile(schema);
    const interpreted = compileInterpreted(schema);
    expect(jit).not.toBe(interpreted);
    expect(jit({ a: 'x' }).issues).toBeUndefined();
  });
});
