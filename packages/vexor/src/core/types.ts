/**
 * Vexor Core Types
 * All types used throughout the framework
 */

import type { TSchema } from '../schema/types.js';

// HTTP Methods supported by Vexor
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

// Parsed query string type
export type ParsedQuery = Record<string, string | string[] | undefined>;

// Route parameters type
export type RouteParams = Record<string, string>;

// Cookie options for setting cookies
export interface CookieOptions {
  maxAge?: number;
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

// Parsed cookie type
export type ParsedCookies = Record<string, string>;

// Runtime adapter capabilities
export interface RuntimeCapabilities {
  http2: boolean;
  streaming: boolean;
  websocket: boolean;
  workerThreads: boolean;
  fileSystem: boolean;
}

// Runtime types
export type RuntimeType = 'node' | 'bun' | 'deno' | 'edge';

// Raw request types from different runtimes
export type RawRequest =
  | import('http').IncomingMessage
  | Request
  | unknown;

// Hook types for middleware pipeline
export type HookType =
  | 'onRequest'
  | 'preParsing'
  | 'preValidation'
  | 'preHandler'
  | 'preSerialization'
  | 'onSend'
  | 'onResponse'
  | 'onError';

// Generic handler function
export type Handler<TContext = unknown> = (ctx: TContext) => Response | Promise<Response>;

// Hook function
export type HookFunction<TContext = unknown> = (ctx: TContext) => void | Promise<void>;

// Error handler function
export type ErrorHandler<TContext = unknown> = (
  error: Error,
  ctx: TContext
) => Response | Promise<Response>;

// Route definition
export interface RouteDefinition<TContext = unknown> {
  method: HTTPMethod;
  path: string;
  handler: Handler<TContext>;
  schema?: RouteSchema;
  hooks?: RouteHooks<TContext>;
}

// Route schema for validation
export interface RouteSchema {
  params?: TSchema;
  query?: TSchema;
  body?: TSchema;
  headers?: TSchema;
  response?: Record<number, TSchema>;
}

// Route-specific hooks
export interface RouteHooks<TContext = unknown> {
  onRequest?: HookFunction<TContext>[];
  preValidation?: HookFunction<TContext>[];
  preHandler?: HookFunction<TContext>[];
  onSend?: HookFunction<TContext>[];
}

// Server options
export interface VexorOptions {
  port?: number;
  host?: string;
  logging?: boolean | LoggingOptions;
  trustProxy?: boolean;
  maxBodySize?: number;
  requestTimeout?: number;
}

// Logging options
export interface LoggingOptions {
  level?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  pretty?: boolean;
  redact?: string[];
}

// Matched route result
export interface MatchedRoute<TContext = unknown> {
  handler: Handler<TContext>;
  params: RouteParams;
  schema?: RouteSchema;
  hooks?: RouteHooks<TContext>;
}
