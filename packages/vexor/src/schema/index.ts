/**
 * Schema Module
 *
 * TypeBox-compatible schema builder with full TypeScript inference.
 * Provides validation schemas, type inference, and Standard Schema compliance.
 */

// Type definitions
export type {
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

export {
  OptionalKind,
  ReadonlyKind,
  AnyKind,
  UnknownKind,
} from './types.js';

// Type namespace (schema builder)
export { Type } from './type.js';

// Type inference utilities
export type { Static, Simplify, StaticPretty } from './static.js';

// Standard Schema compliance
export type {
  StandardSchemaResult,
  StandardSchemaIssue,
  StandardSchema,
} from './standard.js';

export {
  STANDARD_SCHEMA_VERSION,
  isStandardSchema,
  toStandardSchema,
  createResult,
  createResultWithIssues,
  createIssue,
  validate,
  hasIssues,
  getErrors,
} from './standard.js';
