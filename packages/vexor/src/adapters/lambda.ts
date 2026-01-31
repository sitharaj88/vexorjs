/**
 * AWS Lambda Adapter for Vexor
 *
 * Enables Vexor applications to run on AWS Lambda with:
 * - API Gateway v1 (REST API)
 * - API Gateway v2 (HTTP API)
 * - Lambda Function URLs
 * - Application Load Balancer (ALB)
 */

import type { Vexor } from '../core/app.js';

// ============================================================================
// Types
// ============================================================================

// API Gateway v1 (REST API) Event
export interface APIGatewayProxyEvent {
  resource: string;
  path: string;
  httpMethod: string;
  headers: Record<string, string> | null;
  multiValueHeaders: Record<string, string[]> | null;
  queryStringParameters: Record<string, string> | null;
  multiValueQueryStringParameters: Record<string, string[]> | null;
  pathParameters: Record<string, string> | null;
  stageVariables: Record<string, string> | null;
  requestContext: {
    accountId: string;
    apiId: string;
    authorizer?: Record<string, unknown>;
    domainName: string;
    domainPrefix: string;
    extendedRequestId: string;
    httpMethod: string;
    identity: {
      sourceIp: string;
      userAgent: string;
      [key: string]: unknown;
    };
    path: string;
    protocol: string;
    requestId: string;
    requestTime: string;
    requestTimeEpoch: number;
    resourceId: string;
    resourcePath: string;
    stage: string;
  };
  body: string | null;
  isBase64Encoded: boolean;
}

export interface APIGatewayProxyResult {
  statusCode: number;
  headers?: Record<string, string>;
  multiValueHeaders?: Record<string, string[]>;
  body: string;
  isBase64Encoded?: boolean;
}

// API Gateway v2 (HTTP API) Event
export interface APIGatewayProxyEventV2 {
  version: '2.0';
  routeKey: string;
  rawPath: string;
  rawQueryString: string;
  cookies?: string[];
  headers: Record<string, string>;
  queryStringParameters?: Record<string, string>;
  requestContext: {
    accountId: string;
    apiId: string;
    authorizer?: {
      jwt?: {
        claims: Record<string, string>;
        scopes: string[];
      };
      lambda?: Record<string, unknown>;
      iam?: Record<string, unknown>;
    };
    domainName: string;
    domainPrefix: string;
    http: {
      method: string;
      path: string;
      protocol: string;
      sourceIp: string;
      userAgent: string;
    };
    requestId: string;
    routeKey: string;
    stage: string;
    time: string;
    timeEpoch: number;
  };
  body?: string;
  pathParameters?: Record<string, string>;
  isBase64Encoded: boolean;
  stageVariables?: Record<string, string>;
}

export interface APIGatewayProxyResultV2 {
  statusCode: number;
  headers?: Record<string, string>;
  cookies?: string[];
  body?: string;
  isBase64Encoded?: boolean;
}

// Lambda Function URL Event
export interface LambdaFunctionUrlEvent {
  version: '2.0';
  routeKey: '$default';
  rawPath: string;
  rawQueryString: string;
  cookies?: string[];
  headers: Record<string, string>;
  queryStringParameters?: Record<string, string>;
  requestContext: {
    accountId: string;
    apiId: string;
    domainName: string;
    domainPrefix: string;
    http: {
      method: string;
      path: string;
      protocol: string;
      sourceIp: string;
      userAgent: string;
    };
    requestId: string;
    routeKey: '$default';
    stage: '$default';
    time: string;
    timeEpoch: number;
  };
  body?: string;
  isBase64Encoded: boolean;
}

// ALB Event
export interface ALBEvent {
  requestContext: {
    elb: {
      targetGroupArn: string;
    };
  };
  httpMethod: string;
  path: string;
  queryStringParameters?: Record<string, string>;
  headers?: Record<string, string>;
  body?: string | null;
  isBase64Encoded: boolean;
}

export interface ALBResult {
  statusCode: number;
  statusDescription?: string;
  headers?: Record<string, string>;
  body: string;
  isBase64Encoded?: boolean;
}

// Lambda Context
export interface LambdaContext {
  functionName: string;
  functionVersion: string;
  invokedFunctionArn: string;
  memoryLimitInMB: string;
  awsRequestId: string;
  logGroupName: string;
  logStreamName: string;
  identity?: {
    cognitoIdentityId: string;
    cognitoIdentityPoolId: string;
  };
  clientContext?: {
    client: {
      installationId: string;
      appTitle: string;
      appVersionName: string;
      appVersionCode: string;
      appPackageName: string;
    };
    env: {
      platformVersion: string;
      platform: string;
      make: string;
      model: string;
      locale: string;
    };
  };
  getRemainingTimeInMillis(): number;
}

// Unified event type
export type LambdaEvent =
  | APIGatewayProxyEvent
  | APIGatewayProxyEventV2
  | LambdaFunctionUrlEvent
  | ALBEvent;

export type LambdaResult =
  | APIGatewayProxyResult
  | APIGatewayProxyResultV2
  | ALBResult;

export type LambdaHandler = (
  event: LambdaEvent,
  context: LambdaContext
) => Promise<LambdaResult>;

export interface LambdaAdapterOptions {
  /**
   * Base path to strip from incoming requests
   * Useful when deploying behind API Gateway with a stage
   */
  basePath?: string;

  /**
   * Binary media types that should be base64 encoded
   */
  binaryMediaTypes?: string[];

  /**
   * Whether to include request context in VexorContext
   */
  includeRequestContext?: boolean;

  /**
   * Custom response transformer
   */
  transformResponse?: (response: Response) => Promise<Response>;
}

// ============================================================================
// Event Detection
// ============================================================================

function isAPIGatewayV1Event(event: LambdaEvent): event is APIGatewayProxyEvent {
  return 'resource' in event && 'httpMethod' in event && !('version' in event);
}

function isAPIGatewayV2Event(event: LambdaEvent): event is APIGatewayProxyEventV2 {
  return 'version' in event && event.version === '2.0' && 'routeKey' in event;
}

function isLambdaFunctionUrlEvent(event: LambdaEvent): event is LambdaFunctionUrlEvent {
  return (
    'version' in event &&
    event.version === '2.0' &&
    'routeKey' in event &&
    event.routeKey === '$default'
  );
}

function isALBEvent(event: LambdaEvent): event is ALBEvent {
  return 'requestContext' in event && 'elb' in (event.requestContext as any);
}

// ============================================================================
// Request Conversion
// ============================================================================

function convertV1EventToRequest(
  event: APIGatewayProxyEvent,
  options: LambdaAdapterOptions
): Request {
  const headers = new Headers();

  // Handle multi-value headers first, then single-value
  if (event.multiValueHeaders) {
    for (const [key, values] of Object.entries(event.multiValueHeaders)) {
      for (const value of values) {
        headers.append(key.toLowerCase(), value);
      }
    }
  } else if (event.headers) {
    for (const [key, value] of Object.entries(event.headers)) {
      headers.set(key.toLowerCase(), value);
    }
  }

  // Build URL
  let path = event.path;
  if (options.basePath && path.startsWith(options.basePath)) {
    path = path.slice(options.basePath.length) || '/';
  }

  let url = `https://${event.requestContext.domainName}${path}`;

  // Add query string
  if (event.multiValueQueryStringParameters) {
    const params = new URLSearchParams();
    for (const [key, values] of Object.entries(event.multiValueQueryStringParameters)) {
      for (const value of values) {
        params.append(key, value);
      }
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  } else if (event.queryStringParameters) {
    const qs = new URLSearchParams(event.queryStringParameters).toString();
    if (qs) url += `?${qs}`;
  }

  // Add client IP header
  headers.set('x-forwarded-for', event.requestContext.identity.sourceIp);

  // Convert body
  let body: BodyInit | null = null;
  if (event.body) {
    body = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64')
      : event.body;
  }

  return new Request(url, {
    method: event.httpMethod,
    headers,
    body: ['GET', 'HEAD'].includes(event.httpMethod) ? null : body,
  });
}

function convertV2EventToRequest(
  event: APIGatewayProxyEventV2 | LambdaFunctionUrlEvent,
  options: LambdaAdapterOptions
): Request {
  const headers = new Headers();

  for (const [key, value] of Object.entries(event.headers)) {
    headers.set(key.toLowerCase(), value);
  }

  // Handle cookies
  if (event.cookies) {
    headers.set('cookie', event.cookies.join('; '));
  }

  // Build URL
  let path = event.rawPath;
  if (options.basePath && path.startsWith(options.basePath)) {
    path = path.slice(options.basePath.length) || '/';
  }

  let url = `https://${event.requestContext.domainName}${path}`;
  if (event.rawQueryString) {
    url += `?${event.rawQueryString}`;
  }

  // Add client IP header
  headers.set('x-forwarded-for', event.requestContext.http.sourceIp);

  // Convert body
  let body: BodyInit | null = null;
  if (event.body) {
    body = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64')
      : event.body;
  }

  const method = event.requestContext.http.method;

  return new Request(url, {
    method,
    headers,
    body: ['GET', 'HEAD'].includes(method) ? null : body,
  });
}

function convertALBEventToRequest(
  event: ALBEvent,
  options: LambdaAdapterOptions
): Request {
  const headers = new Headers();

  if (event.headers) {
    for (const [key, value] of Object.entries(event.headers)) {
      headers.set(key.toLowerCase(), value);
    }
  }

  // Build URL
  let path = event.path;
  if (options.basePath && path.startsWith(options.basePath)) {
    path = path.slice(options.basePath.length) || '/';
  }

  const host = headers.get('host') || 'localhost';
  let url = `https://${host}${path}`;

  if (event.queryStringParameters) {
    const qs = new URLSearchParams(event.queryStringParameters).toString();
    if (qs) url += `?${qs}`;
  }

  // Convert body
  let body: BodyInit | null = null;
  if (event.body) {
    body = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64')
      : event.body;
  }

  return new Request(url, {
    method: event.httpMethod,
    headers,
    body: ['GET', 'HEAD'].includes(event.httpMethod) ? null : body,
  });
}

// ============================================================================
// Response Conversion
// ============================================================================

function isBinaryContentType(
  contentType: string | null,
  binaryMediaTypes: string[]
): boolean {
  if (!contentType) return false;

  const mimeType = contentType.split(';')[0].trim().toLowerCase();

  // Check exact match
  if (binaryMediaTypes.includes(mimeType)) return true;

  // Check wildcard patterns
  for (const pattern of binaryMediaTypes) {
    if (pattern.endsWith('/*')) {
      const prefix = pattern.slice(0, -2);
      if (mimeType.startsWith(prefix)) return true;
    }
  }

  // Default binary types
  const defaultBinary = [
    'application/octet-stream',
    'image/',
    'audio/',
    'video/',
    'application/pdf',
    'application/zip',
    'application/gzip',
  ];

  return defaultBinary.some((prefix) =>
    mimeType.startsWith(prefix.replace('/', ''))
  );
}

async function convertResponseToV1Result(
  response: Response,
  binaryMediaTypes: string[]
): Promise<APIGatewayProxyResult> {
  const headers: Record<string, string> = {};
  const multiValueHeaders: Record<string, string[]> = {};

  response.headers.forEach((value, key) => {
    const existing = multiValueHeaders[key];
    if (existing) {
      existing.push(value);
    } else {
      multiValueHeaders[key] = [value];
      headers[key] = value;
    }
  });

  const contentType = response.headers.get('content-type');
  const isBinary = isBinaryContentType(contentType, binaryMediaTypes);

  let body: string;
  if (isBinary) {
    const buffer = await response.arrayBuffer();
    body = Buffer.from(buffer).toString('base64');
  } else {
    body = await response.text();
  }

  return {
    statusCode: response.status,
    headers,
    multiValueHeaders,
    body,
    isBase64Encoded: isBinary,
  };
}

async function convertResponseToV2Result(
  response: Response,
  binaryMediaTypes: string[]
): Promise<APIGatewayProxyResultV2> {
  const headers: Record<string, string> = {};
  const cookies: string[] = [];

  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      cookies.push(value);
    } else {
      headers[key] = value;
    }
  });

  const contentType = response.headers.get('content-type');
  const isBinary = isBinaryContentType(contentType, binaryMediaTypes);

  let body: string | undefined;
  if (response.body) {
    if (isBinary) {
      const buffer = await response.arrayBuffer();
      body = Buffer.from(buffer).toString('base64');
    } else {
      body = await response.text();
    }
  }

  return {
    statusCode: response.status,
    headers,
    cookies: cookies.length > 0 ? cookies : undefined,
    body,
    isBase64Encoded: isBinary,
  };
}

async function convertResponseToALBResult(
  response: Response,
  binaryMediaTypes: string[]
): Promise<ALBResult> {
  const headers: Record<string, string> = {};

  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const contentType = response.headers.get('content-type');
  const isBinary = isBinaryContentType(contentType, binaryMediaTypes);

  let body: string;
  if (isBinary) {
    const buffer = await response.arrayBuffer();
    body = Buffer.from(buffer).toString('base64');
  } else {
    body = await response.text();
  }

  return {
    statusCode: response.status,
    statusDescription: `${response.status} ${response.statusText}`,
    headers,
    body,
    isBase64Encoded: isBinary,
  };
}

// ============================================================================
// Lambda Adapter
// ============================================================================

/**
 * Create a Lambda handler from a Vexor application
 */
export function createLambdaHandler(
  app: Vexor,
  options: LambdaAdapterOptions = {}
): LambdaHandler {
  const {
    binaryMediaTypes = [],
    includeRequestContext = true,
    transformResponse,
  } = options;

  return async (
    event: LambdaEvent,
    context: LambdaContext
  ): Promise<LambdaResult> => {
    let request: Request;

    // Convert event to Request based on event type
    if (isALBEvent(event)) {
      request = convertALBEventToRequest(event, options);
    } else if (isAPIGatewayV2Event(event) || isLambdaFunctionUrlEvent(event)) {
      request = convertV2EventToRequest(event, options);
    } else if (isAPIGatewayV1Event(event)) {
      request = convertV1EventToRequest(event, options);
    } else {
      // Unknown event type, try v1 format
      request = convertV1EventToRequest(event as APIGatewayProxyEvent, options);
    }

    // Add Lambda context to request headers (can be accessed via ctx.header())
    if (includeRequestContext) {
      const modifiedHeaders = new Headers(request.headers);
      modifiedHeaders.set('x-amzn-requestid', context.awsRequestId);
      modifiedHeaders.set('x-amzn-function-name', context.functionName);

      request = new Request(request.url, {
        method: request.method,
        headers: modifiedHeaders,
        body: request.body,
        // @ts-ignore - duplex is needed for Node.js
        duplex: 'half',
      });
    }

    // Handle the request
    let response = await app.fetch(request);

    // Apply custom transformation if provided
    if (transformResponse) {
      response = await transformResponse(response);
    }

    // Convert Response based on event type
    if (isALBEvent(event)) {
      return convertResponseToALBResult(response, binaryMediaTypes);
    } else if (isAPIGatewayV2Event(event) || isLambdaFunctionUrlEvent(event)) {
      return convertResponseToV2Result(response, binaryMediaTypes);
    } else {
      return convertResponseToV1Result(response, binaryMediaTypes);
    }
  };
}

// ============================================================================
// Streaming Response Support (Lambda Response Streaming)
// ============================================================================

export interface StreamingLambdaContext extends LambdaContext {
  /**
   * Response stream for Lambda response streaming
   */
  responseStream?: NodeJS.WritableStream;
}

export interface StreamingHandler {
  (
    event: LambdaEvent,
    responseStream: NodeJS.WritableStream,
    context: LambdaContext
  ): Promise<void>;
}

/**
 * Create a streaming Lambda handler (for Lambda response streaming)
 * Only works with Lambda Function URLs with response streaming enabled
 */
export function createStreamingLambdaHandler(
  app: Vexor,
  options: LambdaAdapterOptions = {}
): StreamingHandler {
  const { includeRequestContext = true } = options;

  return async (
    event: LambdaEvent,
    responseStream: NodeJS.WritableStream,
    context: LambdaContext
  ): Promise<void> => {
    let request: Request;

    // Convert event to Request
    if (isAPIGatewayV2Event(event) || isLambdaFunctionUrlEvent(event)) {
      request = convertV2EventToRequest(event, options);
    } else {
      throw new Error('Streaming responses only supported with HTTP API or Function URLs');
    }

    // Add Lambda context
    if (includeRequestContext) {
      const modifiedHeaders = new Headers(request.headers);
      modifiedHeaders.set('x-amzn-requestid', context.awsRequestId);
      modifiedHeaders.set('x-amzn-function-name', context.functionName);

      request = new Request(request.url, {
        method: request.method,
        headers: modifiedHeaders,
        body: request.body,
        // @ts-ignore
        duplex: 'half',
      });
    }

    // Handle the request
    const response = await app.fetch(request);

    // Write response metadata - convert headers using forEach
    const headersObj: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headersObj[key] = value;
    });
    const metadata = {
      statusCode: response.status,
      headers: headersObj,
    };

    // Use awslambda.HttpResponseStream.from if available
    const awslambda = (globalThis as any).awslambda;
    if (awslambda?.HttpResponseStream) {
      const httpResponseStream = awslambda.HttpResponseStream.from(
        responseStream,
        metadata
      );

      if (response.body) {
        const reader = response.body.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            httpResponseStream.write(value);
          }
        } finally {
          reader.releaseLock();
        }
      }

      httpResponseStream.end();
    } else {
      // Fallback for non-streaming environments
      const body = await response.text();
      responseStream.write(JSON.stringify({ ...metadata, body }));
      responseStream.end();
    }
  };
}

// ============================================================================
// Warmup Support
// ============================================================================

/**
 * Check if the event is a warmup event (from CloudWatch scheduled events)
 */
export function isWarmupEvent(event: unknown): boolean {
  if (!event || typeof event !== 'object') return false;

  // Check for CloudWatch scheduled event
  if ('source' in event && (event as any).source === 'aws.events') {
    return true;
  }

  // Check for custom warmup payload
  if ('warmup' in event || 'ping' in event) {
    return true;
  }

  return false;
}

/**
 * Create a Lambda handler with warmup support
 */
export function createLambdaHandlerWithWarmup(
  app: Vexor,
  options: LambdaAdapterOptions & {
    onWarmup?: () => Promise<void>;
  } = {}
): (event: LambdaEvent | unknown, context: LambdaContext) => Promise<LambdaResult | { statusCode: number }> {
  const handler = createLambdaHandler(app, options);

  return async (event: LambdaEvent | unknown, context: LambdaContext) => {
    if (isWarmupEvent(event)) {
      if (options.onWarmup) {
        await options.onWarmup();
      }
      return { statusCode: 200 };
    }

    return handler(event as LambdaEvent, context);
  };
}
