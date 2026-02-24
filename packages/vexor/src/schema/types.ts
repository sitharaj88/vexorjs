/**
 * Schema Types
 *
 * Core type definitions for the schema system.
 * Compatible with JSON Schema and Standard Schema specification.
 */

/**
 * Base schema interface
 */
export interface TSchema {
  readonly type?: string;
  readonly $id?: string;
  readonly title?: string;
  readonly description?: string;
  readonly default?: unknown;
  readonly examples?: unknown[];
  readonly [key: string]: unknown;
}

/**
 * String schema
 */
export interface TString extends TSchema {
  readonly type: 'string';
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly pattern?: string;
  readonly format?: 'email' | 'uri' | 'uuid' | 'date' | 'date-time' | 'time' | 'ipv4' | 'ipv6' | string;
  readonly enum?: readonly string[];
}

/**
 * Number schema
 */
export interface TNumber extends TSchema {
  readonly type: 'number';
  readonly minimum?: number;
  readonly maximum?: number;
  readonly exclusiveMinimum?: number;
  readonly exclusiveMaximum?: number;
  readonly multipleOf?: number;
}

/**
 * Integer schema
 */
export interface TInteger extends TSchema {
  readonly type: 'integer';
  readonly minimum?: number;
  readonly maximum?: number;
  readonly exclusiveMinimum?: number;
  readonly exclusiveMaximum?: number;
  readonly multipleOf?: number;
}

/**
 * Boolean schema
 */
export interface TBoolean extends TSchema {
  readonly type: 'boolean';
}

/**
 * Null schema
 */
export interface TNull extends TSchema {
  readonly type: 'null';
}

/**
 * Literal schema (const)
 */
export interface TLiteral<T extends string | number | boolean> extends TSchema {
  readonly const: T;
}

/**
 * Array schema
 */
export interface TArray<T extends TSchema = TSchema> extends TSchema {
  readonly type: 'array';
  readonly items: T;
  readonly minItems?: number;
  readonly maxItems?: number;
  readonly uniqueItems?: boolean;
}

/**
 * Tuple schema
 */
export interface TTuple<T extends readonly TSchema[] = readonly TSchema[]> extends TSchema {
  readonly type: 'array';
  readonly items: T;
  readonly minItems: number;
  readonly maxItems: number;
}

/**
 * Object property schemas
 */
export type TProperties = Record<string, TSchema>;

/**
 * Object schema
 */
export interface TObject<T extends TProperties = TProperties> extends TSchema {
  readonly type: 'object';
  readonly properties: T;
  readonly required?: readonly string[];
  readonly additionalProperties?: boolean | TSchema;
}

/**
 * Union schema (anyOf)
 */
export interface TUnion<T extends readonly TSchema[] = readonly TSchema[]> extends TSchema {
  readonly anyOf: T;
}

/**
 * Intersection schema (allOf)
 */
export interface TIntersect<T extends readonly TSchema[] = readonly TSchema[]> extends TSchema {
  readonly allOf: T;
}

/**
 * Optional modifier
 */
export interface TOptional<T extends TSchema = TSchema> extends TSchema {
  readonly [OptionalKind]: 'Optional';
  readonly wrapped: T;
}

/**
 * Readonly modifier
 */
export interface TReadonly<T extends TSchema = TSchema> extends TSchema {
  readonly [ReadonlyKind]: 'Readonly';
  readonly wrapped: T;
}

/**
 * Record schema (dictionary)
 */
export interface TRecord<K extends TSchema = TSchema, V extends TSchema = TSchema> extends TSchema {
  readonly type: 'object';
  readonly patternProperties: { readonly [key: string]: V };
  readonly propertyNames?: K;
}

/**
 * Enum schema
 */
export interface TEnum<T extends readonly (string | number)[] = readonly (string | number)[]> extends TSchema {
  readonly enum: T;
}

/**
 * Any schema
 */
export interface TAny extends TSchema {
  readonly [AnyKind]: 'Any';
}

/**
 * Unknown schema
 */
export interface TUnknown extends TSchema {
  readonly [UnknownKind]: 'Unknown';
}

/**
 * Never schema
 */
export interface TNever extends TSchema {
  readonly not: Record<string, never>;
}

/**
 * Symbols for schema kinds
 */
export const OptionalKind = Symbol.for('Vexor.Optional');
export const ReadonlyKind = Symbol.for('Vexor.Readonly');
export const AnyKind = Symbol.for('Vexor.Any');
export const UnknownKind = Symbol.for('Vexor.Unknown');

/**
 * Schema options
 */
export interface SchemaOptions {
  $id?: string;
  title?: string;
  description?: string;
  default?: unknown;
  examples?: unknown[];
}

/**
 * String schema options
 */
export interface StringOptions extends SchemaOptions {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: TString['format'];
}

/**
 * Number schema options
 */
export interface NumberOptions extends SchemaOptions {
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
}

/**
 * Integer schema options
 */
export interface IntegerOptions extends NumberOptions {}

/**
 * Array schema options
 */
export interface ArrayOptions extends SchemaOptions {
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
}

/**
 * Object schema options
 */
export interface ObjectOptions extends SchemaOptions {
  additionalProperties?: boolean | TSchema;
}
