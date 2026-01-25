/**
 * Adapters Module Exports
 */

export {
  NodeAdapter,
  createNodeServer,
  startNodeServer,
  incomingMessageToRequest,
  toVexorRequest as nodeToVexorRequest,
  writeResponse,
  readBody,
  nodeCapabilities,
  runtimeType as nodeRuntimeType,
} from './node.js';

export type { NodeServerOptions, RequestHandler as NodeRequestHandler } from './node.js';

export {
  BunAdapter,
  startBunServer,
  toVexorRequest as bunToVexorRequest,
  isBun,
  bunCapabilities,
  runtimeType as bunRuntimeType,
} from './bun.js';

export type { BunServeOptions, BunServer, RequestHandler as BunRequestHandler } from './bun.js';

// Cloudflare Workers adapter
export {
  CloudflareAdapter,
  createCloudflareAdapter,
  createCloudflareWorker,
  isCloudflareWorkers,
  createDurableObject,
  cloudflareCapabilities,
  cloudflareRuntime,
} from './cloudflare.js';

export type {
  CloudflareEnv,
  ExecutionContext,
  CloudflareHandler,
  ScheduledController,
  DurableObjectState,
  DurableObjectStorage,
  KVNamespace,
  R2Bucket,
  R2Object,
  R2PutOptions,
  R2HTTPMetadata,
  R2ListOptions,
  R2Objects,
} from './cloudflare.js';

// Vercel Edge adapter
export {
  VercelAdapter,
  createVercelAdapter,
  createVercelEdgeHandler,
  isVercelEdge,
  getVercelGeo,
  getVercelRequestId,
  getVercelDeploymentUrl,
  createNextApiHandler,
  createEdgeMiddleware,
  rewriteUrl,
  redirect,
  nextResponse,
  vercelEdgeCapabilities,
  vercelRuntime,
} from './vercel.js';

export type {
  VercelRequestContext,
  VercelGeo,
  EdgeConfigClient,
} from './vercel.js';

// Deno adapter
export {
  DenoAdapter,
  createDenoAdapter,
  isDeno,
  getDenoVersion,
  getEnv as getDenoEnv,
  DenoDeployHelpers,
  createFreshHandler,
  createOakMiddleware,
  denoCapabilities,
  denoRuntime,
} from './deno.js';

export type {
  DenoServeOptions,
  DenoConnInfo,
  DenoServer,
  DenoKv,
  DenoKvAtomic,
} from './deno.js';
