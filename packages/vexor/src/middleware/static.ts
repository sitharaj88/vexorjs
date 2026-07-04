/**
 * Static File Serving
 *
 * Node.js filesystem-backed static file handler. Register it on a
 * trailing-wildcard route:
 *
 *   app.get('/assets/*', serveStatic({ root: './public' }));
 *
 * Features: path traversal protection, ETag / If-None-Match (304),
 * Cache-Control, index file resolution, dotfile policy, and streaming
 * responses for large files.
 *
 * This module uses node:fs and is intended for the Node/Bun/Deno adapters;
 * on edge runtimes serve static assets through the platform instead.
 */

import type { VexorContext } from '../core/context.js';
import type { Handler } from '../core/types.js';

/**
 * Options for serveStatic
 */
export interface StaticOptions {
  /** Directory to serve files from (resolved to an absolute path) */
  root: string;
  /** File served when the path resolves to a directory (false to disable) */
  index?: string | false;
  /** Cache-Control max-age in seconds (default 0 → no-cache) */
  maxAge?: number;
  /** Append `immutable` to Cache-Control (for hashed asset filenames) */
  immutable?: boolean;
  /** Send ETag / handle If-None-Match (default true) */
  etag?: boolean;
  /** How to treat dotfiles: 'ignore' (404, default), 'deny' (403), 'allow' */
  dotfiles?: 'ignore' | 'deny' | 'allow';
  /** Extra headers set on every file response */
  headers?: Record<string, string>;
}

/**
 * Common MIME types by file extension
 */
const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.eot': 'application/vnd.ms-fontobject',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.pdf': 'application/pdf',
  '.wasm': 'application/wasm',
  '.zip': 'application/zip',
  '.gz': 'application/gzip',
};

/**
 * Get the MIME type for a file path
 */
export function getMimeType(filePath: string): string {
  const dot = filePath.lastIndexOf('.');
  if (dot === -1) return 'application/octet-stream';
  const ext = filePath.slice(dot).toLowerCase();
  return MIME_TYPES[ext] ?? 'application/octet-stream';
}

/**
 * Weak ETag from file size + modification time
 */
function computeEtag(size: number, mtimeMs: number): string {
  return `W/"${size.toString(16)}-${Math.floor(mtimeMs).toString(16)}"`;
}

function notFound(): Response {
  return new Response(JSON.stringify({ error: 'Not Found', code: 'NOT_FOUND' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function forbidden(): Response {
  return new Response(JSON.stringify({ error: 'Forbidden', code: 'FORBIDDEN' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

/**
 * Send a single file as a Response (streams from disk).
 * Returns a 404 response if the file does not exist.
 */
export async function sendFile(
  ctx: VexorContext,
  filePath: string,
  options: Pick<StaticOptions, 'maxAge' | 'immutable' | 'etag' | 'headers'> = {}
): Promise<Response> {
  const { stat } = await import('node:fs/promises');

  let fileStat: Awaited<ReturnType<typeof stat>>;
  try {
    fileStat = await stat(filePath);
  } catch {
    return notFound();
  }
  if (!fileStat.isFile()) {
    return notFound();
  }

  const headers = new Headers(options.headers);
  headers.set('Content-Type', getMimeType(filePath));
  headers.set('Content-Length', String(fileStat.size));

  const maxAge = options.maxAge ?? 0;
  headers.set(
    'Cache-Control',
    maxAge > 0
      ? `public, max-age=${maxAge}${options.immutable ? ', immutable' : ''}`
      : 'no-cache'
  );

  if (options.etag !== false) {
    const etag = computeEtag(fileStat.size, fileStat.mtimeMs);
    headers.set('ETag', etag);
    if (ctx.header('if-none-match') === etag) {
      headers.delete('Content-Length');
      return new Response(null, { status: 304, headers });
    }
  }

  // HEAD requests need headers only
  if (ctx.method === 'HEAD') {
    return new Response(null, { status: 200, headers });
  }

  const { createReadStream } = await import('node:fs');
  const { Readable } = await import('node:stream');
  const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;

  return new Response(stream, { status: 200, headers });
}

/**
 * Create a static file handler for a trailing-wildcard route.
 *
 *   app.get('/assets/*', serveStatic({ root: './public', maxAge: 3600 }));
 */
export function serveStatic(options: StaticOptions): Handler<VexorContext> {
  const dotfiles = options.dotfiles ?? 'ignore';
  const indexFile = options.index === undefined ? 'index.html' : options.index;

  // Resolved lazily so importing this module stays free of node:path on edge
  let rootPromise: Promise<string> | undefined;
  const resolveRoot = () => {
    rootPromise ??= import('node:path').then((p) => p.resolve(options.root));
    return rootPromise;
  };

  return async (ctx: VexorContext): Promise<Response> => {
    const root = await resolveRoot();
    const path = await import('node:path');

    // The catch-all segment holds the requested sub-path
    const rawSubPath = ctx.params['*'] ?? '';

    let decoded: string;
    try {
      decoded = decodeURIComponent(rawSubPath);
    } catch {
      return notFound();
    }

    // Reject NUL bytes and normalize away any ../ traversal
    if (decoded.includes('\0')) {
      return notFound();
    }

    const filePath = path.resolve(root, '.' + path.sep + decoded.split('/').join(path.sep));
    if (filePath !== root && !filePath.startsWith(root + path.sep)) {
      return forbidden();
    }

    // Dotfile policy applies to every path segment under the root
    if (dotfiles !== 'allow') {
      const relative = path.relative(root, filePath);
      const hasDotSegment = relative
        .split(path.sep)
        .some((segment) => segment.startsWith('.') && segment !== '');
      if (hasDotSegment) {
        return dotfiles === 'deny' ? forbidden() : notFound();
      }
    }

    // Directory → index file
    let target = filePath;
    try {
      const { stat } = await import('node:fs/promises');
      const targetStat = await stat(filePath);
      if (targetStat.isDirectory()) {
        if (!indexFile) return notFound();
        target = path.join(filePath, indexFile);
      }
    } catch {
      return notFound();
    }

    return sendFile(ctx, target, options);
  };
}
