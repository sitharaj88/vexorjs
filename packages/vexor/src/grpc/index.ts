/**
 * gRPC-Web Adapter
 *
 * Implements the gRPC-Web wire format on top of plain HTTP/1.1+ — usable
 * from browsers, edge runtimes, and any HTTP proxy. The full HTTP/2
 * gRPC variant requires `@grpc/grpc-js` and is out of scope here.
 *
 * Wire format (per https://github.com/grpc/grpc/blob/master/doc/PROTOCOL-WEB.md):
 *
 *   message frame:  byte 0 = flags (bit 7 = trailer)
 *                   bytes 1-4 = big-endian uint32 length
 *                   payload bytes
 *
 *   trailers come as a final frame with the trailer flag set, body is
 *   `key: value\r\n` pairs (ASCII).
 *
 * Codecs: pluggable via the `Codec<T>` interface. Default is JSON, which
 * is non-canonical for gRPC but interoperates with anything that accepts
 * `application/grpc-web+json`. For Protobuf, plug in a codec that wraps
 * your generated `*.pb` types.
 */

// ---------------------------------------------------------------------------
// Status codes (canonical gRPC subset)
// ---------------------------------------------------------------------------

export const GrpcStatus = {
  OK: 0,
  CANCELLED: 1,
  UNKNOWN: 2,
  INVALID_ARGUMENT: 3,
  DEADLINE_EXCEEDED: 4,
  NOT_FOUND: 5,
  ALREADY_EXISTS: 6,
  PERMISSION_DENIED: 7,
  RESOURCE_EXHAUSTED: 8,
  FAILED_PRECONDITION: 9,
  ABORTED: 10,
  OUT_OF_RANGE: 11,
  UNIMPLEMENTED: 12,
  INTERNAL: 13,
  UNAVAILABLE: 14,
  DATA_LOSS: 15,
  UNAUTHENTICATED: 16,
} as const;

export type GrpcStatusCode = (typeof GrpcStatus)[keyof typeof GrpcStatus];

export class GrpcError extends Error {
  constructor(
    public readonly code: GrpcStatusCode,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'GrpcError';
  }
}

// ---------------------------------------------------------------------------
// Codec
// ---------------------------------------------------------------------------

export interface Codec<TIn = unknown, TOut = unknown> {
  /** Mime suffix used in the response Content-Type, e.g. 'json' or 'proto'. */
  readonly subtype: 'proto' | 'json';
  encode(value: TOut): Uint8Array;
  decode(bytes: Uint8Array): TIn;
}

/**
 * JSON codec — encodes/decodes values via JSON. Convenient default; not
 * canonical gRPC but interoperable with `application/grpc-web+json`.
 */
export const jsonCodec: Codec<unknown, unknown> = {
  subtype: 'json',
  encode(value) {
    return new TextEncoder().encode(JSON.stringify(value));
  },
  decode(bytes) {
    if (bytes.length === 0) return undefined;
    return JSON.parse(new TextDecoder().decode(bytes));
  },
};

// ---------------------------------------------------------------------------
// Frame parsing / encoding
// ---------------------------------------------------------------------------

const TRAILER_FLAG = 0x80;

export interface GrpcFrame {
  trailer: boolean;
  payload: Uint8Array;
}

/**
 * Parse a sequence of length-prefixed frames from a buffer. Throws if
 * the buffer is malformed (truncated header or truncated payload).
 */
export function parseFrames(buffer: Uint8Array): GrpcFrame[] {
  const frames: GrpcFrame[] = [];
  let offset = 0;

  while (offset < buffer.length) {
    if (offset + 5 > buffer.length) {
      throw new GrpcError(
        GrpcStatus.INVALID_ARGUMENT,
        'Truncated gRPC-Web frame header'
      );
    }
    const flags = buffer[offset];
    const length =
      (buffer[offset + 1] << 24) |
      (buffer[offset + 2] << 16) |
      (buffer[offset + 3] << 8) |
      buffer[offset + 4];

    offset += 5;

    if (offset + length > buffer.length) {
      throw new GrpcError(
        GrpcStatus.INVALID_ARGUMENT,
        'Truncated gRPC-Web frame payload'
      );
    }

    frames.push({
      trailer: (flags & TRAILER_FLAG) !== 0,
      payload: buffer.subarray(offset, offset + length),
    });

    offset += length;
  }

  return frames;
}

/**
 * Encode a single frame.
 */
export function encodeFrame(payload: Uint8Array, trailer = false): Uint8Array {
  const frame = new Uint8Array(5 + payload.length);
  frame[0] = trailer ? TRAILER_FLAG : 0;
  const len = payload.length;
  frame[1] = (len >>> 24) & 0xff;
  frame[2] = (len >>> 16) & 0xff;
  frame[3] = (len >>> 8) & 0xff;
  frame[4] = len & 0xff;
  frame.set(payload, 5);
  return frame;
}

/**
 * Build the trailer frame body — ASCII `key: value\r\n` pairs.
 */
export function encodeTrailers(trailers: Record<string, string>): Uint8Array {
  const lines: string[] = [];
  for (const [k, v] of Object.entries(trailers)) {
    lines.push(`${k.toLowerCase()}: ${v}`);
  }
  return new TextEncoder().encode(lines.join('\r\n') + '\r\n');
}

/**
 * Parse a trailers frame body back into a key/value record.
 */
export function parseTrailers(payload: Uint8Array): Record<string, string> {
  const result: Record<string, string> = {};
  const text = new TextDecoder().decode(payload);
  for (const line of text.split('\r\n')) {
    if (!line) continue;
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    const k = line.slice(0, idx).trim().toLowerCase();
    const v = line.slice(idx + 1).trim();
    result[k] = v;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Service registry + handler
// ---------------------------------------------------------------------------

/**
 * Unary handler — single request, single response.
 */
export type UnaryHandler<TReq = unknown, TRes = unknown> = (
  request: TReq,
  context: GrpcContext
) => Promise<TRes> | TRes;

/**
 * Server-streaming handler — single request, async iterable of responses.
 * Each yielded value becomes one message frame; the response ends with the
 * trailer frame containing `grpc-status: 0` (or the error status if the
 * iterator throws).
 */
export type ServerStreamHandler<TReq = unknown, TRes = unknown> = (
  request: TReq,
  context: GrpcContext
) => AsyncIterable<TRes>;

export type ServiceMethod<TReq = unknown, TRes = unknown> =
  | { kind: 'unary'; handler: UnaryHandler<TReq, TRes> }
  | { kind: 'serverStream'; handler: ServerStreamHandler<TReq, TRes> };

export interface GrpcContext {
  /** Request URL path (`/<service>/<method>`). */
  path: string;
  /** Caller's metadata (HTTP headers minus the gRPC framing ones). */
  metadata: Record<string, string>;
}

export class GrpcService {
  private methods = new Map<string, ServiceMethod>();

  constructor(public readonly name: string) {}

  /**
   * Register a unary RPC method on this service.
   */
  unary<TReq, TRes>(method: string, handler: UnaryHandler<TReq, TRes>): this {
    this.methods.set(method, {
      kind: 'unary',
      handler: handler as UnaryHandler,
    });
    return this;
  }

  /**
   * Register a server-streaming RPC method. The handler returns an
   * AsyncIterable; each yielded value is sent as a separate message frame.
   */
  serverStream<TReq, TRes>(
    method: string,
    handler: ServerStreamHandler<TReq, TRes>
  ): this {
    this.methods.set(method, {
      kind: 'serverStream',
      handler: handler as ServerStreamHandler,
    });
    return this;
  }

  getMethod(method: string): ServiceMethod | undefined {
    return this.methods.get(method);
  }
}

// ---------------------------------------------------------------------------
// HTTP handler
// ---------------------------------------------------------------------------

export interface GrpcHTTPContext {
  method: string;
  path: string;
  request: Request;
}

export interface CreateGrpcHandlerOptions {
  /** Service definitions keyed by service name. */
  services: GrpcService[];
  /** Codec used for request/response payloads. Defaults to JSON. */
  codec?: Codec;
}

export type GrpcHandler = (ctx: GrpcHTTPContext) => Promise<Response>;

/**
 * Build a gRPC-Web HTTP handler.
 *
 *   const greeter = new GrpcService('Greeter')
 *     .unary('SayHello', async ({ name }) => ({ message: `hi ${name}` }));
 *
 *   const handler = createGrpcHandler({ services: [greeter] });
 *   app.post('/Greeter/:method', handler);
 */
export function createGrpcHandler(
  options: CreateGrpcHandlerOptions
): GrpcHandler {
  const codec = options.codec ?? jsonCodec;
  const services = new Map<string, GrpcService>();
  for (const s of options.services) services.set(s.name, s);

  const contentType = `application/grpc-web+${codec.subtype}`;

  return async (ctx: GrpcHTTPContext): Promise<Response> => {
    if (ctx.method.toUpperCase() !== 'POST') {
      return errorResponse(
        codec,
        contentType,
        GrpcStatus.UNIMPLEMENTED,
        'Only POST is allowed for gRPC-Web'
      );
    }

    const { service, method } = parsePath(ctx.path);
    if (!service || !method) {
      return errorResponse(
        codec,
        contentType,
        GrpcStatus.NOT_FOUND,
        `Invalid gRPC path: ${ctx.path}`
      );
    }

    const svc = services.get(service);
    if (!svc) {
      return errorResponse(
        codec,
        contentType,
        GrpcStatus.UNIMPLEMENTED,
        `Unknown service: ${service}`
      );
    }

    const m = svc.getMethod(method);
    if (!m) {
      return errorResponse(
        codec,
        contentType,
        GrpcStatus.UNIMPLEMENTED,
        `Unknown method: ${service}/${method}`
      );
    }

    let buffer: ArrayBuffer;
    try {
      buffer = await ctx.request.arrayBuffer();
    } catch (err) {
      return errorResponse(
        codec,
        contentType,
        GrpcStatus.INTERNAL,
        `Failed to read request body: ${(err as Error).message}`
      );
    }

    let frames: GrpcFrame[];
    try {
      frames = parseFrames(new Uint8Array(buffer));
    } catch (err) {
      const e = err as GrpcError;
      return errorResponse(
        codec,
        contentType,
        e.code ?? GrpcStatus.INVALID_ARGUMENT,
        e.message
      );
    }

    const messageFrames = frames.filter((f) => !f.trailer);
    if (messageFrames.length === 0) {
      return errorResponse(
        codec,
        contentType,
        GrpcStatus.INVALID_ARGUMENT,
        'No message frame in request'
      );
    }
    if (messageFrames.length > 1) {
      return errorResponse(
        codec,
        contentType,
        GrpcStatus.INVALID_ARGUMENT,
        'Unary call received multiple request messages'
      );
    }

    let request: unknown;
    try {
      request = codec.decode(messageFrames[0].payload);
    } catch (err) {
      return errorResponse(
        codec,
        contentType,
        GrpcStatus.INVALID_ARGUMENT,
        `Codec decode failed: ${(err as Error).message}`
      );
    }

    const grpcContext: GrpcContext = {
      path: ctx.path,
      metadata: extractMetadata(ctx.request.headers),
    };

    if (m.kind === 'unary') {
      let response: unknown;
      try {
        response = await m.handler(request, grpcContext);
      } catch (err) {
        if (err instanceof GrpcError) {
          return errorResponse(codec, contentType, err.code, err.message);
        }
        return errorResponse(
          codec,
          contentType,
          GrpcStatus.INTERNAL,
          (err as Error).message
        );
      }

      const messagePayload = codec.encode(response);
      const messageFrame = encodeFrame(messagePayload);
      const trailerFrame = encodeFrame(
        encodeTrailers({ 'grpc-status': '0' }),
        true
      );

      const body = new Uint8Array(messageFrame.length + trailerFrame.length);
      body.set(messageFrame, 0);
      body.set(trailerFrame, messageFrame.length);

      return new Response(body as BodyInit, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'grpc-status': '0',
        },
      });
    }

    // Server-streaming: stream response frames + close with trailer.
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          const iterator = m.handler(request, grpcContext);
          for await (const value of iterator) {
            controller.enqueue(encodeFrame(codec.encode(value)));
          }
          controller.enqueue(
            encodeFrame(encodeTrailers({ 'grpc-status': '0' }), true)
          );
        } catch (err) {
          const code =
            err instanceof GrpcError ? err.code : GrpcStatus.INTERNAL;
          const message =
            err instanceof GrpcError ? err.message : (err as Error).message;
          controller.enqueue(
            encodeFrame(
              encodeTrailers({
                'grpc-status': String(code),
                'grpc-message': encodeURIComponent(message),
              }),
              true
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'grpc-status': '0',
      },
    });
  };
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function parsePath(path: string): { service: string; method: string } {
  // Accept `/Service/Method` and ignore any prefix. Used by route handlers
  // mounted at e.g. `/grpc/Service/Method` or directly at root.
  const segments = path.split('/').filter(Boolean);
  if (segments.length < 2) return { service: '', method: '' };
  return {
    service: segments[segments.length - 2],
    method: segments[segments.length - 1],
  };
}

function extractMetadata(headers: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    // Skip transport-level headers; expose user metadata.
    if (
      lower === 'content-type' ||
      lower === 'content-length' ||
      lower === 'host' ||
      lower === 'connection' ||
      lower.startsWith('grpc-')
    ) {
      return;
    }
    out[lower] = value;
  });
  return out;
}

function errorResponse(
  _codec: Codec,
  contentType: string,
  code: GrpcStatusCode,
  message: string
): Response {
  // Per gRPC-Web spec, errors can come back as headers-only with grpc-status,
  // or as a trailer-only response. We emit a trailer-only body for clarity.
  const trailer = encodeFrame(
    encodeTrailers({
      'grpc-status': String(code),
      'grpc-message': encodeURIComponent(message),
    }),
    true
  );

  return new Response(trailer as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'grpc-status': String(code),
      'grpc-message': encodeURIComponent(message),
    },
  });
}
