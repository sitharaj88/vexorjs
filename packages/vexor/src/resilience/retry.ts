/**
 * Retry Strategies
 *
 * Configurable retry patterns with exponential backoff,
 * jitter, and conditional retry logic.
 */

/**
 * Retry options
 */
export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxAttempts?: number;
  /** Initial delay in ms (default: 1000) */
  delay?: number;
  /** Maximum delay in ms (default: 30000) */
  maxDelay?: number;
  /** Backoff multiplier (default: 2) */
  backoffFactor?: number;
  /** Add random jitter to delay (default: true) */
  jitter?: boolean;
  /** Jitter factor (0-1, default: 0.1) */
  jitterFactor?: number;
  /** Function to determine if error is retryable */
  retryIf?: (error: Error, attempt: number) => boolean;
  /** Callback on each retry */
  onRetry?: (error: Error, attempt: number, delay: number) => void;
  /** Timeout per attempt in ms (optional) */
  timeout?: number;
}

/**
 * Retry result
 */
export interface RetryResult<T> {
  /** Success result */
  value?: T;
  /** Final error if all attempts failed */
  error?: Error;
  /** Number of attempts made */
  attempts: number;
  /** Total time spent in ms */
  totalTime: number;
  /** Whether the operation succeeded */
  success: boolean;
}

/**
 * Default retry options
 */
const defaultOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  delay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
  jitter: true,
  jitterFactor: 0.1,
  retryIf: () => true,
  onRetry: () => {},
  timeout: 0,
};

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(
  attempt: number,
  options: Required<RetryOptions>
): number {
  // Exponential backoff
  let delay = options.delay * Math.pow(options.backoffFactor, attempt - 1);

  // Cap at max delay
  delay = Math.min(delay, options.maxDelay);

  // Add jitter
  if (options.jitter) {
    const jitterRange = delay * options.jitterFactor;
    delay += (Math.random() - 0.5) * 2 * jitterRange;
  }

  return Math.max(0, Math.round(delay));
}

/**
 * Sleep for a given duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry an async operation
 */
export async function retry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      // Execute with optional timeout
      if (opts.timeout > 0) {
        return await Promise.race([
          operation(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), opts.timeout)
          ),
        ]);
      }
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Check if we should retry
      if (attempt >= opts.maxAttempts || !opts.retryIf(lastError, attempt)) {
        throw lastError;
      }

      // Calculate delay
      const delay = calculateDelay(attempt, opts);

      // Notify retry callback
      opts.onRetry(lastError, attempt, delay);

      // Wait before next attempt
      await sleep(delay);
    }
  }

  throw lastError ?? new Error('Retry failed');
}

/**
 * Retry with detailed result
 */
export async function retryWithResult<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const opts = { ...defaultOptions, ...options };
  let lastError: Error | undefined;
  const startTime = Date.now();
  let attempts = 0;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    attempts = attempt;

    try {
      // Execute with optional timeout
      let result: T;
      if (opts.timeout > 0) {
        result = await Promise.race([
          operation(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), opts.timeout)
          ),
        ]);
      } else {
        result = await operation();
      }

      return {
        value: result,
        attempts,
        totalTime: Date.now() - startTime,
        success: true,
      };
    } catch (error) {
      lastError = error as Error;

      // Check if we should retry
      if (attempt >= opts.maxAttempts || !opts.retryIf(lastError, attempt)) {
        return {
          error: lastError,
          attempts,
          totalTime: Date.now() - startTime,
          success: false,
        };
      }

      // Calculate delay
      const delay = calculateDelay(attempt, opts);

      // Notify retry callback
      opts.onRetry(lastError, attempt, delay);

      // Wait before next attempt
      await sleep(delay);
    }
  }

  return {
    error: lastError ?? new Error('Retry failed'),
    attempts,
    totalTime: Date.now() - startTime,
    success: false,
  };
}

/**
 * Create a retryable function
 */
export function retryable<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options: RetryOptions = {}
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    return retry(() => fn(...args), options) as Promise<Awaited<ReturnType<T>>>;
  };
}

/**
 * Retry decorator for class methods
 */
export function Retry(options: RetryOptions = {}): MethodDecorator {
  return function (
    _target: unknown,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      return retry(() => originalMethod.apply(this, args), options);
    };

    return descriptor;
  };
}

/**
 * Common retry predicates
 */
export const retryPredicates = {
  /**
   * Retry on any error
   */
  always: (): boolean => true,

  /**
   * Never retry
   */
  never: (): boolean => false,

  /**
   * Retry on specific error types
   */
  onErrorType: (...types: (new (...args: unknown[]) => Error)[]) =>
    (error: Error): boolean => types.some(t => error instanceof t),

  /**
   * Retry on specific error messages
   */
  onErrorMessage: (...patterns: (string | RegExp)[]) =>
    (error: Error): boolean => patterns.some(p =>
      typeof p === 'string' ? error.message.includes(p) : p.test(error.message)
    ),

  /**
   * Retry on HTTP status codes
   */
  onHttpStatus: (...statuses: number[]) =>
    (error: Error & { status?: number }): boolean =>
      error.status !== undefined && statuses.includes(error.status),

  /**
   * Retry on transient errors (5xx, network errors)
   */
  transient: (error: Error & { status?: number; code?: string }): boolean => {
    // Server errors
    if (error.status !== undefined && error.status >= 500) return true;
    // Network errors
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') return true;
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') return false;
    // Timeout errors
    if (error.message === 'Timeout') return true;
    return false;
  },

  /**
   * Combine multiple predicates with AND
   */
  and: (...predicates: ((error: Error, attempt: number) => boolean)[]) =>
    (error: Error, attempt: number): boolean =>
      predicates.every(p => p(error, attempt)),

  /**
   * Combine multiple predicates with OR
   */
  or: (...predicates: ((error: Error, attempt: number) => boolean)[]) =>
    (error: Error, attempt: number): boolean =>
      predicates.some(p => p(error, attempt)),

  /**
   * Limit retries based on attempt count
   */
  maxAttempts: (max: number) =>
    (_error: Error, attempt: number): boolean => attempt < max,
};

/**
 * Backoff strategies
 */
export const backoffStrategies = {
  /**
   * Constant delay
   */
  constant: (delay: number): RetryOptions => ({
    delay,
    backoffFactor: 1,
    jitter: false,
  }),

  /**
   * Linear backoff
   */
  linear: (initialDelay: number, _increment: number): RetryOptions => ({
    delay: initialDelay,
    backoffFactor: 1,
    // Custom calculation needed - this is an approximation
  }),

  /**
   * Exponential backoff (default)
   */
  exponential: (initialDelay: number = 1000, factor: number = 2): RetryOptions => ({
    delay: initialDelay,
    backoffFactor: factor,
  }),

  /**
   * Exponential backoff with jitter
   */
  exponentialWithJitter: (
    initialDelay: number = 1000,
    factor: number = 2,
    jitterFactor: number = 0.1
  ): RetryOptions => ({
    delay: initialDelay,
    backoffFactor: factor,
    jitter: true,
    jitterFactor,
  }),

  /**
   * Fibonacci backoff
   * Note: Fibonacci sequence requires custom onRetry implementation
   */
  fibonacci: (initialDelay: number = 1000): RetryOptions => ({
    delay: initialDelay,
    backoffFactor: 1.618, // Golden ratio approximates Fibonacci
  }),
};
