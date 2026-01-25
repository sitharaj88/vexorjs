/**
 * HTTP Benchmarks
 *
 * Comprehensive HTTP benchmarks for Vexor and comparison frameworks.
 */

import {
  runAutocannon,
  warmUp,
  sleep,
  type BenchmarkResult,
} from '../utils/benchmark.js';
import { serverFactories, type ServerType } from './servers.js';

/**
 * Benchmark scenario
 */
export interface BenchmarkScenario {
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: string;
  headers?: Record<string, string>;
  description: string;
}

/**
 * Standard benchmark scenarios
 */
export const scenarios: BenchmarkScenario[] = [
  {
    name: 'json',
    path: '/json',
    method: 'GET',
    description: 'Simple JSON response',
  },
  {
    name: 'params',
    path: '/user/123',
    method: 'GET',
    description: 'Route with URL parameters',
  },
  {
    name: 'post-echo',
    path: '/echo',
    method: 'POST',
    body: JSON.stringify({ message: 'Hello, World!', timestamp: Date.now() }),
    headers: { 'Content-Type': 'application/json' },
    description: 'POST with JSON body parsing',
  },
  {
    name: 'post-validated',
    path: '/user',
    method: 'POST',
    body: JSON.stringify({ name: 'John Doe', email: 'john@example.com' }),
    headers: { 'Content-Type': 'application/json' },
    description: 'POST with validation',
  },
];

/**
 * Benchmark configuration
 */
export interface BenchmarkConfig {
  /** Frameworks to benchmark */
  frameworks: ServerType[];
  /** Scenarios to run */
  scenarios: BenchmarkScenario[];
  /** Connections per benchmark */
  connections: number;
  /** Duration per benchmark in seconds */
  duration: number;
  /** Pipeline depth */
  pipelining: number;
  /** Base port */
  basePort: number;
  /** Warmup requests */
  warmupRequests: number;
}

/**
 * Default benchmark configuration
 */
export const defaultConfig: BenchmarkConfig = {
  frameworks: ['vexor', 'fastify', 'hono', 'express', 'node'],
  scenarios,
  connections: 100,
  duration: 10,
  pipelining: 10,
  basePort: 3000,
  warmupRequests: 5000,
};

/**
 * Framework benchmark results
 */
export interface FrameworkResults {
  framework: ServerType;
  results: Map<string, BenchmarkResult>;
}

/**
 * Run HTTP benchmarks
 */
export async function runHttpBenchmarks(
  config: Partial<BenchmarkConfig> = {}
): Promise<FrameworkResults[]> {
  // Filter out undefined values to avoid overwriting defaults
  const cleanConfig = Object.fromEntries(
    Object.entries(config).filter(([_, v]) => v !== undefined)
  );
  const cfg = { ...defaultConfig, ...cleanConfig } as BenchmarkConfig;
  const allResults: FrameworkResults[] = [];

  console.log('\n========================================');
  console.log('       HTTP Framework Benchmarks');
  console.log('========================================\n');
  console.log(`Configuration:`);
  console.log(`  Connections: ${cfg.connections}`);
  console.log(`  Duration: ${cfg.duration}s`);
  console.log(`  Pipelining: ${cfg.pipelining}`);
  console.log(`  Warmup: ${cfg.warmupRequests} requests`);
  console.log(`  Frameworks: ${cfg.frameworks.join(', ')}`);
  console.log(`  Scenarios: ${cfg.scenarios.map(s => s.name).join(', ')}\n`);

  for (const framework of cfg.frameworks) {
    console.log(`\n--- Benchmarking ${framework.toUpperCase()} ---\n`);

    const port = cfg.basePort;
    const results = new Map<string, BenchmarkResult>();

    try {
      // Start server
      const factory = serverFactories[framework];
      const { close } = await factory(port);

      // Wait for server to be ready
      await sleep(1000);

      // Warm up
      console.log(`  Warming up with ${cfg.warmupRequests} requests...`);
      await warmUp(`http://localhost:${port}/json`, cfg.warmupRequests);

      // Run scenarios
      for (const scenario of cfg.scenarios) {
        console.log(`  Running: ${scenario.name} (${scenario.description})`);

        const result = await runAutocannon({
          url: `http://localhost:${port}${scenario.path}`,
          connections: cfg.connections,
          duration: cfg.duration,
          pipelining: cfg.pipelining,
          method: scenario.method,
          body: scenario.body,
          headers: scenario.headers,
        });

        result.name = scenario.name;
        results.set(scenario.name, result);

        console.log(`    Throughput: ${result.throughput.toFixed(0)} req/s`);
        console.log(`    Latency (avg): ${result.latency.avg.toFixed(2)}ms`);
        console.log(`    Latency (p99): ${result.latency.p99.toFixed(2)}ms`);

        // Cool down between tests
        await sleep(2000);
      }

      // Stop server
      await close();
      await sleep(1000);

      allResults.push({ framework, results });
    } catch (error) {
      console.error(`  Error benchmarking ${framework}:`, error);
    }
  }

  return allResults;
}

/**
 * Compare results between frameworks
 */
export function compareResults(results: FrameworkResults[]): void {
  console.log('\n========================================');
  console.log('         Benchmark Comparison');
  console.log('========================================\n');

  // Get all scenario names
  const scenarioNames = [...(results[0]?.results.keys() ?? [])];

  for (const scenario of scenarioNames) {
    console.log(`\n--- ${scenario.toUpperCase()} ---\n`);

    // Collect results for this scenario
    const scenarioResults = results
      .map(r => ({
        framework: r.framework,
        result: r.results.get(scenario),
      }))
      .filter(r => r.result)
      .sort((a, b) => (b.result?.throughput ?? 0) - (a.result?.throughput ?? 0));

    // Find baseline (Node.js native)
    const baseline = scenarioResults.find(r => r.framework === 'node')?.result;
    const best = scenarioResults[0];

    console.log('  Throughput (req/s):');
    for (const { framework, result } of scenarioResults) {
      if (!result) continue;

      const throughput = result.throughput.toFixed(0).padStart(8);
      let comparison = '';

      if (baseline && framework !== 'node') {
        const diff = ((result.throughput - baseline.throughput) / baseline.throughput) * 100;
        const sign = diff >= 0 ? '+' : '';
        comparison = ` (${sign}${diff.toFixed(1)}% vs node)`;
      }

      const marker = framework === best?.framework ? ' *' : '';
      console.log(`    ${framework.padEnd(10)}: ${throughput}${comparison}${marker}`);
    }

    console.log('\n  Latency p99 (ms):');
    const sortedByLatency = [...scenarioResults].sort(
      (a, b) => (a.result?.latency.p99 ?? 0) - (b.result?.latency.p99 ?? 0)
    );

    for (const { framework, result } of sortedByLatency) {
      if (!result) continue;

      const latency = result.latency.p99.toFixed(2).padStart(8);
      const marker = framework === sortedByLatency[0]?.framework ? ' *' : '';
      console.log(`    ${framework.padEnd(10)}: ${latency}${marker}`);
    }
  }

  console.log('\n  * = best in category\n');
}

/**
 * Generate summary report
 */
export function generateSummary(results: FrameworkResults[]): void {
  console.log('\n========================================');
  console.log('              Summary');
  console.log('========================================\n');

  // Calculate averages across all scenarios
  const averages = results.map(r => {
    const throughputs = [...r.results.values()].map(v => v.throughput);
    const latencies = [...r.results.values()].map(v => v.latency.p99);

    return {
      framework: r.framework,
      avgThroughput: throughputs.reduce((a, b) => a + b, 0) / throughputs.length,
      avgLatency: latencies.reduce((a, b) => a + b, 0) / latencies.length,
    };
  }).sort((a, b) => b.avgThroughput - a.avgThroughput);

  console.log('Average Performance (across all scenarios):\n');
  console.log('  Framework      Throughput     Latency (p99)');
  console.log('  ─────────────────────────────────────────────');

  for (const avg of averages) {
    const name = avg.framework.padEnd(12);
    const throughput = `${avg.avgThroughput.toFixed(0)} req/s`.padStart(12);
    const latency = `${avg.avgLatency.toFixed(2)}ms`.padStart(14);
    console.log(`  ${name} ${throughput} ${latency}`);
  }

  // Vexor position
  const vexorIndex = averages.findIndex(a => a.framework === 'vexor');
  if (vexorIndex !== -1) {
    console.log(`\n  Vexor is #${vexorIndex + 1} in throughput`);

    if (vexorIndex > 0) {
      const leader = averages[0];
      const diff = ((leader.avgThroughput - averages[vexorIndex].avgThroughput) / leader.avgThroughput) * 100;
      console.log(`  ${diff.toFixed(1)}% behind ${leader.framework}`);
    }
  }
}
