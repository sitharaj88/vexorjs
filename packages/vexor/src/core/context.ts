/**
 * VexorContext - Request context with object pooling
 *
 * The context object that gets passed to route handlers.
 * Uses object pooling for zero-allocation performance.
 */

import { VexorRequest } from './request.js';
import { ResponseBuilder, VexorResponse } from './response.js';
import type {
  RouteParams,
  ParsedQuery,
  ParsedCookies,
  CookieOptions,
  MatchedRoute,
} from './types.js';

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Context state - custom data that can be set by middleware/plugins
 */
export type ContextState = Record<string, unknown>;

/**
 * VexorContext - The request context passed to handlers
 */
export class VexorContext {
  // Core request/response
  private _vexorRequest!: VexorRequest;
  private _route?: MatchedRoute;
  private _responseBuilder!: ResponseBuilder;

  // Request metadata
  private _requestId!: string;
  private _startTime!: number;

  // Custom state (for middleware/plugins to store data)
  private _state!: ContextState;

  // Flag to track if context has been initialized
  private _initialized = false;

  /**
   * Initialize the context with a new request
   * Called by the pool when acquiring a context
   */
  init(request: VexorRequest, route?: MatchedRoute): void {
    this._vexorRequest = request;
    this._route = route;
    this._responseBuilder = new ResponseBuilder();
    this._requestId = generateRequestId();
    this._startTime = performance.now();
    this._state = {};
    this._initialized = true;

    // Set route params if available
    if (route?.params) {
      request.setParams(route.params);
    }
  }

  /**
   * Reset the context for reuse in the pool
   */
  reset(): void {
    this._initialized = false;
    this._route = undefined;
    this._state = {};
  }

  /**
   * Check if context is initialized
   */
  get initialized(): boolean {
    return this._initialized;
  }

  // ============ Request Properties ============

  /**
   * Get the underlying VexorRequest
   */
  get req(): VexorRequest {
    return this._vexorRequest;
  }

  /**
   * Get the original Request object
   */
  get request(): Request {
    return this._vexorRequest.request;
  }

  /**
   * HTTP method
   */
  get method(): string {
    return this._vexorRequest.method;
  }

  /**
   * Request URL
   */
  get url(): string {
    return this._vexorRequest.url;
  }

  /**
   * URL pathname
   */
  get path(): string {
    return this._vexorRequest.path;
  }

  /**
   * Request headers
   */
  get headers(): Headers {
    return this._vexorRequest.headers;
  }

  /**
   * Get a specific header
   */
  header(name: string): string | null {
    return this._vexorRequest.header(name);
  }

  /**
   * Route parameters
   */
  get params(): RouteParams {
    return this._vexorRequest.params;
  }

  /**
   * Parsed query string
   */
  get query(): ParsedQuery {
    return this._vexorRequest.query;
  }

  /**
   * Get a specific query parameter
   */
  queryParam(name: string): string | string[] | undefined {
    return this._vexorRequest.queryParam(name);
  }

  /**
   * Parsed cookies
   */
  get cookies(): ParsedCookies {
    return this._vexorRequest.cookies;
  }

  /**
   * Get a specific cookie
   */
  cookie(name: string): string | undefined {
    return this._vexorRequest.cookie(name);
  }

  /**
   * Client IP address
   */
  get ip(): string {
    return this._vexorRequest.ip;
  }

  /**
   * Protocol (http/https)
   */
  get protocol(): 'http' | 'https' {
    return this._vexorRequest.protocol;
  }

  /**
   * Host header
   */
  get host(): string {
    return this._vexorRequest.host;
  }

  /**
   * Unique request ID
   */
  get requestId(): string {
    return this._requestId;
  }

  /**
   * Time elapsed since request started (in ms)
   */
  get elapsed(): number {
    return performance.now() - this._startTime;
  }

  // ============ Body Parsing ============

  /**
   * Parse request body as JSON
   */
  async readJson<T = unknown>(): Promise<T> {
    return this._vexorRequest.json<T>();
  }

  /**
   * Alias for readJson (backwards compatibility)
   */
  async body<T = unknown>(): Promise<T> {
    return this._vexorRequest.json<T>();
  }

  /**
   * Parse request body as text
   */
  async readText(): Promise<string> {
    return this._vexorRequest.text();
  }

  /**
   * Parse body as FormData
   */
  async readFormData(): Promise<FormData> {
    return this._vexorRequest.formData();
  }

  /**
   * Get body as ArrayBuffer
   */
  async readArrayBuffer(): Promise<ArrayBuffer> {
    return this._vexorRequest.arrayBuffer();
  }

  // ============ Response Building ============

  /**
   * Get the response builder for chaining
   */
  get res(): ResponseBuilder {
    return this._responseBuilder;
  }

  /**
   * Set response status
   */
  status(code: number): ResponseBuilder {
    return this._responseBuilder.status(code);
  }

  /**
   * Set a cookie in the response
   */
  setCookie(name: string, value: string, options?: CookieOptions): this {
    this._responseBuilder.cookie(name, value, options);
    return this;
  }

  /**
   * Clear a cookie
   */
  clearCookie(name: string, options?: Omit<CookieOptions, 'maxAge' | 'expires'>): this {
    this._responseBuilder.clearCookie(name, options);
    return this;
  }

  // ============ Response Shortcuts ============

  /**
   * Send JSON response
   */
  json<T>(data: T, status?: number): Response {
    return this._responseBuilder.json(data, status);
  }

  /**
   * Send text response
   */
  text(content: string, status?: number): Response {
    return this._responseBuilder.text(content, status);
  }

  /**
   * Send HTML response
   */
  html(content: string, status?: number): Response {
    return this._responseBuilder.html(content, status);
  }

  /**
   * Send empty response
   */
  empty(status?: number): Response {
    return this._responseBuilder.empty(status);
  }

  /**
   * Send redirect response
   */
  redirect(url: string, status?: number): Response {
    return this._responseBuilder.redirect(url, status);
  }

  /**
   * Send stream response
   */
  stream(readable: ReadableStream, contentType?: string): Response {
    return this._responseBuilder.stream(readable, contentType);
  }

  // ============ Error Responses ============

  /**
   * Send 404 Not Found
   */
  notFound(message?: string): Response {
    return VexorResponse.notFound(message);
  }

  /**
   * Send 400 Bad Request
   */
  badRequest(message?: string): Response {
    return VexorResponse.badRequest(message);
  }

  /**
   * Send 401 Unauthorized
   */
  unauthorized(message?: string): Response {
    return VexorResponse.unauthorized(message);
  }

  /**
   * Send 403 Forbidden
   */
  forbidden(message?: string): Response {
    return VexorResponse.forbidden(message);
  }

  /**
   * Send validation error
   */
  validationError(errors: unknown): Response {
    return VexorResponse.validationError(errors);
  }

  /**
   * Send 500 Internal Server Error
   */
  internalError(message?: string): Response {
    return VexorResponse.internalError(message);
  }

  // ============ Custom State ============

  /**
   * Get custom state value
   */
  get<T>(key: string): T | undefined {
    return this._state[key] as T | undefined;
  }

  /**
   * Set custom state value
   */
  set<T>(key: string, value: T): this {
    this._state[key] = value;
    return this;
  }

  /**
   * Check if state has a key
   */
  has(key: string): boolean {
    return key in this._state;
  }

  /**
   * Delete state value
   */
  delete(key: string): boolean {
    if (key in this._state) {
      delete this._state[key];
      return true;
    }
    return false;
  }

  /**
   * Get all state
   */
  get state(): ContextState {
    return this._state;
  }

  // ============ Route Info ============

  /**
   * Get matched route information
   */
  get route(): MatchedRoute | undefined {
    return this._route;
  }
}

/**
 * Context Pool for object reuse
 * Reduces GC pressure by reusing context objects
 */
export class ContextPool {
  private pool: VexorContext[] = [];
  private maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  /**
   * Acquire a context from the pool
   */
  acquire(request: VexorRequest, route?: MatchedRoute): VexorContext {
    let ctx = this.pool.pop();
    if (!ctx) {
      ctx = new VexorContext();
    }
    ctx.init(request, route);
    return ctx;
  }

  /**
   * Release a context back to the pool
   */
  release(ctx: VexorContext): void {
    ctx.reset();
    if (this.pool.length < this.maxSize) {
      this.pool.push(ctx);
    }
  }

  /**
   * Get current pool size
   */
  get size(): number {
    return this.pool.length;
  }

  /**
   * Clear the pool
   */
  clear(): void {
    this.pool = [];
  }
}

// Export default pool instance
export const contextPool = new ContextPool();
