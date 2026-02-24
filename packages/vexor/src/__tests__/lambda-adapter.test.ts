/**
 * AWS Lambda Adapter Tests
 */

import { describe, it, expect, vi } from 'vitest';
import {
  createLambdaHandler,
  createLambdaHandlerWithWarmup,
  isWarmupEvent,
} from '../adapters/lambda.js';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyEventV2,
  LambdaFunctionUrlEvent,
  ALBEvent,
  LambdaContext,
  APIGatewayProxyResult,
  APIGatewayProxyResultV2,
  ALBResult,
} from '../adapters/lambda.js';
import type { Vexor } from '../core/app.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockLambdaContext(overrides: Partial<LambdaContext> = {}): LambdaContext {
  return {
    functionName: 'test-function',
    functionVersion: '$LATEST',
    invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789:function:test',
    memoryLimitInMB: '128',
    awsRequestId: 'request-id-123',
    logGroupName: '/aws/lambda/test',
    logStreamName: '2024/01/01/[$LATEST]abc123',
    getRemainingTimeInMillis: () => 30000,
    ...overrides,
  };
}

function createMockApp(
  responseBody = 'ok',
  responseInit: ResponseInit = {}
): Vexor {
  return {
    fetch: vi.fn(async (_request: Request) => {
      return new Response(responseBody, {
        status: 200,
        ...responseInit,
      });
    }),
  } as unknown as Vexor;
}

function createV1Event(overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent {
  return {
    resource: '/test',
    path: '/test',
    httpMethod: 'GET',
    headers: { host: 'api.example.com' },
    multiValueHeaders: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    pathParameters: null,
    stageVariables: null,
    requestContext: {
      accountId: '123456789',
      apiId: 'abc123',
      domainName: 'api.example.com',
      domainPrefix: 'api',
      extendedRequestId: 'ext-123',
      httpMethod: 'GET',
      identity: {
        sourceIp: '1.2.3.4',
        userAgent: 'test-agent',
      },
      path: '/test',
      protocol: 'HTTP/1.1',
      requestId: 'req-123',
      requestTime: '01/Jan/2024:00:00:00 +0000',
      requestTimeEpoch: 1704067200000,
      resourceId: 'res-123',
      resourcePath: '/test',
      stage: 'prod',
    },
    body: null,
    isBase64Encoded: false,
    ...overrides,
  };
}

function createV2Event(overrides: Partial<APIGatewayProxyEventV2> = {}): APIGatewayProxyEventV2 {
  return {
    version: '2.0',
    routeKey: 'GET /test',
    rawPath: '/test',
    rawQueryString: '',
    headers: { host: 'api.example.com' },
    requestContext: {
      accountId: '123456789',
      apiId: 'abc123',
      authorizer: undefined,
      domainName: 'api.example.com',
      domainPrefix: 'api',
      http: {
        method: 'GET',
        path: '/test',
        protocol: 'HTTP/1.1',
        sourceIp: '1.2.3.4',
        userAgent: 'test-agent',
      },
      requestId: 'req-123',
      routeKey: 'GET /test',
      stage: 'prod',
      time: '01/Jan/2024:00:00:00 +0000',
      timeEpoch: 1704067200000,
    },
    isBase64Encoded: false,
    ...overrides,
  };
}

function createFunctionUrlEvent(overrides: Partial<LambdaFunctionUrlEvent> = {}): LambdaFunctionUrlEvent {
  return {
    version: '2.0',
    routeKey: '$default',
    rawPath: '/test',
    rawQueryString: '',
    headers: { host: 'abc123.lambda-url.us-east-1.on.aws' },
    requestContext: {
      accountId: '123456789',
      apiId: 'abc123',
      domainName: 'abc123.lambda-url.us-east-1.on.aws',
      domainPrefix: 'abc123',
      http: {
        method: 'GET',
        path: '/test',
        protocol: 'HTTP/1.1',
        sourceIp: '1.2.3.4',
        userAgent: 'test-agent',
      },
      requestId: 'req-123',
      routeKey: '$default',
      stage: '$default',
      time: '01/Jan/2024:00:00:00 +0000',
      timeEpoch: 1704067200000,
    },
    isBase64Encoded: false,
    ...overrides,
  };
}

function createALBEvent(overrides: Partial<ALBEvent> = {}): ALBEvent {
  return {
    requestContext: {
      elb: {
        targetGroupArn: 'arn:aws:elasticloadbalancing:us-east-1:123456789:targetgroup/test/abc',
      },
    },
    httpMethod: 'GET',
    path: '/test',
    headers: { host: 'alb.example.com' },
    isBase64Encoded: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Lambda Adapter', () => {
  // -----------------------------------------------------------------------
  // isWarmupEvent
  // -----------------------------------------------------------------------
  describe('isWarmupEvent', () => {
    it('should detect CloudWatch scheduled event', () => {
      expect(isWarmupEvent({ source: 'aws.events' })).toBe(true);
    });

    it('should detect custom warmup payload', () => {
      expect(isWarmupEvent({ warmup: true })).toBe(true);
    });

    it('should detect ping payload', () => {
      expect(isWarmupEvent({ ping: true })).toBe(true);
    });

    it('should return false for normal events', () => {
      expect(isWarmupEvent(createV1Event())).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(isWarmupEvent(null)).toBe(false);
      expect(isWarmupEvent(undefined)).toBe(false);
    });

    it('should return false for non-object values', () => {
      expect(isWarmupEvent('string')).toBe(false);
      expect(isWarmupEvent(42)).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // createLambdaHandler – API Gateway v1
  // -----------------------------------------------------------------------
  describe('createLambdaHandler (API Gateway v1)', () => {
    it('should convert v1 event to Request and return result', async () => {
      const app = createMockApp('hello v1');
      const handler = createLambdaHandler(app);
      const ctx = createMockLambdaContext();

      const result = await handler(createV1Event(), ctx);

      expect(result.statusCode).toBe(200);
      expect((result as APIGatewayProxyResult).body).toBe('hello v1');
    });

    it('should forward query string parameters', async () => {
      let capturedUrl = '';
      const app = {
        fetch: vi.fn(async (req: Request) => {
          capturedUrl = req.url;
          return new Response('ok');
        }),
      } as unknown as Vexor;

      const handler = createLambdaHandler(app);
      const event = createV1Event({
        queryStringParameters: { foo: 'bar', baz: '123' },
      });

      await handler(event, createMockLambdaContext());
      expect(capturedUrl).toContain('foo=bar');
      expect(capturedUrl).toContain('baz=123');
    });

    it('should forward multi-value query string parameters', async () => {
      let capturedUrl = '';
      const app = {
        fetch: vi.fn(async (req: Request) => {
          capturedUrl = req.url;
          return new Response('ok');
        }),
      } as unknown as Vexor;

      const handler = createLambdaHandler(app);
      const event = createV1Event({
        multiValueQueryStringParameters: { tag: ['a', 'b'] },
      });

      await handler(event, createMockLambdaContext());
      expect(capturedUrl).toContain('tag=a');
      expect(capturedUrl).toContain('tag=b');
    });

    it('should handle multi-value headers', async () => {
      let capturedHeaders: Headers | undefined;
      const app = {
        fetch: vi.fn(async (req: Request) => {
          capturedHeaders = req.headers;
          return new Response('ok');
        }),
      } as unknown as Vexor;

      const handler = createLambdaHandler(app);
      const event = createV1Event({
        headers: null,
        multiValueHeaders: {
          'accept': ['text/html', 'application/json'],
        },
      });

      await handler(event, createMockLambdaContext());
      const accept = capturedHeaders!.get('accept');
      expect(accept).toContain('text/html');
      expect(accept).toContain('application/json');
    });

    it('should decode base64 body', async () => {
      let capturedBody = '';
      const app = {
        fetch: vi.fn(async (req: Request) => {
          capturedBody = await req.text();
          return new Response('ok');
        }),
      } as unknown as Vexor;

      const handler = createLambdaHandler(app);
      const event = createV1Event({
        httpMethod: 'POST',
        body: Buffer.from('encoded body').toString('base64'),
        isBase64Encoded: true,
      });

      await handler(event, createMockLambdaContext());
      expect(capturedBody).toBe('encoded body');
    });

    it('should strip basePath from URL', async () => {
      let capturedUrl = '';
      const app = {
        fetch: vi.fn(async (req: Request) => {
          capturedUrl = req.url;
          return new Response('ok');
        }),
      } as unknown as Vexor;

      const handler = createLambdaHandler(app, { basePath: '/prod' });
      const event = createV1Event({ path: '/prod/users' });

      await handler(event, createMockLambdaContext());
      const url = new URL(capturedUrl);
      expect(url.pathname).toBe('/users');
    });

    it('should include request context headers by default', async () => {
      let capturedHeaders: Headers | undefined;
      const app = {
        fetch: vi.fn(async (req: Request) => {
          capturedHeaders = req.headers;
          return new Response('ok');
        }),
      } as unknown as Vexor;

      const handler = createLambdaHandler(app);
      await handler(createV1Event(), createMockLambdaContext({ awsRequestId: 'req-abc' }));

      expect(capturedHeaders!.get('x-amzn-requestid')).toBe('req-abc');
      expect(capturedHeaders!.get('x-amzn-function-name')).toBe('test-function');
    });

    it('should not include request context when disabled', async () => {
      let capturedHeaders: Headers | undefined;
      const app = {
        fetch: vi.fn(async (req: Request) => {
          capturedHeaders = req.headers;
          return new Response('ok');
        }),
      } as unknown as Vexor;

      const handler = createLambdaHandler(app, { includeRequestContext: false });
      await handler(createV1Event(), createMockLambdaContext());

      expect(capturedHeaders!.get('x-amzn-requestid')).toBeNull();
    });

    it('should set x-forwarded-for from source IP', async () => {
      let capturedHeaders: Headers | undefined;
      const app = {
        fetch: vi.fn(async (req: Request) => {
          capturedHeaders = req.headers;
          return new Response('ok');
        }),
      } as unknown as Vexor;

      const handler = createLambdaHandler(app);
      await handler(createV1Event(), createMockLambdaContext());

      expect(capturedHeaders!.get('x-forwarded-for')).toBe('1.2.3.4');
    });

    it('should produce v1 result with multiValueHeaders', async () => {
      const app = createMockApp('ok', {
        headers: { 'x-test': 'value' },
      });
      const handler = createLambdaHandler(app);
      const result = (await handler(
        createV1Event(),
        createMockLambdaContext()
      )) as APIGatewayProxyResult;

      expect(result.headers).toBeDefined();
      expect(result.multiValueHeaders).toBeDefined();
    });
  });

  // -----------------------------------------------------------------------
  // createLambdaHandler – API Gateway v2
  // -----------------------------------------------------------------------
  describe('createLambdaHandler (API Gateway v2)', () => {
    it('should convert v2 event to Request and return result', async () => {
      const app = createMockApp('hello v2');
      const handler = createLambdaHandler(app);

      const result = await handler(createV2Event(), createMockLambdaContext());

      expect(result.statusCode).toBe(200);
      expect((result as APIGatewayProxyResultV2).body).toBe('hello v2');
    });

    it('should forward rawQueryString', async () => {
      let capturedUrl = '';
      const app = {
        fetch: vi.fn(async (req: Request) => {
          capturedUrl = req.url;
          return new Response('ok');
        }),
      } as unknown as Vexor;

      const handler = createLambdaHandler(app);
      const event = createV2Event({ rawQueryString: 'foo=bar&baz=qux' });

      await handler(event, createMockLambdaContext());
      expect(capturedUrl).toContain('?foo=bar&baz=qux');
    });

    it('should convert cookies to cookie header', async () => {
      let capturedHeaders: Headers | undefined;
      const app = {
        fetch: vi.fn(async (req: Request) => {
          capturedHeaders = req.headers;
          return new Response('ok');
        }),
      } as unknown as Vexor;

      const handler = createLambdaHandler(app);
      const event = createV2Event({ cookies: ['session=abc', 'theme=dark'] });

      await handler(event, createMockLambdaContext());
      expect(capturedHeaders!.get('cookie')).toBe('session=abc; theme=dark');
    });

    it('should extract set-cookie into v2 cookies array', async () => {
      const app = {
        fetch: vi.fn(async () => {
          const headers = new Headers();
          headers.append('set-cookie', 'a=1; Path=/');
          headers.append('content-type', 'text/plain');
          return new Response('ok', { headers });
        }),
      } as unknown as Vexor;

      const handler = createLambdaHandler(app);
      const result = (await handler(
        createV2Event(),
        createMockLambdaContext()
      )) as APIGatewayProxyResultV2;

      // set-cookie should not appear in headers (moved to cookies)
      expect(result.headers!['set-cookie']).toBeUndefined();
    });

    it('should handle POST with text body', async () => {
      let capturedBody = '';
      const app = {
        fetch: vi.fn(async (req: Request) => {
          capturedBody = await req.text();
          return new Response('ok');
        }),
      } as unknown as Vexor;

      const handler = createLambdaHandler(app);
      const event = createV2Event({
        routeKey: 'POST /test',
        body: '{"key":"value"}',
        requestContext: {
          ...createV2Event().requestContext,
          http: { ...createV2Event().requestContext.http, method: 'POST' },
        },
      });

      await handler(event, createMockLambdaContext());
      expect(capturedBody).toBe('{"key":"value"}');
    });
  });

  // -----------------------------------------------------------------------
  // createLambdaHandler – Lambda Function URL
  // -----------------------------------------------------------------------
  describe('createLambdaHandler (Function URL)', () => {
    it('should convert function URL event to Request', async () => {
      let capturedUrl = '';
      const app = {
        fetch: vi.fn(async (req: Request) => {
          capturedUrl = req.url;
          return new Response('ok');
        }),
      } as unknown as Vexor;

      const handler = createLambdaHandler(app);
      await handler(createFunctionUrlEvent(), createMockLambdaContext());

      expect(capturedUrl).toContain('abc123.lambda-url.us-east-1.on.aws');
      expect(capturedUrl).toContain('/test');
    });

    it('should produce v2-format result for function URL events', async () => {
      const app = createMockApp('function url response');
      const handler = createLambdaHandler(app);

      const result = (await handler(
        createFunctionUrlEvent(),
        createMockLambdaContext()
      )) as APIGatewayProxyResultV2;

      expect(result.statusCode).toBe(200);
      expect(result.body).toBe('function url response');
    });
  });

  // -----------------------------------------------------------------------
  // createLambdaHandler – ALB
  // -----------------------------------------------------------------------
  describe('createLambdaHandler (ALB)', () => {
    it('should convert ALB event to Request', async () => {
      let capturedUrl = '';
      const app = {
        fetch: vi.fn(async (req: Request) => {
          capturedUrl = req.url;
          return new Response('ok');
        }),
      } as unknown as Vexor;

      const handler = createLambdaHandler(app);
      await handler(createALBEvent(), createMockLambdaContext());

      expect(capturedUrl).toContain('alb.example.com');
      expect(capturedUrl).toContain('/test');
    });

    it('should include statusDescription in ALB result', async () => {
      const app = createMockApp('alb ok', { status: 201, statusText: 'Created' });
      const handler = createLambdaHandler(app);

      const result = (await handler(
        createALBEvent(),
        createMockLambdaContext()
      )) as ALBResult;

      expect(result.statusCode).toBe(201);
      expect(result.statusDescription).toBe('201 Created');
    });

    it('should handle ALB query string parameters', async () => {
      let capturedUrl = '';
      const app = {
        fetch: vi.fn(async (req: Request) => {
          capturedUrl = req.url;
          return new Response('ok');
        }),
      } as unknown as Vexor;

      const handler = createLambdaHandler(app);
      const event = createALBEvent({
        queryStringParameters: { page: '1', limit: '10' },
      });

      await handler(event, createMockLambdaContext());
      expect(capturedUrl).toContain('page=1');
      expect(capturedUrl).toContain('limit=10');
    });

    it('should use localhost when ALB event has no host header', async () => {
      let capturedUrl = '';
      const app = {
        fetch: vi.fn(async (req: Request) => {
          capturedUrl = req.url;
          return new Response('ok');
        }),
      } as unknown as Vexor;

      const handler = createLambdaHandler(app);
      const event = createALBEvent({ headers: undefined });

      await handler(event, createMockLambdaContext());
      expect(capturedUrl).toContain('localhost');
    });

    it('should decode base64 body for ALB POST', async () => {
      let capturedBody = '';
      const app = {
        fetch: vi.fn(async (req: Request) => {
          capturedBody = await req.text();
          return new Response('ok');
        }),
      } as unknown as Vexor;

      const handler = createLambdaHandler(app);
      const event = createALBEvent({
        httpMethod: 'POST',
        body: Buffer.from('alb body').toString('base64'),
        isBase64Encoded: true,
      });

      await handler(event, createMockLambdaContext());
      expect(capturedBody).toBe('alb body');
    });
  });

  // -----------------------------------------------------------------------
  // Response conversion
  // -----------------------------------------------------------------------
  describe('response conversion', () => {
    it('should preserve status code', async () => {
      const app = createMockApp('', { status: 404 });
      const handler = createLambdaHandler(app);

      const result = await handler(createV1Event(), createMockLambdaContext());
      expect(result.statusCode).toBe(404);
    });

    it('should apply transformResponse option', async () => {
      const app = createMockApp('original');
      const handler = createLambdaHandler(app, {
        transformResponse: async (response) => {
          const body = await response.text();
          return new Response(body + ' transformed', {
            status: response.status,
            headers: response.headers,
          });
        },
      });

      const result = (await handler(
        createV1Event(),
        createMockLambdaContext()
      )) as APIGatewayProxyResult;

      expect(result.body).toBe('original transformed');
    });
  });

  // -----------------------------------------------------------------------
  // createLambdaHandlerWithWarmup
  // -----------------------------------------------------------------------
  describe('createLambdaHandlerWithWarmup', () => {
    it('should handle warmup event and return 200', async () => {
      const app = createMockApp();
      const handler = createLambdaHandlerWithWarmup(app);

      const result = await handler(
        { source: 'aws.events' },
        createMockLambdaContext()
      );

      expect(result).toEqual({ statusCode: 200 });
      expect(app.fetch).not.toHaveBeenCalled();
    });

    it('should call onWarmup callback when provided', async () => {
      const onWarmup = vi.fn(async () => {});
      const app = createMockApp();
      const handler = createLambdaHandlerWithWarmup(app, { onWarmup });

      await handler({ warmup: true }, createMockLambdaContext());

      expect(onWarmup).toHaveBeenCalledOnce();
    });

    it('should pass through normal events to handler', async () => {
      const app = createMockApp('normal response');
      const handler = createLambdaHandlerWithWarmup(app);

      const result = await handler(
        createV1Event(),
        createMockLambdaContext()
      );

      expect(result.statusCode).toBe(200);
      expect((result as APIGatewayProxyResult).body).toBe('normal response');
    });
  });
});
