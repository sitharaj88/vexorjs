#!/usr/bin/env tsx
/**
 * Benchmark Report Generator
 *
 * Generates formatted reports from benchmark results.
 */

import { readdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const resultsDir = join(__dirname, '..', 'results');

interface BenchmarkResult {
  name: string;
  operation?: string;
  requests?: number;
  throughput?: number;
  latency?: {
    avg: number;
    min: number;
    max: number;
    p50: number;
    p90: number;
    p99: number;
  };
  errors?: number;
  opsPerSecond?: number;
  avgTime?: number;
}

interface FrameworkResults {
  framework: string;
  results: Record<string, BenchmarkResult>;
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(httpResults: FrameworkResults[], ormResults?: Record<string, BenchmarkResult[]>): string {
  let md = `# Vexor Benchmark Results

Generated: ${new Date().toISOString()}

## System Information

- Node.js: ${process.version}
- Platform: ${process.platform}
- Architecture: ${process.arch}

`;

  // HTTP Results
  if (httpResults.length > 0) {
    md += `## HTTP Framework Comparison

### Throughput (requests/second)

| Framework | /json | /user/:id | POST /echo | POST /user (validated) |
|-----------|-------|-----------|------------|------------------------|
`;

    for (const fw of httpResults) {
      const json = fw.results['json']?.throughput?.toFixed(0) ?? 'N/A';
      const params = fw.results['params']?.throughput?.toFixed(0) ?? 'N/A';
      const echo = fw.results['post-echo']?.throughput?.toFixed(0) ?? 'N/A';
      const validated = fw.results['post-validated']?.throughput?.toFixed(0) ?? 'N/A';
      md += `| ${fw.framework} | ${json} | ${params} | ${echo} | ${validated} |\n`;
    }

    md += `
### Latency p99 (milliseconds)

| Framework | /json | /user/:id | POST /echo | POST /user (validated) |
|-----------|-------|-----------|------------|------------------------|
`;

    for (const fw of httpResults) {
      const json = fw.results['json']?.latency?.p99?.toFixed(2) ?? 'N/A';
      const params = fw.results['params']?.latency?.p99?.toFixed(2) ?? 'N/A';
      const echo = fw.results['post-echo']?.latency?.p99?.toFixed(2) ?? 'N/A';
      const validated = fw.results['post-validated']?.latency?.p99?.toFixed(2) ?? 'N/A';
      md += `| ${fw.framework} | ${json} | ${params} | ${echo} | ${validated} |\n`;
    }

    // Calculate rankings
    md += `
### Rankings

`;

    const scenarios = ['json', 'params', 'post-echo', 'post-validated'];
    for (const scenario of scenarios) {
      const ranked = httpResults
        .map(fw => ({
          name: fw.framework,
          throughput: fw.results[scenario]?.throughput ?? 0,
        }))
        .sort((a, b) => b.throughput - a.throughput);

      md += `**${scenario}**: `;
      md += ranked.map((r, i) => `${i + 1}. ${r.name}`).join(', ');
      md += '\n';
    }
  }

  // ORM Results
  if (ormResults) {
    md += `
## ORM Benchmarks

### Query Building Performance

| Operation | Ops/sec | Avg Time (μs) |
|-----------|---------|---------------|
`;

    const vexorOrm = ormResults['vexor-orm'] ?? [];
    for (const result of vexorOrm) {
      const ops = result.opsPerSecond?.toFixed(0) ?? 'N/A';
      const time = ((result.avgTime ?? 0) * 1000).toFixed(2);
      md += `| ${result.operation} | ${ops} | ${time} |\n`;
    }
  }

  md += `
## Methodology

- **HTTP Benchmarks**: Using autocannon with 100 connections, 10s duration, pipelining of 10
- **ORM Benchmarks**: 10,000-100,000 iterations per operation, measuring wall-clock time
- **Warmup**: 5,000 requests for HTTP, 1,000 iterations for ORM

## Disclaimer

Benchmark results can vary based on hardware, system load, and configuration.
These results are intended for relative comparison, not absolute performance claims.
`;

  return md;
}

/**
 * Generate ASCII table
 */
function generateAsciiTable(headers: string[], rows: string[][]): string {
  const colWidths = headers.map((h, i) => {
    const maxRow = Math.max(...rows.map(r => (r[i] ?? '').length));
    return Math.max(h.length, maxRow);
  });

  const separator = '+-' + colWidths.map(w => '-'.repeat(w)).join('-+-') + '-+';
  const headerRow = '| ' + headers.map((h, i) => h.padEnd(colWidths[i])).join(' | ') + ' |';

  let table = separator + '\n' + headerRow + '\n' + separator + '\n';

  for (const row of rows) {
    table += '| ' + row.map((c, i) => (c ?? '').padEnd(colWidths[i])).join(' | ') + ' |\n';
  }

  table += separator;

  return table;
}

/**
 * Generate console report with colors
 */
function generateConsoleReport(httpResults: FrameworkResults[], ormResults?: Record<string, BenchmarkResult[]>): void {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║              VEXOR BENCHMARK REPORT                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (httpResults.length > 0) {
    console.log('📊 HTTP FRAMEWORK COMPARISON\n');

    // Throughput table
    console.log('Throughput (req/s):');
    const throughputHeaders = ['Framework', 'json', 'params', 'echo', 'validated'];
    const throughputRows = httpResults.map(fw => [
      fw.framework,
      fw.results['json']?.throughput?.toFixed(0) ?? '-',
      fw.results['params']?.throughput?.toFixed(0) ?? '-',
      fw.results['post-echo']?.throughput?.toFixed(0) ?? '-',
      fw.results['post-validated']?.throughput?.toFixed(0) ?? '-',
    ]);
    console.log(generateAsciiTable(throughputHeaders, throughputRows));

    // Find winner
    const avgThroughputs = httpResults.map(fw => ({
      name: fw.framework,
      avg: Object.values(fw.results).reduce((sum, r) => sum + (r.throughput ?? 0), 0) / Object.keys(fw.results).length,
    })).sort((a, b) => b.avg - a.avg);

    console.log(`\n🏆 Overall winner: ${avgThroughputs[0].name} (${avgThroughputs[0].avg.toFixed(0)} avg req/s)`);

    // Vexor position
    const vexorPos = avgThroughputs.findIndex(t => t.name === 'vexor') + 1;
    if (vexorPos > 0 && vexorPos !== 1) {
      const diff = ((avgThroughputs[0].avg - avgThroughputs[vexorPos - 1].avg) / avgThroughputs[0].avg * 100).toFixed(1);
      console.log(`📍 Vexor position: #${vexorPos} (${diff}% behind leader)`);
    } else if (vexorPos === 1) {
      console.log(`📍 Vexor is the leader! 🎉`);
    }
  }

  if (ormResults) {
    console.log('\n\n📊 ORM QUERY BUILDING PERFORMANCE\n');

    const ormHeaders = ['Operation', 'Ops/sec', 'Avg Time'];
    const ormRows = (ormResults['vexor-orm'] ?? []).map(r => [
      r.operation ?? r.name,
      r.opsPerSecond?.toFixed(0) ?? '-',
      `${((r.avgTime ?? 0) * 1000).toFixed(2)}μs`,
    ]);
    console.log(generateAsciiTable(ormHeaders, ormRows));
  }

  console.log('\n');
}

/**
 * Load latest results
 */
async function loadLatestResults(): Promise<{ http: FrameworkResults[]; orm: Record<string, BenchmarkResult[]> | null }> {
  try {
    const files = await readdir(resultsDir);

    // Find latest HTTP results
    const httpFiles = files.filter(f => f.startsWith('http-')).sort().reverse();
    let httpResults: FrameworkResults[] = [];

    if (httpFiles.length > 0) {
      const content = await readFile(join(resultsDir, httpFiles[0]), 'utf-8');
      httpResults = JSON.parse(content);
    }

    // Find latest ORM results
    const ormFiles = files.filter(f => f.startsWith('orm-')).sort().reverse();
    let ormResults: Record<string, BenchmarkResult[]> | null = null;

    if (ormFiles.length > 0) {
      const content = await readFile(join(resultsDir, ormFiles[0]), 'utf-8');
      ormResults = JSON.parse(content);
    }

    return { http: httpResults, orm: ormResults };
  } catch {
    return { http: [], orm: null };
  }
}

/**
 * Main
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const format = args.includes('--markdown') || args.includes('-m') ? 'markdown' : 'console';

  const { http, orm } = await loadLatestResults();

  if (http.length === 0 && !orm) {
    console.log('No benchmark results found. Run benchmarks first with: npm run bench');
    process.exit(1);
  }

  if (format === 'markdown') {
    console.log(generateMarkdownReport(http, orm ?? undefined));
  } else {
    generateConsoleReport(http, orm ?? undefined);
  }
}

main().catch(console.error);
