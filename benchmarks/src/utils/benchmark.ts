/**
 * Benchmark Utilities
 *
 * Common utilities for running and measuring benchmarks.
 */

import { spawn, ChildProcess } from 'child_process';

/**
 * Benchmark result
 */
export interface BenchmarkResult {
  name: string;
  requests: number;
  duration: number;
  throughput: number;
  latency: {
    avg: number;
    min: number;
    max: number;
    p50: number;
    p90: number;
    p99: number;
  };
  errors: number;
  timeouts: number;
  memory?: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
  };
}

/**
 * Autocannon options
 */
export interface AutocannonOptions {
  url: string;
  connections?: number;
  duration?: number;
  pipelining?: number;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: string;
  headers?: Record<string, string>;
}

/**
 * Run autocannon benchmark
 */
export async function runAutocannon(options: AutocannonOptions): Promise<BenchmarkResult> {
  const autocannon = await import('autocannon');

  const result = await new Promise<any>((resolve, reject) => {
    const instance = autocannon.default({
      url: options.url,
      connections: options.connections ?? 100,
      duration: options.duration ?? 10,
      pipelining: options.pipelining ?? 10,
      method: options.method ?? 'GET',
      body: options.body,
      headers: options.headers,
    }, (err: Error | null, result: any) => {
      if (err) reject(err);
      else resolve(result);
    });

    autocannon.track(instance, { renderProgressBar: false });
  });

  return {
    name: options.url,
    requests: result.requests.total,
    duration: result.duration,
    throughput: result.requests.average,
    latency: {
      avg: result.latency.average,
      min: result.latency.min,
      max: result.latency.max,
      p50: result.latency.p50,
      p90: result.latency.p90,
      p99: result.latency.p99,
    },
    errors: result.errors,
    timeouts: result.timeouts,
  };
}

/**
 * Server process manager
 */
export class ServerProcess {
  private process: ChildProcess | null = null;
  private port: number;

  constructor(port: number) {
    this.port = port;
  }

  /**
   * Start a server process
   */
  async start(command: string, args: string[], cwd?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.process = spawn(command, args, {
        cwd,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, PORT: String(this.port) },
      });

      let started = false;

      this.process.stdout?.on('data', (data) => {
        const output = data.toString();
        if (output.includes('listening') || output.includes('started') || output.includes('running')) {
          if (!started) {
            started = true;
            // Give server a moment to fully initialize
            setTimeout(resolve, 500);
          }
        }
      });

      this.process.stderr?.on('data', (data) => {
        console.error(`Server stderr: ${data}`);
      });

      this.process.on('error', reject);
      this.process.on('exit', (code) => {
        if (!started && code !== 0) {
          reject(new Error(`Server exited with code ${code}`));
        }
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!started) {
          started = true;
          resolve(); // Assume it started
        }
      }, 10000);
    });
  }

  /**
   * Stop the server process
   */
  async stop(): Promise<void> {
    if (this.process) {
      this.process.kill('SIGTERM');
      await new Promise<void>((resolve) => {
        this.process?.on('exit', resolve);
        setTimeout(resolve, 2000);
      });
      this.process = null;
    }
  }
}

/**
 * Wait for port to be available
 */
export async function waitForPort(port: number, timeout = 10000): Promise<boolean> {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(`http://localhost:${port}/health`);
      if (response.ok) return true;
    } catch {
      // Port not ready yet
    }
    await sleep(100);
  }

  return false;
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Format bytes to human readable
 */
export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Calculate percentage difference
 */
export function percentDiff(a: number, b: number): string {
  const diff = ((a - b) / b) * 100;
  const sign = diff >= 0 ? '+' : '';
  return `${sign}${diff.toFixed(1)}%`;
}

/**
 * Get memory usage
 */
export function getMemoryUsage(): { rss: number; heapUsed: number; heapTotal: number } {
  const mem = process.memoryUsage();
  return {
    rss: mem.rss,
    heapUsed: mem.heapUsed,
    heapTotal: mem.heapTotal,
  };
}

/**
 * Warm up a server
 */
export async function warmUp(url: string, requests = 1000): Promise<void> {
  const promises: Promise<Response>[] = [];

  for (let i = 0; i < requests; i++) {
    promises.push(fetch(url).catch(() => new Response()));
  }

  await Promise.all(promises);
  await sleep(1000); // Let GC run
}
