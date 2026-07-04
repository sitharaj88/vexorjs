/**
 * CI performance gate.
 *
 * Reads the most recent benchmark results JSON and fails when Vexor's
 * average throughput drops below a fixed ratio of Fastify's in the same
 * run. Comparing ratios (not absolute req/s) keeps the gate stable across
 * differently-sized CI runners.
 */

import { readdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Vexor currently sits at ~0.72x Fastify; gate leaves headroom for runner
// noise while still catching real regressions. Raise as performance improves.
const MIN_RATIO = 0.55;

const resultsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'benchmarks', 'results');

const files = (await readdir(resultsDir)).filter((f) => f.startsWith('http-')).sort();
if (files.length === 0) {
  console.error('perf-gate: no benchmark results found');
  process.exit(1);
}

const latest = JSON.parse(await readFile(join(resultsDir, files[files.length - 1]), 'utf8'));

function averageThroughput(framework) {
  // Shape: [{ framework, results: { [scenario]: { throughput, ... } } }]
  const entry = (Array.isArray(latest) ? latest : []).find((e) => e.framework === framework);
  const scenarios = Object.values(entry?.results ?? {});
  if (scenarios.length === 0) return null;
  const total = scenarios.reduce((sum, s) => sum + (s.throughput ?? 0), 0);
  return total / scenarios.length;
}

const vexor = averageThroughput('vexor');
const fastify = averageThroughput('fastify');

if (!vexor || !fastify) {
  console.error('perf-gate: missing vexor or fastify results in', files[files.length - 1]);
  console.error('available keys:', Object.keys(latest));
  process.exit(1);
}

const ratio = vexor / fastify;
console.log(`vexor:   ${Math.round(vexor)} req/s (avg)`);
console.log(`fastify: ${Math.round(fastify)} req/s (avg)`);
console.log(`ratio:   ${ratio.toFixed(3)} (gate: >= ${MIN_RATIO})`);

if (ratio < MIN_RATIO) {
  console.error(`\n❌ Performance regression: vexor/fastify ratio ${ratio.toFixed(3)} < ${MIN_RATIO}`);
  process.exit(1);
}
console.log('\n✅ Performance gate passed');
