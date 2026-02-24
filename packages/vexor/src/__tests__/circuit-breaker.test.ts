/**
 * Circuit Breaker Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  CircuitBreaker,
  CircuitBreakerError,
} from '../resilience/circuit-breaker.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function successAction(): Promise<string> {
  return Promise.resolve('ok');
}

function failAction(): Promise<never> {
  return Promise.reject(new Error('fail'));
}

let callCount = 0;
function failNTimes(n: number): () => Promise<string> {
  callCount = 0;
  return () => {
    callCount++;
    if (callCount <= n) {
      return Promise.reject(new Error(`fail-${callCount}`));
    }
    return Promise.resolve('recovered');
  };
}

// ---------------------------------------------------------------------------
// CircuitBreaker
// ---------------------------------------------------------------------------
describe('CircuitBreaker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('CLOSED state', () => {
    it('should execute action and return result when closed', async () => {
      const breaker = new CircuitBreaker(successAction, {
        failureThreshold: 3,
        timeout: 5000,
      });
      const result = await breaker.fire();
      expect(result).toBe('ok');
      expect(breaker.currentState).toBe('CLOSED');
    });

    it('should transition to OPEN after reaching failure threshold', async () => {
      const breaker = new CircuitBreaker(failAction, {
        failureThreshold: 3,
        volumeThreshold: 1,
        rollingWindow: 60_000,
        timeout: 5000,
      });

      for (let i = 0; i < 3; i++) {
        await breaker.fire().catch(() => {});
      }

      expect(breaker.currentState).toBe('OPEN');
    });

    it('should not open if failures are below threshold', async () => {
      const breaker = new CircuitBreaker(failAction, {
        failureThreshold: 5,
        volumeThreshold: 1,
        rollingWindow: 60_000,
        timeout: 5000,
      });

      for (let i = 0; i < 3; i++) {
        await breaker.fire().catch(() => {});
      }

      expect(breaker.currentState).toBe('CLOSED');
    });
  });

  describe('OPEN state', () => {
    it('should reject immediately when open', async () => {
      const breaker = new CircuitBreaker(failAction, {
        failureThreshold: 1,
        volumeThreshold: 1,
        resetTimeout: 30_000,
        rollingWindow: 60_000,
        timeout: 5000,
      });

      await breaker.fire().catch(() => {});
      expect(breaker.currentState).toBe('OPEN');

      await expect(breaker.fire()).rejects.toThrow(CircuitBreakerError);
      expect(breaker.stats.rejected).toBeGreaterThanOrEqual(1);
    });

    it('should use fallback when open', async () => {
      const fallback = vi.fn().mockReturnValue('fallback-result');
      const breaker = new CircuitBreaker(failAction, {
        failureThreshold: 1,
        volumeThreshold: 1,
        rollingWindow: 60_000,
        timeout: 5000,
        fallback,
      });

      await breaker.fire().catch(() => {});
      expect(breaker.currentState).toBe('OPEN');

      const result = await breaker.fire();
      expect(result).toBe('fallback-result');
      expect(fallback).toHaveBeenCalled();
    });
  });

  describe('HALF_OPEN state', () => {
    it('should transition to HALF_OPEN after resetTimeout', async () => {
      const action = failNTimes(2);
      const breaker = new CircuitBreaker(action, {
        failureThreshold: 1,
        volumeThreshold: 1,
        resetTimeout: 10_000,
        rollingWindow: 60_000,
        timeout: 5000,
        halfOpenRequests: 1,
      });

      // Trip the breaker
      await breaker.fire().catch(() => {});
      expect(breaker.currentState).toBe('OPEN');

      // Advance past resetTimeout
      vi.advanceTimersByTime(11_000);

      // Next call should attempt (HALF_OPEN) - action will fail again
      await breaker.fire().catch(() => {});
      // After failure in HALF_OPEN, it goes back to OPEN
      expect(breaker.currentState).toBe('OPEN');
    });

    it('should transition HALF_OPEN to CLOSED on success', async () => {
      const action = failNTimes(1);
      const breaker = new CircuitBreaker(action, {
        failureThreshold: 1,
        volumeThreshold: 1,
        resetTimeout: 10_000,
        rollingWindow: 60_000,
        timeout: 5000,
        halfOpenRequests: 1,
      });

      // Trip the breaker
      await breaker.fire().catch(() => {});
      expect(breaker.currentState).toBe('OPEN');

      // Advance past resetTimeout
      vi.advanceTimersByTime(11_000);

      // Next call succeeds (callCount > 1 now)
      const result = await breaker.fire();
      expect(result).toBe('recovered');
      expect(breaker.currentState).toBe('CLOSED');
    });
  });

  describe('event listeners', () => {
    it('should emit open event', async () => {
      const onOpen = vi.fn();
      const breaker = new CircuitBreaker(failAction, {
        failureThreshold: 1,
        volumeThreshold: 1,
        rollingWindow: 60_000,
        timeout: 5000,
      });
      breaker.on('open', onOpen);

      await breaker.fire().catch(() => {});
      expect(onOpen).toHaveBeenCalled();
    });

    it('should emit close event when transitioning to CLOSED', async () => {
      const onClose = vi.fn();
      const action = failNTimes(1);
      const breaker = new CircuitBreaker(action, {
        failureThreshold: 1,
        volumeThreshold: 1,
        resetTimeout: 10_000,
        rollingWindow: 60_000,
        timeout: 5000,
        halfOpenRequests: 1,
      });
      breaker.on('close', onClose);

      await breaker.fire().catch(() => {});
      vi.advanceTimersByTime(11_000);
      await breaker.fire();

      expect(onClose).toHaveBeenCalled();
    });

    it('should emit reject event when open', async () => {
      const onReject = vi.fn();
      const breaker = new CircuitBreaker(failAction, {
        failureThreshold: 1,
        volumeThreshold: 1,
        rollingWindow: 60_000,
        timeout: 5000,
      });
      breaker.on('reject', onReject);

      await breaker.fire().catch(() => {});
      await breaker.fire().catch(() => {});

      expect(onReject).toHaveBeenCalled();
    });

    it('should emit success event', async () => {
      const onSuccess = vi.fn();
      const breaker = new CircuitBreaker(successAction, { timeout: 5000 });
      breaker.on('success', onSuccess);

      await breaker.fire();
      expect(onSuccess).toHaveBeenCalled();
    });

    it('should emit failure event', async () => {
      const onFailure = vi.fn();
      const breaker = new CircuitBreaker(failAction, { timeout: 5000 });
      breaker.on('failure', onFailure);

      await breaker.fire().catch(() => {});
      expect(onFailure).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should remove listener with off', async () => {
      const onSuccess = vi.fn();
      const breaker = new CircuitBreaker(successAction, { timeout: 5000 });
      breaker.on('success', onSuccess);
      breaker.off('success', onSuccess);

      await breaker.fire();
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('stats', () => {
    it('should track successes and failures', async () => {
      const action = failNTimes(2);
      const breaker = new CircuitBreaker(action, {
        failureThreshold: 100,
        volumeThreshold: 100,
        timeout: 5000,
      });

      await breaker.fire().catch(() => {});
      await breaker.fire().catch(() => {});
      await breaker.fire(); // succeeds

      expect(breaker.stats.failures).toBe(2);
      expect(breaker.stats.successes).toBe(1);
      expect(breaker.stats.successRate).toBeCloseTo(1 / 3, 2);
    });

    it('should report state', async () => {
      const breaker = new CircuitBreaker(successAction, { timeout: 5000 });
      expect(breaker.stats.state).toBe('CLOSED');
    });
  });

  describe('reset', () => {
    it('should reset all counters', async () => {
      const breaker = new CircuitBreaker(failAction, {
        failureThreshold: 100,
        volumeThreshold: 100,
        timeout: 5000,
      });

      await breaker.fire().catch(() => {});
      breaker.reset();

      expect(breaker.stats.failures).toBe(0);
      expect(breaker.stats.successes).toBe(0);
      expect(breaker.stats.rejected).toBe(0);
      expect(breaker.stats.timeouts).toBe(0);
      expect(breaker.stats.fallbacks).toBe(0);
    });
  });

  describe('force open/close', () => {
    it('should force open the circuit', async () => {
      const breaker = new CircuitBreaker(successAction, { timeout: 5000 });
      breaker.open();
      expect(breaker.currentState).toBe('OPEN');
      expect(breaker.isOpen).toBe(true);
      expect(breaker.isClosed).toBe(false);
    });

    it('should force close the circuit', async () => {
      const breaker = new CircuitBreaker(failAction, {
        failureThreshold: 1,
        volumeThreshold: 1,
        rollingWindow: 60_000,
        timeout: 5000,
      });

      await breaker.fire().catch(() => {});
      expect(breaker.currentState).toBe('OPEN');

      breaker.close();
      expect(breaker.currentState).toBe('CLOSED');
      expect(breaker.isClosed).toBe(true);
    });
  });

  describe('fallback on failure', () => {
    it('should invoke fallback when action fails and fallback is set', async () => {
      const fallback = vi.fn().mockReturnValue('fb');
      const breaker = new CircuitBreaker(failAction, {
        failureThreshold: 100,
        volumeThreshold: 100,
        timeout: 5000,
        fallback,
      });

      const result = await breaker.fire();
      expect(result).toBe('fb');
      expect(breaker.stats.fallbacks).toBe(1);
    });
  });
});
