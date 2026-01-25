/**
 * Real-time Module
 *
 * WebSocket, SSE, and Pub/Sub support for real-time applications.
 */

// WebSocket exports
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
} from './websocket.js';

export type {
  WSMessage,
  WSEventHandlers,
  WSRouteOptions,
  VexorWebSocket,
  WSServer,
} from './websocket.js';

// SSE exports
export {
  SSEStream,
  sseFromGenerator,
  sseFromIterable,
  createSSEStream,
  parseSSEData,
} from './sse.js';

export type {
  SSEEvent,
  SSEOptions,
  SSEController,
  SSEClientOptions,
} from './sse.js';

// Pub/Sub exports
export {
  MemoryPubSubAdapter,
  createRedisPubSub,
  EventBus,
  createEventBus,
  ChannelGroup,
  createChannelGroup,
  pubsub,
} from './pubsub.js';

export type {
  MessageHandler,
  Subscription,
  PubSubAdapter,
  RedisClient,
  RedisPubSubOptions,
} from './pubsub.js';
