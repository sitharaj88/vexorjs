/**
 * VexorResponse - Response builder with chainable methods
 *
 * Provides a fluent API for building HTTP responses with support
 * for JSON, HTML, streaming, cookies, and more.
 */

import type { CookieOptions } from './types.js';

/**
 * Serialize cookie to string
 */
function serializeCookie(name: string, value: string, options?: CookieOptions): string {
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (options?.maxAge !== undefined) {
    cookie += `; Max-Age=${options.maxAge}`;
  }
  if (options?.expires) {
    cookie += `; Expires=${options.expires.toUTCString()}`;
  }
  if (options?.path) {
    cookie += `; Path=${options.path}`;
  }
  if (options?.domain) {
    cookie += `; Domain=${options.domain}`;
  }
  if (options?.secure) {
    cookie += '; Secure';
  }
  if (options?.httpOnly) {
    cookie += '; HttpOnly';
  }
  if (options?.sameSite) {
    cookie += `; SameSite=${options.sameSite}`;
  }

  return cookie;
}

/**
 * A Response carrying the JSON payload type as a phantom.
 * `ctx.json(data)` returns this so the RPC client can infer response types;
 * `__data` is never set at runtime.
 */
export interface TypedResponse<T = unknown> extends Response {
  readonly __data?: T;
}

/**
 * Adapter fast-path: when a Response is built from an in-memory string,
 * the raw body is attached under this symbol so the Node adapter can
 * `res.end(raw)` directly instead of pumping a ReadableStream reader.
 */
export const RAW_BODY = Symbol.for('vexor.rawBody');

/** Read the raw in-memory body from a Response, if it was tagged */
export function getRawBody(response: Response): string | Uint8Array | undefined {
  return (response as unknown as Record<symbol, string | Uint8Array | undefined>)[RAW_BODY];
}

/** Tag a Response with its raw in-memory body (used by ResponseBuilder) */
export function setRawBody(response: Response, body: string | Uint8Array): void {
  (response as unknown as Record<symbol, string | Uint8Array>)[RAW_BODY] = body;
}

/**
 * HTTP Status text mapping
 */
const STATUS_TEXT: Record<number, string> = {
  200: 'OK',
  201: 'Created',
  204: 'No Content',
  301: 'Moved Permanently',
  302: 'Found',
  304: 'Not Modified',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
};

/**
 * Response builder class with chainable methods
 */
export class ResponseBuilder {
  private _status = 200;
  private _headers = new Headers();
  private _body: BodyInit | null = null;
  private _cookies: string[] = [];

  /**
   * Set response status code
   */
  status(code: number): this {
    this._status = code;
    return this;
  }

  /**
   * Set a response header
   */
  header(name: string, value: string): this {
    this._headers.set(name, value);
    return this;
  }

  /**
   * Append a response header (for multiple values)
   */
  appendHeader(name: string, value: string): this {
    this._headers.append(name, value);
    return this;
  }

  /**
   * Set multiple headers at once
   */
  headers(headers: Record<string, string>): this {
    for (const [name, value] of Object.entries(headers)) {
      this._headers.set(name, value);
    }
    return this;
  }

  /**
   * Set a cookie
   */
  cookie(name: string, value: string, options?: CookieOptions): this {
    this._cookies.push(serializeCookie(name, value, options));
    return this;
  }

  /**
   * Clear a cookie
   */
  clearCookie(name: string, options?: Omit<CookieOptions, 'maxAge' | 'expires'>): this {
    return this.cookie(name, '', { ...options, maxAge: 0 });
  }

  /**
   * Set Content-Type header
   */
  type(contentType: string): this {
    return this.header('Content-Type', contentType);
  }

  /**
   * Build and return the final Response object
   */
  build(): Response {
    // Add cookies to headers
    for (const cookie of this._cookies) {
      this._headers.append('Set-Cookie', cookie);
    }

    const response = new Response(this._body, {
      status: this._status,
      statusText: STATUS_TEXT[this._status] ?? '',
      headers: this._headers,
    });

    // Enable the adapter's direct-write fast path for in-memory bodies
    if (typeof this._body === 'string' || this._body instanceof Uint8Array) {
      setRawBody(response, this._body);
    }

    return response;
  }

  /**
   * Send JSON response
   */
  json<T>(data: T, status?: number): TypedResponse<T> {
    if (status !== undefined) {
      this._status = status;
    }
    this._headers.set('Content-Type', 'application/json; charset=utf-8');
    this._body = JSON.stringify(data);
    return this.build() as TypedResponse<T>;
  }

  /**
   * Send text response
   */
  text(content: string, status?: number): Response {
    if (status !== undefined) {
      this._status = status;
    }
    this._headers.set('Content-Type', 'text/plain; charset=utf-8');
    this._body = content;
    return this.build();
  }

  /**
   * Send HTML response
   */
  html(content: string, status?: number): Response {
    if (status !== undefined) {
      this._status = status;
    }
    this._headers.set('Content-Type', 'text/html; charset=utf-8');
    this._body = content;
    return this.build();
  }

  /**
   * Send empty response (204 No Content by default)
   */
  empty(status = 204): Response {
    this._status = status;
    this._body = null;
    return this.build();
  }

  /**
   * Send redirect response
   */
  redirect(url: string, status = 302): Response {
    this._status = status;
    this._headers.set('Location', url);
    this._body = null;
    return this.build();
  }

  /**
   * Send file as response (for streaming)
   */
  stream(readable: ReadableStream, contentType = 'application/octet-stream'): Response {
    this._headers.set('Content-Type', contentType);
    this._body = readable;
    return this.build();
  }

  /**
   * Send array buffer response
   */
  buffer(data: ArrayBuffer, contentType = 'application/octet-stream'): Response {
    this._headers.set('Content-Type', contentType);
    this._body = data;
    return this.build();
  }

  /**
   * Send blob response
   */
  blob(data: Blob): Response {
    this._headers.set('Content-Type', data.type || 'application/octet-stream');
    this._body = data;
    return this.build();
  }

  /**
   * Send Server-Sent Events (SSE) response
   */
  sse(stream: ReadableStream): Response {
    this._headers.set('Content-Type', 'text/event-stream');
    this._headers.set('Cache-Control', 'no-cache');
    this._headers.set('Connection', 'keep-alive');
    this._body = stream;
    return this.build();
  }
}

/**
 * Static helper functions for creating common responses
 */
export const VexorResponse = {
  /**
   * Create a new response builder
   */
  create(): ResponseBuilder {
    return new ResponseBuilder();
  },

  /**
   * Send JSON response
   */
  json<T>(data: T, status = 200, headers?: Record<string, string>): TypedResponse<T> {
    const builder = new ResponseBuilder().status(status);
    if (headers) {
      builder.headers(headers);
    }
    return builder.json(data);
  },

  /**
   * Send text response
   */
  text(content: string, status = 200, headers?: Record<string, string>): Response {
    const builder = new ResponseBuilder().status(status);
    if (headers) {
      builder.headers(headers);
    }
    return builder.text(content);
  },

  /**
   * Send HTML response
   */
  html(content: string, status = 200, headers?: Record<string, string>): Response {
    const builder = new ResponseBuilder().status(status);
    if (headers) {
      builder.headers(headers);
    }
    return builder.html(content);
  },

  /**
   * Send empty response
   */
  empty(status = 204): Response {
    return new ResponseBuilder().empty(status);
  },

  /**
   * Send redirect response
   */
  redirect(url: string, status = 302): Response {
    return new ResponseBuilder().redirect(url, status);
  },

  /**
   * Send error response
   */
  error(message: string, status = 500, code?: string): Response {
    return new ResponseBuilder()
      .status(status)
      .json({ error: message, code, status });
  },

  /**
   * Send 404 Not Found
   */
  notFound(message = 'Not Found'): Response {
    return VexorResponse.error(message, 404, 'NOT_FOUND');
  },

  /**
   * Send 400 Bad Request
   */
  badRequest(message = 'Bad Request'): Response {
    return VexorResponse.error(message, 400, 'BAD_REQUEST');
  },

  /**
   * Send 401 Unauthorized
   */
  unauthorized(message = 'Unauthorized'): Response {
    return VexorResponse.error(message, 401, 'UNAUTHORIZED');
  },

  /**
   * Send 403 Forbidden
   */
  forbidden(message = 'Forbidden'): Response {
    return VexorResponse.error(message, 403, 'FORBIDDEN');
  },

  /**
   * Send 422 Validation Error
   */
  validationError(errors: unknown): Response {
    return new ResponseBuilder()
      .status(422)
      .json({ error: 'Validation Error', code: 'VALIDATION_ERROR', errors });
  },

  /**
   * Send 500 Internal Server Error
   */
  internalError(message = 'Internal Server Error'): Response {
    return VexorResponse.error(message, 500, 'INTERNAL_ERROR');
  },
};
