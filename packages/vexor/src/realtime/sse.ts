/**
 * Server-Sent Events (SSE)
 *
 * Type-safe SSE support with automatic reconnection,
 * event typing, and generator-based streaming.
 */

/**
 * SSE event data
 */
export interface SSEEvent {
  /** Event type (used for addEventListener on client) */
  event?: string;
  /** Event data (will be JSON.stringify if not a string) */
  data: unknown;
  /** Event ID (for reconnection) */
  id?: string;
  /** Retry interval in milliseconds */
  retry?: number;
}

/**
 * SSE stream options
 */
export interface SSEOptions {
  /** Retry interval in milliseconds (default: 3000) */
  retry?: number;
  /** Headers to include in response */
  headers?: Record<string, string>;
  /** Keep-alive interval in milliseconds (default: 30000) */
  keepAlive?: number;
  /** Keep-alive comment (default: ':ping') */
  keepAliveComment?: string;
}

/**
 * SSE controller for managing the stream
 */
export interface SSEController {
  /** Send an event */
  send(event: SSEEvent): void;
  /** Send data (shorthand for send({ data })) */
  sendData(data: unknown): void;
  /** Send a named event */
  sendEvent(name: string, data: unknown): void;
  /** Send a comment (for keep-alive) */
  sendComment(comment: string): void;
  /** Close the stream */
  close(): void;
  /** Check if stream is closed */
  readonly closed: boolean;
}

/**
 * SSE stream class for managing server-sent events
 */
export class SSEStream implements SSEController {
  private controller: ReadableStreamDefaultController<Uint8Array> | null = null;
  private encoder = new TextEncoder();
  private _closed = false;
  private keepAliveTimer: ReturnType<typeof setInterval> | null = null;
  private lastEventId = 0;

  constructor(private options: SSEOptions = {}) {}

  /**
   * Get the ReadableStream for the response
   */
  getStream(): ReadableStream<Uint8Array> {
    const self = this;

    return new ReadableStream<Uint8Array>({
      start(controller) {
        self.controller = controller;

        // Send retry interval if specified
        if (self.options.retry) {
          self.write(`retry: ${self.options.retry}\n\n`);
        }

        // Start keep-alive timer
        const keepAlive = self.options.keepAlive ?? 30000;
        if (keepAlive > 0) {
          self.keepAliveTimer = setInterval(() => {
            self.sendComment(self.options.keepAliveComment ?? 'ping');
          }, keepAlive);
        }
      },

      cancel() {
        self.cleanup();
      },
    });
  }

  /**
   * Create a Response object for SSE
   */
  getResponse(): Response {
    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      ...this.options.headers,
    });

    return new Response(this.getStream(), { headers });
  }

  /**
   * Write raw data to the stream
   */
  private write(data: string): void {
    if (this._closed || !this.controller) return;

    try {
      this.controller.enqueue(this.encoder.encode(data));
    } catch {
      this.cleanup();
    }
  }

  /**
   * Send an SSE event
   */
  send(event: SSEEvent): void {
    if (this._closed) return;

    let message = '';

    // Event ID
    if (event.id !== undefined) {
      message += `id: ${event.id}\n`;
    } else {
      // Auto-increment ID
      message += `id: ${++this.lastEventId}\n`;
    }

    // Event type
    if (event.event) {
      message += `event: ${event.event}\n`;
    }

    // Retry interval
    if (event.retry !== undefined) {
      message += `retry: ${event.retry}\n`;
    }

    // Data (handle multiline)
    const data = typeof event.data === 'string'
      ? event.data
      : JSON.stringify(event.data);

    for (const line of data.split('\n')) {
      message += `data: ${line}\n`;
    }

    // End of event
    message += '\n';

    this.write(message);
  }

  /**
   * Send data without event type
   */
  sendData(data: unknown): void {
    this.send({ data });
  }

  /**
   * Send a named event
   */
  sendEvent(name: string, data: unknown): void {
    this.send({ event: name, data });
  }

  /**
   * Send a comment (for keep-alive)
   */
  sendComment(comment: string): void {
    if (this._closed) return;
    this.write(`: ${comment}\n\n`);
  }

  /**
   * Close the stream
   */
  close(): void {
    this.cleanup();
  }

  /**
   * Check if stream is closed
   */
  get closed(): boolean {
    return this._closed;
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this._closed) return;

    this._closed = true;

    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }

    if (this.controller) {
      try {
        this.controller.close();
      } catch {
        // Already closed
      }
      this.controller = null;
    }
  }
}

/**
 * Create an SSE response from a generator
 */
export function sseFromGenerator<T>(
  generator: AsyncGenerator<T, void, unknown> | Generator<T, void, unknown>,
  options: SSEOptions & { transform?: (value: T) => SSEEvent } = {}
): Response {
  const { transform = (value) => ({ data: value }), ...sseOptions } = options;
  const stream = new SSEStream(sseOptions);

  // Start consuming the generator
  (async () => {
    try {
      for await (const value of generator) {
        if (stream.closed) break;
        stream.send(transform(value));
      }
    } catch (error) {
      if (!stream.closed) {
        stream.sendEvent('error', {
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    } finally {
      stream.close();
    }
  })();

  return stream.getResponse();
}

/**
 * Create an SSE response from an iterable
 */
export function sseFromIterable<T>(
  iterable: AsyncIterable<T> | Iterable<T>,
  options: SSEOptions & { transform?: (value: T) => SSEEvent } = {}
): Response {
  const { transform = (value) => ({ data: value }), ...sseOptions } = options;
  const stream = new SSEStream(sseOptions);

  (async () => {
    try {
      for await (const value of iterable) {
        if (stream.closed) break;
        stream.send(transform(value));
      }
    } catch (error) {
      if (!stream.closed) {
        stream.sendEvent('error', {
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    } finally {
      stream.close();
    }
  })();

  return stream.getResponse();
}

/**
 * Create an SSE response with a controller callback
 */
export function createSSEStream(
  handler: (sse: SSEController) => void | Promise<void>,
  options: SSEOptions = {}
): Response {
  const stream = new SSEStream(options);

  // Start the handler
  Promise.resolve(handler(stream)).catch((error) => {
    if (!stream.closed) {
      stream.sendEvent('error', {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      stream.close();
    }
  });

  return stream.getResponse();
}

/**
 * SSE event source client helper (for testing)
 */
export interface SSEClientOptions {
  /** Event handlers */
  onMessage?: (event: MessageEvent) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  /** Named event handlers */
  events?: Record<string, (event: MessageEvent) => void>;
}

/**
 * Parse SSE data from a string
 */
export function parseSSEData(raw: string): SSEEvent[] {
  const events: SSEEvent[] = [];
  let currentEvent: Partial<SSEEvent> = {};
  let dataLines: string[] = [];

  for (const line of raw.split('\n')) {
    if (line === '') {
      // End of event
      if (dataLines.length > 0) {
        const data = dataLines.join('\n');
        try {
          currentEvent.data = JSON.parse(data);
        } catch {
          currentEvent.data = data;
        }
        events.push(currentEvent as SSEEvent);
      }
      currentEvent = {};
      dataLines = [];
      continue;
    }

    if (line.startsWith(':')) {
      // Comment, skip
      continue;
    }

    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const field = line.slice(0, colonIndex);
    const value = line.slice(colonIndex + 1).trimStart();

    switch (field) {
      case 'event':
        currentEvent.event = value;
        break;
      case 'data':
        dataLines.push(value);
        break;
      case 'id':
        currentEvent.id = value;
        break;
      case 'retry':
        currentEvent.retry = parseInt(value, 10);
        break;
    }
  }

  return events;
}
