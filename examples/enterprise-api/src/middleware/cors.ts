/**
 * CORS Middleware - Simplified for Vexor hook pattern
 *
 * Sets CORS headers on the context state for handlers to use.
 */

import type { VexorContext } from '@vexorjs/core';
import { config } from '../config/index.js';

export interface CorsOptions {
  origin: string | string[] | ((origin: string) => boolean);
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

const defaultOptions: CorsOptions = {
  origin: config.corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  credentials: true,
  maxAge: 86400,
};

function isOriginAllowed(origin: string, allowed: CorsOptions['origin']): boolean {
  if (allowed === '*') return true;
  if (typeof allowed === 'string') return origin === allowed;
  if (typeof allowed === 'function') return allowed(origin);
  if (Array.isArray(allowed)) return allowed.includes(origin);
  return false;
}

/**
 * Store CORS options in context state for handlers to use
 */
export function cors(options: Partial<CorsOptions> = {}) {
  const opts = { ...defaultOptions, ...options };

  return async (ctx: VexorContext): Promise<void> => {
    const origin = ctx.header('origin') || '';

    // Determine allowed origin
    let allowedOrigin = '*';
    if (opts.origin !== '*') {
      if (isOriginAllowed(origin, opts.origin)) {
        allowedOrigin = origin;
      } else {
        allowedOrigin = '';
      }
    }

    // Store CORS config in context state for handlers
    (ctx as any)._corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Credentials': opts.credentials ? 'true' : 'false',
      'Access-Control-Allow-Methods': opts.methods?.join(', ') || '',
      'Access-Control-Allow-Headers': opts.allowedHeaders?.join(', ') || '',
      'Access-Control-Expose-Headers': opts.exposedHeaders?.join(', ') || '',
      'Access-Control-Max-Age': opts.maxAge?.toString() || '86400',
    };
  };
}

/**
 * Helper to add CORS headers to a response
 */
export function addCorsHeaders(ctx: VexorContext, headers: Headers): void {
  const corsHeaders = (ctx as any)._corsHeaders;
  if (corsHeaders) {
    for (const [key, value] of Object.entries(corsHeaders)) {
      if (value) {
        headers.set(key, value);
      }
    }
  }
}
