/**
 * Validation Middleware
 *
 * Provides middleware functions for validating request data
 * against schemas defined on routes.
 */

import type { VexorContext } from '../core/context.js';
import type { TSchema } from '../schema/types.js';
import type { RouteSchema } from '../core/types.js';
import { compile, ValidationError } from './compiler.js';

/**
 * Compiled validators cache
 */
const validatorCache = new Map<TSchema, ReturnType<typeof compile>>();

/**
 * Get or compile a validator for a schema
 */
function getValidator<T>(schema: TSchema): ReturnType<typeof compile<T>> {
  let validator = validatorCache.get(schema);
  if (!validator) {
    validator = compile(schema);
    validatorCache.set(schema, validator);
  }
  return validator as ReturnType<typeof compile<T>>;
}

/**
 * Validate params against schema
 */
export function validateParams(ctx: VexorContext, schema: TSchema): void {
  const validator = getValidator(schema);
  const result = validator(ctx.params);

  if (result.issues && result.issues.length > 0) {
    throw new ValidationError(
      result.issues.map(issue => ({
        ...issue,
        path: ['params', ...(issue.path || [])]
      })),
      'Params validation failed'
    );
  }
}

/**
 * Validate query against schema
 */
export function validateQuery(ctx: VexorContext, schema: TSchema): void {
  const validator = getValidator(schema);
  const result = validator(ctx.query);

  if (result.issues && result.issues.length > 0) {
    throw new ValidationError(
      result.issues.map(issue => ({
        ...issue,
        path: ['query', ...(issue.path || [])]
      })),
      'Query validation failed'
    );
  }
}

/**
 * Validate body against schema
 */
export async function validateBody(ctx: VexorContext, schema: TSchema): Promise<void> {
  const body = await ctx.readJson();
  const validator = getValidator(schema);
  const result = validator(body);

  if (result.issues && result.issues.length > 0) {
    throw new ValidationError(
      result.issues.map(issue => ({
        ...issue,
        path: ['body', ...(issue.path || [])]
      })),
      'Body validation failed'
    );
  }

  // Store validated body on context
  ctx.set('validatedBody', result.value);
}

/**
 * Validate headers against schema
 */
export function validateHeaders(ctx: VexorContext, schema: TSchema): void {
  // Convert headers to plain object
  const headers: Record<string, string> = {};
  ctx.req.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  const validator = getValidator(schema);
  const result = validator(headers);

  if (result.issues && result.issues.length > 0) {
    throw new ValidationError(
      result.issues.map(issue => ({
        ...issue,
        path: ['headers', ...(issue.path || [])]
      })),
      'Headers validation failed'
    );
  }
}

/**
 * Create validation middleware for a route schema
 */
export function createValidationMiddleware(schema: RouteSchema) {
  return async (ctx: VexorContext): Promise<void> => {
    // Validate params
    if (schema.params) {
      validateParams(ctx, schema.params);
    }

    // Validate query
    if (schema.query) {
      validateQuery(ctx, schema.query);
    }

    // Validate headers
    if (schema.headers) {
      validateHeaders(ctx, schema.headers);
    }

    // Validate body (async)
    if (schema.body) {
      await validateBody(ctx, schema.body);
    }
  };
}

/**
 * Error response for validation errors
 */
export function validationErrorResponse(error: ValidationError): Response {
  return new Response(
    JSON.stringify({
      error: 'Validation Error',
      code: 'VALIDATION_ERROR',
      issues: error.issues,
    }),
    {
      status: 400,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    }
  );
}
