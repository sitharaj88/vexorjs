/**
 * Debug UI Routes
 *
 * Development debugging UI for inspecting application state,
 * routes, metrics, and tracing.
 */

import type { Vexor, VexorContext } from '../core/index.js';
import { registry, createHttpMetrics, createProcessMetrics } from './metrics.js';

/**
 * Debug routes options
 */
export interface DebugOptions {
  /** Base path for debug routes (default: /__debug) */
  basePath?: string;
  /** Enable metrics endpoint (default: true) */
  metrics?: boolean;
  /** Enable routes endpoint (default: true) */
  routes?: boolean;
  /** Enable health endpoint (default: true) */
  health?: boolean;
  /** Enable config endpoint (default: false, exposes sensitive data) */
  config?: boolean;
  /** Custom debug data */
  custom?: Record<string, () => unknown>;
}

/**
 * Register debug routes
 */
export function registerDebugRoutes(app: Vexor, options: DebugOptions = {}): void {
  const basePath = options.basePath ?? '/__debug';
  const processMetrics = createProcessMetrics();

  // Debug index
  app.get(basePath, {}, async (_ctx) => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Vexor Debug</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { color: #333; }
    .card { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .card h2 { margin-top: 0; color: #444; border-bottom: 1px solid #eee; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #eee; }
    th { background: #f8f9fa; font-weight: 600; }
    code { background: #e9ecef; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .badge-get { background: #d4edda; color: #155724; }
    .badge-post { background: #cce5ff; color: #004085; }
    .badge-put { background: #fff3cd; color: #856404; }
    .badge-delete { background: #f8d7da; color: #721c24; }
    .nav { margin-bottom: 20px; }
    .nav a { display: inline-block; padding: 8px 16px; margin-right: 8px; background: white; border-radius: 4px; text-decoration: none; color: #333; }
    .nav a:hover { background: #e9ecef; }
    pre { background: #1e1e1e; color: #d4d4d4; padding: 16px; border-radius: 4px; overflow-x: auto; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔧 Vexor Debug</h1>
    <div class="nav">
      <a href="${basePath}">Overview</a>
      <a href="${basePath}/routes">Routes</a>
      <a href="${basePath}/metrics">Metrics</a>
      <a href="${basePath}/health">Health</a>
    </div>
    <div class="card">
      <h2>Quick Stats</h2>
      <table>
        <tr><td>Uptime</td><td>${formatDuration(process.uptime())}</td></tr>
        <tr><td>Memory (RSS)</td><td>${formatBytes(process.memoryUsage().rss)}</td></tr>
        <tr><td>Memory (Heap Used)</td><td>${formatBytes(process.memoryUsage().heapUsed)}</td></tr>
        <tr><td>Node Version</td><td>${process.version}</td></tr>
        <tr><td>Platform</td><td>${process.platform}</td></tr>
        <tr><td>PID</td><td>${process.pid}</td></tr>
      </table>
    </div>
    <div class="card">
      <h2>Endpoints</h2>
      <table>
        <tr><td><code>GET ${basePath}/routes</code></td><td>List all registered routes</td></tr>
        <tr><td><code>GET ${basePath}/metrics</code></td><td>Prometheus metrics</td></tr>
        <tr><td><code>GET ${basePath}/health</code></td><td>Health check</td></tr>
      </table>
    </div>
  </div>
</body>
</html>`;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  });

  // Routes endpoint
  if (options.routes !== false) {
    app.get(`${basePath}/routes`, {}, async (_ctx) => {
      // Get routes from the app's router
      const router = (app as unknown as { router: { routes?: unknown[] } }).router;
      const routes = router?.routes ?? [];

      const html = `<!DOCTYPE html>
<html>
<head>
  <title>Routes - Vexor Debug</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { color: #333; }
    .card { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #eee; }
    th { background: #f8f9fa; font-weight: 600; }
    code { background: #e9ecef; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; min-width: 50px; text-align: center; }
    .badge-get { background: #d4edda; color: #155724; }
    .badge-post { background: #cce5ff; color: #004085; }
    .badge-put { background: #fff3cd; color: #856404; }
    .badge-patch { background: #e2e3e5; color: #383d41; }
    .badge-delete { background: #f8d7da; color: #721c24; }
    .nav { margin-bottom: 20px; }
    .nav a { display: inline-block; padding: 8px 16px; margin-right: 8px; background: white; border-radius: 4px; text-decoration: none; color: #333; }
    .nav a:hover { background: #e9ecef; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📍 Routes</h1>
    <div class="nav">
      <a href="${basePath}">← Back to Debug</a>
    </div>
    <div class="card">
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Path</th>
            <th>Handler</th>
          </tr>
        </thead>
        <tbody>
          ${Array.isArray(routes) ? (routes as Array<{ method?: string; path?: string }>).map((route) => `
            <tr>
              <td><span class="badge badge-${(route.method ?? 'get').toLowerCase()}">${route.method ?? 'GET'}</span></td>
              <td><code>${route.path ?? '/'}</code></td>
              <td>Handler</td>
            </tr>
          `).join('') : '<tr><td colspan="3">No routes available</td></tr>'}
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`;

      return new Response(html, {
        headers: { 'Content-Type': 'text/html' },
      });
    });

    app.get(`${basePath}/routes.json`, {}, async () => {
      const router = (app as unknown as { router: { routes?: unknown[] } }).router;
      return Response.json(router?.routes ?? []);
    });
  }

  // Metrics endpoint
  if (options.metrics !== false) {
    app.get(`${basePath}/metrics`, {}, async () => {
      processMetrics.collect();
      const content = registry.toPrometheus();
      return new Response(content, {
        headers: { 'Content-Type': 'text/plain; version=0.0.4' },
      });
    });

    app.get(`${basePath}/metrics.json`, {}, async () => {
      processMetrics.collect();
      const metrics: Record<string, unknown> = {};

      for (const [name, metric] of registry.getAll()) {
        if (metric.type === 'counter' || metric.type === 'gauge') {
          const impl = metric as unknown as { getAll: () => Map<string, number> };
          metrics[name] = Object.fromEntries(impl.getAll());
        } else if (metric.type === 'histogram') {
          const impl = metric as unknown as { getAll: () => Map<string, unknown> };
          metrics[name] = Object.fromEntries(impl.getAll());
        }
      }

      return Response.json(metrics);
    });
  }

  // Health endpoint
  if (options.health !== false) {
    app.get(`${basePath}/health`, {}, async () => {
      const mem = process.memoryUsage();

      return Response.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        memory: {
          rss: mem.rss,
          heapUsed: mem.heapUsed,
          heapTotal: mem.heapTotal,
        },
        pid: process.pid,
        version: process.version,
      });
    });
  }

  // Config endpoint (disabled by default for security)
  if (options.config) {
    app.get(`${basePath}/config`, {}, async () => {
      return Response.json({
        env: process.env.NODE_ENV,
        // Only expose safe config values
      });
    });
  }

  // Custom endpoints
  if (options.custom) {
    for (const [name, handler] of Object.entries(options.custom)) {
      app.get(`${basePath}/${name}`, {}, async () => {
        return Response.json(handler());
      });
    }
  }
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Format duration to human readable
 */
function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(0)}s`;
  }
  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

/**
 * Create debug middleware (adds timing to responses)
 */
export function debugMiddleware() {
  const httpMetrics = createHttpMetrics();

  return async (ctx: VexorContext, next: () => Promise<Response>): Promise<Response> => {
    const startTime = performance.now();
    const endRequest = httpMetrics.startRequest(ctx.method);

    try {
      const response = await next();
      const duration = performance.now() - startTime;

      // Record metrics - extract pathname from URL string
      const pathname = new URL(ctx.url, 'http://localhost').pathname;
      httpMetrics.record(
        ctx.method,
        pathname,
        response.status,
        duration
      );

      // Add debug headers in development
      if (process.env.NODE_ENV !== 'production') {
        const headers = new Headers(response.headers);
        headers.set('X-Response-Time', `${duration.toFixed(2)}ms`);
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      }

      return response;
    } finally {
      endRequest();
    }
  };
}
