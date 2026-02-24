/**
 * Type - Schema Builder
 *
 * TypeBox-compatible schema builder with full TypeScript inference.
 * Creates JSON Schema compatible objects that can be validated at runtime.
 */

import type {
  TSchema,
  TString,
  TNumber,
  TInteger,
  TBoolean,
  TNull,
  TLiteral,
  TArray,
  TTuple,
  TObject,
  TUnion,
  TIntersect,
  TOptional,
  TReadonly,
  TRecord,
  TEnum,
  TAny,
  TUnknown,
  TNever,
  TProperties,
  StringOptions,
  NumberOptions,
  IntegerOptions,
  ArrayOptions,
  ObjectOptions,
  SchemaOptions,
} from './types.js';

import {
  OptionalKind,
  ReadonlyKind,
  AnyKind,
  UnknownKind,
} from './types.js';

/**
 * Type namespace - Schema builder functions
 */
export const Type = {
  /**
   * Create a string schema
   */
  String(options: StringOptions = {}): TString {
    return {
      type: 'string',
      ...options,
    } as TString;
  },

  /**
   * Create a number schema
   */
  Number(options: NumberOptions = {}): TNumber {
    return {
      type: 'number',
      ...options,
    } as TNumber;
  },

  /**
   * Create an integer schema
   */
  Integer(options: IntegerOptions = {}): TInteger {
    return {
      type: 'integer',
      ...options,
    } as TInteger;
  },

  /**
   * Create a boolean schema
   */
  Boolean(options: SchemaOptions = {}): TBoolean {
    return {
      type: 'boolean',
      ...options,
    } as TBoolean;
  },

  /**
   * Create a null schema
   */
  Null(options: SchemaOptions = {}): TNull {
    return {
      type: 'null',
      ...options,
    } as TNull;
  },

  /**
   * Create a literal (const) schema
   */
  Literal<T extends string | number | boolean>(value: T, options: SchemaOptions = {}): TLiteral<T> {
    return {
      const: value,
      ...options,
    } as TLiteral<T>;
  },

  /**
   * Create an array schema
   */
  Array<T extends TSchema>(items: T, options: ArrayOptions = {}): TArray<T> {
    return {
      type: 'array',
      items,
      ...options,
    } as TArray<T>;
  },

  /**
   * Create a tuple schema
   */
  Tuple<T extends readonly TSchema[]>(items: [...T], options: SchemaOptions = {}): TTuple<T> {
    return {
      type: 'array',
      items: items as unknown as T,
      minItems: items.length,
      maxItems: items.length,
      ...options,
    } as TTuple<T>;
  },

  /**
   * Create an object schema
   */
  Object<T extends TProperties>(
    properties: T,
    options: ObjectOptions & { required?: readonly (keyof T)[] } = {}
  ): TObject<T> {
    const { required, ...rest } = options;
    return {
      type: 'object',
      properties,
      ...(required && { required: required as readonly string[] }),
      ...rest,
    } as TObject<T>;
  },

  /**
   * Create a strict object schema (all properties required)
   */
  Strict<T extends TProperties>(properties: T, options: ObjectOptions = {}): TObject<T> {
    return {
      type: 'object',
      properties,
      required: Object.keys(properties) as readonly string[],
      additionalProperties: false,
      ...options,
    } as TObject<T>;
  },

  /**
   * Create a partial object schema (all properties optional)
   */
  Partial<T extends TProperties>(properties: T, options: ObjectOptions = {}): TObject<T> {
    return {
      type: 'object',
      properties,
      required: [] as readonly string[],
      ...options,
    } as TObject<T>;
  },

  /**
   * Create a union schema (anyOf)
   */
  Union<T extends readonly TSchema[]>(schemas: [...T], options: SchemaOptions = {}): TUnion<T> {
    return {
      anyOf: schemas as unknown as T,
      ...options,
    } as TUnion<T>;
  },

  /**
   * Create an intersection schema (allOf)
   */
  Intersect<T extends readonly TSchema[]>(schemas: [...T], options: SchemaOptions = {}): TIntersect<T> {
    return {
      allOf: schemas as unknown as T,
      ...options,
    } as TIntersect<T>;
  },

  /**
   * Make a schema optional
   */
  Optional<T extends TSchema>(schema: T): TOptional<T> {
    return {
      [OptionalKind]: 'Optional',
      wrapped: schema,
      ...schema,
    } as unknown as TOptional<T>;
  },

  /**
   * Make a schema readonly
   */
  Readonly<T extends TSchema>(schema: T): TReadonly<T> {
    return {
      [ReadonlyKind]: 'Readonly',
      wrapped: schema,
      ...schema,
    } as unknown as TReadonly<T>;
  },

  /**
   * Create a record schema (dictionary)
   */
  Record<K extends TString, V extends TSchema>(
    key: K,
    value: V,
    options: SchemaOptions = {}
  ): TRecord<K, V> {
    return {
      type: 'object',
      patternProperties: { '.*': value },
      propertyNames: key,
      ...options,
    } as TRecord<K, V>;
  },

  /**
   * Create an enum schema from values
   */
  Enum<T extends readonly (string | number)[]>(values: [...T], options: SchemaOptions = {}): TEnum<T> {
    return {
      enum: values as unknown as T,
      ...options,
    } as TEnum<T>;
  },

  /**
   * Create an enum schema from TypeScript enum
   */
  EnumFromObject<T extends Record<string, string | number>>(
    enumObject: T,
    options: SchemaOptions = {}
  ): TEnum<T[keyof T][]> {
    const values = Object.values(enumObject).filter(
      (v): v is string | number => typeof v === 'string' || typeof v === 'number'
    );
    return {
      enum: values,
      ...options,
    } as TEnum<T[keyof T][]>;
  },

  /**
   * Create an any schema
   */
  Any(options: SchemaOptions = {}): TAny {
    return {
      [AnyKind]: 'Any',
      ...options,
    } as TAny;
  },

  /**
   * Create an unknown schema
   */
  Unknown(options: SchemaOptions = {}): TUnknown {
    return {
      [UnknownKind]: 'Unknown',
      ...options,
    } as TUnknown;
  },

  /**
   * Create a never schema
   */
  Never(options: SchemaOptions = {}): TNever {
    return {
      not: {},
      ...options,
    } as TNever;
  },

  /**
   * Create a nullable version of a schema
   */
  Nullable<T extends TSchema>(schema: T): TUnion<[T, TNull]> {
    return Type.Union([schema, Type.Null()]);
  },

  /**
   * Pick specific properties from an object schema
   */
  Pick<T extends TProperties, K extends keyof T>(
    schema: TObject<T>,
    keys: readonly K[],
    options: ObjectOptions = {}
  ): TObject<Pick<T, K>> {
    const properties = {} as Pick<T, K>;
    for (const key of keys) {
      properties[key] = schema.properties[key];
    }
    const required = schema.required?.filter((k) => keys.includes(k as K));
    return Type.Object(properties, { ...options, required } as ObjectOptions & { required?: readonly K[] });
  },

  /**
   * Omit specific properties from an object schema
   */
  Omit<T extends TProperties, K extends keyof T>(
    schema: TObject<T>,
    keys: readonly K[],
    options: ObjectOptions = {}
  ): TObject<Omit<T, K>> {
    const properties = { ...schema.properties } as Omit<T, K>;
    for (const key of keys) {
      delete (properties as Record<string, unknown>)[key as string];
    }
    const required = schema.required?.filter((k) => !keys.includes(k as K));
    return Type.Object(properties, { ...options, required } as ObjectOptions & { required?: readonly (Exclude<keyof T, K>)[] });
  },

  /**
   * Extend an object schema with additional properties
   */
  Extend<T extends TProperties, U extends TProperties>(
    base: TObject<T>,
    extension: U,
    options: ObjectOptions = {}
  ): TObject<T & U> {
    const properties = { ...base.properties, ...extension } as T & U;
    return Type.Object(properties, options);
  },

  /**
   * Create a ref schema (for recursive types)
   */
  Ref<T extends TSchema>(schema: T & { $id: string }): T {
    return {
      $ref: `#/definitions/${schema.$id}`,
    } as unknown as T;
  },

  /**
   * Common string formats
   */
  Email(options: Omit<StringOptions, 'format'> = {}): TString {
    return Type.String({ ...options, format: 'email' });
  },

  Uri(options: Omit<StringOptions, 'format'> = {}): TString {
    return Type.String({ ...options, format: 'uri' });
  },

  Uuid(options: Omit<StringOptions, 'format'> = {}): TString {
    return Type.String({ ...options, format: 'uuid' });
  },

  Date(options: Omit<StringOptions, 'format'> = {}): TString {
    return Type.String({ ...options, format: 'date' });
  },

  DateTime(options: Omit<StringOptions, 'format'> = {}): TString {
    return Type.String({ ...options, format: 'date-time' });
  },

  Time(options: Omit<StringOptions, 'format'> = {}): TString {
    return Type.String({ ...options, format: 'time' });
  },

  IPv4(options: Omit<StringOptions, 'format'> = {}): TString {
    return Type.String({ ...options, format: 'ipv4' });
  },

  IPv6(options: Omit<StringOptions, 'format'> = {}): TString {
    return Type.String({ ...options, format: 'ipv6' });
  },
};
