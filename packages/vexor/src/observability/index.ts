/**
 * Observability Module
 *
 * Distributed tracing, metrics, and debugging tools.
 */

export {
  Tracer,
  createTracer,
  tracer,
  ConsoleTraceExporter,
  BatchTraceExporter,
  OTLPTraceExporter,
  SemanticAttributes,
} from './tracer.js';

export type {
  SpanStatus,
  SpanKind,
  SpanAttributes,
  SpanEvent,
  SpanContext,
  Span,
  TraceExporter,
  TracerOptions,
} from './tracer.js';

export {
  MetricsRegistry,
  registry,
  createHttpMetrics,
  createProcessMetrics,
} from './metrics.js';

export type {
  MetricType,
  MetricLabels,
  Metric,
  Counter,
  Gauge,
  Histogram,
  HistogramValue,
} from './metrics.js';

export {
  registerDebugRoutes,
  debugMiddleware,
} from './debug.js';

export type {
  DebugOptions,
} from './debug.js';
