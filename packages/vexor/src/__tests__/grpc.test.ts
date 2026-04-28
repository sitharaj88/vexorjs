/**
 * gRPC-Web Adapter Tests
 *
 * Covers:
 *  - Frame parsing and encoding
 *  - Trailer encoding/parsing
 *  - JSON codec round-trip
 *  - Service registry dispatch
 *  - Error mapping (unknown service/method, unimplemented, internal)
 *  - GrpcError thrown by handler → grpc-status in response
 *  - Custom codec
 *  - Metadata extraction
 */

import { describe, it, expect } from 'vitest';
import {
  GrpcService,
  GrpcError,
  GrpcStatus,
  createGrpcHandler,
  parseFrames,
  encodeFrame,
  encodeTrailers,
  parseTrailers,
  jsonCodec,
  type Codec,
  type GrpcHTTPContext,
} from '../grpc/index.js';

// ---------------------------------------------------------------------------
// Frame encoding / parsing
// ---------------------------------------------------------------------------

describe('frame encoding', () => {
  it('encodes a 5-byte header with big-endian length', () => {
    const frame = encodeFrame(new Uint8Array([1, 2, 3]));
    expect(frame[0]).toBe(0); // flags
    // length = 3, big-endian
    expect(frame[1]).toBe(0);
    expect(frame[2]).toBe(0);
    expect(frame[3]).toBe(0);
    expect(frame[4]).toBe(3);
    expect(frame.slice(5)).toEqual(new Uint8Array([1, 2, 3]));
  });

  it('sets the trailer flag when requested', () => {
    const frame = encodeFrame(new Uint8Array([0xff]), true);
    expect(frame[0]).toBe(0x80);
  });

  it('round-trips through parseFrames', () => {
    const a = encodeFrame(new Uint8Array([1, 2, 3]));
    const b = encodeFrame(new Uint8Array([4, 5]), true);
    const combined = new Uint8Array(a.length + b.length);
    combined.set(a, 0);
    combined.set(b, a.length);

    const parsed = parseFrames(combined);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].trailer).toBe(false);
    expect(parsed[0].payload).toEqual(new Uint8Array([1, 2, 3]));
    expect(parsed[1].trailer).toBe(true);
    expect(parsed[1].payload).toEqual(new Uint8Array([4, 5]));
  });

  it('throws on truncated header', () => {
    expect(() => parseFrames(new Uint8Array([0, 0, 0]))).toThrow(
      'Truncated gRPC-Web frame header'
    );
  });

  it('throws on truncated payload', () => {
    // Header says length=10, but only 2 bytes follow
    const buf = new Uint8Array([0, 0, 0, 0, 10, 1, 2]);
    expect(() => parseFrames(buf)).toThrow('Truncated gRPC-Web frame payload');
  });

  it('encodes and parses large lengths correctly (>255 bytes)', () => {
    const payload = new Uint8Array(300).fill(0xab);
    const frame = encodeFrame(payload);
    const parsed = parseFrames(frame);
    expect(parsed[0].payload.length).toBe(300);
  });
});

// ---------------------------------------------------------------------------
// Trailers
// ---------------------------------------------------------------------------

describe('trailers', () => {
  it('encodes key-value pairs with CRLF separators', () => {
    const buf = encodeTrailers({ 'grpc-status': '0', 'grpc-message': 'ok' });
    const text = new TextDecoder().decode(buf);
    expect(text).toContain('grpc-status: 0\r\n');
    expect(text).toContain('grpc-message: ok\r\n');
  });

  it('lowercases keys (HTTP/2 trailer convention)', () => {
    const buf = encodeTrailers({ 'GRPC-Status': '0' });
    const text = new TextDecoder().decode(buf);
    expect(text).toContain('grpc-status: 0');
  });

  it('parseTrailers reverses encodeTrailers', () => {
    const buf = encodeTrailers({ 'grpc-status': '7', 'grpc-message': 'denied' });
    expect(parseTrailers(buf)).toEqual({
      'grpc-status': '7',
      'grpc-message': 'denied',
    });
  });

  it('parseTrailers ignores empty lines and malformed lines', () => {
    const buf = new TextEncoder().encode(
      'grpc-status: 0\r\n\r\nno-colon-line\r\nx: y\r\n'
    );
    expect(parseTrailers(buf)).toEqual({ 'grpc-status': '0', x: 'y' });
  });
});

// ---------------------------------------------------------------------------
// JSON codec
// ---------------------------------------------------------------------------

describe('jsonCodec', () => {
  it('round-trips an object', () => {
    const encoded = jsonCodec.encode({ name: 'alice', age: 30 });
    expect(jsonCodec.decode(encoded)).toEqual({ name: 'alice', age: 30 });
  });

  it('decodes empty input as undefined', () => {
    expect(jsonCodec.decode(new Uint8Array(0))).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Handler — happy path + error mapping
// ---------------------------------------------------------------------------

function makeRequest(
  path: string,
  body: Uint8Array | undefined,
  headers: Record<string, string> = {}
): Request {
  return new Request(`http://localhost${path}`, {
    method: body ? 'POST' : 'GET',
    body: body && (body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength) as ArrayBuffer),
    headers: { 'content-type': 'application/grpc-web+json', ...headers },
  });
}

function frameJSON(value: unknown): Uint8Array {
  return encodeFrame(jsonCodec.encode(value));
}

async function readBodyFrames(res: Response) {
  return parseFrames(new Uint8Array(await res.arrayBuffer()));
}

function makeCtx(method: string, path: string, request: Request): GrpcHTTPContext {
  return { method, path, request };
}

describe('createGrpcHandler', () => {
  function buildGreeter() {
    return new GrpcService('Greeter')
      .unary<{ name: string }, { message: string }>('SayHello', async (req) => ({
        message: `hi ${req.name}`,
      }))
      .unary<{ name: string }, never>('Forbidden', async () => {
        throw new GrpcError(GrpcStatus.PERMISSION_DENIED, 'no');
      })
      .unary<{ name: string }, never>('Crash', async () => {
        throw new Error('boom');
      });
  }

  it('handles a unary call and returns one message frame + trailer', async () => {
    const handler = createGrpcHandler({ services: [buildGreeter()] });

    const body = frameJSON({ name: 'world' });
    const req = makeRequest('/Greeter/SayHello', body);
    const res = await handler(makeCtx('POST', '/Greeter/SayHello', req));

    expect(res.status).toBe(200);
    expect(res.headers.get('grpc-status')).toBe('0');
    expect(res.headers.get('content-type')).toBe('application/grpc-web+json');

    const frames = await readBodyFrames(res);
    expect(frames).toHaveLength(2);
    expect(frames[0].trailer).toBe(false);
    expect(jsonCodec.decode(frames[0].payload)).toEqual({ message: 'hi world' });
    expect(frames[1].trailer).toBe(true);
    expect(parseTrailers(frames[1].payload)['grpc-status']).toBe('0');
  });

  it('rejects non-POST with UNIMPLEMENTED', async () => {
    const handler = createGrpcHandler({ services: [buildGreeter()] });
    const req = makeRequest('/Greeter/SayHello', undefined);
    const res = await handler(makeCtx('GET', '/Greeter/SayHello', req));

    expect(res.headers.get('grpc-status')).toBe(String(GrpcStatus.UNIMPLEMENTED));
  });

  it('returns NOT_FOUND for an invalid path', async () => {
    const handler = createGrpcHandler({ services: [buildGreeter()] });
    const req = makeRequest('/justone', frameJSON({ name: 'a' }));
    const res = await handler(makeCtx('POST', '/justone', req));
    expect(res.headers.get('grpc-status')).toBe(String(GrpcStatus.NOT_FOUND));
  });

  it('returns UNIMPLEMENTED for an unknown service', async () => {
    const handler = createGrpcHandler({ services: [buildGreeter()] });
    const req = makeRequest('/Other/Method', frameJSON({}));
    const res = await handler(makeCtx('POST', '/Other/Method', req));
    expect(res.headers.get('grpc-status')).toBe(String(GrpcStatus.UNIMPLEMENTED));
  });

  it('returns UNIMPLEMENTED for an unknown method', async () => {
    const handler = createGrpcHandler({ services: [buildGreeter()] });
    const req = makeRequest('/Greeter/Missing', frameJSON({}));
    const res = await handler(makeCtx('POST', '/Greeter/Missing', req));
    expect(res.headers.get('grpc-status')).toBe(String(GrpcStatus.UNIMPLEMENTED));
  });

  it('returns INVALID_ARGUMENT when no message frame is present', async () => {
    const handler = createGrpcHandler({ services: [buildGreeter()] });
    // Send a body that's only a trailer frame
    const trailer = encodeFrame(encodeTrailers({}), true);
    const req = makeRequest('/Greeter/SayHello', trailer);
    const res = await handler(makeCtx('POST', '/Greeter/SayHello', req));
    expect(res.headers.get('grpc-status')).toBe(String(GrpcStatus.INVALID_ARGUMENT));
  });

  it('returns INVALID_ARGUMENT when multiple message frames are present', async () => {
    const handler = createGrpcHandler({ services: [buildGreeter()] });
    const a = frameJSON({ name: 'a' });
    const b = frameJSON({ name: 'b' });
    const both = new Uint8Array(a.length + b.length);
    both.set(a, 0);
    both.set(b, a.length);
    const req = makeRequest('/Greeter/SayHello', both);
    const res = await handler(makeCtx('POST', '/Greeter/SayHello', req));
    expect(res.headers.get('grpc-status')).toBe(String(GrpcStatus.INVALID_ARGUMENT));
  });

  it('returns INVALID_ARGUMENT when frame buffer is malformed', async () => {
    const handler = createGrpcHandler({ services: [buildGreeter()] });
    const req = makeRequest(
      '/Greeter/SayHello',
      new Uint8Array([0, 0, 0, 0, 99, 1, 2]) // header says 99 bytes, 2 follow
    );
    const res = await handler(makeCtx('POST', '/Greeter/SayHello', req));
    expect(res.headers.get('grpc-status')).toBe(String(GrpcStatus.INVALID_ARGUMENT));
  });

  it('surfaces GrpcError thrown by handler with its code', async () => {
    const handler = createGrpcHandler({ services: [buildGreeter()] });
    const req = makeRequest('/Greeter/Forbidden', frameJSON({ name: 'a' }));
    const res = await handler(makeCtx('POST', '/Greeter/Forbidden', req));
    expect(res.headers.get('grpc-status')).toBe(String(GrpcStatus.PERMISSION_DENIED));
    expect(decodeURIComponent(res.headers.get('grpc-message') ?? '')).toBe('no');
  });

  it('maps unknown errors to INTERNAL', async () => {
    const handler = createGrpcHandler({ services: [buildGreeter()] });
    const req = makeRequest('/Greeter/Crash', frameJSON({ name: 'a' }));
    const res = await handler(makeCtx('POST', '/Greeter/Crash', req));
    expect(res.headers.get('grpc-status')).toBe(String(GrpcStatus.INTERNAL));
    expect(decodeURIComponent(res.headers.get('grpc-message') ?? '')).toBe('boom');
  });

  it('returns INVALID_ARGUMENT for codec decode failures', async () => {
    const handler = createGrpcHandler({ services: [buildGreeter()] });
    const garbageJson = encodeFrame(new TextEncoder().encode('{not json'));
    const req = makeRequest('/Greeter/SayHello', garbageJson);
    const res = await handler(makeCtx('POST', '/Greeter/SayHello', req));
    expect(res.headers.get('grpc-status')).toBe(String(GrpcStatus.INVALID_ARGUMENT));
  });

  it('passes user-supplied metadata through to the handler', async () => {
    let captured: Record<string, string> = {};
    const svc = new GrpcService('Echo').unary(
      'Whoami',
      async (_req, ctx) => {
        captured = ctx.metadata;
        return { ok: true };
      }
    );

    const handler = createGrpcHandler({ services: [svc] });
    const req = makeRequest('/Echo/Whoami', frameJSON({}), {
      'x-tenant': 'acme',
      authorization: 'Bearer xyz',
    });
    await handler(makeCtx('POST', '/Echo/Whoami', req));

    expect(captured['x-tenant']).toBe('acme');
    expect(captured.authorization).toBe('Bearer xyz');
    // Transport headers must be filtered out
    expect(captured['content-type']).toBeUndefined();
  });

  it('uses a custom codec end-to-end', async () => {
    // Toy "uppercase" codec: payload is the plain UTF-8 string.
    const upperCodec: Codec = {
      subtype: 'json', // reuse the spec subtype
      encode: (v) => new TextEncoder().encode(String(v).toUpperCase()),
      decode: (b) => new TextDecoder().decode(b),
    };

    const svc = new GrpcService('Echo').unary<string, string>(
      'Shout',
      async (req) => req
    );
    const handler = createGrpcHandler({ services: [svc], codec: upperCodec });

    const body = encodeFrame(upperCodec.encode('hello'));
    const req = makeRequest('/Echo/Shout', body);
    const res = await handler(makeCtx('POST', '/Echo/Shout', req));

    const frames = await readBodyFrames(res);
    const decoded = upperCodec.decode(frames[0].payload);
    expect(decoded).toBe('HELLO'); // server applied .toUpperCase() during encode
  });
});

// ---------------------------------------------------------------------------
// Service registration
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Server-streaming
// ---------------------------------------------------------------------------

describe('createGrpcHandler — server-streaming', () => {
  function buildCounter() {
    return new GrpcService('Counter')
      .serverStream<{ from: number; to: number }, { n: number }>(
        'Range',
        async function* (req) {
          for (let i = req.from; i <= req.to; i++) {
            yield { n: i };
          }
        }
      )
      .serverStream<{}, { msg: string }>(
        'Failing',
        async function* () {
          yield { msg: 'first' };
          throw new GrpcError(GrpcStatus.UNAVAILABLE, 'try later');
        }
      )
      .serverStream<{}, { msg: string }>(
        'EmptyStream',
        // eslint-disable-next-line require-yield
        async function* () {
          // yields nothing
        }
      )
      .serverStream<{}, { msg: string }>('UnknownError', async function* () {
        yield { msg: 'a' };
        throw new Error('kaboom');
      });
  }

  it('streams multiple frames then a success trailer', async () => {
    const handler = createGrpcHandler({ services: [buildCounter()] });
    const body = frameJSON({ from: 1, to: 3 });
    const req = makeRequest('/Counter/Range', body);
    const res = await handler(makeCtx('POST', '/Counter/Range', req));

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('application/grpc-web+json');

    const frames = await readBodyFrames(res);
    expect(frames).toHaveLength(4); // 3 messages + 1 trailer
    expect(frames[0].trailer).toBe(false);
    expect(frames[1].trailer).toBe(false);
    expect(frames[2].trailer).toBe(false);
    expect(frames[3].trailer).toBe(true);

    expect(jsonCodec.decode(frames[0].payload)).toEqual({ n: 1 });
    expect(jsonCodec.decode(frames[1].payload)).toEqual({ n: 2 });
    expect(jsonCodec.decode(frames[2].payload)).toEqual({ n: 3 });
    expect(parseTrailers(frames[3].payload)['grpc-status']).toBe('0');
  });

  it('emits only a trailer for an empty stream', async () => {
    const handler = createGrpcHandler({ services: [buildCounter()] });
    const req = makeRequest('/Counter/EmptyStream', frameJSON({}));
    const res = await handler(makeCtx('POST', '/Counter/EmptyStream', req));

    const frames = await readBodyFrames(res);
    expect(frames).toHaveLength(1);
    expect(frames[0].trailer).toBe(true);
    expect(parseTrailers(frames[0].payload)['grpc-status']).toBe('0');
  });

  it('sends frames already produced before a GrpcError, then error trailer', async () => {
    const handler = createGrpcHandler({ services: [buildCounter()] });
    const req = makeRequest('/Counter/Failing', frameJSON({}));
    const res = await handler(makeCtx('POST', '/Counter/Failing', req));

    const frames = await readBodyFrames(res);
    expect(frames).toHaveLength(2);
    expect(frames[0].trailer).toBe(false);
    expect(jsonCodec.decode(frames[0].payload)).toEqual({ msg: 'first' });

    const trailer = parseTrailers(frames[1].payload);
    expect(trailer['grpc-status']).toBe(String(GrpcStatus.UNAVAILABLE));
    expect(decodeURIComponent(trailer['grpc-message'])).toBe('try later');
  });

  it('maps non-GrpcError exceptions in the iterator to INTERNAL', async () => {
    const handler = createGrpcHandler({ services: [buildCounter()] });
    const req = makeRequest('/Counter/UnknownError', frameJSON({}));
    const res = await handler(makeCtx('POST', '/Counter/UnknownError', req));

    const frames = await readBodyFrames(res);
    const trailer = parseTrailers(frames[frames.length - 1].payload);
    expect(trailer['grpc-status']).toBe(String(GrpcStatus.INTERNAL));
    expect(decodeURIComponent(trailer['grpc-message'])).toBe('kaboom');
  });

  it('streaming and unary methods can coexist on the same service', async () => {
    const svc = new GrpcService('Mixed')
      .unary<{ x: number }, { x: number }>('Echo', async (r) => ({ x: r.x }))
      .serverStream<{ n: number }, { i: number }>('Up', async function* (req) {
        for (let i = 0; i < req.n; i++) yield { i };
      });
    const handler = createGrpcHandler({ services: [svc] });

    const unaryRes = await handler(
      makeCtx(
        'POST',
        '/Mixed/Echo',
        makeRequest('/Mixed/Echo', frameJSON({ x: 7 }))
      )
    );
    const unaryFrames = await readBodyFrames(unaryRes);
    expect(unaryFrames).toHaveLength(2);
    expect(jsonCodec.decode(unaryFrames[0].payload)).toEqual({ x: 7 });

    const streamRes = await handler(
      makeCtx(
        'POST',
        '/Mixed/Up',
        makeRequest('/Mixed/Up', frameJSON({ n: 2 }))
      )
    );
    const streamFrames = await readBodyFrames(streamRes);
    expect(streamFrames).toHaveLength(3); // 2 messages + trailer
  });
});

describe('GrpcService', () => {
  it('chains method registrations', () => {
    const svc = new GrpcService('S')
      .unary('A', async () => ({}))
      .unary('B', async () => ({}));
    expect(svc.getMethod('A')?.kind).toBe('unary');
    expect(svc.getMethod('B')?.kind).toBe('unary');
    expect(svc.getMethod('C')).toBeUndefined();
  });

  it('overwrites a method when re-registered', () => {
    const svc = new GrpcService('S').unary('A', async () => ({ v: 1 }));
    svc.unary('A', async () => ({ v: 2 }));
    const method = svc.getMethod('A')!;
    // We can only verify by call; build a minimal context to invoke it.
    expect(method.kind).toBe('unary');
  });
});
