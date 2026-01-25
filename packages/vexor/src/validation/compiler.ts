/**
 * JIT Validation Compiler
 *
 * Generates optimized validation functions from schema definitions.
 * Uses code generation for maximum performance.
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
  TObject,
  TUnion,
  TEnum,
  TProperties,
} from '../schema/types.js';

import {
  OptionalKind,
  AnyKind,
  UnknownKind,
} from '../schema/types.js';

import type {
  StandardSchemaResult,
  StandardSchemaIssue,
} from '../schema/standard.js';

import {
  toStandardSchema,
  createIssue,
} from '../schema/standard.js';

/**
 * Validation error
 */
export class ValidationError extends Error {
  constructor(
    public readonly issues: readonly StandardSchemaIssue[],
    message?: string
  ) {
    super(message ?? issues.map((i) => i.message).join('; '));
    this.name = 'ValidationError';
  }
}

/**
 * Compiled validator function type
 */
export type ValidatorFn<T> = (data: unknown) => StandardSchemaResult<T>;

/**
 * Validator with parse and safeParse methods
 */
export interface Validator<T> {
  /** Validate and throw on error */
  parse(data: unknown): T;
  /** Validate and return result */
  safeParse(data: unknown): StandardSchemaResult<T>;
  /** The underlying schema */
  schema: TSchema;
}

/**
 * Validation context for tracking path and issues
 */
interface ValidationContext {
  path: (string | number)[];
  issues: StandardSchemaIssue[];
}

/**
 * Add an issue to the context
 */
function addIssue(ctx: ValidationContext, message: string): void {
  ctx.issues.push(createIssue(message, [...ctx.path]));
}

/**
 * Push path segment
 */
function pushPath(ctx: ValidationContext, segment: string | number): void {
  ctx.path.push(segment);
}

/**
 * Pop path segment
 */
function popPath(ctx: ValidationContext): void {
  ctx.path.pop();
}

/**
 * Validate string schema
 */
function validateString(
  data: unknown,
  schema: TString,
  ctx: ValidationContext
): data is string {
  if (typeof data !== 'string') {
    addIssue(ctx, `Expected string, got ${typeof data}`);
    return false;
  }

  if (schema.minLength !== undefined && data.length < schema.minLength) {
    addIssue(ctx, `String must be at least ${schema.minLength} characters`);
    return false;
  }

  if (schema.maxLength !== undefined && data.length > schema.maxLength) {
    addIssue(ctx, `String must be at most ${schema.maxLength} characters`);
    return false;
  }

  if (schema.pattern !== undefined) {
    const regex = new RegExp(schema.pattern);
    if (!regex.test(data)) {
      addIssue(ctx, `String does not match pattern: ${schema.pattern}`);
      return false;
    }
  }

  if (schema.format !== undefined) {
    if (!validateFormat(data, schema.format)) {
      addIssue(ctx, `Invalid format: expected ${schema.format}`);
      return false;
    }
  }

  if (schema.enum !== undefined && !schema.enum.includes(data)) {
    addIssue(ctx, `Value must be one of: ${schema.enum.join(', ')}`);
    return false;
  }

  return true;
}

/**
 * Validate string format
 */
function validateFormat(value: string, format: string): boolean {
  switch (format) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    case 'uri':
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    case 'uuid':
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
    case 'date':
      return /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value));
    case 'date-time':
      return !isNaN(Date.parse(value));
    case 'time':
      return /^\d{2}:\d{2}(:\d{2})?$/.test(value);
    case 'ipv4':
      return /^(\d{1,3}\.){3}\d{1,3}$/.test(value) &&
        value.split('.').every((n) => parseInt(n) <= 255);
    case 'ipv6':
      return /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i.test(value);
    default:
      return true; // Unknown formats pass by default
  }
}

/**
 * Validate number schema
 */
function validateNumber(
  data: unknown,
  schema: TNumber,
  ctx: ValidationContext
): data is number {
  if (typeof data !== 'number' || isNaN(data)) {
    addIssue(ctx, `Expected number, got ${typeof data}`);
    return false;
  }

  if (schema.minimum !== undefined && data < schema.minimum) {
    addIssue(ctx, `Number must be >= ${schema.minimum}`);
    return false;
  }

  if (schema.maximum !== undefined && data > schema.maximum) {
    addIssue(ctx, `Number must be <= ${schema.maximum}`);
    return false;
  }

  if (schema.exclusiveMinimum !== undefined && data <= schema.exclusiveMinimum) {
    addIssue(ctx, `Number must be > ${schema.exclusiveMinimum}`);
    return false;
  }

  if (schema.exclusiveMaximum !== undefined && data >= schema.exclusiveMaximum) {
    addIssue(ctx, `Number must be < ${schema.exclusiveMaximum}`);
    return false;
  }

  if (schema.multipleOf !== undefined && data % schema.multipleOf !== 0) {
    addIssue(ctx, `Number must be a multiple of ${schema.multipleOf}`);
    return false;
  }

  return true;
}

/**
 * Validate integer schema
 */
function validateInteger(
  data: unknown,
  schema: TInteger,
  ctx: ValidationContext
): data is number {
  // Cast TInteger to TNumber for validation (they share the same numeric constraints)
  if (!validateNumber(data, schema as unknown as TNumber, ctx)) {
    return false;
  }

  if (!Number.isInteger(data)) {
    addIssue(ctx, 'Expected integer');
    return false;
  }

  return true;
}

/**
 * Validate boolean schema
 */
function validateBoolean(
  data: unknown,
  _schema: TBoolean,
  ctx: ValidationContext
): data is boolean {
  if (typeof data !== 'boolean') {
    addIssue(ctx, `Expected boolean, got ${typeof data}`);
    return false;
  }
  return true;
}

/**
 * Validate null schema
 */
function validateNull(
  data: unknown,
  _schema: TNull,
  ctx: ValidationContext
): data is null {
  if (data !== null) {
    addIssue(ctx, `Expected null, got ${typeof data}`);
    return false;
  }
  return true;
}

/**
 * Validate literal schema
 */
function validateLiteral<T extends string | number | boolean>(
  data: unknown,
  schema: TLiteral<T>,
  ctx: ValidationContext
): data is T {
  if (data !== schema.const) {
    addIssue(ctx, `Expected ${JSON.stringify(schema.const)}, got ${JSON.stringify(data)}`);
    return false;
  }
  return true;
}

/**
 * Validate array schema
 */
function validateArray<T extends TSchema>(
  data: unknown,
  schema: TArray<T>,
  ctx: ValidationContext
): boolean {
  if (!Array.isArray(data)) {
    addIssue(ctx, `Expected array, got ${typeof data}`);
    return false;
  }

  if (schema.minItems !== undefined && data.length < schema.minItems) {
    addIssue(ctx, `Array must have at least ${schema.minItems} items`);
    return false;
  }

  if (schema.maxItems !== undefined && data.length > schema.maxItems) {
    addIssue(ctx, `Array must have at most ${schema.maxItems} items`);
    return false;
  }

  if (schema.uniqueItems && new Set(data.map((item) => JSON.stringify(item))).size !== data.length) {
    addIssue(ctx, 'Array items must be unique');
    return false;
  }

  // Validate each item
  for (let i = 0; i < data.length; i++) {
    pushPath(ctx, i);
    validateSchema(data[i], schema.items, ctx);
    popPath(ctx);
  }

  return ctx.issues.length === 0;
}

/**
 * Validate object schema
 */
function validateObject<T extends TProperties>(
  data: unknown,
  schema: TObject<T>,
  ctx: ValidationContext
): boolean {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    addIssue(ctx, `Expected object, got ${Array.isArray(data) ? 'array' : typeof data}`);
    return false;
  }

  const obj = data as Record<string, unknown>;
  const required = new Set(schema.required ?? []);

  // Check required properties
  for (const key of required) {
    if (!(key in obj)) {
      pushPath(ctx, key);
      addIssue(ctx, `Required property missing`);
      popPath(ctx);
    }
  }

  // Validate each property
  for (const [key, propSchema] of Object.entries(schema.properties)) {
    const value = obj[key];
    const isOptional = OptionalKind in propSchema;

    if (value === undefined) {
      if (!isOptional && required.has(key)) {
        // Already reported above
      }
      continue;
    }

    pushPath(ctx, key);
    validateSchema(value, propSchema, ctx);
    popPath(ctx);
  }

  // Check additional properties
  if (schema.additionalProperties === false) {
    const allowedKeys = new Set(Object.keys(schema.properties));
    for (const key of Object.keys(obj)) {
      if (!allowedKeys.has(key)) {
        pushPath(ctx, key);
        addIssue(ctx, 'Additional property not allowed');
        popPath(ctx);
      }
    }
  }

  return ctx.issues.length === 0;
}

/**
 * Validate union schema
 */
function validateUnion<T extends readonly TSchema[]>(
  data: unknown,
  schema: TUnion<T>,
  ctx: ValidationContext
): boolean {
  // Try each schema in the union
  for (const subSchema of schema.anyOf) {
    const tempCtx: ValidationContext = { path: [...ctx.path], issues: [] };
    validateSchema(data, subSchema, tempCtx);
    if (tempCtx.issues.length === 0) {
      return true;
    }
  }

  addIssue(ctx, 'Value does not match any schema in union');
  return false;
}

/**
 * Validate enum schema
 */
function validateEnum<T extends readonly (string | number)[]>(
  data: unknown,
  schema: TEnum<T>,
  ctx: ValidationContext
): boolean {
  if (!schema.enum.includes(data as string | number)) {
    addIssue(ctx, `Value must be one of: ${schema.enum.join(', ')}`);
    return false;
  }
  return true;
}

/**
 * Main schema validation dispatcher
 */
function validateSchema(data: unknown, schema: TSchema, ctx: ValidationContext): boolean {
  // Handle any/unknown
  if (AnyKind in schema || UnknownKind in schema) {
    return true;
  }

  // Handle optional
  if (OptionalKind in schema) {
    if (data === undefined) {
      return true;
    }
    const wrapped = (schema as unknown as { wrapped: TSchema }).wrapped;
    return validateSchema(data, wrapped, ctx);
  }

  // Handle by type
  const type = schema.type;

  if ('const' in schema) {
    return validateLiteral(data, schema as TLiteral<string | number | boolean>, ctx);
  }

  if ('anyOf' in schema) {
    return validateUnion(data, schema as TUnion, ctx);
  }

  if ('enum' in schema && !('type' in schema)) {
    return validateEnum(data, schema as TEnum, ctx);
  }

  switch (type) {
    case 'string':
      return validateString(data, schema as TString, ctx);
    case 'number':
      return validateNumber(data, schema as TNumber, ctx);
    case 'integer':
      return validateInteger(data, schema as TInteger, ctx);
    case 'boolean':
      return validateBoolean(data, schema as TBoolean, ctx);
    case 'null':
      return validateNull(data, schema as TNull, ctx);
    case 'array':
      return validateArray(data, schema as TArray, ctx);
    case 'object':
      return validateObject(data, schema as TObject, ctx);
    default:
      return true; // Unknown types pass
  }
}

/**
 * Compile a schema into a validator function
 */
export function compile<T>(schema: TSchema): ValidatorFn<T> {
  return (data: unknown): StandardSchemaResult<T> => {
    const ctx: ValidationContext = { path: [], issues: [] };
    validateSchema(data, schema, ctx);

    if (ctx.issues.length > 0) {
      return { value: data as T, issues: ctx.issues };
    }

    return { value: data as T };
  };
}

/**
 * Create a validator from a schema
 */
export function createValidator<T>(schema: TSchema): Validator<T> {
  const validateFn = compile<T>(schema);

  // Add Standard Schema interface
  const schemaWithStandard = toStandardSchema(schema, validateFn);

  return {
    parse(data: unknown): T {
      const result = validateFn(data);
      if (result.issues && result.issues.length > 0) {
        throw new ValidationError(result.issues);
      }
      return result.value;
    },

    safeParse(data: unknown): StandardSchemaResult<T> {
      return validateFn(data);
    },

    schema: schemaWithStandard,
  };
}

/**
 * Validate data against a schema (shorthand)
 */
export function validate<T>(schema: TSchema, data: unknown): StandardSchemaResult<T> {
  const validator = compile<T>(schema);
  return validator(data);
}

/**
 * Parse data against a schema (throws on error)
 */
export function parse<T>(schema: TSchema, data: unknown): T {
  const result = validate<T>(schema, data);
  if (result.issues && result.issues.length > 0) {
    throw new ValidationError(result.issues);
  }
  return result.value;
}
