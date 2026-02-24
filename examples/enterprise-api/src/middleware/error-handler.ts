/**
 * Error Handler Middleware
 *
 * Centralized error handling with structured responses.
 */

import type { VexorContext } from '@vexorjs/core';
import { config } from '../config/index.js';

// ============================================================================
// Custom Error Classes
// ============================================================================

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, 'VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(401, 'AUTHENTICATION_ERROR', message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Permission denied') {
    super(403, 'AUTHORIZATION_ERROR', message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(404, 'NOT_FOUND', `${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, 'CONFLICT', message);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfter: number;

  constructor(retryAfter: number) {
    super(429, 'RATE_LIMIT_EXCEEDED', `Too many requests. Retry after ${retryAfter} seconds.`, { retryAfter });
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class InternalError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(500, 'INTERNAL_ERROR', message);
    this.name = 'InternalError';
  }
}

// ============================================================================
// Error Response Builder
// ============================================================================

interface ErrorResponse {
  error: string;
  code: string;
  message: string;
  details?: unknown;
  stack?: string;
  requestId?: string;
}

function buildErrorResponse(error: AppError, ctx: VexorContext): ErrorResponse {
  const response: ErrorResponse = {
    error: error.name,
    code: error.code,
    message: error.message,
    requestId: ctx.requestId,
  };

  if (error.details) {
    response.details = error.details;
  }

  // Include stack trace in development
  if (config.isDevelopment && error.stack) {
    response.stack = error.stack;
  }

  return response;
}

// ============================================================================
// Error Handler
// ============================================================================

export async function errorHandler(error: Error, ctx: VexorContext): Promise<Response> {
  // Log the error
  console.error(`[ERROR] ${ctx.method} ${ctx.path}:`, {
    requestId: ctx.requestId,
    error: error.message,
    stack: error.stack,
  });

  // Handle known error types
  if (error instanceof AppError) {
    // Build base response
    let response = ctx.status(error.statusCode);

    // Add rate limit headers if present
    const rateLimitHeaders = (ctx as any)._rateLimitHeaders as Record<string, string> | undefined;
    if (rateLimitHeaders) {
      for (const [key, value] of Object.entries(rateLimitHeaders)) {
        response = response.header(key, value);
      }
    }

    return response.json(buildErrorResponse(error, ctx));
  }

  // Handle JSON parse errors
  if (error instanceof SyntaxError && 'body' in error) {
    const appError = new ValidationError('Invalid JSON body');
    return ctx.status(400).json(buildErrorResponse(appError, ctx));
  }

  // Handle unknown errors
  const appError = new InternalError(
    config.isDevelopment ? error.message : 'An unexpected error occurred'
  );

  return ctx.status(500).json(buildErrorResponse(appError, ctx));
}

// ============================================================================
// Async Handler Wrapper
// ============================================================================

type AsyncHandler = (ctx: VexorContext) => Promise<Response>;

export function asyncHandler(handler: AsyncHandler) {
  return async (ctx: VexorContext): Promise<Response> => {
    try {
      return await handler(ctx);
    } catch (error) {
      return errorHandler(error as Error, ctx);
    }
  };
}
