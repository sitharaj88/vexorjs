/**
 * gRPC-Web Example
 *
 * Mounts a unary `Greeter.SayHello` RPC on top of Vexor. Browsers and
 * grpc-web clients can call it over plain HTTP/1.1 — no HTTP/2 trailer
 * support required.
 *
 * Run with: npx tsx examples/grpc-web/index.ts
 *
 * Test with:
 *   curl -X POST http://localhost:3000/Greeter/SayHello \
 *     -H "Content-Type: application/grpc-web+json" \
 *     --data-binary @<(printf '\x00\x00\x00\x00\x10{"name":"world"}')
 *
 * Or use a grpc-web client and point it at /Greeter.
 */

import {
  Vexor,
  GrpcService,
  GrpcError,
  GrpcStatus,
  createGrpcHandler,
} from '@vexorjs/core';

// ---------------------------------------------------------------------------
// Define a service
// ---------------------------------------------------------------------------

interface HelloRequest {
  name: string;
}

interface HelloResponse {
  message: string;
}

const greeter = new GrpcService('Greeter')
  .unary<HelloRequest, HelloResponse>('SayHello', async (req) => {
    if (!req.name) {
      throw new GrpcError(GrpcStatus.INVALID_ARGUMENT, 'name is required');
    }
    return { message: `Hello, ${req.name}!` };
  })
  .unary<{}, { count: number }>('Stats', async (_, ctx) => {
    // ctx.metadata exposes the caller's headers (minus transport-level ones)
    return {
      count: Object.keys(ctx.metadata).length,
    };
  });

// ---------------------------------------------------------------------------
// Mount on Vexor
// ---------------------------------------------------------------------------

const app = new Vexor({ port: 3000, logging: true });

const grpcHandler = createGrpcHandler({ services: [greeter] });

// One catch-all route per service path. The handler dispatches by
// `/<service>/<method>` parsed from ctx.path.
app.post('/Greeter/:method', async (ctx) => {
  return grpcHandler({
    method: ctx.method,
    path: ctx.path,
    request: ctx.request,
  });
});

app.get('/', (ctx) =>
  ctx.json({
    service: 'Greeter',
    methods: ['SayHello', 'Stats'],
    contentType: 'application/grpc-web+json',
  })
);

app.listen(3000).then(() => {
  console.log('gRPC-Web service ready at http://localhost:3000/Greeter/*');
});
