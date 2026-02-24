#!/usr/bin/env tsx
/**
 * Benchmark Runner
 *
 * Main entry point for running Vexor benchmarks.
 */

import { runHttpBenchmarks, compareResults, generateSummary } from './http/benchmark.js';
import { runAllORMBenchmarks, generateORMSummary } from './orm/benchmark.js';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const resultsDir = join(__dirname, '..', 'results');

/**
 * Parse CLI arguments
 */
function parseArgs(): {
  suite: 'http' | 'orm' | 'all';
  compare: boolean;
  save: boolean;
  frameworks?: string[];
  duration?: number;
  connections?: number;
} {
  const args = process.argv.slice(2);
  const options: ReturnType<typeof parseArgs> = {
    suite: 'all',
    compare: false,
    save: true,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--suite' || arg === '-s') {
      options.suite = args[++i] as 'http' | 'orm' | 'all';
    } else if (arg === '--compare' || arg === '-c') {
      options.compare = true;
    } else if (arg === '--no-save') {
      options.save = false;
    } else if (arg === '--frameworks' || arg === '-f') {
      options.frameworks = args[++i].split(',');
    } else if (arg === '--duration' || arg === '-d') {
      options.duration = parseInt(args[++i], 10);
    } else if (arg === '--connections' || arg === '-n') {
      options.connections = parseInt(args[++i], 10);
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

/**
 * Print help message
 */
function printHelp(): void {
  console.log(`
Vexor Benchmark Runner

Usage: npm run bench [options]

Options:
  --suite, -s <suite>      Benchmark suite to run (http, orm, all)
  --compare, -c            Compare frameworks (HTTP only)
  --no-save                Don't save results to file
  --frameworks, -f <list>  Comma-separated list of frameworks
  --duration, -d <secs>    Duration per benchmark in seconds
  --connections, -n <num>  Number of connections
  --help, -h               Show this help message

Examples:
  npm run bench                     Run all benchmarks
  npm run bench -- --suite http     Run HTTP benchmarks only
  npm run bench -- --suite orm      Run ORM benchmarks only
  npm run bench -- --compare        Run comparison benchmarks
  npm run bench -- -f vexor,fastify -d 5
`);
}

/**
 * Save results to JSON file
 */
async function saveResults(name: string, data: unknown): Promise<string> {
  await mkdir(resultsDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}-${timestamp}.json`;
  const filepath = join(resultsDir, filename);

  await writeFile(filepath, JSON.stringify(data, null, 2));

  return filepath;
}

/**
 * Print banner
 */
function printBanner(): void {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║             🚀  Vexor Framework Benchmarks  🚀                ║
║                                                               ║
║   High-performance, batteries-included Node.js framework      ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);
}

/**
 * Main runner
 */
async function main(): Promise<void> {
  printBanner();

  const options = parseArgs();
  const startTime = Date.now();

  console.log(`Running: ${options.suite} benchmarks`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  try {
    // HTTP Benchmarks
    if (options.suite === 'http' || options.suite === 'all') {
      const httpResults = await runHttpBenchmarks({
        frameworks: options.frameworks as any,
        duration: options.duration,
        connections: options.connections,
      });

      if (options.compare || options.suite === 'all') {
        compareResults(httpResults);
      }

      generateSummary(httpResults);

      if (options.save) {
        const filepath = await saveResults('http', httpResults);
        console.log(`\nResults saved to: ${filepath}`);
      }
    }

    // ORM Benchmarks
    if (options.suite === 'orm' || options.suite === 'all') {
      const ormResults = await runAllORMBenchmarks();
      generateORMSummary(ormResults);

      if (options.save) {
        const filepath = await saveResults('orm', Object.fromEntries(ormResults));
        console.log(`\nResults saved to: ${filepath}`);
      }
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Benchmarks completed in ${totalTime}s`);

  } catch (error) {
    console.error('\n❌ Benchmark failed:', error);
    process.exit(1);
  }
}

// Run
main().catch(console.error);
