---
'@vexorjs/core': minor
---

Performance: JIT-compiled validation and a direct-write response fast path.

- **JIT validation compiler**: schemas now compile to specialized functions via
  code generation — ~30× faster than the tree-walking interpreter on typical
  request bodies (measured 7.8M validations/sec vs 260K), with byte-identical
  issue output (verified by a parity test suite). Runtimes that forbid codegen
  (e.g. Cloudflare Workers) automatically fall back to the interpreter.
  The interpreter remains exported as `compileInterpreted`.
- **Node adapter fast path**: responses built from in-memory bodies
  (`ctx.json()`, `ctx.text()`, `ctx.html()`) are written with a single
  `res.end(raw)` instead of pumping a ReadableStream reader per request.
  Streaming responses (SSE, static files) keep the streaming path.
