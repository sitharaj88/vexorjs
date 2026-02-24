/**
 * Metrics Collection
 *
 * Prometheus-compatible metrics with counters, gauges, histograms,
 * and automatic HTTP metrics collection.
 */

/**
 * Metric types
 */
export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary';

/**
 * Metric labels
 */
export type MetricLabels = Record<string, string>;

/**
 * Base metric interface
 */
export interface Metric {
  name: string;
  help: string;
  type: MetricType;
  labels: string[];
}

/**
 * Counter metric
 */
export interface Counter extends Metric {
  type: 'counter';
  inc(labels?: MetricLabels, value?: number): void;
  get(labels?: MetricLabels): number;
}

/**
 * Gauge metric
 */
export interface Gauge extends Metric {
  type: 'gauge';
  set(value: number, labels?: MetricLabels): void;
  inc(labels?: MetricLabels, value?: number): void;
  dec(labels?: MetricLabels, value?: number): void;
  get(labels?: MetricLabels): number;
}

/**
 * Histogram metric
 */
export interface Histogram extends Metric {
  type: 'histogram';
  observe(value: number, labels?: MetricLabels): void;
  get(labels?: MetricLabels): HistogramValue;
}

/**
 * Histogram value
 */
export interface HistogramValue {
  count: number;
  sum: number;
  buckets: Record<number, number>;
}

/**
 * Metric value storage
 */
class MetricValue {
  private values = new Map<string, number>();
  private histogramBuckets = new Map<string, Map<number, number>>();
  private histogramSums = new Map<string, number>();
  private histogramCounts = new Map<string, number>();

  private labelsToKey(labels: MetricLabels = {}): string {
    return Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
  }

  set(labels: MetricLabels, value: number): void {
    this.values.set(this.labelsToKey(labels), value);
  }

  get(labels: MetricLabels): number {
    return this.values.get(this.labelsToKey(labels)) ?? 0;
  }

  inc(labels: MetricLabels, value: number): void {
    const key = this.labelsToKey(labels);
    this.values.set(key, (this.values.get(key) ?? 0) + value);
  }

  dec(labels: MetricLabels, value: number): void {
    const key = this.labelsToKey(labels);
    this.values.set(key, (this.values.get(key) ?? 0) - value);
  }

  observeHistogram(labels: MetricLabels, value: number, buckets: number[]): void {
    const key = this.labelsToKey(labels);

    // Update count and sum
    this.histogramCounts.set(key, (this.histogramCounts.get(key) ?? 0) + 1);
    this.histogramSums.set(key, (this.histogramSums.get(key) ?? 0) + value);

    // Update buckets
    let bucketMap = this.histogramBuckets.get(key);
    if (!bucketMap) {
      bucketMap = new Map();
      for (const bucket of buckets) {
        bucketMap.set(bucket, 0);
      }
      bucketMap.set(Infinity, 0);
      this.histogramBuckets.set(key, bucketMap);
    }

    for (const bucket of buckets) {
      if (value <= bucket) {
        bucketMap.set(bucket, (bucketMap.get(bucket) ?? 0) + 1);
      }
    }
    bucketMap.set(Infinity, (bucketMap.get(Infinity) ?? 0) + 1);
  }

  getHistogram(labels: MetricLabels): HistogramValue {
    const key = this.labelsToKey(labels);
    const buckets: Record<number, number> = {};
    const bucketMap = this.histogramBuckets.get(key);

    if (bucketMap) {
      for (const [bucket, count] of bucketMap) {
        buckets[bucket] = count;
      }
    }

    return {
      count: this.histogramCounts.get(key) ?? 0,
      sum: this.histogramSums.get(key) ?? 0,
      buckets,
    };
  }

  getAllValues(): Map<string, number> {
    return new Map(this.values);
  }

  getAllHistograms(): Map<string, HistogramValue> {
    const result = new Map<string, HistogramValue>();
    for (const key of this.histogramCounts.keys()) {
      result.set(key, {
        count: this.histogramCounts.get(key) ?? 0,
        sum: this.histogramSums.get(key) ?? 0,
        buckets: Object.fromEntries(this.histogramBuckets.get(key) ?? new Map()),
      });
    }
    return result;
  }
}

/**
 * Counter implementation
 */
class CounterImpl implements Counter {
  readonly type = 'counter' as const;
  private storage = new MetricValue();

  constructor(
    public readonly name: string,
    public readonly help: string,
    public readonly labels: string[] = []
  ) {}

  inc(labels: MetricLabels = {}, value = 1): void {
    if (value < 0) {
      throw new Error('Counter can only be incremented');
    }
    this.storage.inc(labels, value);
  }

  get(labels: MetricLabels = {}): number {
    return this.storage.get(labels);
  }

  getAll(): Map<string, number> {
    return this.storage.getAllValues();
  }
}

/**
 * Gauge implementation
 */
class GaugeImpl implements Gauge {
  readonly type = 'gauge' as const;
  private storage = new MetricValue();

  constructor(
    public readonly name: string,
    public readonly help: string,
    public readonly labels: string[] = []
  ) {}

  set(value: number, labels: MetricLabels = {}): void {
    this.storage.set(labels, value);
  }

  inc(labels: MetricLabels = {}, value = 1): void {
    this.storage.inc(labels, value);
  }

  dec(labels: MetricLabels = {}, value = 1): void {
    this.storage.dec(labels, value);
  }

  get(labels: MetricLabels = {}): number {
    return this.storage.get(labels);
  }

  getAll(): Map<string, number> {
    return this.storage.getAllValues();
  }
}

/**
 * Default histogram buckets
 */
const DEFAULT_BUCKETS = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];

/**
 * Histogram implementation
 */
class HistogramImpl implements Histogram {
  readonly type = 'histogram' as const;
  private storage = new MetricValue();
  private buckets: number[];

  constructor(
    public readonly name: string,
    public readonly help: string,
    public readonly labels: string[] = [],
    buckets: number[] = DEFAULT_BUCKETS
  ) {
    this.buckets = buckets.sort((a, b) => a - b);
  }

  observe(value: number, labels: MetricLabels = {}): void {
    this.storage.observeHistogram(labels, value, this.buckets);
  }

  get(labels: MetricLabels = {}): HistogramValue {
    return this.storage.getHistogram(labels);
  }

  getAll(): Map<string, HistogramValue> {
    return this.storage.getAllHistograms();
  }

  getBuckets(): number[] {
    return this.buckets;
  }
}

/**
 * Metrics registry
 */
export class MetricsRegistry {
  private metrics = new Map<string, Metric>();

  /**
   * Create a counter
   */
  counter(name: string, help: string, labels: string[] = []): Counter {
    if (this.metrics.has(name)) {
      const existing = this.metrics.get(name)!;
      if (existing.type !== 'counter') {
        throw new Error(`Metric "${name}" already registered as ${existing.type}`);
      }
      return existing as Counter;
    }

    const counter = new CounterImpl(name, help, labels);
    this.metrics.set(name, counter);
    return counter;
  }

  /**
   * Create a gauge
   */
  gauge(name: string, help: string, labels: string[] = []): Gauge {
    if (this.metrics.has(name)) {
      const existing = this.metrics.get(name)!;
      if (existing.type !== 'gauge') {
        throw new Error(`Metric "${name}" already registered as ${existing.type}`);
      }
      return existing as Gauge;
    }

    const gauge = new GaugeImpl(name, help, labels);
    this.metrics.set(name, gauge);
    return gauge;
  }

  /**
   * Create a histogram
   */
  histogram(
    name: string,
    help: string,
    labels: string[] = [],
    buckets: number[] = DEFAULT_BUCKETS
  ): Histogram {
    if (this.metrics.has(name)) {
      const existing = this.metrics.get(name)!;
      if (existing.type !== 'histogram') {
        throw new Error(`Metric "${name}" already registered as ${existing.type}`);
      }
      return existing as Histogram;
    }

    const histogram = new HistogramImpl(name, help, labels, buckets);
    this.metrics.set(name, histogram);
    return histogram;
  }

  /**
   * Get all metrics
   */
  getAll(): Map<string, Metric> {
    return new Map(this.metrics);
  }

  /**
   * Export metrics in Prometheus format
   */
  toPrometheus(): string {
    const lines: string[] = [];

    for (const [name, metric] of this.metrics) {
      lines.push(`# HELP ${name} ${metric.help}`);
      lines.push(`# TYPE ${name} ${metric.type}`);

      if (metric.type === 'counter' || metric.type === 'gauge') {
        const impl = metric as CounterImpl | GaugeImpl;
        const values = impl.getAll();

        if (values.size === 0) {
          lines.push(`${name} 0`);
        } else {
          for (const [labels, value] of values) {
            if (labels) {
              lines.push(`${name}{${labels}} ${value}`);
            } else {
              lines.push(`${name} ${value}`);
            }
          }
        }
      } else if (metric.type === 'histogram') {
        const impl = metric as HistogramImpl;
        const histograms = impl.getAll();
        const buckets = impl.getBuckets();

        for (const [labels, hist] of histograms) {
          const labelStr = labels ? `{${labels}}` : '';

          // Bucket values
          for (const bucket of buckets) {
            const bucketLabel = labels
              ? `{${labels},le="${bucket}"}`
              : `{le="${bucket}"}`;
            lines.push(`${name}_bucket${bucketLabel} ${hist.buckets[bucket] ?? 0}`);
          }
          const infLabel = labels ? `{${labels},le="+Inf"}` : `{le="+Inf"}`;
          lines.push(`${name}_bucket${infLabel} ${hist.buckets[Infinity] ?? 0}`);

          // Sum and count
          lines.push(`${name}_sum${labelStr} ${hist.sum}`);
          lines.push(`${name}_count${labelStr} ${hist.count}`);
        }
      }

      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics.clear();
  }
}

/**
 * Default metrics registry
 */
export const registry = new MetricsRegistry();

/**
 * Create HTTP metrics
 */
export function createHttpMetrics(reg: MetricsRegistry = registry) {
  const requestsTotal = reg.counter(
    'http_requests_total',
    'Total number of HTTP requests',
    ['method', 'path', 'status']
  );

  const requestDuration = reg.histogram(
    'http_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'path'],
    [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
  );

  const requestsActive = reg.gauge(
    'http_requests_active',
    'Number of active HTTP requests',
    ['method']
  );

  return {
    requestsTotal,
    requestDuration,
    requestsActive,

    /**
     * Record HTTP request
     */
    record(
      method: string,
      path: string,
      status: number,
      durationMs: number
    ): void {
      requestsTotal.inc({ method, path, status: String(status) });
      requestDuration.observe(durationMs / 1000, { method, path });
    },

    /**
     * Track active request
     */
    startRequest(method: string): () => void {
      requestsActive.inc({ method });
      return () => requestsActive.dec({ method });
    },
  };
}

/**
 * Create process metrics
 */
export function createProcessMetrics(reg: MetricsRegistry = registry) {
  const memoryUsage = reg.gauge(
    'process_memory_bytes',
    'Process memory usage in bytes',
    ['type']
  );

  const cpuUsage = reg.gauge(
    'process_cpu_seconds_total',
    'Total CPU usage in seconds'
  );

  const uptime = reg.gauge(
    'process_uptime_seconds',
    'Process uptime in seconds'
  );

  // Collect process metrics
  const collect = () => {
    const mem = process.memoryUsage();
    memoryUsage.set(mem.heapUsed, { type: 'heap_used' });
    memoryUsage.set(mem.heapTotal, { type: 'heap_total' });
    memoryUsage.set(mem.rss, { type: 'rss' });
    memoryUsage.set(mem.external, { type: 'external' });

    const cpu = process.cpuUsage();
    cpuUsage.set((cpu.user + cpu.system) / 1_000_000);

    uptime.set(process.uptime());
  };

  return {
    memoryUsage,
    cpuUsage,
    uptime,
    collect,
  };
}
