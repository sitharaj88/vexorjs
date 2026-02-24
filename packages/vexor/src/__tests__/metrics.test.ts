/**
 * Metrics Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MetricsRegistry } from '../observability/metrics.js';
import type { Counter, Gauge, Histogram } from '../observability/metrics.js';

// ---------------------------------------------------------------------------
// Counter
// ---------------------------------------------------------------------------
describe('Counter', () => {
  let registry: MetricsRegistry;
  let counter: Counter;

  beforeEach(() => {
    registry = new MetricsRegistry();
    counter = registry.counter('test_requests_total', 'Total requests', ['method']);
  });

  it('should start at zero', () => {
    expect(counter.get()).toBe(0);
  });

  it('should increment by 1 by default', () => {
    counter.inc();
    expect(counter.get()).toBe(1);
  });

  it('should increment by specified amount', () => {
    counter.inc({}, 5);
    expect(counter.get()).toBe(5);
  });

  it('should track separate label sets', () => {
    counter.inc({ method: 'GET' }, 3);
    counter.inc({ method: 'POST' }, 1);
    counter.inc({ method: 'GET' }, 2);

    expect(counter.get({ method: 'GET' })).toBe(5);
    expect(counter.get({ method: 'POST' })).toBe(1);
  });

  it('should throw on negative increment', () => {
    expect(() => counter.inc({}, -1)).toThrow('Counter can only be incremented');
  });
});

// ---------------------------------------------------------------------------
// Gauge
// ---------------------------------------------------------------------------
describe('Gauge', () => {
  let registry: MetricsRegistry;
  let gauge: Gauge;

  beforeEach(() => {
    registry = new MetricsRegistry();
    gauge = registry.gauge('test_temperature', 'Temperature', ['location']);
  });

  it('should start at zero', () => {
    expect(gauge.get()).toBe(0);
  });

  it('should set to an absolute value', () => {
    gauge.set(42);
    expect(gauge.get()).toBe(42);
  });

  it('should increment', () => {
    gauge.set(10);
    gauge.inc({}, 5);
    expect(gauge.get()).toBe(15);
  });

  it('should decrement', () => {
    gauge.set(10);
    gauge.dec({}, 3);
    expect(gauge.get()).toBe(7);
  });

  it('should track separate label sets', () => {
    gauge.set(20, { location: 'indoor' });
    gauge.set(35, { location: 'outdoor' });

    expect(gauge.get({ location: 'indoor' })).toBe(20);
    expect(gauge.get({ location: 'outdoor' })).toBe(35);
  });

  it('should default increment/decrement to 1', () => {
    gauge.inc();
    expect(gauge.get()).toBe(1);
    gauge.dec();
    expect(gauge.get()).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Histogram
// ---------------------------------------------------------------------------
describe('Histogram', () => {
  let registry: MetricsRegistry;
  let histogram: Histogram;

  beforeEach(() => {
    registry = new MetricsRegistry();
    histogram = registry.histogram(
      'test_duration',
      'Duration',
      [],
      [0.1, 0.5, 1, 5]
    );
  });

  it('should start with zero count and sum', () => {
    const val = histogram.get();
    expect(val.count).toBe(0);
    expect(val.sum).toBe(0);
  });

  it('should observe values', () => {
    histogram.observe(0.3);
    histogram.observe(0.7);
    histogram.observe(2.0);

    const val = histogram.get();
    expect(val.count).toBe(3);
    expect(val.sum).toBeCloseTo(3.0, 5);
  });

  it('should fill correct buckets', () => {
    histogram.observe(0.05); // <= 0.1, 0.5, 1, 5
    histogram.observe(0.3);  // <= 0.5, 1, 5
    histogram.observe(3.0);  // <= 5

    const val = histogram.get();
    expect(val.buckets[0.1]).toBe(1);
    expect(val.buckets[0.5]).toBe(2);
    expect(val.buckets[1]).toBe(2);
    expect(val.buckets[5]).toBe(3);
    expect(val.buckets[Infinity]).toBe(3);
  });

  it('should track labels', () => {
    const h = registry.histogram('labeled_hist', 'help', ['path'], [1, 5]);
    h.observe(0.5, { path: '/api' });
    h.observe(3.0, { path: '/api' });

    const val = h.get({ path: '/api' });
    expect(val.count).toBe(2);
    expect(val.sum).toBeCloseTo(3.5, 5);
  });
});

// ---------------------------------------------------------------------------
// MetricsRegistry
// ---------------------------------------------------------------------------
describe('MetricsRegistry', () => {
  let registry: MetricsRegistry;

  beforeEach(() => {
    registry = new MetricsRegistry();
  });

  it('should create counter, gauge, and histogram', () => {
    const c = registry.counter('c', 'help');
    const g = registry.gauge('g', 'help');
    const h = registry.histogram('h', 'help');

    expect(c.type).toBe('counter');
    expect(g.type).toBe('gauge');
    expect(h.type).toBe('histogram');
  });

  it('should return existing metric on duplicate name with same type', () => {
    const c1 = registry.counter('dup', 'help');
    const c2 = registry.counter('dup', 'help');
    expect(c1).toBe(c2);
  });

  it('should throw on duplicate name with different type', () => {
    registry.counter('conflict', 'help');
    expect(() => registry.gauge('conflict', 'help')).toThrow(
      'Metric "conflict" already registered as counter'
    );
  });

  it('should throw on gauge registered as histogram', () => {
    registry.gauge('g', 'help');
    expect(() => registry.histogram('g', 'help')).toThrow(
      'Metric "g" already registered as gauge'
    );
  });

  it('should list all metrics', () => {
    registry.counter('a', 'ha');
    registry.gauge('b', 'hb');
    const all = registry.getAll();
    expect(all.size).toBe(2);
  });

  it('should reset all metrics', () => {
    registry.counter('a', 'ha');
    registry.gauge('b', 'hb');
    registry.reset();
    expect(registry.getAll().size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// toPrometheus
// ---------------------------------------------------------------------------
describe('toPrometheus', () => {
  let registry: MetricsRegistry;

  beforeEach(() => {
    registry = new MetricsRegistry();
  });

  it('should format counter in Prometheus exposition format', () => {
    const c = registry.counter('http_requests_total', 'Total HTTP requests', ['method']);
    c.inc({ method: 'GET' }, 10);
    c.inc({ method: 'POST' }, 3);

    const output = registry.toPrometheus();
    expect(output).toContain('# HELP http_requests_total Total HTTP requests');
    expect(output).toContain('# TYPE http_requests_total counter');
    expect(output).toContain('http_requests_total{method="GET"} 10');
    expect(output).toContain('http_requests_total{method="POST"} 3');
  });

  it('should format gauge', () => {
    const g = registry.gauge('temperature', 'Temp');
    g.set(72);

    const output = registry.toPrometheus();
    expect(output).toContain('# TYPE temperature gauge');
    expect(output).toContain('temperature 72');
  });

  it('should format histogram with buckets', () => {
    const h = registry.histogram('duration', 'Duration', [], [0.1, 1, 10]);
    h.observe(0.05);
    h.observe(5);
    h.observe(15);

    const output = registry.toPrometheus();
    expect(output).toContain('# TYPE duration histogram');
    expect(output).toContain('duration_bucket{le="0.1"} 1');
    expect(output).toContain('duration_bucket{le="1"} 1');
    expect(output).toContain('duration_bucket{le="10"} 2');
    expect(output).toContain('duration_bucket{le="+Inf"} 3');
    expect(output).toContain('duration_sum');
    expect(output).toContain('duration_count 3');
  });

  it('should output zero for counters with no increments', () => {
    registry.counter('empty_counter', 'No increments');
    const output = registry.toPrometheus();
    expect(output).toContain('empty_counter 0');
  });
});
