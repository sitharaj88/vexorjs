declare module 'autocannon' {
  interface AutocannonOptions {
    url: string;
    connections?: number;
    duration?: number;
    pipelining?: number;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
    body?: string | Buffer;
    headers?: Record<string, string>;
    timeout?: number;
    title?: string;
    setupClient?: (client: unknown) => void;
    workers?: number;
  }

  interface AutocannonResult {
    title: string;
    url: string;
    socketPath: string | undefined;
    requests: {
      average: number;
      mean: number;
      stddev: number;
      min: number;
      max: number;
      total: number;
      sent: number;
      p0_001: number;
      p0_01: number;
      p0_1: number;
      p1: number;
      p2_5: number;
      p10: number;
      p25: number;
      p50: number;
      p75: number;
      p90: number;
      p97_5: number;
      p99: number;
      p99_9: number;
      p99_99: number;
      p99_999: number;
    };
    latency: {
      average: number;
      mean: number;
      stddev: number;
      min: number;
      max: number;
      p0_001: number;
      p0_01: number;
      p0_1: number;
      p1: number;
      p2_5: number;
      p10: number;
      p25: number;
      p50: number;
      p75: number;
      p90: number;
      p97_5: number;
      p99: number;
      p99_9: number;
      p99_99: number;
      p99_999: number;
    };
    throughput: {
      average: number;
      mean: number;
      stddev: number;
      min: number;
      max: number;
      total: number;
      p0_001: number;
      p0_01: number;
      p0_1: number;
      p1: number;
      p2_5: number;
      p10: number;
      p25: number;
      p50: number;
      p75: number;
      p90: number;
      p97_5: number;
      p99: number;
      p99_9: number;
      p99_99: number;
      p99_999: number;
    };
    errors: number;
    timeouts: number;
    duration: number;
    start: Date;
    finish: Date;
    connections: number;
    pipelining: number;
    non2xx: number;
  }

  interface AutocannonInstance {
    on(event: 'done', callback: (result: AutocannonResult) => void): void;
    on(event: 'error', callback: (error: Error) => void): void;
    on(event: 'reqError', callback: (error: Error) => void): void;
    on(event: 'response', callback: (client: unknown, statusCode: number, resBytes: number, responseTime: number) => void): void;
    stop(): void;
  }

  function autocannon(
    options: AutocannonOptions,
    callback?: (err: Error | null, result: AutocannonResult) => void
  ): AutocannonInstance;

  namespace autocannon {
    function track(instance: AutocannonInstance, options?: { renderProgressBar?: boolean; renderResultsTable?: boolean }): void;
  }

  export = autocannon;
}
