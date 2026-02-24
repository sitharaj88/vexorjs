/**
 * Health Check Middleware Tests
 *
 * Tests for healthCheck middleware, determineOverallStatus, memoryCheck,
 * customCheck, and endpoint matching
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  healthCheck,
  memoryCheck,
  customCheck,
} from '../middleware/health.js';
import type { HealthCheck, HealthCheckResult } from '../middleware/health.js';
import { createMockContext } from './helpers.js';

describe('Health Check Middleware', () => {
  describe('healthCheck middleware matches health endpoint path', () => {
    it('responds on default /health path', async () => {
      const middleware = healthCheck();

      const ctx = createMockContext('http://localhost/health');
      const response = await middleware(ctx);

      expect(response).toBeInstanceOf(Response);
      expect(response!.status).toBe(200);

      const body = await response!.json();
      expect(body.status).toBe('healthy');
      expect(body.timestamp).toBeDefined();
      expect(body.uptime).toBeDefined();
    });

    it('responds on custom path', async () => {
      const middleware = healthCheck({ path: '/status' });

      const ctx = createMockContext('http://localhost/status');
      const response = await middleware(ctx);

      expect(response).toBeInstanceOf(Response);
      expect(response!.status).toBe(200);
    });

    it('passes through non-health paths', async () => {
      const middleware = healthCheck();

      const ctx = createMockContext('http://localhost/api/users');
      const response = await middleware(ctx);

      expect(response).toBeUndefined();
    });
  });

  describe('Liveness probe', () => {
    it('returns 200 with status: healthy', async () => {
      const middleware = healthCheck();

      const ctx = createMockContext('http://localhost/health/live');
      const response = await middleware(ctx);

      expect(response).toBeInstanceOf(Response);
      expect(response!.status).toBe(200);

      const body = await response!.json();
      expect(body.status).toBe('healthy');
      expect(body.timestamp).toBeDefined();
    });

    it('responds on custom liveness path', async () => {
      const middleware = healthCheck({ livenesPath: '/alive' });

      const ctx = createMockContext('http://localhost/alive');
      const response = await middleware(ctx);

      expect(response).toBeInstanceOf(Response);
      expect(response!.status).toBe(200);

      const body = await response!.json();
      expect(body.status).toBe('healthy');
    });
  });

  describe('determineOverallStatus (tested via healthCheck)', () => {
    it('with all healthy checks returns healthy', async () => {
      const checks: HealthCheck[] = [
        {
          name: 'db',
          critical: true,
          check: () => ({ status: 'healthy' }),
        },
        {
          name: 'cache',
          critical: false,
          check: () => ({ status: 'healthy' }),
        },
      ];

      const middleware = healthCheck({ checks });
      const ctx = createMockContext('http://localhost/health');
      const response = await middleware(ctx);

      const body = await response!.json();
      expect(body.status).toBe('healthy');
    });

    it('with critical unhealthy returns unhealthy', async () => {
      const checks: HealthCheck[] = [
        {
          name: 'db',
          critical: true,
          check: () => ({ status: 'unhealthy', message: 'Connection refused' }),
        },
        {
          name: 'cache',
          critical: false,
          check: () => ({ status: 'healthy' }),
        },
      ];

      const middleware = healthCheck({ checks });
      const ctx = createMockContext('http://localhost/health');
      const response = await middleware(ctx);

      expect(response!.status).toBe(503);

      const body = await response!.json();
      expect(body.status).toBe('unhealthy');
    });

    it('with non-critical unhealthy returns degraded', async () => {
      const checks: HealthCheck[] = [
        {
          name: 'db',
          critical: true,
          check: () => ({ status: 'healthy' }),
        },
        {
          name: 'cache',
          critical: false,
          check: () => ({ status: 'unhealthy', message: 'Cache down' }),
        },
      ];

      const middleware = healthCheck({ checks });
      const ctx = createMockContext('http://localhost/health');
      const response = await middleware(ctx);

      expect(response!.status).toBe(200);

      const body = await response!.json();
      expect(body.status).toBe('degraded');
    });

    it('with degraded check returns degraded', async () => {
      const checks: HealthCheck[] = [
        {
          name: 'db',
          critical: true,
          check: () => ({ status: 'healthy' }),
        },
        {
          name: 'cache',
          critical: false,
          check: () => ({ status: 'degraded', message: 'High latency' }),
        },
      ];

      const middleware = healthCheck({ checks });
      const ctx = createMockContext('http://localhost/health');
      const response = await middleware(ctx);

      const body = await response!.json();
      expect(body.status).toBe('degraded');
    });

    it('critical takes precedence over degraded', async () => {
      const checks: HealthCheck[] = [
        {
          name: 'db',
          critical: true,
          check: () => ({ status: 'unhealthy', message: 'DB down' }),
        },
        {
          name: 'cache',
          critical: false,
          check: () => ({ status: 'degraded', message: 'Slow' }),
        },
      ];

      const middleware = healthCheck({ checks });
      const ctx = createMockContext('http://localhost/health');
      const response = await middleware(ctx);

      const body = await response!.json();
      expect(body.status).toBe('unhealthy');
    });
  });

  describe('memoryCheck', () => {
    it('returns a valid HealthCheck object', () => {
      const check = memoryCheck();

      expect(check.name).toBe('memory');
      expect(check.critical).toBe(false);
      expect(typeof check.check).toBe('function');
    });

    it('returns healthy status under normal conditions', () => {
      const check = memoryCheck();
      const result = check.check() as HealthCheckResult;

      // Under normal test conditions, memory should be healthy
      expect(['healthy', 'degraded']).toContain(result.status);
      expect(result.details).toBeDefined();
      expect(result.details!.heapUsed).toBeDefined();
      expect(result.details!.heapTotal).toBeDefined();
    });

    it('respects custom thresholds', () => {
      // Use extremely low thresholds to trigger degraded/unhealthy
      const check = memoryCheck({ warnThreshold: 0, criticalThreshold: 0 });
      const result = check.check() as HealthCheckResult;

      // With 0% threshold, any memory usage should be unhealthy
      expect(result.status).toBe('unhealthy');
    });

    it('includes memory usage details', () => {
      const check = memoryCheck();
      const result = check.check() as HealthCheckResult;

      expect(result.details).toBeDefined();
      expect(typeof result.details!.heapUsed).toBe('number');
      expect(typeof result.details!.heapTotal).toBe('number');
    });
  });

  describe('customCheck', () => {
    it('wraps arbitrary synchronous function', () => {
      const check = customCheck('myService', () => ({
        status: 'healthy',
        message: 'All good',
      }));

      expect(check.name).toBe('myService');
      expect(check.critical).toBe(false);

      const result = check.check() as HealthCheckResult;
      expect(result.status).toBe('healthy');
      expect(result.message).toBe('All good');
    });

    it('wraps arbitrary async function', async () => {
      const check = customCheck('asyncService', async () => ({
        status: 'degraded',
        message: 'High latency',
      }));

      const result = await check.check();
      expect(result.status).toBe('degraded');
      expect(result.message).toBe('High latency');
    });

    it('respects critical option', () => {
      const check = customCheck(
        'criticalService',
        () => ({ status: 'healthy' }),
        { critical: true }
      );

      expect(check.critical).toBe(true);
    });

    it('respects timeout option', () => {
      const check = customCheck(
        'slowService',
        () => ({ status: 'healthy' }),
        { timeout: 10000 }
      );

      expect(check.timeout).toBe(10000);
    });

    it('integrates with healthCheck middleware', async () => {
      const myCheck = customCheck('custom', () => ({
        status: 'healthy',
        message: 'Running',
        details: { version: '1.0' },
      }));

      const middleware = healthCheck({ checks: [myCheck] });
      const ctx = createMockContext('http://localhost/health');
      const response = await middleware(ctx);

      const body = await response!.json();
      expect(body.status).toBe('healthy');
      expect(body.checks.custom).toBeDefined();
      expect(body.checks.custom.status).toBe('healthy');
      expect(body.checks.custom.message).toBe('Running');
    });
  });

  describe('Non-health paths return void (pass-through)', () => {
    it('returns undefined for /api/users', async () => {
      const middleware = healthCheck();
      const ctx = createMockContext('http://localhost/api/users');
      const result = await middleware(ctx);

      expect(result).toBeUndefined();
    });

    it('returns undefined for /', async () => {
      const middleware = healthCheck();
      const ctx = createMockContext('http://localhost/');
      const result = await middleware(ctx);

      expect(result).toBeUndefined();
    });

    it('returns undefined for /healthcheck (not matching /health)', async () => {
      const middleware = healthCheck();
      const ctx = createMockContext('http://localhost/healthcheck');
      const result = await middleware(ctx);

      expect(result).toBeUndefined();
    });

    it('returns undefined for /health/something-else', async () => {
      const middleware = healthCheck();
      const ctx = createMockContext('http://localhost/health/something-else');
      const result = await middleware(ctx);

      expect(result).toBeUndefined();
    });
  });

  describe('Health response includes version when configured', () => {
    it('includes version in response body', async () => {
      const middleware = healthCheck({ version: '2.1.0' });
      const ctx = createMockContext('http://localhost/health');
      const response = await middleware(ctx);

      const body = await response!.json();
      expect(body.version).toBe('2.1.0');
    });

    it('omits version when not configured', async () => {
      const middleware = healthCheck();
      const ctx = createMockContext('http://localhost/health');
      const response = await middleware(ctx);

      const body = await response!.json();
      expect(body.version).toBeUndefined();
    });
  });

  describe('Readiness probe', () => {
    it('runs all checks for readiness endpoint', async () => {
      const checkFn = vi.fn(() => ({ status: 'healthy' as const }));
      const checks: HealthCheck[] = [
        { name: 'db', critical: true, check: checkFn },
      ];

      const middleware = healthCheck({ checks });
      const ctx = createMockContext('http://localhost/health/ready');
      const response = await middleware(ctx);

      expect(response).toBeInstanceOf(Response);
      expect(response!.status).toBe(200);
      expect(checkFn).toHaveBeenCalled();
    });
  });

  describe('Check timeout handling', () => {
    it('returns unhealthy when check times out', async () => {
      const slowCheck: HealthCheck = {
        name: 'slow',
        critical: true,
        timeout: 50,
        check: () => new Promise((resolve) => setTimeout(() => resolve({ status: 'healthy' }), 200)),
      };

      const middleware = healthCheck({ checks: [slowCheck] });
      const ctx = createMockContext('http://localhost/health');
      const response = await middleware(ctx);

      expect(response!.status).toBe(503);

      const body = await response!.json();
      expect(body.status).toBe('unhealthy');
      expect(body.checks.slow.status).toBe('unhealthy');
      expect(body.checks.slow.message).toContain('timed out');
    });
  });

  describe('includeDetails option', () => {
    it('includes check details by default', async () => {
      const checks: HealthCheck[] = [
        { name: 'db', check: () => ({ status: 'healthy' }) },
      ];

      const middleware = healthCheck({ checks });
      const ctx = createMockContext('http://localhost/health');
      const response = await middleware(ctx);

      const body = await response!.json();
      expect(body.checks).toBeDefined();
      expect(body.checks.db).toBeDefined();
    });

    it('excludes check details when includeDetails is false', async () => {
      const checks: HealthCheck[] = [
        { name: 'db', check: () => ({ status: 'healthy' }) },
      ];

      const middleware = healthCheck({ checks, includeDetails: false });
      const ctx = createMockContext('http://localhost/health');
      const response = await middleware(ctx);

      const body = await response!.json();
      expect(body.checks).toEqual({});
    });
  });
});
