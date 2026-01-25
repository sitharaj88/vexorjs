/**
 * VexorRequest - Web Standards based Request with extensions
 *
 * Wraps the standard Request object with additional properties
 * for routing, query parsing, and runtime-specific access.
 * Uses lazy evaluation for performance.
 */

import type { ParsedQuery, RouteParams, ParsedCookies, RawRequest } from './types.js';

/**
 * Parse query string into object
 * Handles multiple values for same key as arrays
 */
function parseQueryString(queryString: string): ParsedQuery {
  if (!queryString) return {};

  const result: ParsedQuery = {};
  const params = new URLSearchParams(queryString);

  for (const [key, value] of params) {
    const existing = result[key];
    if (existing === undefined) {
      result[key] = value;
    } else if (Array.isArray(existing)) {
      existing.push(value);
    } else {
      result[key] = [existing, value];
    }
  }

  return result;
}

/**
 * Parse cookie header into object
 */
function parseCookieHeader(cookieHeader: string | null): ParsedCookies {
  if (!cookieHeader) return {};

  const result: ParsedCookies = {};
  const pairs = cookieHeader.split(';');

  for (const pair of pairs) {
    const [name, ...rest] = pair.trim().split('=');
    if (name) {
      result[name] = rest.join('=');
    }
  }

  return result;
}

/**
 * VexorRequest extends the standard Request with lazy-parsed properties
 */
export class VexorRequest {
  private readonly _request: Request;
  private readonly _raw: RawRequest;

  // Lazy-evaluated cached values
  private _url?: URL;
  private _query?: ParsedQuery;
  private _cookies?: ParsedCookies;
  private _ip?: string;
  private _params: RouteParams = {};

  // Body cache
  private _bodyUsed = false;
  private _bodyCache?: unknown;

  constructor(request: Request, raw?: RawRequest) {
    this._request = request;
    this._raw = raw ?? request;
  }

  /**
   * Get the underlying standard Request object
   */
  get request(): Request {
    return this._request;
  }

  /**
   * Get the raw runtime-specific request object
   * (e.g., http.IncomingMessage for Node.js)
   */
  get raw(): RawRequest {
    return this._raw;
  }

  /**
   * HTTP method (GET, POST, etc.)
   */
  get method(): string {
    return this._request.method;
  }

  /**
   * Full URL string
   */
  get url(): string {
    return this._request.url;
  }

  /**
   * Parsed URL object (lazy)
   */
  get parsedUrl(): URL {
    if (!this._url) {
      this._url = new URL(this._request.url);
    }
    return this._url;
  }

  /**
   * URL pathname (e.g., /users/123)
   */
  get path(): string {
    return this.parsedUrl.pathname;
  }

  /**
   * Request headers
   */
  get headers(): Headers {
    return this._request.headers;
  }

  /**
   * Get a specific header value
   */
  header(name: string): string | null {
    return this._request.headers.get(name);
  }

  /**
   * Route parameters (e.g., { id: '123' } for /users/:id)
   * Set by the router after matching
   */
  get params(): RouteParams {
    return this._params;
  }

  /**
   * Set route parameters (called by router)
   */
  setParams(params: RouteParams): void {
    this._params = params;
  }

  /**
   * Parsed query string (lazy)
   */
  get query(): ParsedQuery {
    if (!this._query) {
      this._query = parseQueryString(this.parsedUrl.search.slice(1));
    }
    return this._query;
  }

  /**
   * Get a specific query parameter
   */
  queryParam(name: string): string | string[] | undefined {
    return this.query[name];
  }

  /**
   * Parsed cookies (lazy)
   */
  get cookies(): ParsedCookies {
    if (!this._cookies) {
      this._cookies = parseCookieHeader(this._request.headers.get('cookie'));
    }
    return this._cookies;
  }

  /**
   * Get a specific cookie value
   */
  cookie(name: string): string | undefined {
    return this.cookies[name];
  }

  /**
   * Client IP address
   * Checks X-Forwarded-For header first (for proxied requests)
   */
  get ip(): string {
    if (!this._ip) {
      const forwarded = this._request.headers.get('x-forwarded-for');
      if (forwarded) {
        this._ip = forwarded.split(',')[0].trim();
      } else {
        // Try to get from raw request if Node.js
        const raw = this._raw as { socket?: { remoteAddress?: string } };
        this._ip = raw.socket?.remoteAddress ?? '127.0.0.1';
      }
    }
    return this._ip;
  }

  /**
   * Protocol (http or https)
   */
  get protocol(): 'http' | 'https' {
    const proto = this._request.headers.get('x-forwarded-proto');
    if (proto) {
      return proto === 'https' ? 'https' : 'http';
    }
    return this.parsedUrl.protocol === 'https:' ? 'https' : 'http';
  }

  /**
   * Host header value
   */
  get host(): string {
    return this._request.headers.get('host') ?? this.parsedUrl.host;
  }

  /**
   * Content-Type header
   */
  get contentType(): string | null {
    return this._request.headers.get('content-type');
  }

  /**
   * Content-Length header as number
   */
  get contentLength(): number {
    const length = this._request.headers.get('content-length');
    return length ? parseInt(length, 10) : 0;
  }

  /**
   * User-Agent header
   */
  get userAgent(): string | null {
    return this._request.headers.get('user-agent');
  }

  /**
   * Accept header
   */
  get accept(): string | null {
    return this._request.headers.get('accept');
  }

  /**
   * Check if request accepts a specific content type
   */
  accepts(type: string): boolean {
    const accept = this.accept;
    if (!accept) return false;
    return accept.includes(type) || accept.includes('*/*');
  }

  /**
   * Check if this is an AJAX/XHR request
   */
  get isXhr(): boolean {
    return this._request.headers.get('x-requested-with')?.toLowerCase() === 'xmlhttprequest';
  }

  /**
   * Parse body as JSON
   * Caches the result for subsequent calls
   */
  async json<T = unknown>(): Promise<T> {
    if (this._bodyUsed && this._bodyCache !== undefined) {
      return this._bodyCache as T;
    }
    this._bodyUsed = true;
    this._bodyCache = await this._request.json();
    return this._bodyCache as T;
  }

  /**
   * Parse body as text
   */
  async text(): Promise<string> {
    if (this._bodyUsed && typeof this._bodyCache === 'string') {
      return this._bodyCache;
    }
    this._bodyUsed = true;
    const text = await this._request.text();
    this._bodyCache = text;
    return text;
  }

  /**
   * Parse body as FormData
   */
  async formData(): Promise<FormData> {
    return this._request.formData();
  }

  /**
   * Get body as ArrayBuffer
   */
  async arrayBuffer(): Promise<ArrayBuffer> {
    return this._request.arrayBuffer();
  }

  /**
   * Get body as Blob
   */
  async blob(): Promise<Blob> {
    return this._request.blob();
  }

  /**
   * Get readable stream of body
   */
  get body(): ReadableStream<Uint8Array> | null {
    return this._request.body;
  }

  /**
   * Check if body has been consumed
   */
  get bodyUsed(): boolean {
    return this._bodyUsed || this._request.bodyUsed;
  }
}

/**
 * Factory function to create VexorRequest from various sources
 */
export function createRequest(input: Request | string, raw?: RawRequest): VexorRequest {
  if (typeof input === 'string') {
    return new VexorRequest(new Request(input), raw);
  }
  return new VexorRequest(input, raw);
}
