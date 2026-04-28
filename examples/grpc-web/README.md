# gRPC-Web example

A minimal gRPC-Web service using Vexor's built-in adapter. JSON codec by
default — pluggable to Protobuf if you want canonical wire format.

```bash
npx tsx examples/grpc-web/index.ts
```

The adapter implements the gRPC-Web spec on plain HTTP/1.1+, so it works
in browsers, edge runtimes, and behind any HTTP proxy. HTTP/2 gRPC (the
`@grpc/grpc-js` flavor) is a separate concern.

## Calling from a browser

```js
import { GreeterClient } from './generated/greeter_grpc_web_pb';
const client = new GreeterClient('http://localhost:3000');
client.sayHello({ name: 'world' }, {}, (err, res) => {
  console.log(res.getMessage());
});
```

## Custom codecs

The default JSON codec is convenient for development. For a production
Protobuf service, plug in a codec that uses your generated `*.pb.js` types:

```ts
import { HelloRequest, HelloResponse } from './generated/hello_pb';

const protoCodec: Codec = {
  subtype: 'proto',
  encode: (v) => (v as HelloResponse).serializeBinary(),
  decode: (b) => HelloRequest.deserializeBinary(b).toObject(),
};

const handler = createGrpcHandler({ services: [greeter], codec: protoCodec });
```
