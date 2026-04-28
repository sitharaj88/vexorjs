# @vexorjs/core

A blazing-fast, batteries-included, multi-runtime Node.js backend framework.

```bash
npm install @vexorjs/core
```

---

## Highlights

- **Routing** — Radix tree router with O(1) static lookup
- **Validation & serialization** — JIT-compiled with end-to-end type inference
- **Middleware** — CORS, compression, rate limiting, file uploads, health checks, API versioning
- **Auth** — JWT (HS/RS 256/384/512), sessions (memory + cookie), OAuth 2.0 / OIDC with 8 built-in providers
- **Realtime** — WebSocket server, Server-Sent Events, pub/sub with memory + Redis adapters
- **GraphQL** — Built-in adapter with optional GraphiQL playground
- **gRPC-Web** — Full gRPC-Web wire format on plain HTTP/1.1+ with unary + server-streaming
- **Resilience** — Circuit breaker, retry with backoff
- **Observability** — Tracer, metrics, structured logger, OTLP exporter
- **OpenAPI** — Auto-generated from route definitions; ships with Swagger UI / ReDoc / Scalar
- **Multi-runtime** — Node.js, Bun, Deno, Cloudflare Workers, Vercel Edge, AWS Lambda

---

## Quick start

```ts
import { Vexor, Type } from '@vexorjs/core';

const app = new Vexor();

app.get('/users/:id', {
  params: Type.Object({ id: Type.String() }),
  response: {
    200: Type.Object({
      id: Type.String(),
      name: Type.String(),
      email: Type.String({ format: 'email' }),
    }),
  },
}, async (ctx) => {
  return ctx.json({ id: ctx.params.id, name: 'John', email: 'john@example.com' });
});

app.listen(3000);
```

---

## Authentication

### JWT

```ts
import { JWT } from '@vexorjs/core';

const jwt = new JWT({ secret: process.env.JWT_SECRET! });
const token = await jwt.sign({ userId: '123' });
const payload = await jwt.verify(token);
```

### OAuth 2.0 / OIDC

Eight built-in providers: Google, GitHub, Discord, Twitter, Microsoft, Facebook, LinkedIn, Apple.

```ts
import { OAuth, providers, RedisStateStore, RedisSessionStore } from '@vexorjs/core';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

const oauth = new OAuth({
  providers: {
    github: providers.github(process.env.GH_CLIENT_ID!, process.env.GH_CLIENT_SECRET!),
  },
  // Production-ready stores for multi-instance deployments
  stateStore: new RedisStateStore(redis, { ttl: 600 }),
  sessionStore: new RedisSessionStore(redis, { ttl: 86400 }),
});

app.get('/auth/github', async (ctx) => {
  const url = await oauth.getAuthorizationUrl('github');
  return ctx.redirect(url);
});
```

`RedisLike` is intentionally minimal — `ioredis`, `node-redis` v4+ (`setStyle: 'options'`), `@upstash/redis`, or any `set`/`get`/`del` client works.

---

## Realtime

### WebSocket

```ts
app.ws('/chat', {
  onOpen(ws) {
    ws.subscribe('global');
  },
  onMessage(ws, msg) {
    ws.publish('global', msg); // broadcast except sender
  },
});
```

### Server-Sent Events

```ts
app.get('/events', (ctx) => ctx.sse(async (stream) => {
  for await (const event of generateEvents()) {
    stream.send(event);
  }
}));
```

### Pub/Sub

```ts
import { createPubSub, RedisPubSubAdapter } from '@vexorjs/core';

const pubsub = createPubSub({ adapter: new RedisPubSubAdapter(redis) });
await pubsub.publish('orders.created', { id: 1 });
```

---

## GraphQL

```ts
import { createGraphQLHandler } from '@vexorjs/core';
import { buildSchema, execute, parse } from 'graphql';

const schema = buildSchema(`type Query { hello(name: String): String! }`);
const rootValue = { hello: ({ name }) => `hi ${name ?? 'world'}` };

const handler = createGraphQLHandler({
  graphiql: true, // GET /graphql renders the playground
  executor: async ({ query, variables, operationName }) =>
    (await execute({
      schema,
      document: parse(query),
      rootValue,
      variableValues: variables,
      operationName,
    })) as any,
});

app.post('/graphql', handler);
app.get('/graphql', handler);
```

The handler is HTTP-only plumbing — no hard dependency on `graphql`. Works equally well with Yoga, Apollo, or any executor you supply.

---

## gRPC-Web

Full gRPC-Web wire format on plain HTTP/1.1+ — works in browsers, edge runtimes, and behind any HTTP proxy. JSON codec by default, pluggable `Codec` for Protobuf.

```ts
import { GrpcService, GrpcError, GrpcStatus, createGrpcHandler } from '@vexorjs/core';

const greeter = new GrpcService('Greeter')
  .unary<{ name: string }, { message: string }>('SayHello', async (req) => {
    if (!req.name) throw new GrpcError(GrpcStatus.INVALID_ARGUMENT, 'name required');
    return { message: `hi ${req.name}` };
  })
  .serverStream<{ from: number; to: number }, { n: number }>(
    'Range',
    async function* (req) {
      for (let i = req.from; i <= req.to; i++) yield { n: i };
    }
  );

const handler = createGrpcHandler({ services: [greeter] });
app.post('/Greeter/:method', (ctx) =>
  handler({ method: ctx.method, path: ctx.path, request: ctx.request })
);
```

For canonical Protobuf wire format, plug in a codec backed by your generated `*.pb` types:

```ts
const protoCodec: Codec = {
  subtype: 'proto',
  encode: (v) => (v as HelloResponse).serializeBinary(),
  decode: (b) => HelloRequest.deserializeBinary(b).toObject(),
};
createGrpcHandler({ services: [greeter], codec: protoCodec });
```

---

## Multi-runtime adapters

| Runtime | Helper |
|---|---|
| Node.js | `app.listen(port)` (default) |
| Bun | `createBunAdapter(app)` |
| Deno | `createDenoAdapter(app)` |
| Cloudflare Workers | `createCloudflareWorker(app)` |
| Vercel Edge | `createVercelEdgeHandler(app)` |
| AWS Lambda | `createLambdaHandler(app)` (API Gateway / Function URL / ALB) |

See [`examples/cloudflare-workers`](../../examples/cloudflare-workers) and [`examples/vercel-edge`](../../examples/vercel-edge).

---

## Observability

```ts
import { createTracer, createMetrics } from '@vexorjs/core';

const tracer = createTracer({ exporter: 'otlp', endpoint: 'http://localhost:4318' });
const metrics = createMetrics();

const requests = metrics.counter('http_requests_total', ['method', 'path']);
app.use(async (ctx, next) => {
  const span = tracer.startSpan('request');
  try {
    await next();
    requests.inc({ method: ctx.method, path: ctx.path });
  } finally {
    span.end();
  }
});
```

---

## Standard Schema interop

Vexor schemas implement [Standard Schema](https://github.com/standard-schema/standard-schema), so you can interoperate with Zod, Valibot, ArkType, and any other compliant validator.

```ts
import { toStandardSchema, validate, getErrors } from '@vexorjs/core';

const wrapped = toStandardSchema(myVexorSchema, validateFn);
const result = validate(wrapped, input);
if (result.issues) console.log(getErrors(result));
```

---

## Documentation

- **Full docs**: <https://sitharaj88.github.io/vexorjs/>
- **Examples**: [`examples/`](../../examples/)
- **API reference**: <https://sitharaj88.github.io/vexorjs/api/vexor-class>

## License

MIT
