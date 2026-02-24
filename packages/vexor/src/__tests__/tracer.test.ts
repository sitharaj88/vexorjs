/**
 * Tracer Module Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  Tracer,
  createTracer,
  ConsoleTraceExporter,
  BatchTraceExporter,
  SemanticAttributes,
} from '../observability/tracer.js';
import type { Span, TraceExporter, SpanContext } from '../observability/tracer.js';

// ============================================================================
// Span Tests
// ============================================================================

describe('Span', () => {
  let tracer: Tracer;

  beforeEach(() => {
    tracer = new Tracer({
      exporter: new ConsoleTraceExporter(),
      enabled: true,
      samplingRate: 1.0,
    });
  });

  describe('creation', () => {
    it('should create a span with name and context', () => {
      const span = tracer.startSpan('test-span');
      expect(span.name).toBe('test-span');
      expect(span.context).toBeDefined();
      expect(span.context.traceId).toBeDefined();
      expect(span.context.spanId).toBeDefined();
      expect(span.context.traceFlags).toBe(1);
    });

    it('should default kind to internal', () => {
      const span = tracer.startSpan('test-span');
      expect(span.kind).toBe('internal');
    });

    it('should accept kind option', () => {
      const span = tracer.startSpan('server-span', { kind: 'server' });
      expect(span.kind).toBe('server');
    });

    it('should record startTime', () => {
      const before = Date.now();
      const span = tracer.startSpan('test-span');
      const after = Date.now();

      expect(span.startTime).toBeGreaterThanOrEqual(before);
      expect(span.startTime).toBeLessThanOrEqual(after);
    });

    it('should have initial status as unset', () => {
      const span = tracer.startSpan('test-span');
      expect(span.status).toBe('unset');
    });

    it('should have empty attributes initially', () => {
      const span = tracer.startSpan('test-span');
      expect(span.attributes).toEqual({});
    });

    it('should have empty events initially', () => {
      const span = tracer.startSpan('test-span');
      expect(span.events).toEqual([]);
    });

    it('should apply initial attributes from options', () => {
      const span = tracer.startSpan('test-span', {
        attributes: { 'http.method': 'GET', 'http.url': '/test' },
      });
      expect(span.attributes['http.method']).toBe('GET');
      expect(span.attributes['http.url']).toBe('/test');
    });
  });

  describe('setAttribute', () => {
    it('should set a string attribute', () => {
      const span = tracer.startSpan('test');
      span.setAttribute('key', 'value');
      expect(span.attributes.key).toBe('value');
    });

    it('should set a number attribute', () => {
      const span = tracer.startSpan('test');
      span.setAttribute('count', 42);
      expect(span.attributes.count).toBe(42);
    });

    it('should set a boolean attribute', () => {
      const span = tracer.startSpan('test');
      span.setAttribute('active', true);
      expect(span.attributes.active).toBe(true);
    });

    it('should return this for chaining', () => {
      const span = tracer.startSpan('test');
      const result = span.setAttribute('key', 'value');
      expect(result).toBe(span);
    });
  });

  describe('setAttributes', () => {
    it('should set multiple attributes at once', () => {
      const span = tracer.startSpan('test');
      span.setAttributes({
        'http.method': 'POST',
        'http.status_code': 200,
        'http.url': '/api/users',
      });

      expect(span.attributes['http.method']).toBe('POST');
      expect(span.attributes['http.status_code']).toBe(200);
      expect(span.attributes['http.url']).toBe('/api/users');
    });

    it('should merge with existing attributes', () => {
      const span = tracer.startSpan('test');
      span.setAttribute('existing', 'value');
      span.setAttributes({ added: 'new' });

      expect(span.attributes.existing).toBe('value');
      expect(span.attributes.added).toBe('new');
    });

    it('should return this for chaining', () => {
      const span = tracer.startSpan('test');
      const result = span.setAttributes({ key: 'value' });
      expect(result).toBe(span);
    });
  });

  describe('addEvent', () => {
    it('should add an event with name and timestamp', () => {
      const span = tracer.startSpan('test');
      span.addEvent('request.start');

      expect(span.events).toHaveLength(1);
      expect(span.events[0].name).toBe('request.start');
      expect(span.events[0].timestamp).toBeDefined();
      expect(typeof span.events[0].timestamp).toBe('number');
    });

    it('should add event with attributes', () => {
      const span = tracer.startSpan('test');
      span.addEvent('cache.hit', { 'cache.key': 'user:123' });

      expect(span.events[0].attributes).toBeDefined();
      expect(span.events[0].attributes!['cache.key']).toBe('user:123');
    });

    it('should support multiple events', () => {
      const span = tracer.startSpan('test');
      span.addEvent('start');
      span.addEvent('middle');
      span.addEvent('end');

      expect(span.events).toHaveLength(3);
    });

    it('should return this for chaining', () => {
      const span = tracer.startSpan('test');
      const result = span.addEvent('event');
      expect(result).toBe(span);
    });
  });

  describe('setStatus', () => {
    it('should set status to ok', () => {
      const span = tracer.startSpan('test');
      span.setStatus('ok');
      expect(span.status).toBe('ok');
    });

    it('should set status to error', () => {
      const span = tracer.startSpan('test');
      span.setStatus('error', 'Something failed');
      expect(span.status).toBe('error');
    });

    it('should return this for chaining', () => {
      const span = tracer.startSpan('test');
      const result = span.setStatus('ok');
      expect(result).toBe(span);
    });
  });

  describe('recordException', () => {
    it('should add exception event and set error status', () => {
      const span = tracer.startSpan('test');
      const error = new Error('Test error');
      span.recordException(error);

      expect(span.status).toBe('error');
      expect(span.events).toHaveLength(1);
      expect(span.events[0].name).toBe('exception');
      expect(span.events[0].attributes!['exception.type']).toBe('Error');
      expect(span.events[0].attributes!['exception.message']).toBe('Test error');
    });

    it('should include stack trace in event attributes', () => {
      const span = tracer.startSpan('test');
      const error = new Error('Test error');
      span.recordException(error);

      expect(span.events[0].attributes!['exception.stacktrace']).toBeDefined();
    });

    it('should return this for chaining', () => {
      const span = tracer.startSpan('test');
      const result = span.recordException(new Error('fail'));
      expect(result).toBe(span);
    });
  });

  describe('end', () => {
    it('should set endTime when ending span', () => {
      const span = tracer.startSpan('test');
      expect(span.endTime).toBeUndefined();

      span.end();
      expect(span.endTime).toBeDefined();
      expect(typeof span.endTime).toBe('number');
    });

    it('should accept custom endTime', () => {
      const span = tracer.startSpan('test');
      const customEnd = Date.now() + 1000;
      span.end(customEnd);

      expect(span.endTime).toBe(customEnd);
    });

    it('should mark span as ended', () => {
      const span = tracer.startSpan('test');
      expect(span.isEnded()).toBe(false);

      span.end();
      expect(span.isEnded()).toBe(true);
    });

    it('should be idempotent (calling end twice does not change endTime)', () => {
      const span = tracer.startSpan('test');
      span.end();
      const firstEndTime = span.endTime;

      span.end(Date.now() + 5000);
      expect(span.endTime).toBe(firstEndTime);
    });
  });

  describe('child spans', () => {
    it('should inherit traceId from parent span', () => {
      const parent = tracer.startSpan('parent');
      const child = tracer.startSpan('child', { parent });

      expect(child.context.traceId).toBe(parent.context.traceId);
    });

    it('should have different spanId from parent', () => {
      const parent = tracer.startSpan('parent');
      const child = tracer.startSpan('child', { parent });

      expect(child.context.spanId).not.toBe(parent.context.spanId);
    });

    it('should set parentSpanId to parent span id', () => {
      const parent = tracer.startSpan('parent');
      const child = tracer.startSpan('child', { parent });

      expect(child.parentSpanId).toBe(parent.context.spanId);
    });

    it('should support parent as SpanContext', () => {
      const parent = tracer.startSpan('parent');
      const parentContext: SpanContext = parent.context;
      const child = tracer.startSpan('child', { parent: parentContext });

      expect(child.context.traceId).toBe(parentContext.traceId);
      expect(child.parentSpanId).toBe(parentContext.spanId);
    });
  });
});

// ============================================================================
// Tracer Tests
// ============================================================================

describe('Tracer', () => {
  describe('creation', () => {
    it('should create tracer with defaults', () => {
      const tracer = new Tracer();
      expect(tracer).toBeDefined();
    });

    it('should accept custom options', () => {
      const tracer = new Tracer({
        serviceName: 'my-service',
        serviceVersion: '2.0.0',
        samplingRate: 0.5,
      });
      expect(tracer).toBeDefined();
    });
  });

  describe('createTracer factory', () => {
    it('should return a Tracer instance', () => {
      const tracer = createTracer();
      expect(tracer).toBeInstanceOf(Tracer);
    });

    it('should pass options through', () => {
      const tracer = createTracer({ serviceName: 'test' });
      expect(tracer).toBeInstanceOf(Tracer);
    });
  });

  describe('startSpan', () => {
    it('should create and track active span', () => {
      const tracer = new Tracer({ samplingRate: 1.0 });
      const span = tracer.startSpan('test');

      const active = tracer.getActiveSpan(span.context.spanId);
      expect(active).toBe(span);
    });

    it('should remove span from active spans on end', () => {
      // Use a mock exporter to avoid console output
      const exporter: TraceExporter = {
        export: vi.fn().mockResolvedValue(undefined),
        shutdown: vi.fn().mockResolvedValue(undefined),
      };
      const tracer = new Tracer({ exporter, samplingRate: 1.0 });
      const span = tracer.startSpan('test');
      const spanId = span.context.spanId;

      span.end();

      expect(tracer.getActiveSpan(spanId)).toBeUndefined();
    });
  });

  describe('withSpan', () => {
    it('should run function within span context', async () => {
      const exporter: TraceExporter = {
        export: vi.fn().mockResolvedValue(undefined),
        shutdown: vi.fn().mockResolvedValue(undefined),
      };
      const tracer = new Tracer({ exporter, samplingRate: 1.0 });

      const result = await tracer.withSpan('compute', async (span) => {
        span.setAttribute('input', 'test');
        return 42;
      });

      expect(result).toBe(42);
    });

    it('should set status to ok on success', async () => {
      const exportedSpans: Span[] = [];
      const exporter: TraceExporter = {
        export: async (spans) => { exportedSpans.push(...spans); },
        shutdown: vi.fn().mockResolvedValue(undefined),
      };
      const tracer = new Tracer({ exporter, samplingRate: 1.0 });

      await tracer.withSpan('success', async () => 'result');

      expect(exportedSpans).toHaveLength(1);
      expect(exportedSpans[0].status).toBe('ok');
    });

    it('should record exception and rethrow on error', async () => {
      const exportedSpans: Span[] = [];
      const exporter: TraceExporter = {
        export: async (spans) => { exportedSpans.push(...spans); },
        shutdown: vi.fn().mockResolvedValue(undefined),
      };
      const tracer = new Tracer({ exporter, samplingRate: 1.0 });

      await expect(
        tracer.withSpan('failing', async () => {
          throw new Error('boom');
        })
      ).rejects.toThrow('boom');

      expect(exportedSpans).toHaveLength(1);
      expect(exportedSpans[0].status).toBe('error');
    });

    it('should end the span after execution', async () => {
      const exportedSpans: Span[] = [];
      const exporter: TraceExporter = {
        export: async (spans) => { exportedSpans.push(...spans); },
        shutdown: vi.fn().mockResolvedValue(undefined),
      };
      const tracer = new Tracer({ exporter, samplingRate: 1.0 });

      await tracer.withSpan('test', async () => 'done');

      expect(exportedSpans[0].isEnded()).toBe(true);
      expect(exportedSpans[0].endTime).toBeDefined();
    });
  });

  describe('sampling', () => {
    it('should create noop span when sampling rate is 0', () => {
      const tracer = new Tracer({ samplingRate: 0 });
      const span = tracer.startSpan('test');

      // Noop span characteristics
      expect(span.context.traceId).toBe('');
      expect(span.context.spanId).toBe('');
      expect(span.context.traceFlags).toBe(0);
      expect(span.isEnded()).toBe(true);
    });

    it('should create noop span when tracing is disabled', () => {
      const tracer = new Tracer({ enabled: false });
      const span = tracer.startSpan('test');

      expect(span.context.traceId).toBe('');
      expect(span.isEnded()).toBe(true);
    });

    it('noop span methods should not throw', () => {
      const tracer = new Tracer({ enabled: false });
      const span = tracer.startSpan('test');

      // These should all work without error
      expect(() => {
        span.setAttribute('key', 'val');
        span.setAttributes({ a: 1 });
        span.addEvent('event');
        span.setStatus('ok');
        span.recordException(new Error('test'));
        span.end();
      }).not.toThrow();
    });
  });

  describe('onSpanEnd', () => {
    it('should export span when it ends', async () => {
      const exportFn = vi.fn().mockResolvedValue(undefined);
      const exporter: TraceExporter = {
        export: exportFn,
        shutdown: vi.fn().mockResolvedValue(undefined),
      };
      const tracer = new Tracer({ exporter, samplingRate: 1.0 });

      const span = tracer.startSpan('test');
      span.end();

      // Wait for async export
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(exportFn).toHaveBeenCalledWith([span]);
    });
  });

  describe('shutdown', () => {
    it('should call exporter shutdown', async () => {
      const shutdownFn = vi.fn().mockResolvedValue(undefined);
      const exporter: TraceExporter = {
        export: vi.fn().mockResolvedValue(undefined),
        shutdown: shutdownFn,
      };
      const tracer = new Tracer({ exporter });

      await tracer.shutdown();
      expect(shutdownFn).toHaveBeenCalledOnce();
    });
  });
});

// ============================================================================
// Exporters
// ============================================================================

describe('ConsoleTraceExporter', () => {
  it('should log spans to console', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const exporter = new ConsoleTraceExporter();
    const tracer = new Tracer({ exporter, samplingRate: 1.0 });

    const span = tracer.startSpan('test-span');
    span.end();

    // Wait for export
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should shutdown without error', async () => {
    const exporter = new ConsoleTraceExporter();
    await expect(exporter.shutdown()).resolves.not.toThrow();
  });
});

describe('BatchTraceExporter', () => {
  it('should buffer spans and flush at batch size', async () => {
    const innerExportFn = vi.fn().mockResolvedValue(undefined);
    const innerExporter: TraceExporter = {
      export: innerExportFn,
      shutdown: vi.fn().mockResolvedValue(undefined),
    };

    const batchExporter = new BatchTraceExporter(innerExporter, {
      batchSize: 2,
      flushInterval: 60000, // large interval so it doesn't auto-flush
    });

    const tracer = new Tracer({ samplingRate: 1.0, exporter: new ConsoleTraceExporter() });

    // Create mock spans
    const span1 = tracer.startSpan('span1');
    span1.end();
    const span2 = tracer.startSpan('span2');
    span2.end();

    // Export individually (below batch size)
    await batchExporter.export([span1]);
    expect(innerExportFn).not.toHaveBeenCalled();

    // This should trigger a flush (hitting batch size)
    await batchExporter.export([span2]);
    expect(innerExportFn).toHaveBeenCalledOnce();

    await batchExporter.shutdown();
  });

  it('should flush on shutdown', async () => {
    const innerExportFn = vi.fn().mockResolvedValue(undefined);
    const innerShutdownFn = vi.fn().mockResolvedValue(undefined);
    const innerExporter: TraceExporter = {
      export: innerExportFn,
      shutdown: innerShutdownFn,
    };

    const batchExporter = new BatchTraceExporter(innerExporter, {
      batchSize: 100,
      flushInterval: 60000,
    });

    const tracer = new Tracer({ samplingRate: 1.0, exporter: new ConsoleTraceExporter() });
    const span = tracer.startSpan('test');
    span.end();

    await batchExporter.export([span]);

    // Not yet flushed (below batch size)
    expect(innerExportFn).not.toHaveBeenCalled();

    await batchExporter.shutdown();

    // Should flush on shutdown
    expect(innerExportFn).toHaveBeenCalledOnce();
    expect(innerShutdownFn).toHaveBeenCalledOnce();
  });

  it('should not flush if buffer is empty', async () => {
    const innerExportFn = vi.fn().mockResolvedValue(undefined);
    const innerExporter: TraceExporter = {
      export: innerExportFn,
      shutdown: vi.fn().mockResolvedValue(undefined),
    };

    const batchExporter = new BatchTraceExporter(innerExporter, {
      batchSize: 10,
      flushInterval: 60000,
    });

    await batchExporter.flush();
    expect(innerExportFn).not.toHaveBeenCalled();

    await batchExporter.shutdown();
  });
});

// ============================================================================
// Context Propagation
// ============================================================================

describe('context propagation', () => {
  it('should propagate traceId from parent span', () => {
    const tracer = new Tracer({ samplingRate: 1.0 });

    const root = tracer.startSpan('root', { kind: 'server' });
    const child = tracer.startSpan('child', { parent: root });
    const grandchild = tracer.startSpan('grandchild', { parent: child });

    expect(child.context.traceId).toBe(root.context.traceId);
    expect(grandchild.context.traceId).toBe(root.context.traceId);
  });

  it('should propagate traceState from parent context', () => {
    const tracer = new Tracer({ samplingRate: 1.0 });

    const parentContext: SpanContext = {
      traceId: 'abcdef1234567890abcdef1234567890',
      spanId: '1234567890abcdef',
      traceFlags: 1,
      traceState: 'vendor=value',
    };

    const child = tracer.startSpan('child', { parent: parentContext });
    expect(child.context.traceState).toBe('vendor=value');
    expect(child.context.traceId).toBe(parentContext.traceId);
    expect(child.parentSpanId).toBe(parentContext.spanId);
  });

  it('should generate new traceId when no parent', () => {
    const tracer = new Tracer({ samplingRate: 1.0 });

    const span1 = tracer.startSpan('span1');
    const span2 = tracer.startSpan('span2');

    expect(span1.context.traceId).not.toBe(span2.context.traceId);
  });

  it('should generate 32-character hex traceId', () => {
    const tracer = new Tracer({ samplingRate: 1.0 });
    const span = tracer.startSpan('test');

    expect(span.context.traceId).toMatch(/^[0-9a-f]{32}$/);
  });

  it('should generate 16-character hex spanId', () => {
    const tracer = new Tracer({ samplingRate: 1.0 });
    const span = tracer.startSpan('test');

    expect(span.context.spanId).toMatch(/^[0-9a-f]{16}$/);
  });
});

// ============================================================================
// SemanticAttributes
// ============================================================================

describe('SemanticAttributes', () => {
  it('should define HTTP semantic attributes', () => {
    expect(SemanticAttributes.HTTP_METHOD).toBe('http.method');
    expect(SemanticAttributes.HTTP_URL).toBe('http.url');
    expect(SemanticAttributes.HTTP_STATUS_CODE).toBe('http.status_code');
    expect(SemanticAttributes.HTTP_HOST).toBe('http.host');
  });

  it('should define database semantic attributes', () => {
    expect(SemanticAttributes.DB_SYSTEM).toBe('db.system');
    expect(SemanticAttributes.DB_STATEMENT).toBe('db.statement');
  });

  it('should define general semantic attributes', () => {
    expect(SemanticAttributes.SERVICE_NAME).toBe('service.name');
    expect(SemanticAttributes.SERVICE_VERSION).toBe('service.version');
  });
});
