/**
 * Vexor - A blazing-fast, batteries-included, multi-runtime Node.js backend framework
 *
 * @example
 * ```typescript
 * import { Vexor, Type } from 'vexor';
 *
 * const app = new Vexor();
 *
 * const UserSchema = Type.Object({
 *   id: Type.String(),
 *   name: Type.String(),
 *   email: Type.String({ format: 'email' })
 * });
 *
 * app.get('/users/:id', {
 *   params: Type.Object({ id: Type.String() }),
 *   response: { 200: UserSchema }
 * }, async (ctx) => {
 *   return ctx.json({ id: ctx.params.id, name: 'John', email: 'john@example.com' });
 * });
 *
 * app.listen(3000);
 * ```
 */

// Core exports
export {
  Vexor,
  createApp,
  VexorRequest,
  VexorResponse,
  ResponseBuilder,
  VexorContext,
  ContextPool,
  contextPool,
  createRequest,
} from './core/index.js';

export type {
  RouteOptions,
  VexorHandler,
  ServerInstance,
  ContextState,
  HTTPMethod,
  ParsedQuery,
  RouteParams,
  CookieOptions,
  ParsedCookies,
  RuntimeCapabilities,
  RuntimeType,
  RawRequest,
  HookType,
  HookFunction,
  ErrorHandler,
  Handler,
  RouteDefinition,
  RouteSchema,
  RouteHooks,
  VexorOptions,
  LoggingOptions,
  MatchedRoute,
} from './core/index.js';

// Router exports
export { RadixRouter, toMatchedRoute } from './router/index.js';

// Middleware exports
export { Pipeline, compose, when, timing, timingEnd } from './middleware/index.js';
export type { PipelineResult } from './middleware/index.js';

// Adapter exports
export {
  NodeAdapter,
  BunAdapter,
  isBun,
  nodeCapabilities,
  bunCapabilities,
} from './adapters/index.js';

export type {
  NodeServerOptions,
  BunServeOptions,
  BunServer,
} from './adapters/index.js';

// Schema exports (Phase 2)
export {
  Type,
  OptionalKind,
  ReadonlyKind,
  AnyKind,
  UnknownKind,
  STANDARD_SCHEMA_VERSION,
  isStandardSchema,
  toStandardSchema,
  createResult,
  createResultWithIssues,
  createIssue,
  validate as validateStandard,
  hasIssues,
  getErrors,
} from './schema/index.js';

export type {
  TSchema,
  TString,
  TNumber,
  TInteger,
  TBoolean,
  TNull,
  TLiteral,
  TArray,
  TTuple,
  TObject,
  TUnion,
  TIntersect,
  TOptional,
  TReadonly,
  TRecord,
  TEnum,
  TAny,
  TUnknown,
  TNever,
  TProperties,
  StringOptions,
  NumberOptions,
  IntegerOptions,
  ArrayOptions,
  ObjectOptions,
  SchemaOptions,
  Static,
  Simplify,
  StaticPretty,
  StandardSchemaResult,
  StandardSchemaIssue,
  StandardSchema,
} from './schema/index.js';

// Validation exports (Phase 2)
export {
  compile as compileValidator,
  createValidator,
  validate,
  parse,
  ValidationError,
  validateParams,
  validateQuery,
  validateBody,
  validateHeaders,
  createValidationMiddleware,
  validationErrorResponse,
} from './validation/index.js';

export type {
  ValidatorFn,
  Validator,
} from './validation/index.js';

// Serialization exports (Phase 2)
export {
  compileSerializer,
  createSerializer,
  stringify,
  FastJSON,
} from './serialization/index.js';

export type {
  SerializerFn,
  SerializerOptions,
  Serializer,
} from './serialization/index.js';

// OpenAPI exports (Phase 2)
export {
  OpenAPIGenerator,
  createOpenAPIGenerator,
} from './openapi/index.js';

export type {
  OpenAPIDocument,
  OpenAPIInfo,
  OpenAPIServer,
  OpenAPITag,
  OpenAPIPathItem,
  OpenAPIOperation,
  OpenAPIParameter,
  OpenAPIRequestBody,
  OpenAPIResponse,
  OpenAPIMediaType,
  OpenAPISchema,
  OpenAPIComponents,
  OpenAPISecurityScheme,
  OpenAPIOAuthFlows,
  OpenAPIOAuthFlow,
  OpenAPISecurityRequirement,
  RouteMeta,
  GeneratorOptions,
} from './openapi/index.js';

// Logging exports (Phase 4)
export {
  Logger,
  ConsoleTransport,
  StreamTransport,
  MultiTransport,
  createLogger,
  createRequestLogger,
  generateRequestId,
  logger,
  serializers,
} from './logging/logger.js';

export type {
  LogLevel,
  LogEntry,
  LoggerOptions,
  LogTransport,
  RequestLogContext,
} from './logging/logger.js';

// Auth exports (Phase 4)
export {
  JWT,
  createJWT,
  sign as signJWT,
  verify as verifyJWT,
  decode as decodeJWT,
  generateJti,
  JWTError,
} from './auth/jwt.js';

export type {
  JWTAlgorithm,
  JWTHeader,
  JWTPayload,
  JWTOptions,
  JWTDecodeResult,
  JWTVerifyResult,
} from './auth/jwt.js';

export {
  SessionManager,
  Session,
  MemorySessionStore,
  CookieSessionStore,
  createSessionManager,
  parseCookies,
} from './auth/session.js';

export type {
  SessionData,
  SessionStore,
  SessionOptions,
} from './auth/session.js';

// Config exports (Phase 4)
export {
  Config,
  ConfigLoader,
  defineConfig,
  loadConfig,
  env,
} from './config/loader.js';

export type {
  ConfigSource,
  ConfigValue,
  EnvOptions,
  ConfigLoaderOptions,
} from './config/loader.js';

// Plugin exports (Phase 4)
export {
  PluginRegistry,
  definePlugin,
  asyncPlugin,
  routePlugin,
  configurablePlugin,
  plugins,
} from './plugins/system.js';

export type {
  PluginMeta,
  PluginOptions,
  PluginContext,
  PluginRegisterFn,
  VexorPlugin,
  AsyncPlugin,
  PluginInput,
} from './plugins/system.js';

// DI exports (Phase 4)
export {
  Container,
  createContainer,
  token,
  inject,
  getDependencies,
  registerModule,
  defineModule,
} from './di/container.js';

export type {
  ServiceId,
  Factory,
  ServiceScope,
  ServiceOptions,
  ContainerOptions,
  Module,
} from './di/container.js';

// Observability exports (Phase 6)
export {
  Tracer,
  createTracer,
  tracer,
  ConsoleTraceExporter,
  BatchTraceExporter,
  OTLPTraceExporter,
  SemanticAttributes,
  MetricsRegistry,
  registry,
  createHttpMetrics,
  createProcessMetrics,
  registerDebugRoutes,
  debugMiddleware,
} from './observability/index.js';

export type {
  SpanStatus,
  SpanKind,
  SpanAttributes,
  SpanEvent,
  SpanContext,
  Span,
  TraceExporter,
  TracerOptions,
  MetricType,
  MetricLabels,
  Metric,
  Counter,
  Gauge,
  Histogram,
  HistogramValue,
  DebugOptions,
} from './observability/index.js';

// Real-time exports (Phase 7)
export {
  WebSocketClient,
  WebSocketServer,
  wsServer,
  generateConnectionId,
  createUpgradeResponse,
  isWebSocketUpgrade,
  getWebSocketKey,
  getRequestedProtocols,
  createWebSocketHandler,
  SSEStream,
  sseFromGenerator,
  sseFromIterable,
  createSSEStream,
  parseSSEData,
  MemoryPubSubAdapter,
  createRedisPubSub,
  EventBus,
  createEventBus,
  ChannelGroup,
  createChannelGroup,
  pubsub,
} from './realtime/index.js';

export type {
  WSMessage,
  WSEventHandlers,
  WSRouteOptions,
  VexorWebSocket,
  WSServer,
  SSEEvent,
  SSEOptions,
  SSEController,
  SSEClientOptions,
  MessageHandler,
  Subscription,
  PubSubAdapter,
  RedisClient,
  RedisPubSubOptions,
} from './realtime/index.js';

// Resilience exports (Phase 7)
export {
  CircuitBreaker,
  CircuitBreakerError,
  createCircuitBreaker,
  withCircuitBreaker,
  retry,
  retryWithResult,
  retryable,
  Retry,
  retryPredicates,
  backoffStrategies,
} from './resilience/index.js';

export type {
  CircuitState,
  CircuitBreakerOptions,
  CircuitBreakerStats,
  CircuitBreakerEvents,
  RetryOptions,
  RetryResult,
} from './resilience/index.js';

// Rate Limiting exports
export {
  rateLimit,
  createRateLimiter,
  getRateLimitInfo,
  slowDown,
  MemoryStore as RateLimitMemoryStore,
  SlidingWindowStore,
  RedisStore as RateLimitRedisStore,
} from './middleware/rate-limit.js';

export type {
  RateLimitOptions,
  RateLimitStore,
  RateLimitInfo,
  RedisClient as RateLimitRedisClient,
} from './middleware/rate-limit.js';

// CORS exports
export {
  cors,
  simpleCors,
  getCorsHeaders,
  applyCorsHeaders,
  corsWithOrigins,
  corsWithPattern,
} from './middleware/cors.js';

export type {
  CorsOptions,
  CorsOrigin,
} from './middleware/cors.js';

// Compression exports
export {
  compression,
  compressResponse,
  createCompressedResponse,
  isCompressible,
} from './middleware/compression.js';

export type {
  CompressionOptions,
} from './middleware/compression.js';

// File Upload exports
export {
  upload,
  getUploadedFiles,
  getFilesByField,
  getFile,
  getUploadFields,
  getUploadError,
  deleteUploadedFile,
  singleUpload,
  multiUpload,
  fieldsUpload,
  imageUpload,
  documentUpload,
  UploadError,
} from './middleware/upload.js';

export type {
  UploadOptions,
  UploadedFile,
  UploadResult,
} from './middleware/upload.js';

// Health Check exports
export {
  healthCheck,
  databaseCheck,
  redisCheck,
  httpCheck,
  memoryCheck,
  diskCheck,
  customCheck,
} from './middleware/health.js';

export type {
  HealthStatus,
  HealthCheckResult,
  HealthCheck,
  HealthOptions,
  HealthResponse,
} from './middleware/health.js';

// API Versioning exports
export {
  versioning,
  createVersionRouter,
  getApiVersion,
  isVersion,
  applyVersionHeader,
  deprecated,
  applyDeprecationHeaders,
} from './middleware/versioning.js';

export type {
  VersioningOptions,
  VersioningStrategy,
  VersionedRoute,
  VersionRouter,
  VersionRouterInstance,
} from './middleware/versioning.js';

// Cache exports
export {
  CacheManager,
  MemoryCacheStore,
  LRUCacheStore,
  RedisCacheStore,
  cacheMiddleware,
  cacheResponse,
  createCache,
  createMemoryCache,
  createRedisCache,
} from './cache/index.js';

export type {
  CacheOptions,
  CacheEntry,
  CacheStore,
  CacheStats,
  RedisClient as CacheRedisClient,
} from './cache/index.js';

// OAuth2/OIDC exports
export {
  OAuth,
  OAuthError,
  MemoryStateStore,
  providers as OAuthProviders,
  oauthMiddleware,
  getOAuthUser,
} from './auth/oauth.js';

export type {
  OAuthProvider,
  OAuthConfig,
  OAuthProfile,
  OAuthUser,
  OAuthTokens,
  OAuthStateStore,
  OAuthStateData,
  OAuthSessionStore,
} from './auth/oauth.js';

// Lambda Adapter exports
export {
  createLambdaHandler,
  createStreamingLambdaHandler,
  createLambdaHandlerWithWarmup,
  isWarmupEvent,
} from './adapters/lambda.js';

export type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  LambdaFunctionUrlEvent,
  ALBEvent,
  ALBResult,
  LambdaContext,
  LambdaEvent,
  LambdaResult,
  LambdaHandler,
  LambdaAdapterOptions,
  StreamingLambdaContext,
  StreamingHandler,
} from './adapters/lambda.js';

// Swagger UI / API Documentation exports
export {
  swaggerUI,
  registerSwaggerUI,
  reDoc,
  registerReDoc,
  scalar,
  registerScalar,
} from './openapi/swagger-ui.js';

export type {
  SwaggerUIOptions,
  OpenAPISpec,
  ReDocOptions,
  ScalarOptions,
} from './openapi/swagger-ui.js';

// Default export
export { Vexor as default } from './core/index.js';
