/**
 * Circuit Breaker
 *
 * Opossum-inspired circuit breaker pattern for fault tolerance.
 * Prevents cascading failures by failing fast when a service is unhealthy.
 */

/**
 * Circuit breaker states
 */
export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

/**
 * Circuit breaker options
 */
export interface CircuitBreakerOptions {
  /** Failure threshold before opening (default: 5) */
  failureThreshold?: number;
  /** Time in ms to wait before testing (default: 30000) */
  resetTimeout?: number;
  /** Time window in ms for counting failures (default: 10000) */
  rollingWindow?: number;
  /** Minimum calls before threshold applies (default: 5) */
  volumeThreshold?: number;
  /** Request timeout in ms (default: 10000) */
  timeout?: number;
  /** Fallback function when circuit is open */
  fallback?: (...args: unknown[]) => unknown;
  /** Whether to track success rate (default: true) */
  trackSuccessRate?: boolean;
  /** Success rate threshold (0-1) to close circuit (default: 0.5) */
  successRateThreshold?: number;
  /** Number of test requests in half-open state (default: 1) */
  halfOpenRequests?: number;
}

/**
 * Circuit breaker statistics
 */
export interface CircuitBreakerStats {
  /** Current state */
  state: CircuitState;
  /** Total successful calls */
  successes: number;
  /** Total failed calls */
  failures: number;
  /** Total rejected calls (when open) */
  rejected: number;
  /** Total timed out calls */
  timeouts: number;
  /** Fallback calls */
  fallbacks: number;
  /** Success rate (0-1) */
  successRate: number;
  /** Last failure time */
  lastFailure: number | null;
  /** Time circuit was opened */
  openedAt: number | null;
}

/**
 * Circuit breaker events
 */
export interface CircuitBreakerEvents {
  /** Circuit opened */
  open: () => void;
  /** Circuit closed */
  close: () => void;
  /** Circuit half-opened */
  halfOpen: () => void;
  /** Request succeeded */
  success: (duration: number) => void;
  /** Request failed */
  failure: (error: Error) => void;
  /** Request rejected (circuit open) */
  reject: () => void;
  /** Request timed out */
  timeout: () => void;
  /** Fallback called */
  fallback: (error: Error) => void;
}

/**
 * Circuit breaker error
 */
export class CircuitBreakerError extends Error {
  constructor(
    message: string,
    public readonly state: CircuitState
  ) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}

/**
 * Circuit breaker implementation
 */
export class CircuitBreaker<T extends (...args: unknown[]) => Promise<unknown>> {
  private state: CircuitState = 'CLOSED';
  private failures = 0;
  private successes = 0;
  private rejected = 0;
  private timeouts = 0;
  private fallbacks = 0;
  private lastFailure: number | null = null;
  private openedAt: number | null = null;
  private halfOpenSuccesses = 0;
  private failureTimestamps: number[] = [];

  private options: Omit<Required<CircuitBreakerOptions>, 'fallback'> & { fallback?: CircuitBreakerOptions['fallback'] };
  private listeners = new Map<keyof CircuitBreakerEvents, Set<Function>>();

  constructor(
    private action: T,
    options: CircuitBreakerOptions = {}
  ) {
    this.options = {
      failureThreshold: options.failureThreshold ?? 5,
      resetTimeout: options.resetTimeout ?? 30000,
      rollingWindow: options.rollingWindow ?? 10000,
      volumeThreshold: options.volumeThreshold ?? 5,
      timeout: options.timeout ?? 10000,
      fallback: options.fallback,
      trackSuccessRate: options.trackSuccessRate ?? true,
      successRateThreshold: options.successRateThreshold ?? 0.5,
      halfOpenRequests: options.halfOpenRequests ?? 1,
    };
  }

  /**
   * Execute the protected action
   */
  async fire(...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> {
    // Check if circuit should transition from OPEN to HALF_OPEN
    if (this.state === 'OPEN') {
      if (Date.now() - (this.openedAt ?? 0) >= this.options.resetTimeout) {
        this.toHalfOpen();
      } else {
        return this.handleRejection(args);
      }
    }

    // In HALF_OPEN state, only allow limited requests
    if (this.state === 'HALF_OPEN') {
      // Continue with test request
    }

    try {
      const result = await this.executeWithTimeout(args);
      this.handleSuccess();
      return result as Awaited<ReturnType<T>>;
    } catch (error) {
      return this.handleFailure(error as Error, args);
    }
  }

  /**
   * Execute with timeout
   */
  private async executeWithTimeout(args: Parameters<T>): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.timeouts++;
        this.emit('timeout');
        reject(new Error('Circuit breaker timeout'));
      }, this.options.timeout);

      this.action(...args)
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Handle successful call
   */
  private handleSuccess(): void {
    this.successes++;
    this.emit('success', 0);

    if (this.state === 'HALF_OPEN') {
      this.halfOpenSuccesses++;
      if (this.halfOpenSuccesses >= this.options.halfOpenRequests) {
        this.toClose();
      }
    }
  }

  /**
   * Handle failed call
   */
  private async handleFailure(error: Error, args: Parameters<T>): Promise<Awaited<ReturnType<T>>> {
    this.failures++;
    this.lastFailure = Date.now();
    this.failureTimestamps.push(this.lastFailure);
    this.emit('failure', error);

    // Clean up old failure timestamps
    const windowStart = Date.now() - this.options.rollingWindow;
    this.failureTimestamps = this.failureTimestamps.filter(t => t >= windowStart);

    // Check if we should open the circuit
    if (this.state === 'CLOSED' || this.state === 'HALF_OPEN') {
      const totalCalls = this.successes + this.failures;
      const recentFailures = this.failureTimestamps.length;

      if (
        totalCalls >= this.options.volumeThreshold &&
        recentFailures >= this.options.failureThreshold
      ) {
        this.toOpen();
      } else if (this.state === 'HALF_OPEN') {
        // Any failure in half-open reopens the circuit
        this.toOpen();
      }
    }

    // Try fallback
    if (this.options.fallback) {
      this.fallbacks++;
      this.emit('fallback', error);
      return this.options.fallback(...args) as Awaited<ReturnType<T>>;
    }

    throw error;
  }

  /**
   * Handle rejection when circuit is open
   */
  private async handleRejection(args: Parameters<T>): Promise<Awaited<ReturnType<T>>> {
    this.rejected++;
    this.emit('reject');

    if (this.options.fallback) {
      this.fallbacks++;
      this.emit('fallback', new CircuitBreakerError('Circuit is open', this.state));
      return this.options.fallback(...args) as Awaited<ReturnType<T>>;
    }

    throw new CircuitBreakerError('Circuit breaker is open', this.state);
  }

  /**
   * Transition to OPEN state
   */
  private toOpen(): void {
    if (this.state !== 'OPEN') {
      this.state = 'OPEN';
      this.openedAt = Date.now();
      this.halfOpenSuccesses = 0;
      this.emit('open');
    }
  }

  /**
   * Transition to HALF_OPEN state
   */
  private toHalfOpen(): void {
    if (this.state !== 'HALF_OPEN') {
      this.state = 'HALF_OPEN';
      this.halfOpenSuccesses = 0;
      this.emit('halfOpen');
    }
  }

  /**
   * Transition to CLOSED state
   */
  private toClose(): void {
    if (this.state !== 'CLOSED') {
      this.state = 'CLOSED';
      this.failures = 0;
      this.failureTimestamps = [];
      this.openedAt = null;
      this.halfOpenSuccesses = 0;
      this.emit('close');
    }
  }

  /**
   * Force the circuit to open
   */
  open(): void {
    this.toOpen();
  }

  /**
   * Force the circuit to close
   */
  close(): void {
    this.toClose();
  }

  /**
   * Get circuit statistics
   */
  get stats(): CircuitBreakerStats {
    const total = this.successes + this.failures;
    return {
      state: this.state,
      successes: this.successes,
      failures: this.failures,
      rejected: this.rejected,
      timeouts: this.timeouts,
      fallbacks: this.fallbacks,
      successRate: total > 0 ? this.successes / total : 0,
      lastFailure: this.lastFailure,
      openedAt: this.openedAt,
    };
  }

  /**
   * Get current state
   */
  get currentState(): CircuitState {
    return this.state;
  }

  /**
   * Check if circuit is open
   */
  get isOpen(): boolean {
    return this.state === 'OPEN';
  }

  /**
   * Check if circuit is closed
   */
  get isClosed(): boolean {
    return this.state === 'CLOSED';
  }

  /**
   * Reset statistics
   */
  reset(): void {
    this.failures = 0;
    this.successes = 0;
    this.rejected = 0;
    this.timeouts = 0;
    this.fallbacks = 0;
    this.lastFailure = null;
    this.failureTimestamps = [];
  }

  /**
   * Add event listener
   */
  on<K extends keyof CircuitBreakerEvents>(
    event: K,
    listener: CircuitBreakerEvents[K]
  ): void {
    let listeners = this.listeners.get(event);
    if (!listeners) {
      listeners = new Set();
      this.listeners.set(event, listeners);
    }
    listeners.add(listener);
  }

  /**
   * Remove event listener
   */
  off<K extends keyof CircuitBreakerEvents>(
    event: K,
    listener: CircuitBreakerEvents[K]
  ): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Emit event
   */
  private emit<K extends keyof CircuitBreakerEvents>(
    event: K,
    ...args: Parameters<CircuitBreakerEvents[K]>
  ): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        try {
          (listener as Function)(...args);
        } catch (error) {
          console.error(`Circuit breaker event handler error:`, error);
        }
      }
    }
  }
}

/**
 * Create a circuit breaker
 */
export function createCircuitBreaker<T extends (...args: unknown[]) => Promise<unknown>>(
  action: T,
  options?: CircuitBreakerOptions
): CircuitBreaker<T> {
  return new CircuitBreaker(action, options);
}

/**
 * Wrap a function with circuit breaker
 */
export function withCircuitBreaker<T extends (...args: unknown[]) => Promise<unknown>>(
  action: T,
  options?: CircuitBreakerOptions
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  const breaker = new CircuitBreaker(action, options);
  return (...args) => breaker.fire(...args);
}
