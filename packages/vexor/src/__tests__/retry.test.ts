/**
 * Retry Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  retry,
  retryWithResult,
  retryPredicates,
  backoffStrategies,
} from '../resilience/retry.js';

// ---------------------------------------------------------------------------
// retry
// ---------------------------------------------------------------------------
describe('retry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should succeed on first attempt', async () => {
    const op = vi.fn().mockResolvedValue('ok');
    const promise = retry(op, { maxAttempts: 3, jitter: false, delay: 100 });

    const result = await promise;
    expect(result).toBe('ok');
    expect(op).toHaveBeenCalledTimes(1);
  });

  it('should retry and succeed on later attempt', async () => {
    const op = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail1'))
      .mockRejectedValueOnce(new Error('fail2'))
      .mockResolvedValue('ok');

    const promise = retry(op, {
      maxAttempts: 5,
      delay: 100,
      jitter: false,
    });

    // Advance through backoff delays
    await vi.advanceTimersByTimeAsync(100); // attempt 2
    await vi.advanceTimersByTimeAsync(200); // attempt 3

    const result = await promise;
    expect(result).toBe('ok');
    expect(op).toHaveBeenCalledTimes(3);
  });

  it('should throw after exhausting all attempts', async () => {
    vi.useRealTimers();
    const op = vi.fn().mockRejectedValue(new Error('always fails'));

    await expect(
      retry(op, {
        maxAttempts: 3,
        delay: 1,
        jitter: false,
      })
    ).rejects.toThrow('always fails');
    expect(op).toHaveBeenCalledTimes(3);
    vi.useFakeTimers();
  });

  it('should respect maxDelay cap', async () => {
    const onRetry = vi.fn();
    const op = vi
      .fn()
      .mockRejectedValueOnce(new Error('e1'))
      .mockRejectedValueOnce(new Error('e2'))
      .mockResolvedValue('ok');

    const promise = retry(op, {
      maxAttempts: 5,
      delay: 1000,
      backoffFactor: 10,
      maxDelay: 5000,
      jitter: false,
      onRetry,
    });

    // First retry: delay = 1000 * 10^0 = 1000
    await vi.advanceTimersByTimeAsync(1000);
    // Second retry: delay = min(1000 * 10^1, 5000) = 5000
    await vi.advanceTimersByTimeAsync(5000);

    const result = await promise;
    expect(result).toBe('ok');
    // Verify the capped delay was passed to onRetry
    const secondRetryDelay = onRetry.mock.calls[1]?.[2];
    expect(secondRetryDelay).toBeLessThanOrEqual(5000);
  });

  it('should call onRetry callback', async () => {
    const onRetry = vi.fn();
    const op = vi
      .fn()
      .mockRejectedValueOnce(new Error('e1'))
      .mockResolvedValue('ok');

    const promise = retry(op, {
      maxAttempts: 3,
      delay: 100,
      jitter: false,
      onRetry,
    });

    await vi.advanceTimersByTimeAsync(100);
    await promise;

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'e1' }),
      1,
      expect.any(Number)
    );
  });

  it('should stop retrying when retryIf returns false', async () => {
    const op = vi.fn().mockRejectedValue(new Error('not-retryable'));

    const promise = retry(op, {
      maxAttempts: 5,
      delay: 100,
      jitter: false,
      retryIf: () => false,
    });

    await expect(promise).rejects.toThrow('not-retryable');
    expect(op).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// retryWithResult
// ---------------------------------------------------------------------------
describe('retryWithResult', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return success result', async () => {
    const op = vi.fn().mockResolvedValue(42);
    const result = await retryWithResult(op, { maxAttempts: 3, delay: 100, jitter: false });

    expect(result.success).toBe(true);
    expect(result.value).toBe(42);
    expect(result.attempts).toBe(1);
  });

  it('should return failure result after exhaustion', async () => {
    const op = vi.fn().mockRejectedValue(new Error('nope'));

    const promise = retryWithResult(op, {
      maxAttempts: 2,
      delay: 50,
      jitter: false,
    });

    await vi.advanceTimersByTimeAsync(50);

    const result = await promise;
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error!.message).toBe('nope');
    expect(result.attempts).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// retryPredicates
// ---------------------------------------------------------------------------
describe('retryPredicates', () => {
  it('always returns true', () => {
    expect(retryPredicates.always()).toBe(true);
  });

  it('never returns false', () => {
    expect(retryPredicates.never()).toBe(false);
  });

  it('onErrorType matches specific error types', () => {
    class CustomError extends Error {}
    const pred = retryPredicates.onErrorType(TypeError, CustomError);

    expect(pred(new TypeError('t'))).toBe(true);
    expect(pred(new CustomError('c'))).toBe(true);
    expect(pred(new Error('e'))).toBe(false);
  });

  it('onErrorMessage matches string patterns', () => {
    const pred = retryPredicates.onErrorMessage('timeout', /ECONNRESET/);

    expect(pred(new Error('connection timeout occurred'))).toBe(true);
    expect(pred(new Error('ECONNRESET'))).toBe(true);
    expect(pred(new Error('not found'))).toBe(false);
  });

  it('onHttpStatus matches specific status codes', () => {
    const pred = retryPredicates.onHttpStatus(500, 502, 503);
    const err500 = Object.assign(new Error(''), { status: 500 });
    const err404 = Object.assign(new Error(''), { status: 404 });

    expect(pred(err500)).toBe(true);
    expect(pred(err404)).toBe(false);
  });

  it('transient recognizes server errors', () => {
    const err500 = Object.assign(new Error(''), { status: 500 });
    const err404 = Object.assign(new Error(''), { status: 404 });
    const errReset = Object.assign(new Error(''), { code: 'ECONNRESET' });
    const errTimeout = new Error('Timeout');

    expect(retryPredicates.transient(err500)).toBe(true);
    expect(retryPredicates.transient(err404)).toBe(false);
    expect(retryPredicates.transient(errReset)).toBe(true);
    expect(retryPredicates.transient(errTimeout)).toBe(true);
  });

  it('and combines predicates', () => {
    const pred = retryPredicates.and(
      () => true,
      (_err, attempt) => attempt < 3
    );
    expect(pred(new Error(), 1)).toBe(true);
    expect(pred(new Error(), 3)).toBe(false);
  });

  it('or combines predicates', () => {
    const pred = retryPredicates.or(
      () => false,
      () => true
    );
    expect(pred(new Error(), 1)).toBe(true);
  });

  it('maxAttempts limits retries', () => {
    const pred = retryPredicates.maxAttempts(2);
    expect(pred(new Error(), 1)).toBe(true);
    expect(pred(new Error(), 2)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// backoffStrategies
// ---------------------------------------------------------------------------
describe('backoffStrategies', () => {
  it('constant returns fixed delay with no backoff', () => {
    const opts = backoffStrategies.constant(500);
    expect(opts.delay).toBe(500);
    expect(opts.backoffFactor).toBe(1);
    expect(opts.jitter).toBe(false);
  });

  it('exponential returns correct initial delay and factor', () => {
    const opts = backoffStrategies.exponential(200, 3);
    expect(opts.delay).toBe(200);
    expect(opts.backoffFactor).toBe(3);
  });

  it('exponentialWithJitter enables jitter', () => {
    const opts = backoffStrategies.exponentialWithJitter(100, 2, 0.25);
    expect(opts.jitter).toBe(true);
    expect(opts.jitterFactor).toBe(0.25);
    expect(opts.delay).toBe(100);
    expect(opts.backoffFactor).toBe(2);
  });

  it('fibonacci uses golden ratio approximation', () => {
    const opts = backoffStrategies.fibonacci(1000);
    expect(opts.delay).toBe(1000);
    expect(opts.backoffFactor).toBeCloseTo(1.618, 2);
  });

  it('linear uses backoffFactor of 1', () => {
    const opts = backoffStrategies.linear(500, 100);
    expect(opts.delay).toBe(500);
    expect(opts.backoffFactor).toBe(1);
  });
});
