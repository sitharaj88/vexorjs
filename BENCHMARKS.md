# Vexor Benchmarks

Honest, reproducible numbers. Run them yourself:

```bash
npm ci && npm run build
npm run bench:http -- --compare --duration 30 --connections 100
```

## HTTP throughput vs other frameworks

Preliminary numbers — Windows 11 laptop, Node 22, 10s runs, 100 connections,
averaged across 5 route scenarios (static, JSON, params, POST echo, POST
validated). Treat relative positions as indicative, not absolute:

| Framework | Avg throughput | Avg p99 latency |
|-----------|---------------:|----------------:|
| Fastify   | 4,831 req/s    | 424 ms          |
| Hono      | 4,156 req/s    | 579 ms          |
| **Vexor** | **3,480 req/s**| **694 ms**      |
| Express   | 2,348 req/s    | 945 ms          |

Where Vexor currently stands: **faster than Express, ~16% behind Hono and
~28% behind Fastify** on the Node adapter. On the schema-validated POST
scenario the gap to Hono is ~9% (2,628 vs 2,897 req/s) thanks to JIT
validation. Closing the remaining adapter overhead is tracked work — these
numbers will be updated as it lands, not massaged.

## Validation: JIT compiler vs interpreter

Schemas compile to specialized functions via code generation (with an
automatic interpreter fallback on codegen-restricted runtimes like
Cloudflare Workers). Measured on a typical 6-field API body (Node 22):

| Path | Valid input | Invalid input |
|------|------------:|--------------:|
| Interpreter (`compileInterpreted`) | 260K ops/s | 203K ops/s |
| **JIT (`compile`, default)** | **7.79M ops/s** | **861K ops/s** |
| Speedup | **~30×** | **~4.2×** |

Output parity between the two paths (identical issues, messages, and paths)
is enforced by a dedicated test suite (`validation-jit.test.ts`).

## Methodology notes

- Load generation: autocannon; each framework runs in its own process,
  measured sequentially on the same machine.
- All frameworks serve identical route sets defined in
  [benchmarks/src/http/servers.ts](benchmarks/src/http/servers.ts).
- Vexor is currently measured from TypeScript source via tsx while
  competitors run their published builds — a small handicap for Vexor.
- CI runs a relative performance gate (Vexor must stay within a fixed
  ratio of Fastify) to catch regressions; see `.github/workflows/ci.yml`.

_Last updated: 2026-07-04 (Vexor 1.3.0-dev, Node 22.15)._
