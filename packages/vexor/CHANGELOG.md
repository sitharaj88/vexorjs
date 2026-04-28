# @vexorjs/core

## Unreleased

### Minor Changes

- **GraphQL adapter** — `createGraphQLHandler({ schema | executor, contextFactory, graphiql })`. Pure HTTP plumbing; lazy-loads the `graphql` package only when a `schema` is provided. Includes a built-in GraphiQL playground.
- **gRPC-Web adapter** — Full gRPC-Web wire format on plain HTTP/1.1+. `GrpcService` with chainable `unary()` and `serverStream()` registration. JSON codec by default; pluggable `Codec` interface for Protobuf. Canonical status codes, `GrpcError`, header-based metadata pass-through.
- **Server-streaming gRPC** — `serverStream()` handlers return an `AsyncIterable`; each yielded value is sent as a separate frame, terminated with a `grpc-status` trailer.
- **OAuth Redis stores** — `RedisStateStore` and `RedisSessionStore` for multi-instance deployments. Compatible with `ioredis`, `node-redis` v4+, `@upstash/redis`, or any client conforming to `RedisLike`. Configurable prefix, TTL, and call style.
- **Standard Schema interop** — `toStandardSchema` / `validate` / `getErrors` helpers for compatibility with Zod, Valibot, ArkType, and other validators implementing the spec.

### Patch Changes

- WebSocket concurrency hardening — added stress tests covering 1000-subscriber fan-out, mid-broadcast disconnect, idempotent subscribe, and randomized subscribe/unsubscribe interleaving.

## 1.0.1

### Patch Changes

- Patch release: fix publish configuration and version bump
