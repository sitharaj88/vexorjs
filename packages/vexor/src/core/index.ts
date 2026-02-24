/**
 * Core Module Exports
 */

export { VexorRequest, createRequest } from './request.js';
export { VexorResponse, ResponseBuilder } from './response.js';
export { VexorContext, ContextPool, contextPool } from './context.js';
export type { ContextState } from './context.js';
export { Vexor, createApp } from './app.js';
export type { RouteOptions, VexorHandler, ServerInstance } from './app.js';

// Re-export types
export type {
  HTTPMethod,
  ParsedQuery,
  RouteParams,
  CookieOptions,
  ParsedCookies,
  RuntimeCapabilities,
  RuntimeType,
  RawRequest,
  HookType,
  HookFunction,
  ErrorHandler,
  Handler,
  RouteDefinition,
  RouteSchema,
  RouteHooks,
  VexorOptions,
  LoggingOptions,
  MatchedRoute,
} from './types.js';
