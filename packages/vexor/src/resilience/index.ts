/**
 * Resilience Module
 *
 * Fault tolerance patterns including circuit breakers,
 * retry strategies, bulkheads, and rate limiting.
 */

// Circuit breaker exports
export {
  CircuitBreaker,
  CircuitBreakerError,
  createCircuitBreaker,
  withCircuitBreaker,
} from './circuit-breaker.js';

export type {
  CircuitState,
  CircuitBreakerOptions,
  CircuitBreakerStats,
  CircuitBreakerEvents,
} from './circuit-breaker.js';

// Retry exports
export {
  retry,
  retryWithResult,
  retryable,
  Retry,
  retryPredicates,
  backoffStrategies,
} from './retry.js';

export type {
  RetryOptions,
  RetryResult,
} from './retry.js';
