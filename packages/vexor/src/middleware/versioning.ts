/**
 * API Versioning Middleware
 *
 * Supports multiple versioning strategies:
 * - URL path (/v1/users, /v2/users)
 * - Header (X-API-Version, Accept-Version)
 * - Query parameter (?version=1)
 * - Media type (Accept: application/vnd.api.v1+json)
 */

import type { Vexor } from '../core/app.js';
import type { VexorContext } from '../core/context.js';

// ============================================================================
// Types
// ============================================================================

export type VersioningStrategy = 'path' | 'header' | 'query' | 'media-type' | 'custom';

export interface VersioningOptions {
  /**
   * Versioning strategy
   * Default: 'path'
   */
  strategy?: VersioningStrategy;

  /**
   * Default version when not specified
   * Default: '1'
   */
  defaultVersion?: string;

  /**
   * Header name for header strategy
   * Default: 'X-API-Version'
   */
  header?: string;

  /**
   * Query parameter name for query strategy
   * Default: 'version'
   */
  queryParam?: string;

  /**
   * Vendor name for media type strategy
   * Default: 'api'
   */
  vendor?: string;

  /**
   * Custom version extractor
   */
  extractor?: (ctx: VexorContext) => string | null;

  /**
   * Version prefix for path strategy
   * Default: 'v'
   */
  prefix?: string;

  /**
   * Whether to include version in response headers
   * Default: true
   */
  responseHeader?: boolean;

  /**
   * Response header name
   * Default: 'X-API-Version'
   */
  responseHeaderName?: string;
}

export interface VersionedRoute {
  version: string;
  handler: (ctx: VexorContext) => Response | Promise<Response>;
  deprecated?: boolean;
  deprecationMessage?: string;
  sunset?: Date;
}

// ============================================================================
// Version Extractors
// ============================================================================

function extractFromPath(ctx: VexorContext, prefix: string): string | null {
  const pathSegments = ctx.path.split('/').filter(Boolean);
  const versionSegment = pathSegments.find((s) => s.startsWith(prefix));

  if (versionSegment) {
    return versionSegment.slice(prefix.length);
  }

  return null;
}

function extractFromHeader(ctx: VexorContext, headerName: string): string | null {
  const value = ctx.header(headerName);
  return value || null;
}

function extractFromQuery(ctx: VexorContext, paramName: string): string | null {
  const url = new URL(ctx.url);
  return url.searchParams.get(paramName);
}

function extractFromMediaType(ctx: VexorContext, vendor: string): string | null {
  const accept = ctx.header('accept') || '';

  // Parse Accept header for media type versioning
  // Format: application/vnd.{vendor}.v{version}+json
  const regex = new RegExp(`application\\/vnd\\.${vendor}\\.v(\\d+)\\+json`);
  const match = accept.match(regex);

  if (match) {
    return match[1];
  }

  return null;
}

// ============================================================================
// Default Options
// ============================================================================

const defaultOptions: Required<Omit<VersioningOptions, 'extractor'>> & Partial<VersioningOptions> = {
  strategy: 'path',
  defaultVersion: '1',
  header: 'X-API-Version',
  queryParam: 'version',
  vendor: 'api',
  prefix: 'v',
  responseHeader: true,
  responseHeaderName: 'X-API-Version',
};

// ============================================================================
// Versioning Middleware
// ============================================================================

/**
 * Create versioning middleware
 */
export function versioning(options: VersioningOptions = {}) {
  const opts = { ...defaultOptions, ...options };

  return async (ctx: VexorContext): Promise<void> => {
    let version: string | null = null;

    // Extract version based on strategy
    switch (opts.strategy) {
      case 'path':
        version = extractFromPath(ctx, opts.prefix);
        break;
      case 'header':
        version = extractFromHeader(ctx, opts.header);
        break;
      case 'query':
        version = extractFromQuery(ctx, opts.queryParam);
        break;
      case 'media-type':
        version = extractFromMediaType(ctx, opts.vendor);
        break;
      case 'custom':
        if (opts.extractor) {
          version = opts.extractor(ctx);
        }
        break;
    }

    // Use default version if not found
    if (!version) {
      version = opts.defaultVersion;
    }

    // Store version in context
    (ctx as any).apiVersion = version;

    // Add version to response headers
    if (opts.responseHeader) {
      (ctx as any)._versionHeader = {
        name: opts.responseHeaderName,
        value: version,
      };
    }
  };
}

/**
 * Get API version from context
 */
export function getApiVersion(ctx: VexorContext): string {
  return (ctx as any).apiVersion || '1';
}

/**
 * Check if request is for a specific version
 */
export function isVersion(ctx: VexorContext, version: string): boolean {
  return getApiVersion(ctx) === version;
}

/**
 * Apply version header to response
 */
export function applyVersionHeader(ctx: VexorContext, response: Response): Response {
  const versionHeader = (ctx as any)._versionHeader;
  if (!versionHeader) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set(versionHeader.name, versionHeader.value);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// ============================================================================
// Versioned Router
// ============================================================================

export interface VersionRouter {
  /**
   * Register a route for a specific version
   */
  version(
    version: string,
    callback: (router: VersionRouterInstance) => void
  ): VersionRouter;

  /**
   * Apply routes to the app
   */
  apply(app: Vexor): void;
}

export interface VersionRouterInstance {
  get(path: string, handler: (ctx: VexorContext) => Response | Promise<Response>): void;
  post(path: string, handler: (ctx: VexorContext) => Response | Promise<Response>): void;
  put(path: string, handler: (ctx: VexorContext) => Response | Promise<Response>): void;
  patch(path: string, handler: (ctx: VexorContext) => Response | Promise<Response>): void;
  delete(path: string, handler: (ctx: VexorContext) => Response | Promise<Response>): void;
}

interface VersionedRouteEntry {
  method: string;
  path: string;
  version: string;
  handler: (ctx: VexorContext) => Response | Promise<Response>;
}

/**
 * Create a versioned router
 */
export function createVersionRouter(options: VersioningOptions = {}): VersionRouter {
  const opts = { ...defaultOptions, ...options };
  const routes: VersionedRouteEntry[] = [];

  const router: VersionRouter = {
    version(version: string, callback: (router: VersionRouterInstance) => void) {
      const versionRouterInstance: VersionRouterInstance = {
        get(path, handler) {
          routes.push({ method: 'GET', path, version, handler });
        },
        post(path, handler) {
          routes.push({ method: 'POST', path, version, handler });
        },
        put(path, handler) {
          routes.push({ method: 'PUT', path, version, handler });
        },
        patch(path, handler) {
          routes.push({ method: 'PATCH', path, version, handler });
        },
        delete(path, handler) {
          routes.push({ method: 'DELETE', path, version, handler });
        },
      };

      callback(versionRouterInstance);
      return router;
    },

    apply(app: Vexor) {
      for (const route of routes) {
        // For path strategy, prepend version to path
        let fullPath = route.path;
        if (opts.strategy === 'path') {
          fullPath = `/${opts.prefix}${route.version}${route.path}`;
        }

        // Create handler that checks version for non-path strategies
        const handler = async (ctx: VexorContext) => {
          if (opts.strategy !== 'path') {
            const requestVersion = getApiVersion(ctx);
            if (requestVersion !== route.version) {
              // Skip this handler - not the right version
              return ctx.status(404).json({
                error: 'Not Found',
                message: `Endpoint not available in API version ${requestVersion}`,
              });
            }
          }
          return route.handler(ctx);
        };

        // Register route
        switch (route.method) {
          case 'GET':
            (app as any).get(fullPath, handler);
            break;
          case 'POST':
            (app as any).post(fullPath, handler);
            break;
          case 'PUT':
            (app as any).put(fullPath, handler);
            break;
          case 'PATCH':
            (app as any).patch(fullPath, handler);
            break;
          case 'DELETE':
            (app as any).delete(fullPath, handler);
            break;
        }
      }
    },
  };

  return router;
}

/**
 * Deprecation middleware
 */
export function deprecated(message?: string, sunset?: Date) {
  return async (ctx: VexorContext): Promise<void> => {
    // Add deprecation headers
    (ctx as any)._deprecationHeaders = {
      'Deprecation': 'true',
      ...(message && { 'X-Deprecation-Notice': message }),
      ...(sunset && { 'Sunset': sunset.toUTCString() }),
    };
  };
}

/**
 * Apply deprecation headers to response
 */
export function applyDeprecationHeaders(ctx: VexorContext, response: Response): Response {
  const deprecationHeaders = (ctx as any)._deprecationHeaders;
  if (!deprecationHeaders) {
    return response;
  }

  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(deprecationHeaders)) {
    headers.set(key, value as string);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
