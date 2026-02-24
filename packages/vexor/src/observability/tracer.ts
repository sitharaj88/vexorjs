/**
 * Distributed Tracing
 *
 * OpenTelemetry-compatible distributed tracing with automatic
 * span creation, context propagation, and multiple exporters.
 */

/**
 * Span status
 */
export type SpanStatus = 'unset' | 'ok' | 'error';

/**
 * Span kind
 */
export type SpanKind = 'internal' | 'server' | 'client' | 'producer' | 'consumer';

/**
 * Span attributes
 */
export type SpanAttributes = Record<string, string | number | boolean | string[] | number[] | boolean[]>;

/**
 * Span event
 */
export interface SpanEvent {
  name: string;
  timestamp: number;
  attributes?: SpanAttributes;
}

/**
 * Span context
 */
export interface SpanContext {
  traceId: string;
  spanId: string;
  traceFlags: number;
  traceState?: string;
}

/**
 * Span interface
 */
export interface Span {
  readonly context: SpanContext;
  readonly name: string;
  readonly kind: SpanKind;
  readonly startTime: number;
  endTime?: number;
  status: SpanStatus;
  attributes: SpanAttributes;
  events: SpanEvent[];
  parentSpanId?: string;

  /** Set attribute */
  setAttribute(key: string, value: string | number | boolean): this;
  /** Set multiple attributes */
  setAttributes(attributes: SpanAttributes): this;
  /** Add event */
  addEvent(name: string, attributes?: SpanAttributes): this;
  /** Set status */
  setStatus(status: SpanStatus, message?: string): this;
  /** Record exception */
  recordException(error: Error): this;
  /** End span */
  end(endTime?: number): void;
  /** Check if ended */
  isEnded(): boolean;
}

/**
 * Span implementation
 */
class SpanImpl implements Span {
  readonly context: SpanContext;
  readonly name: string;
  readonly kind: SpanKind;
  readonly startTime: number;
  endTime?: number;
  status: SpanStatus = 'unset';
  statusMessage?: string;
  attributes: SpanAttributes = {};
  events: SpanEvent[] = [];
  parentSpanId?: string;

  private _ended = false;
  private _tracer: Tracer;

  constructor(
    tracer: Tracer,
    name: string,
    kind: SpanKind,
    context: SpanContext,
    parentSpanId?: string
  ) {
    this._tracer = tracer;
    this.name = name;
    this.kind = kind;
    this.context = context;
    this.startTime = Date.now();
    this.parentSpanId = parentSpanId;
  }

  setAttribute(key: string, value: string | number | boolean): this {
    this.attributes[key] = value;
    return this;
  }

  setAttributes(attributes: SpanAttributes): this {
    Object.assign(this.attributes, attributes);
    return this;
  }

  addEvent(name: string, attributes?: SpanAttributes): this {
    this.events.push({
      name,
      timestamp: Date.now(),
      attributes,
    });
    return this;
  }

  setStatus(status: SpanStatus, message?: string): this {
    this.status = status;
    this.statusMessage = message;
    return this;
  }

  recordException(error: Error): this {
    this.addEvent('exception', {
      'exception.type': error.constructor.name,
      'exception.message': error.message,
      'exception.stacktrace': error.stack ?? '',
    });
    this.setStatus('error', error.message);
    return this;
  }

  end(endTime?: number): void {
    if (this._ended) return;
    this._ended = true;
    this.endTime = endTime ?? Date.now();
    this._tracer.onSpanEnd(this);
  }

  isEnded(): boolean {
    return this._ended;
  }
}

/**
 * Trace exporter interface
 */
export interface TraceExporter {
  export(spans: Span[]): Promise<void>;
  shutdown(): Promise<void>;
}

/**
 * Console exporter (for development)
 */
export class ConsoleTraceExporter implements TraceExporter {
  async export(spans: Span[]): Promise<void> {
    for (const span of spans) {
      const duration = span.endTime ? span.endTime - span.startTime : 0;
      console.log(`[TRACE] ${span.name} (${duration}ms)`, {
        traceId: span.context.traceId,
        spanId: span.context.spanId,
        parentSpanId: span.parentSpanId,
        kind: span.kind,
        status: span.status,
        attributes: span.attributes,
      });
    }
  }

  async shutdown(): Promise<void> {
    // Nothing to cleanup
  }
}

/**
 * Batch exporter (buffers spans and exports periodically)
 */
export class BatchTraceExporter implements TraceExporter {
  private buffer: Span[] = [];
  private exporter: TraceExporter;
  private batchSize: number;
  private flushInterval: number;
  private timer?: ReturnType<typeof setInterval>;

  constructor(
    exporter: TraceExporter,
    options: { batchSize?: number; flushInterval?: number } = {}
  ) {
    this.exporter = exporter;
    this.batchSize = options.batchSize ?? 100;
    this.flushInterval = options.flushInterval ?? 5000;

    this.timer = setInterval(() => this.flush(), this.flushInterval);
  }

  async export(spans: Span[]): Promise<void> {
    this.buffer.push(...spans);

    if (this.buffer.length >= this.batchSize) {
      await this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const spans = this.buffer;
    this.buffer = [];

    await this.exporter.export(spans);
  }

  async shutdown(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
    }
    await this.flush();
    await this.exporter.shutdown();
  }
}

/**
 * OTLP HTTP exporter (for production)
 */
export class OTLPTraceExporter implements TraceExporter {
  private endpoint: string;
  private headers: Record<string, string>;

  constructor(options: { endpoint?: string; headers?: Record<string, string> } = {}) {
    this.endpoint = options.endpoint ?? 'http://localhost:4318/v1/traces';
    this.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
  }

  async export(spans: Span[]): Promise<void> {
    if (spans.length === 0) return;

    const payload = {
      resourceSpans: [
        {
          resource: {
            attributes: [
              { key: 'service.name', value: { stringValue: 'vexor-app' } },
            ],
          },
          scopeSpans: [
            {
              scope: {
                name: 'vexor-tracer',
                version: '1.0.0',
              },
              spans: spans.map((span) => this.serializeSpan(span)),
            },
          ],
        },
      ],
    };

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Failed to export traces:', error);
    }
  }

  private serializeSpan(span: Span) {
    return {
      traceId: span.context.traceId,
      spanId: span.context.spanId,
      parentSpanId: span.parentSpanId,
      name: span.name,
      kind: this.mapSpanKind(span.kind),
      startTimeUnixNano: span.startTime * 1_000_000,
      endTimeUnixNano: (span.endTime ?? span.startTime) * 1_000_000,
      attributes: Object.entries(span.attributes).map(([key, value]) => ({
        key,
        value: this.serializeValue(value),
      })),
      events: span.events.map((event) => ({
        timeUnixNano: event.timestamp * 1_000_000,
        name: event.name,
        attributes: event.attributes
          ? Object.entries(event.attributes).map(([key, value]) => ({
              key,
              value: this.serializeValue(value),
            }))
          : [],
      })),
      status: {
        code: span.status === 'error' ? 2 : span.status === 'ok' ? 1 : 0,
      },
    };
  }

  private mapSpanKind(kind: SpanKind): number {
    const kindMap: Record<SpanKind, number> = {
      internal: 1,
      server: 2,
      client: 3,
      producer: 4,
      consumer: 5,
    };
    return kindMap[kind];
  }

  private serializeValue(value: unknown): Record<string, unknown> {
    if (typeof value === 'string') {
      return { stringValue: value };
    }
    if (typeof value === 'number') {
      return Number.isInteger(value) ? { intValue: value } : { doubleValue: value };
    }
    if (typeof value === 'boolean') {
      return { boolValue: value };
    }
    if (Array.isArray(value)) {
      return {
        arrayValue: {
          values: value.map((v) => this.serializeValue(v)),
        },
      };
    }
    return { stringValue: String(value) };
  }

  async shutdown(): Promise<void> {
    // Nothing to cleanup
  }
}

/**
 * Tracer options
 */
export interface TracerOptions {
  /** Service name */
  serviceName?: string;
  /** Service version */
  serviceVersion?: string;
  /** Sampling rate (0-1) */
  samplingRate?: number;
  /** Trace exporter */
  exporter?: TraceExporter;
  /** Enable tracing */
  enabled?: boolean;
}

/**
 * Tracer class
 */
export class Tracer {
  private options: Required<TracerOptions>;
  private exporter: TraceExporter;
  private activeSpans = new Map<string, Span>();

  constructor(options: TracerOptions = {}) {
    this.options = {
      serviceName: options.serviceName ?? 'vexor-app',
      serviceVersion: options.serviceVersion ?? '1.0.0',
      samplingRate: options.samplingRate ?? 1.0,
      exporter: options.exporter ?? new ConsoleTraceExporter(),
      enabled: options.enabled ?? true,
    };
    this.exporter = this.options.exporter;
  }

  /**
   * Start a new span
   */
  startSpan(
    name: string,
    options: {
      kind?: SpanKind;
      parent?: Span | SpanContext;
      attributes?: SpanAttributes;
    } = {}
  ): Span {
    // Check sampling
    if (!this.options.enabled || Math.random() > this.options.samplingRate) {
      return this.createNoopSpan(name);
    }

    const context = this.createSpanContext(options.parent);
    const parentSpanId = options.parent
      ? 'context' in options.parent
        ? options.parent.context.spanId
        : options.parent.spanId
      : undefined;

    const span = new SpanImpl(
      this,
      name,
      options.kind ?? 'internal',
      context,
      parentSpanId
    );

    if (options.attributes) {
      span.setAttributes(options.attributes);
    }

    this.activeSpans.set(context.spanId, span);
    return span;
  }

  /**
   * Run function with span context
   */
  async withSpan<T>(
    name: string,
    fn: (span: Span) => T | Promise<T>,
    options: {
      kind?: SpanKind;
      parent?: Span | SpanContext;
      attributes?: SpanAttributes;
    } = {}
  ): Promise<T> {
    const span = this.startSpan(name, options);

    try {
      const result = await fn(span);
      span.setStatus('ok');
      return result;
    } catch (error) {
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Get active span
   */
  getActiveSpan(spanId: string): Span | undefined {
    return this.activeSpans.get(spanId);
  }

  /**
   * Called when span ends
   */
  onSpanEnd(span: Span): void {
    this.activeSpans.delete(span.context.spanId);
    this.exporter.export([span]).catch(console.error);
  }

  /**
   * Shutdown tracer
   */
  async shutdown(): Promise<void> {
    await this.exporter.shutdown();
  }

  /**
   * Create span context
   */
  private createSpanContext(parent?: Span | SpanContext): SpanContext {
    const parentContext = parent
      ? 'context' in parent
        ? parent.context
        : parent
      : undefined;

    return {
      traceId: parentContext?.traceId ?? this.generateTraceId(),
      spanId: this.generateSpanId(),
      traceFlags: 1,
      traceState: parentContext?.traceState,
    };
  }

  /**
   * Create no-op span (when sampling rejects)
   */
  private createNoopSpan(name: string): Span {
    return {
      context: { traceId: '', spanId: '', traceFlags: 0 },
      name,
      kind: 'internal',
      startTime: Date.now(),
      status: 'unset',
      attributes: {},
      events: [],
      setAttribute: function () { return this; },
      setAttributes: function () { return this; },
      addEvent: function () { return this; },
      setStatus: function () { return this; },
      recordException: function () { return this; },
      end: function () {},
      isEnded: () => true,
    };
  }

  /**
   * Generate trace ID
   */
  private generateTraceId(): string {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Generate span ID
   */
  private generateSpanId(): string {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

/**
 * Create a tracer
 */
export function createTracer(options?: TracerOptions): Tracer {
  return new Tracer(options);
}

/**
 * Default tracer instance
 */
export const tracer = createTracer();

/**
 * HTTP semantic conventions
 */
export const SemanticAttributes = {
  // HTTP
  HTTP_METHOD: 'http.method',
  HTTP_URL: 'http.url',
  HTTP_TARGET: 'http.target',
  HTTP_HOST: 'http.host',
  HTTP_SCHEME: 'http.scheme',
  HTTP_STATUS_CODE: 'http.status_code',
  HTTP_REQUEST_CONTENT_LENGTH: 'http.request_content_length',
  HTTP_RESPONSE_CONTENT_LENGTH: 'http.response_content_length',
  HTTP_USER_AGENT: 'http.user_agent',

  // Database
  DB_SYSTEM: 'db.system',
  DB_NAME: 'db.name',
  DB_STATEMENT: 'db.statement',
  DB_OPERATION: 'db.operation',

  // General
  SERVICE_NAME: 'service.name',
  SERVICE_VERSION: 'service.version',
  EXCEPTION_TYPE: 'exception.type',
  EXCEPTION_MESSAGE: 'exception.message',
  EXCEPTION_STACKTRACE: 'exception.stacktrace',
};
