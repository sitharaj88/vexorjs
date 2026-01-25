/**
 * Static Type Inference
 *
 * Extracts TypeScript types from schema definitions.
 * This is the core of Vexor's end-to-end type safety.
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
} from './types.js';

/**
 * Infer the TypeScript type from a schema
 */
export type Static<T extends TSchema> =
  // Literal (const)
  T extends TLiteral<infer U> ? U :
  // String
  T extends TString ? string :
  // Number
  T extends TNumber ? number :
  // Integer
  T extends TInteger ? number :
  // Boolean
  T extends TBoolean ? boolean :
  // Null
  T extends TNull ? null :
  // Array
  T extends TArray<infer U> ? Static<U>[] :
  // Tuple
  T extends TTuple<infer U> ? StaticTuple<U> :
  // Object
  T extends TObject<infer P> ? StaticObject<P, T> :
  // Union
  T extends TUnion<infer U> ? StaticUnion<U> :
  // Intersect
  T extends TIntersect<infer U> ? StaticIntersect<U> :
  // Optional
  T extends TOptional<infer U> ? Static<U> | undefined :
  // Readonly
  T extends TReadonly<infer U> ? Readonly<Static<U>> :
  // Record
  T extends TRecord<infer _K, infer V> ? Record<string, Static<V>> :
  // Enum
  T extends TEnum<infer U> ? U[number] :
  // Any
  T extends TAny ? any :
  // Unknown
  T extends TUnknown ? unknown :
  // Never
  T extends TNever ? never :
  // Default
  unknown;

/**
 * Infer tuple types
 */
type StaticTuple<T extends readonly TSchema[]> = {
  [K in keyof T]: T[K] extends TSchema ? Static<T[K]> : never;
};

/**
 * Infer union types
 */
type StaticUnion<T extends readonly TSchema[]> = Static<T[number]>;

/**
 * Infer intersection types
 */
type StaticIntersect<T extends readonly TSchema[]> = UnionToIntersection<Static<T[number]>>;

/**
 * Helper to convert union to intersection
 */
type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

/**
 * Extract required keys from object schema
 */
type RequiredKeys<T extends TProperties, R extends readonly string[] | undefined> =
  R extends readonly string[]
    ? Extract<keyof T, R[number]>
    : keyof T;

/**
 * Extract optional keys from object schema
 */
type OptionalKeys<T extends TProperties, R extends readonly string[] | undefined> =
  R extends readonly string[]
    ? Exclude<keyof T, R[number]>
    : never;

/**
 * Infer object types with required/optional handling
 */
type StaticObject<P extends TProperties, T extends TObject<P>> =
  // Check if required array is defined
  T extends { required: readonly string[] }
    ? (
        // Required properties
        { [K in RequiredKeys<P, T['required']>]: Static<P[K]> } &
        // Optional properties
        { [K in OptionalKeys<P, T['required']>]?: Static<P[K]> }
      )
    : // No required array, check individual properties for Optional modifier
      {
        [K in keyof P as P[K] extends TOptional ? never : K]: Static<P[K]>;
      } & {
        [K in keyof P as P[K] extends TOptional ? K : never]?: P[K] extends TOptional<infer U> ? Static<U> : never;
      };

/**
 * Simplify complex types for better IDE display
 */
export type Simplify<T> = { [K in keyof T]: T[K] } & {};

/**
 * Pretty version of Static that simplifies the output
 */
export type StaticPretty<T extends TSchema> = Simplify<Static<T>>;
