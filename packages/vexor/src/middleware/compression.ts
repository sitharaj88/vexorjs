/**
 * Compression Middleware
 *
 * Response compression using gzip and deflate.
 * Uses native Node.js zlib for compression.
 */

import { gzip, deflate } from 'node:zlib';
import { promisify } from 'node:util';
import type { VexorContext } from '../core/context.js';

const gzipAsync = promisify(gzip);
const deflateAsync = promisify(deflate);

// ============================================================================
// Types
// ============================================================================

export interface CompressionOptions {
  /**
   * Minimum response size in bytes to compress.
   * Default: 1024 (1KB)
   */
  threshold?: number;

  /**
   * Compression level (1-9, where 9 is best compression).
   * Default: 6
   */
  level?: number;

  /**
   * Filter function to determine if response should be compressed.
   * Default: Compresses text-based content types
   */
  filter?: (ctx: VexorContext, contentType: string) => boolean;

  /**
   * Supported encodings in order of preference.
   * Default: ['gzip', 'deflate']
   */
  encodings?: ('gzip' | 'deflate' | 'br')[];

  /**
   * Memory level for compression (1-9).
   * Default: 8
   */
  memLevel?: number;

  /**
   * Whether to add Vary: Accept-Encoding header.
   * Default: true
   */
  vary?: boolean;
}

// ============================================================================
// Helpers
// ============================================================================

const COMPRESSIBLE_TYPES = [
  'text/',
  'application/json',
  'application/javascript',
  'application/xml',
  'application/xhtml+xml',
  'application/rss+xml',
  'application/atom+xml',
  'application/x-javascript',
  'application/x-font-ttf',
  'font/opentype',
  'font/ttf',
  'font/eot',
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon',
];

function defaultFilter(_ctx: VexorContext, contentType: string): boolean {
  if (!contentType) return false;

  const type = contentType.split(';')[0].trim().toLowerCase();

  for (const compressible of COMPRESSIBLE_TYPES) {
    if (type.startsWith(compressible) || type === compressible) {
      return true;
    }
  }

  return false;
}

function parseAcceptEncoding(header: string | null): string[] {
  if (!header) return [];

  return header
    .split(',')
    .map((part) => {
      const [encoding, qValue] = part.trim().split(';');
      const q = qValue ? parseFloat(qValue.split('=')[1]) : 1;
      return { encoding: encoding.trim().toLowerCase(), q };
    })
    .filter((item) => item.q > 0)
    .sort((a, b) => b.q - a.q)
    .map((item) => item.encoding);
}

function selectEncoding(
  acceptedEncodings: string[],
  supportedEncodings: string[]
): string | null {
  for (const accepted of acceptedEncodings) {
    if (accepted === '*') {
      return supportedEncodings[0] || null;
    }
    if (supportedEncodings.includes(accepted)) {
      return accepted;
    }
  }
  return null;
}

async function compressData(
  data: Buffer,
  encoding: string,
  level: number
): Promise<Buffer> {
  const options = { level };

  switch (encoding) {
    case 'gzip':
      return gzipAsync(data, options);
    case 'deflate':
      return deflateAsync(data, options);
    default:
      return data;
  }
}

// ============================================================================
// Default Options
// ============================================================================

const defaultOptions: Required<CompressionOptions> = {
  threshold: 1024,
  level: 6,
  filter: defaultFilter,
  encodings: ['gzip', 'deflate'],
  memLevel: 8,
  vary: true,
};

// ============================================================================
// Compression Middleware
// ============================================================================

/**
 * Create compression middleware
 *
 * Note: This middleware should be used as an onSend hook to compress responses.
 */
export function compression(options: CompressionOptions = {}) {
  const opts = { ...defaultOptions, ...options };

  return async (ctx: VexorContext): Promise<void> => {
    // Store compression options in context
    (ctx as any)._compressionOptions = opts;
  };
}

/**
 * Compress a response
 * Use this in your response handling or as a utility
 */
export async function compressResponse(
  response: Response,
  ctx: VexorContext,
  options?: CompressionOptions
): Promise<Response> {
  const opts = options ?? (ctx as any)._compressionOptions ?? defaultOptions;

  // Check Accept-Encoding header
  const acceptEncoding = ctx.header('accept-encoding');
  const acceptedEncodings = parseAcceptEncoding(acceptEncoding);
  const encoding = selectEncoding(acceptedEncodings, opts.encodings);

  if (!encoding) {
    return response;
  }

  // Get content type
  const contentType = response.headers.get('content-type') || '';

  // Check filter
  if (!opts.filter(ctx, contentType)) {
    return response;
  }

  // Check if already encoded
  if (response.headers.get('content-encoding')) {
    return response;
  }

  // Get response body
  const body = await response.arrayBuffer();
  const data = Buffer.from(body);

  // Check threshold
  if (data.length < opts.threshold) {
    // Return original response with new body
    return new Response(data, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }

  // Compress
  const compressed = await compressData(data, encoding, opts.level);

  // Build new headers
  const headers = new Headers(response.headers);
  headers.set('Content-Encoding', encoding);
  headers.set('Content-Length', String(compressed.length));

  if (opts.vary) {
    const existingVary = headers.get('Vary');
    if (existingVary) {
      if (!existingVary.toLowerCase().includes('accept-encoding')) {
        headers.set('Vary', `${existingVary}, Accept-Encoding`);
      }
    } else {
      headers.set('Vary', 'Accept-Encoding');
    }
  }

  return new Response(new Uint8Array(compressed), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Create a response wrapper that automatically compresses
 */
export function createCompressedResponse(
  ctx: VexorContext,
  body: string | Buffer | object,
  options?: ResponseInit & { compressionOptions?: CompressionOptions }
): Promise<Response> {
  let responseBody: BodyInit;
  const headers = new Headers(options?.headers);

  if (typeof body === 'object' && !(body instanceof Buffer)) {
    responseBody = JSON.stringify(body);
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  } else if (body instanceof Buffer) {
    responseBody = new Uint8Array(body);
  } else {
    responseBody = body as string;
  }

  const response = new Response(responseBody, {
    ...options,
    headers,
  });

  return compressResponse(response, ctx, options?.compressionOptions);
}

/**
 * Check if a content type is compressible
 */
export function isCompressible(contentType: string): boolean {
  return defaultFilter({} as VexorContext, contentType);
}
