/**
 * Health Check Middleware
 *
 * Provides configurable health check endpoints for monitoring
 * application and dependency health.
 */

import type { VexorContext } from '../core/context.js';

// ============================================================================
// Types
// ============================================================================

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface HealthCheckResult {
  status: HealthStatus;
  message?: string;
  duration?: number;
  details?: Record<string, unknown>;
}

export interface HealthCheck {
  name: string;
  check: () => Promise<HealthCheckResult> | HealthCheckResult;
  /** Critical checks affect overall status (default: true) */
  critical?: boolean;
  /** Timeout in milliseconds (default: 5000) */
  timeout?: number;
}

export interface HealthResponse {
  status: HealthStatus;
  timestamp: string;
  uptime: number;
  version?: string;
  checks: Record<string, HealthCheckResult>;
}

export interface HealthOptions {
  /**
   * Health checks to perform
   */
  checks?: HealthCheck[];

  /**
   * Path for health endpoint (default: '/health')
   */
  path?: string;

  /**
   * Path for liveness probe (default: '/health/live')
   */
  livenesPath?: string;

  /**
   * Path for readiness probe (default: '/health/ready')
   */
  readinessPath?: string;

  /**
   * Application version
   */
  version?: string;

  /**
   * Custom response transformer
   */
  transformer?: (response: HealthResponse) => object;

  /**
   * Timeout for all checks in milliseconds (default: 10000)
   */
  timeout?: number;

  /**
   * Cache health check results for this many milliseconds (default: 0 = no cache)
   */
  cacheTtl?: number;

  /**
   * Include detailed check results (default: true)
   */
  includeDetails?: boolean;
}

// ============================================================================
// Helpers
// ============================================================================

async function runCheckWithTimeout(
  check: HealthCheck,
  timeout: number
): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    const checkPromise = Promise.resolve(check.check());
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Health check timed out')), timeout);
    });

    const result = await Promise.race([checkPromise, timeoutPromise]);
    return {
      ...result,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Check failed',
      duration: Date.now() - startTime,
    };
  }
}

function determineOverallStatus(
  checks: Record<string, HealthCheckResult>,
  checkConfigs: HealthCheck[]
): HealthStatus {
  let hasUnhealthy = false;
  let hasDegraded = false;

  for (const config of checkConfigs) {
    const result = checks[config.name];
    if (!result) continue;

    const isCritical = config.critical !== false;

    if (result.status === 'unhealthy') {
      if (isCritical) {
        hasUnhealthy = true;
      } else {
        hasDegraded = true;
      }
    } else if (result.status === 'degraded') {
      hasDegraded = true;
    }
  }

  if (hasUnhealthy) return 'unhealthy';
  if (hasDegraded) return 'degraded';
  return 'healthy';
}

// ============================================================================
// Default Options
// ============================================================================

const startTime = Date.now();

const defaultOptions: Required<Omit<HealthOptions, 'checks' | 'version' | 'transformer'>> & Partial<HealthOptions> = {
  path: '/health',
  livenesPath: '/health/live',
  readinessPath: '/health/ready',
  timeout: 10000,
  cacheTtl: 0,
  includeDetails: true,
};

// ============================================================================
// Cache
// ============================================================================

interface CachedResult {
  response: HealthResponse;
  timestamp: number;
}

const cache = new Map<string, CachedResult>();

function getCachedResult(key: string, ttl: number): HealthResponse | null {
  const cached = cache.get(key);
  if (!cached) return null;

  if (Date.now() - cached.timestamp > ttl) {
    cache.delete(key);
    return null;
  }

  return cached.response;
}

function setCachedResult(key: string, response: HealthResponse): void {
  cache.set(key, { response, timestamp: Date.now() });
}

// ============================================================================
// Health Check Middleware
// ============================================================================

/**
 * Create health check handler
 */
export function healthCheck(options: HealthOptions = {}) {
  const opts = { ...defaultOptions, ...options };
  const checks = opts.checks || [];

  return async (ctx: VexorContext): Promise<Response | void> => {
    const path = ctx.path;

    // Check if this is a health endpoint
    if (path !== opts.path && path !== opts.livenesPath && path !== opts.readinessPath) {
      return;
    }

    // Liveness probe - simple check that the service is running
    if (path === opts.livenesPath) {
      return ctx.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
      });
    }

    // Check cache
    if (opts.cacheTtl > 0) {
      const cached = getCachedResult(path, opts.cacheTtl);
      if (cached) {
        const status = cached.status === 'healthy' ? 200 : cached.status === 'degraded' ? 200 : 503;
        return ctx.status(status).json(opts.transformer ? opts.transformer(cached) : cached);
      }
    }

    // Run health checks
    const checkResults: Record<string, HealthCheckResult> = {};

    // For readiness, run all checks
    // For main health endpoint, also run all checks
    const checksToRun = path === opts.readinessPath ? checks : checks;

    await Promise.all(
      checksToRun.map(async (check) => {
        const timeout = check.timeout ?? opts.timeout;
        checkResults[check.name] = await runCheckWithTimeout(check, timeout);
      })
    );

    // Determine overall status
    const overallStatus = determineOverallStatus(checkResults, checksToRun);

    const response: HealthResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1000),
      ...(opts.version && { version: opts.version }),
      checks: opts.includeDetails ? checkResults : {},
    };

    // Cache result
    if (opts.cacheTtl > 0) {
      setCachedResult(path, response);
    }

    // Return response
    const httpStatus = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;
    return ctx.status(httpStatus).json(opts.transformer ? opts.transformer(response) : response);
  };
}

/**
 * Create a database health check
 */
export function databaseCheck(
  name: string,
  pingFn: () => Promise<void>,
  options: { critical?: boolean; timeout?: number } = {}
): HealthCheck {
  return {
    name,
    critical: options.critical ?? true,
    timeout: options.timeout ?? 5000,
    check: async () => {
      try {
        await pingFn();
        return { status: 'healthy' };
      } catch (error) {
        return {
          status: 'unhealthy',
          message: error instanceof Error ? error.message : 'Database connection failed',
        };
      }
    },
  };
}

/**
 * Create a Redis health check
 */
export function redisCheck(
  name: string,
  pingFn: () => Promise<string>,
  options: { critical?: boolean; timeout?: number } = {}
): HealthCheck {
  return {
    name,
    critical: options.critical ?? false,
    timeout: options.timeout ?? 3000,
    check: async () => {
      try {
        const result = await pingFn();
        if (result === 'PONG') {
          return { status: 'healthy' };
        }
        return { status: 'degraded', message: `Unexpected response: ${result}` };
      } catch (error) {
        return {
          status: 'unhealthy',
          message: error instanceof Error ? error.message : 'Redis connection failed',
        };
      }
    },
  };
}

/**
 * Create a HTTP endpoint health check
 */
export function httpCheck(
  name: string,
  url: string,
  options: {
    critical?: boolean;
    timeout?: number;
    expectedStatus?: number;
    method?: string;
  } = {}
): HealthCheck {
  return {
    name,
    critical: options.critical ?? false,
    timeout: options.timeout ?? 5000,
    check: async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout ?? 5000);

        const response = await fetch(url, {
          method: options.method ?? 'GET',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const expectedStatus = options.expectedStatus ?? 200;
        if (response.status === expectedStatus) {
          return { status: 'healthy' };
        }

        return {
          status: response.status >= 500 ? 'unhealthy' : 'degraded',
          message: `Unexpected status: ${response.status}`,
        };
      } catch (error) {
        return {
          status: 'unhealthy',
          message: error instanceof Error ? error.message : 'HTTP check failed',
        };
      }
    },
  };
}

/**
 * Create a memory usage health check
 */
export function memoryCheck(
  options: {
    warnThreshold?: number; // Percentage (default: 80)
    criticalThreshold?: number; // Percentage (default: 95)
  } = {}
): HealthCheck {
  const warnThreshold = options.warnThreshold ?? 80;
  const criticalThreshold = options.criticalThreshold ?? 95;

  return {
    name: 'memory',
    critical: false,
    check: () => {
      const usage = process.memoryUsage();
      const heapUsedPercent = (usage.heapUsed / usage.heapTotal) * 100;

      if (heapUsedPercent >= criticalThreshold) {
        return {
          status: 'unhealthy',
          message: `Heap usage at ${heapUsedPercent.toFixed(1)}%`,
          details: {
            heapUsed: usage.heapUsed,
            heapTotal: usage.heapTotal,
            external: usage.external,
            rss: usage.rss,
          },
        };
      }

      if (heapUsedPercent >= warnThreshold) {
        return {
          status: 'degraded',
          message: `Heap usage at ${heapUsedPercent.toFixed(1)}%`,
          details: {
            heapUsed: usage.heapUsed,
            heapTotal: usage.heapTotal,
          },
        };
      }

      return {
        status: 'healthy',
        details: {
          heapUsed: usage.heapUsed,
          heapTotal: usage.heapTotal,
        },
      };
    },
  };
}

/**
 * Create a disk space health check (Node.js only)
 */
export function diskCheck(
  _path: string,
  _options: {
    warnThreshold?: number; // Percentage (default: 80)
    criticalThreshold?: number; // Percentage (default: 95)
  } = {}
): HealthCheck {
  return {
    name: 'disk',
    critical: false,
    check: async () => {
      // This would require a native module or exec to check disk space
      // For now, return healthy as a placeholder
      return {
        status: 'healthy',
        message: 'Disk check not implemented',
      };
    },
  };
}

/**
 * Create a custom health check
 */
export function customCheck(
  name: string,
  checkFn: () => Promise<HealthCheckResult> | HealthCheckResult,
  options: { critical?: boolean; timeout?: number } = {}
): HealthCheck {
  return {
    name,
    critical: options.critical ?? false,
    timeout: options.timeout ?? 5000,
    check: checkFn,
  };
}
