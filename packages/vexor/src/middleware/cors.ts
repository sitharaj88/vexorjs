/**
 * CORS Middleware
 *
 * Cross-Origin Resource Sharing (CORS) support with flexible configuration.
 */

import type { VexorContext } from '../core/context.js';

// ============================================================================
// Types
// ============================================================================

export type CorsOrigin =
  | boolean
  | string
  | RegExp
  | (string | RegExp)[]
  | ((origin: string, ctx: VexorContext) => boolean | string | Promise<boolean | string>);

export interface CorsOptions {
  /**
   * Configures the Access-Control-Allow-Origin header.
   * - true: Reflects the request origin (allows all)
   * - false: Disables CORS
   * - string: Sets a specific origin
   * - RegExp: Tests against the origin
   * - Array: List of allowed origins
   * - Function: Custom logic to determine origin
   * Default: '*'
   */
  origin?: CorsOrigin;

  /**
   * Configures the Access-Control-Allow-Methods header.
   * Default: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE']
   */
  methods?: string | string[];

  /**
   * Configures the Access-Control-Allow-Headers header.
   * Default: Reflects the headers specified in the request's Access-Control-Request-Headers header
   */
  allowedHeaders?: string | string[];

  /**
   * Configures the Access-Control-Expose-Headers header.
   * Default: []
   */
  exposedHeaders?: string | string[];

  /**
   * Configures the Access-Control-Allow-Credentials header.
   * Default: false
   */
  credentials?: boolean;

  /**
   * Configures the Access-Control-Max-Age header in seconds.
   * Default: undefined (no header sent)
   */
  maxAge?: number;

  /**
   * Whether to pass the CORS preflight response to the next handler.
   * Default: false
   */
  preflightContinue?: boolean;

  /**
   * Provides a status code to use for successful OPTIONS requests.
   * Default: 204
   */
  optionsSuccessStatus?: number;
}

// ============================================================================
// Helpers
// ============================================================================

function isOriginAllowed(
  origin: string,
  allowedOrigin: CorsOrigin,
  ctx: VexorContext
): boolean | string | Promise<boolean | string> {
  if (typeof allowedOrigin === 'boolean') {
    return allowedOrigin;
  }

  if (typeof allowedOrigin === 'string') {
    return allowedOrigin === '*' || origin === allowedOrigin;
  }

  if (allowedOrigin instanceof RegExp) {
    return allowedOrigin.test(origin);
  }

  if (Array.isArray(allowedOrigin)) {
    for (const allowed of allowedOrigin) {
      if (typeof allowed === 'string' && (allowed === '*' || origin === allowed)) {
        return true;
      }
      if (allowed instanceof RegExp && allowed.test(origin)) {
        return true;
      }
    }
    return false;
  }

  if (typeof allowedOrigin === 'function') {
    return allowedOrigin(origin, ctx);
  }

  return false;
}

// Helper function for normalizing arrays - reserved for future use
function _normalizeArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}
void _normalizeArray; // Silence unused warning

function normalizeToString(value: string | string[] | undefined): string {
  if (!value) return '';
  if (Array.isArray(value)) return value.join(', ');
  return value;
}

// ============================================================================
// Default Options
// ============================================================================

const defaultOptions: Required<CorsOptions> = {
  origin: '*',
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: [],
  exposedHeaders: [],
  credentials: false,
  maxAge: undefined as unknown as number,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// ============================================================================
// CORS Middleware
// ============================================================================

/**
 * Create CORS middleware
 */
export function cors(options: CorsOptions = {}) {
  const opts = { ...defaultOptions, ...options };

  return async (ctx: VexorContext): Promise<Response | void> => {
    const origin = ctx.header('origin') || '';
    const method = ctx.method;

    // Build headers object
    const headers: Record<string, string> = {};

    // Handle origin
    if (origin) {
      const allowedResult = await isOriginAllowed(origin, opts.origin, ctx);

      if (allowedResult === true) {
        // Reflect the origin
        headers['Access-Control-Allow-Origin'] = origin;
      } else if (typeof allowedResult === 'string') {
        // Use the returned string
        headers['Access-Control-Allow-Origin'] = allowedResult;
      } else if (opts.origin === '*') {
        headers['Access-Control-Allow-Origin'] = '*';
      }
      // If false or not allowed, don't set the header
    } else if (opts.origin === '*') {
      headers['Access-Control-Allow-Origin'] = '*';
    }

    // Vary header for caching
    if (opts.origin !== '*' && origin) {
      headers['Vary'] = 'Origin';
    }

    // Credentials
    if (opts.credentials) {
      headers['Access-Control-Allow-Credentials'] = 'true';
    }

    // Exposed headers
    const exposedHeaders = normalizeToString(opts.exposedHeaders);
    if (exposedHeaders) {
      headers['Access-Control-Expose-Headers'] = exposedHeaders;
    }

    // Handle preflight request
    if (method === 'OPTIONS') {
      // Methods
      const methods = normalizeToString(opts.methods);
      if (methods) {
        headers['Access-Control-Allow-Methods'] = methods;
      }

      // Allowed headers
      let allowedHeaders = normalizeToString(opts.allowedHeaders);
      if (!allowedHeaders) {
        // Reflect requested headers
        const requestedHeaders = ctx.header('access-control-request-headers');
        if (requestedHeaders) {
          allowedHeaders = requestedHeaders;
          headers['Vary'] = headers['Vary']
            ? `${headers['Vary']}, Access-Control-Request-Headers`
            : 'Access-Control-Request-Headers';
        }
      }
      if (allowedHeaders) {
        headers['Access-Control-Allow-Headers'] = allowedHeaders;
      }

      // Max age
      if (opts.maxAge !== undefined) {
        headers['Access-Control-Max-Age'] = String(opts.maxAge);
      }

      // Store headers in context for later use
      (ctx as any)._corsHeaders = headers;

      // Handle preflight
      if (!opts.preflightContinue) {
        // Build response with headers
        const responseHeaders = new Headers();
        for (const [key, value] of Object.entries(headers)) {
          responseHeaders.set(key, value);
        }
        responseHeaders.set('Content-Length', '0');

        return new Response(null, {
          status: opts.optionsSuccessStatus,
          headers: responseHeaders,
        });
      }
    } else {
      // Store headers in context for actual requests
      (ctx as any)._corsHeaders = headers;
    }
  };
}

/**
 * Simple CORS - allows all origins
 */
export function simpleCors() {
  return cors({
    origin: true,
    credentials: true,
  });
}

/**
 * Get CORS headers from context
 */
export function getCorsHeaders(ctx: VexorContext): Record<string, string> | undefined {
  return (ctx as any)._corsHeaders;
}

/**
 * Apply CORS headers to a response
 */
export function applyCorsHeaders(ctx: VexorContext, response: Response): Response {
  const corsHeaders = getCorsHeaders(ctx);
  if (!corsHeaders) {
    return response;
  }

  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders)) {
    headers.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Create CORS middleware for specific origins
 */
export function corsWithOrigins(origins: string[], options: Omit<CorsOptions, 'origin'> = {}) {
  return cors({
    ...options,
    origin: origins,
  });
}

/**
 * Create CORS middleware with regex pattern
 */
export function corsWithPattern(pattern: RegExp, options: Omit<CorsOptions, 'origin'> = {}) {
  return cors({
    ...options,
    origin: pattern,
  });
}
