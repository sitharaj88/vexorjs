/**
 * Standard Schema Compliance
 *
 * Implements the Standard Schema specification for interoperability
 * with other validation libraries (Zod, Valibot, ArkType, etc.)
 *
 * @see https://github.com/standard-schema/standard-schema
 */

import type { TSchema } from './types.js';

/**
 * Standard Schema version
 */
export const STANDARD_SCHEMA_VERSION = 1;

/**
 * Standard Schema validation result
 */
export interface StandardSchemaResult<T> {
  readonly value: T;
  readonly issues?: readonly StandardSchemaIssue[];
}

/**
 * Standard Schema issue
 */
export interface StandardSchemaIssue {
  readonly message: string;
  readonly path?: readonly (string | number)[];
}

/**
 * Standard Schema interface
 */
export interface StandardSchema<T = unknown> {
  readonly '~standard': {
    readonly version: typeof STANDARD_SCHEMA_VERSION;
    readonly vendor: string;
    readonly validate: (data: unknown) => StandardSchemaResult<T>;
  };
}

/**
 * Check if a schema implements Standard Schema
 */
export function isStandardSchema(schema: unknown): schema is StandardSchema {
  return (
    typeof schema === 'object' &&
    schema !== null &&
    '~standard' in schema &&
    typeof (schema as StandardSchema)['~standard'] === 'object' &&
    (schema as StandardSchema)['~standard'].version === STANDARD_SCHEMA_VERSION
  );
}

/**
 * Wrap a Vexor schema with Standard Schema interface
 */
export function toStandardSchema<T>(
  schema: TSchema,
  validate: (data: unknown) => StandardSchemaResult<T>
): TSchema & StandardSchema<T> {
  return {
    ...schema,
    '~standard': {
      version: STANDARD_SCHEMA_VERSION,
      vendor: 'vexor',
      validate,
    },
  };
}

/**
 * Create validation result for Standard Schema
 */
export function createResult<T>(value: T): StandardSchemaResult<T> {
  return { value };
}

/**
 * Create validation result with issues
 */
export function createResultWithIssues<T>(
  value: T,
  issues: readonly StandardSchemaIssue[]
): StandardSchemaResult<T> {
  return { value, issues };
}

/**
 * Create a validation issue
 */
export function createIssue(
  message: string,
  path?: readonly (string | number)[]
): StandardSchemaIssue {
  return path ? { message, path } : { message };
}

/**
 * Validate data against a Standard Schema
 */
export function validate<T>(
  schema: StandardSchema<T>,
  data: unknown
): StandardSchemaResult<T> {
  return schema['~standard'].validate(data);
}

/**
 * Check if validation result has issues
 */
export function hasIssues<T>(result: StandardSchemaResult<T>): boolean {
  return result.issues !== undefined && result.issues.length > 0;
}

/**
 * Get validation errors as a flat list of strings
 */
export function getErrors<T>(result: StandardSchemaResult<T>): string[] {
  if (!result.issues) return [];
  return result.issues.map((issue) => {
    if (issue.path && issue.path.length > 0) {
      return `${issue.path.join('.')}: ${issue.message}`;
    }
    return issue.message;
  });
}
