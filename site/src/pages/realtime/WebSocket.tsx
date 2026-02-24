import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const basicUsageCode = `import { Vexor, WebSocketServer } from '@vexorjs/core';
import type { VexorWebSocket } from '@vexorjs/core';

const app = new Vexor();
const wss = new WebSocketServer();

// Define a WebSocket route
wss.route('/ws/chat', {
  handlers: {
    open(ws: VexorWebSocket) {
      console.log('Client connected:', ws.id);
      ws.send('Welcome to the chat!');
    },

    message(ws: VexorWebSocket, message: string) {
      console.log(\`Message from \${ws.id}:\`, message);

      // Echo message back to the sender
      ws.send(\`You said: \${message}\`);
    },

    close(ws: VexorWebSocket, code: number, reason: string) {
      console.log(\`Client \${ws.id} disconnected: \${code} \${reason}\`);
    },

    error(ws: VexorWebSocket, error: Error) {
      console.error(\`WebSocket error for \${ws.id}:\`, error);
    },
  },
});

// Attach WebSocket server to the Vexor app
app.listen(3000, { websocket: wss });`;

const messageHandlingCode = `import { WebSocketServer, Type } from '@vexorjs/core';
import type { VexorWebSocket } from '@vexorjs/core';

const wss = new WebSocketServer();

// Validate incoming messages with a schema
wss.route('/ws/api', {
  messageSchema: Type.Object({
    type: Type.String(),
    payload: Type.Unknown(),
  }),

  handlers: {
    message(ws: VexorWebSocket, message: { type: string; payload: unknown }) {
      switch (message.type) {
        case 'ping':
          ws.json({ type: 'pong', timestamp: Date.now() });
          break;

        case 'subscribe':
          const { channel } = message.payload as { channel: string };
          ws.subscribe(channel);
          ws.json({ type: 'subscribed', channel });
          break;

        case 'unsubscribe':
          const { channel: ch } = message.payload as { channel: string };
          ws.unsubscribe(ch);
          ws.json({ type: 'unsubscribed', channel: ch });
          break;

        default:
          ws.json({ type: 'error', message: \`Unknown type: \${message.type}\` });
      }
    },
  },
});

// Route with payload limits and compression
wss.route('/ws/uploads', {
  maxPayloadLength: 16 * 1024 * 1024, // 16 MB
  idleTimeout: 120, // seconds
  compression: true,

  handlers: {
    message(ws, message) {
      // Handle large payloads
      ws.json({ received: true, size: message.length });
    },
  },
});`;

const topicsCode = `import { WebSocketServer } from '@vexorjs/core';
import type { VexorWebSocket } from '@vexorjs/core';

const wss = new WebSocketServer();

wss.route('/ws/realtime', {
  handlers: {
    open(ws: VexorWebSocket) {
      // Subscribe the client to topics
      ws.subscribe('global-announcements');
      ws.json({ type: 'connected', topics: ['global-announcements'] });
    },

    message(ws: VexorWebSocket, message: string) {
      const data = JSON.parse(message);

      switch (data.action) {
        case 'join-room':
          ws.subscribe(\`room:\${data.roomId}\`);
          // Notify others in the room
          ws.publish(\`room:\${data.roomId}\`, JSON.stringify({
            type: 'user-joined',
            userId: data.userId,
          }));
          break;

        case 'leave-room':
          ws.unsubscribe(\`room:\${data.roomId}\`);
          ws.publish(\`room:\${data.roomId}\`, JSON.stringify({
            type: 'user-left',
            userId: data.userId,
          }));
          break;

        case 'send-message':
          // Publish to room topic (all subscribers except sender)
          ws.publish(\`room:\${data.roomId}\`, JSON.stringify({
            type: 'new-message',
            userId: data.userId,
            content: data.content,
            timestamp: Date.now(),
          }));
          break;
      }
    },

    close(ws: VexorWebSocket) {
      // Subscriptions are automatically cleaned up on disconnect
    },
  },
});`;

const broadcastCode = `import { WebSocketServer } from '@vexorjs/core';

const wss = new WebSocketServer();

wss.route('/ws/dashboard', {
  handlers: {
    open(ws) {
      // Track the client on the server
      wss.addClient('dashboard', ws);
      ws.subscribe('dashboard-updates');
    },

    close(ws) {
      wss.removeClient('dashboard', ws);
    },
  },
});

// Broadcast to all connected dashboard clients
function broadcastMetrics(metrics: Record<string, number>) {
  wss.broadcast('dashboard-updates', JSON.stringify({
    type: 'metrics',
    data: metrics,
    timestamp: Date.now(),
  }));
}

// Publish to a specific topic
wss.publish('dashboard-updates', JSON.stringify({
  type: 'alert',
  message: 'CPU usage above 90%',
}));

// Close all connections gracefully
process.on('SIGTERM', () => {
  wss.closeAll(1001, 'Server shutting down');
});`;

const jsonMessagesCode = `import { createWebSocketHandler, Type } from '@vexorjs/core';
import type { VexorWebSocket } from '@vexorjs/core';

// Type-safe JSON messaging
interface ChatMessage {
  type: 'message';
  room: string;
  content: string;
  sender: string;
}

interface TypingEvent {
  type: 'typing';
  room: string;
  sender: string;
  isTyping: boolean;
}

type ClientMessage = ChatMessage | TypingEvent;

const handler = createWebSocketHandler({
  messageSchema: Type.Union([
    Type.Object({
      type: Type.Literal('message'),
      room: Type.String(),
      content: Type.String({ minLength: 1, maxLength: 5000 }),
      sender: Type.String(),
    }),
    Type.Object({
      type: Type.Literal('typing'),
      room: Type.String(),
      sender: Type.String(),
      isTyping: Type.Boolean(),
    }),
  ]),

  handlers: {
    open(ws: VexorWebSocket) {
      ws.json({ type: 'ready', serverTime: Date.now() });
    },

    message(ws: VexorWebSocket, msg: ClientMessage) {
      if (msg.type === 'message') {
        ws.publish(\`room:\${msg.room}\`, JSON.stringify({
          type: 'message',
          content: msg.content,
          sender: msg.sender,
          timestamp: Date.now(),
        }));
      }

      if (msg.type === 'typing') {
        ws.publish(\`room:\${msg.room}\`, JSON.stringify({
          type: 'typing',
          sender: msg.sender,
          isTyping: msg.isTyping,
        }));
      }
    },
  },
});`;

const statsCode = `// Get WebSocket server statistics
const stats = wss.getStats();

console.log({
  totalConnections: stats.totalConnections,
  activeConnections: stats.activeConnections,
  messagesReceived: stats.messagesReceived,
  messagesSent: stats.messagesSent,
  topics: stats.topics,           // Number of active topics
  uptime: stats.uptime,           // Server uptime in ms
});

// Expose stats via HTTP endpoint
app.get('/ws/stats', async (ctx) => {
  return ctx.json(wss.getStats());
});

// Per-client information
wss.route('/ws/chat', {
  handlers: {
    open(ws) {
      console.log('Client ID:', ws.id);
      console.log('Remote address:', ws.remoteAddress);

      // Ping the client to measure latency
      ws.ping();
    },
  },
});`;

export default function WebSocket() {
  return (
    <div className="space-y-12">
      <div>
        <h1 id="websocket" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          WebSocket
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          WebSocket is a communication protocol that provides full-duplex, bidirectional messaging between a client and server over a single, long-lived TCP connection. Unlike HTTP's request-response model where the client must initiate every exchange, a WebSocket connection allows both sides to send messages at any time, independently and concurrently. This makes it the protocol of choice for applications that require real-time, low-latency interaction: chat systems, collaborative editing, multiplayer games, live trading platforms, and interactive dashboards.
        </p>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          A WebSocket connection begins its life as a standard HTTP request. The client sends an HTTP GET with an <code className="prose-code">Upgrade: websocket</code> header, and the server responds with a <code className="prose-code">101 Switching Protocols</code> status. After this handshake, the HTTP connection is "upgraded" to the WebSocket protocol, and both sides switch to a binary framing format. From this point forward, data flows in small frames rather than HTTP messages, eliminating the per-message overhead of HTTP headers and enabling sub-millisecond message delivery.
        </p>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          The WebSocket protocol defines several frame types: text frames carry UTF-8 string data, binary frames carry arbitrary bytes, ping and pong frames serve as heartbeat mechanisms, and close frames initiate connection shutdown. The ping/pong mechanism is particularly important for production deployments: the server periodically sends ping frames, and the client is expected to respond with pong frames. If no pong is received within a timeout, the server considers the client disconnected and cleans up resources.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Vexor's <code className="prose-code">WebSocketServer</code> provides a high-level API built on top of the raw WebSocket protocol. It adds route-based organization (different paths handle different features), topic-based pub/sub for efficient message fan-out, JSON message validation with schema checking, per-route configuration for payload limits and compression, and server-level broadcast and publish capabilities. This layered architecture lets you build complex real-time features without managing raw frames, connection tracking, or subscription lists manually.
        </p>
      </div>

      <section>
        <h2 id="how-it-works" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          How It Works
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When the Vexor server receives an HTTP request with an <code className="prose-code">Upgrade: websocket</code> header, it matches the request path against registered WebSocket routes. If a matching route is found, the server completes the HTTP upgrade handshake and creates a <code className="prose-code">VexorWebSocket</code> instance that wraps the raw connection. Each instance is assigned a unique <code className="prose-code">ws.id</code> for identification and tracking.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The route's handler callbacks are invoked at key points in the connection lifecycle. The <code className="prose-code">open</code> handler fires immediately after the connection is established, giving you a chance to perform initial setup like subscribing the client to topics, sending a welcome message, or recording the connection in an external tracking system. The <code className="prose-code">message</code> handler fires each time the client sends a message. If a <code className="prose-code">messageSchema</code> is configured, the incoming message is parsed and validated against the schema before reaching your handler; invalid messages are rejected automatically with an error response.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Topic-based routing is the backbone of Vexor's WebSocket architecture. When a client calls <code className="prose-code">ws.subscribe('room:123')</code>, the server adds that connection to an in-memory set of subscribers for that topic. When any connection calls <code className="prose-code">ws.publish('room:123', data)</code>, the message is delivered to every subscriber of that topic except the sender. This pub/sub mechanism is implemented at the server level with O(1) per-subscriber delivery, making it efficient even with thousands of active topics and connections.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          When a client disconnects, either voluntarily or due to a network failure, the <code className="prose-code">close</code> handler fires with a status code and reason string. The server automatically removes the connection from all topic subscriptions, preventing stale references and ensuring that subsequent publish operations do not attempt to write to closed connections. This automatic cleanup means you rarely need to manage subscriptions manually in the close handler.
        </p>
      </section>

      <section>
        <h2 id="when-to-use" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          When to Use WebSocket
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          WebSocket is the right choice when your application requires bidirectional real-time communication. If the client needs to send frequent, low-latency messages to the server (not just receive updates), WebSocket is the appropriate protocol. Chat applications, collaborative editors, multiplayer games, remote terminals, and interactive whiteboards all fall into this category.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          WebSocket is also appropriate for high-frequency unidirectional streaming where the volume and rate of messages exceeds what SSE can comfortably handle. Financial data feeds that deliver hundreds of updates per second, audio/video signaling channels, and IoT sensor streams often use WebSocket for its lower per-message overhead and binary frame support. SSE is limited to text-based data and incurs slightly more overhead per message due to its line-based format.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The trade-offs of WebSocket relative to SSE include additional complexity (you must manage connection state, handle reconnection in client code, and deal with the upgrade handshake), reduced compatibility with HTTP infrastructure (some proxies, firewalls, and CDNs interfere with WebSocket upgrades), and the loss of standard HTTP features like caching, compression negotiation, and cookie-based authentication during the upgrade. WebSocket connections also consume a dedicated file descriptor each, whereas SSE over HTTP/2 multiplexes streams over shared connections.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          As a general principle, use SSE for server-to-client streaming and WebSocket for scenarios where the client must send messages back to the server over the same persistent connection. If you find yourself implementing a WebSocket endpoint where the client only receives data and never sends anything, SSE is likely a simpler and more robust choice.
        </p>
      </section>

      <section>
        <h2 id="basic-usage" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Basic Usage
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Create a <code className="prose-code">WebSocketServer</code> instance and define routes using the <code className="prose-code">route()</code> method. Each route maps a URL path to a set of handler callbacks that respond to connection lifecycle events. The four available handlers are <code className="prose-code">open</code> (connection established), <code className="prose-code">message</code> (data received from client), <code className="prose-code">close</code> (connection terminated), and <code className="prose-code">error</code> (an error occurred).
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Attach the WebSocket server to your Vexor application by passing it to <code className="prose-code">app.listen()</code> in the options object. Vexor handles the HTTP upgrade negotiation internally, routing incoming WebSocket connections to the correct handler based on the request path. You can define multiple routes on the same server, each serving a different real-time feature at a different path.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Every WebSocket connection receives a unique <code className="prose-code">ws.id</code> string that persists for the lifetime of the connection. Use this ID for logging, debugging, and correlating messages across handlers. The <code className="prose-code">ws.send()</code> method sends raw text or binary data, while <code className="prose-code">ws.json()</code> serializes a JavaScript object as JSON and sends it as a text frame. For most applications, <code className="prose-code">ws.json()</code> is the preferred method because it handles serialization automatically.
        </p>
        <CodeBlock code={basicUsageCode} filename="src/server.ts" showLineNumbers />
        <InfoBlock variant="info">
          Each WebSocket connection is assigned a unique <code className="prose-code">ws.id</code> that
          you can use for tracking, logging, and targeted messaging.
        </InfoBlock>
      </section>

      <section>
        <h2 id="handling-messages" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Handling Messages
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          In production WebSocket applications, you cannot trust the shape or content of incoming messages. Clients may send malformed JSON, missing fields, or payloads that exceed expected sizes. The <code className="prose-code">messageSchema</code> option lets you define a schema that incoming messages must conform to. Messages that fail validation are rejected before they reach your handler, preventing your application code from operating on invalid data.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Schema validation uses the same <code className="prose-code">Type</code> builder used throughout Vexor for HTTP request validation. You can define exact object shapes, union types for messages with different structures, and constraints like minimum and maximum string lengths. When validation is enabled, the <code className="prose-code">message</code> handler receives the parsed and typed object rather than a raw string, giving you type safety throughout your handler logic.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Per-route configuration lets you tune resource limits for different use cases. The <code className="prose-code">maxPayloadLength</code> option caps the maximum size of a single message in bytes, protecting the server from memory exhaustion attacks. The <code className="prose-code">idleTimeout</code> option closes connections that have not sent or received any data within the specified number of seconds, freeing up resources held by abandoned connections. The <code className="prose-code">compression</code> option enables per-message deflate compression, which reduces bandwidth for text-heavy payloads at the cost of additional CPU usage.
        </p>
        <CodeBlock code={messageHandlingCode} filename="src/ws/api.ts" showLineNumbers />
        <InfoBlock variant="warning">
          Always set <code className="prose-code">maxPayloadLength</code> to prevent clients from
          sending excessively large messages that could consume server memory.
        </InfoBlock>
      </section>

      <section>
        <h2 id="topics-pubsub" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Topics and Pub/Sub
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Topic-based pub/sub is the mechanism that makes WebSocket applications scalable. Without topics, sending a message to a specific group of clients requires the server to maintain manual lists of connections and iterate over them. With topics, clients subscribe to named channels, and the server handles fan-out delivery transparently. This decouples message routing from your application logic and makes it trivial to implement features like chat rooms, per-user notifications, and real-time collaboration.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When a client calls <code className="prose-code">ws.subscribe('room:123')</code>, the server adds that connection to an internal subscriber set for the topic <code className="prose-code">room:123</code>. The client can subscribe to any number of topics simultaneously. When any client calls <code className="prose-code">ws.publish('room:123', data)</code>, the server iterates over all subscribers of that topic and sends the message to each one, excluding the publisher itself. This "exclude sender" behavior is the convention for chat-like applications where the sender already has its own copy of the message.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Topic names are arbitrary strings, and a common pattern is to use colon-separated namespaces: <code className="prose-code">room:general</code>, <code className="prose-code">user:123:notifications</code>, <code className="prose-code">game:abc:moves</code>. This naming convention makes it easy to reason about topic scopes and implement access control by checking the topic name in the message handler before allowing a subscribe or publish operation.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When a client disconnects, all of its topic subscriptions are automatically removed. You do not need to manually unsubscribe in the <code className="prose-code">close</code> handler. This automatic cleanup prevents dead connections from accumulating in subscriber sets and ensures that publish operations never attempt to write to closed connections.
        </p>
        <CodeBlock code={topicsCode} filename="src/ws/realtime.ts" showLineNumbers />
        <InfoBlock variant="tip">
          Topic subscriptions are automatically cleaned up when a client disconnects. You do not
          need to manually unsubscribe in the close handler.
        </InfoBlock>
      </section>

      <section>
        <h2 id="broadcasting" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Broadcasting
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          While <code className="prose-code">ws.publish()</code> sends messages from within a WebSocket handler (in the context of a connected client), server-level broadcast and publish methods let you push messages from anywhere in your application. This is essential for integrating WebSocket updates with the rest of your system: an HTTP endpoint that creates a new order can publish a "new order" event to all connected dashboard clients, a cron job can broadcast system maintenance notifications, and a database change listener can push real-time updates.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">wss.broadcast()</code> method sends a message to all subscribers of a topic, including any connection that initiated the broadcast (unlike <code className="prose-code">ws.publish()</code>, which excludes the sender). The <code className="prose-code">wss.publish()</code> method works identically at the server level. The <code className="prose-code">wss.addClient()</code> and <code className="prose-code">wss.removeClient()</code> methods let you maintain named client groups for manual tracking, though topic subscriptions are usually sufficient for message routing.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For graceful shutdown, the <code className="prose-code">wss.closeAll()</code> method closes every active WebSocket connection with a specified close code and reason string. This should be called during the application shutdown sequence so that clients receive a clean close frame and can reconnect to another server instance in a load-balanced deployment, rather than experiencing an abrupt TCP reset.
        </p>
        <CodeBlock code={broadcastCode} filename="src/ws/dashboard.ts" showLineNumbers />
      </section>

      <section>
        <h2 id="json-messages" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Type-Safe JSON Messages
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Real-world WebSocket applications typically communicate using structured JSON messages. A chat application might have message, typing indicator, presence update, and room management events, each with a different payload shape. The <code className="prose-code">createWebSocketHandler()</code> function combined with schema validation provides end-to-end type safety for this pattern.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Define a TypeScript discriminated union for your client message types, then create a matching schema using <code className="prose-code">Type.Union()</code>. The schema validates that each incoming message matches one of the expected shapes and enforces constraints like minimum and maximum string lengths. The <code className="prose-code">message</code> handler receives the validated, typed message object, so you can use a type-narrowing switch statement to handle each message type with full type safety and autocompletion.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          This pattern catches protocol errors at the boundary rather than deep inside your business logic. If a client sends a message with a missing field or an invalid type, the validation layer rejects it before your handler executes. This reduces the surface area for bugs and makes your WebSocket handlers as predictable and testable as typed HTTP endpoint handlers.
        </p>
        <CodeBlock code={jsonMessagesCode} filename="src/ws/chat.ts" showLineNumbers />
      </section>

      <section>
        <h2 id="connection-stats" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Connection Statistics and Monitoring
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Monitoring WebSocket connections in production is critical for understanding resource usage, detecting anomalies, and planning capacity. The <code className="prose-code">wss.getStats()</code> method provides a snapshot of the server's current state, including the total number of connections established since startup, the number of currently active connections, cumulative message counts, the number of active topics, and server uptime.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The most important metric to track is <code className="prose-code">activeConnections</code>, which directly correlates with memory and file descriptor consumption. Each active WebSocket connection holds a kernel file descriptor, a send buffer, a receive buffer, and any application-level state you attach to it. If active connections grow unexpectedly, it may indicate clients that are connecting but never disconnecting, or a connection leak in your client-side code.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Exposing statistics through an HTTP endpoint (as shown below) allows monitoring systems to scrape metrics at regular intervals. You can also compute derived metrics like messages per second, average connections per minute, and topic churn rate. For per-client diagnostics, each <code className="prose-code">VexorWebSocket</code> instance exposes <code className="prose-code">ws.id</code> and <code className="prose-code">ws.remoteAddress</code>, and the <code className="prose-code">ws.ping()</code> method sends a WebSocket ping frame to measure round-trip latency.
        </p>
        <CodeBlock code={statsCode} filename="src/ws/monitoring.ts" showLineNumbers />
      </section>

      <section>
        <h2 id="best-practices" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Best Practices
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Always set <code className="prose-code">maxPayloadLength</code> on every WebSocket route. Without a limit, a malicious client can send arbitrarily large messages that consume the server's memory. A sensible default for text-based JSON messaging is 64 KB. For routes that handle file uploads or binary data, increase the limit to match your application's requirements, but always set an explicit ceiling.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use <code className="prose-code">messageSchema</code> validation for all production WebSocket routes. Unvalidated messages force you to write defensive parsing code in every handler, which is error-prone and leads to inconsistent error handling. Schema validation centralizes input validation and guarantees that your handler only receives well-formed data.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Implement heartbeat checking with <code className="prose-code">idleTimeout</code>. Mobile clients, laptop lid closures, and network transitions can leave TCP connections in a half-open state where the server believes the client is still connected but the client is actually gone. The idle timeout detects these zombie connections and closes them, freeing up resources. A timeout of 60 to 120 seconds is appropriate for most applications.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Design your message protocol as a discriminated union with a <code className="prose-code">type</code> field. This pattern makes it trivial to add new message types without breaking existing handlers, and it works naturally with both schema validation and TypeScript type narrowing. Document the message protocol so that client developers know exactly which message shapes are accepted and what responses to expect.
        </p>
      </section>

      <section>
        <h2 id="api-reference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          API Reference
        </h2>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">
          WSRouteOptions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Option</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Default</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">messageSchema</code></td>
                <td className="py-3 px-4"><code className="prose-code">TSchema</code></td>
                <td className="py-3 px-4"><code className="prose-code">undefined</code></td>
                <td className="py-3 px-4">A schema definition used to validate and parse incoming messages before they reach the <code className="prose-code">message</code> handler. When set, raw string messages are parsed as JSON and validated against the schema. Messages that fail validation are rejected with an error and the handler is not invoked. When not set, raw message strings are passed to the handler as-is.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">maxPayloadLength</code></td>
                <td className="py-3 px-4"><code className="prose-code">number</code></td>
                <td className="py-3 px-4"><code className="prose-code">65536</code></td>
                <td className="py-3 px-4">The maximum size of a single incoming message in bytes. Messages exceeding this limit are rejected and the connection may be closed. This is a critical security setting that prevents clients from sending payloads large enough to exhaust server memory. Set this to the maximum message size your application legitimately needs to handle.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">idleTimeout</code></td>
                <td className="py-3 px-4"><code className="prose-code">number</code></td>
                <td className="py-3 px-4"><code className="prose-code">120</code></td>
                <td className="py-3 px-4">The number of seconds a connection can remain idle (no messages sent or received) before it is automatically closed. This detects zombie connections from clients that disconnected without sending a close frame. The server sends ping frames and expects pong responses to determine liveness.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">compression</code></td>
                <td className="py-3 px-4"><code className="prose-code">boolean</code></td>
                <td className="py-3 px-4"><code className="prose-code">false</code></td>
                <td className="py-3 px-4">Enables per-message deflate compression as defined in RFC 7692. When enabled, text and binary frames are compressed before transmission, reducing bandwidth usage for large or repetitive payloads. Compression adds CPU overhead on both sides. Enable it for routes that transfer large JSON payloads; leave it disabled for routes with small, frequent messages where the compression overhead exceeds the bandwidth savings.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">handlers</code></td>
                <td className="py-3 px-4"><code className="prose-code">WSHandlers</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">An object containing callback functions for connection lifecycle events: <code className="prose-code">open</code> (connection established), <code className="prose-code">message</code> (data received), <code className="prose-code">close</code> (connection terminated with code and reason), and <code className="prose-code">error</code> (an error occurred on the connection). Only <code className="prose-code">message</code> is required; the others are optional.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          VexorWebSocket Methods
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Method</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Signature</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Default</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">send(data)</code></td>
                <td className="py-3 px-4"><code className="prose-code">(data: string | Buffer) =&gt; void</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Sends a raw text string or binary buffer to the connected client. Text data is sent as a text frame; binary data is sent as a binary frame. For structured data, prefer <code className="prose-code">json()</code> which handles serialization automatically.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">json(data)</code></td>
                <td className="py-3 px-4"><code className="prose-code">(data: unknown) =&gt; void</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Serializes the given JavaScript value as JSON and sends it as a text frame. This is the recommended method for sending structured data. The client must parse the received string with <code className="prose-code">JSON.parse()</code> to reconstruct the object.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">close(code?, reason?)</code></td>
                <td className="py-3 px-4"><code className="prose-code">(code?: number, reason?: string) =&gt; void</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Initiates a graceful close of the WebSocket connection by sending a close frame with an optional status code and reason string. The client receives the close frame and can perform its own cleanup. Common codes: 1000 (normal), 1001 (going away), 1008 (policy violation).</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">subscribe(topic)</code></td>
                <td className="py-3 px-4"><code className="prose-code">(topic: string) =&gt; void</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Adds this connection to the subscriber set for the given topic. After subscribing, the connection will receive messages published to this topic by other connections. Subscriptions are automatically cleaned up when the connection closes.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">unsubscribe(topic)</code></td>
                <td className="py-3 px-4"><code className="prose-code">(topic: string) =&gt; void</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Removes this connection from the subscriber set for the given topic. After unsubscribing, the connection will no longer receive messages published to this topic. Has no effect if the connection was not subscribed.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">publish(topic, data)</code></td>
                <td className="py-3 px-4"><code className="prose-code">(topic: string, data: string) =&gt; void</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Sends a message to all subscribers of the given topic, excluding the calling connection (the sender). The data must be a pre-serialized string. Use <code className="prose-code">JSON.stringify()</code> to send structured data. This is the primary mechanism for peer-to-peer communication through the server.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">ping()</code></td>
                <td className="py-3 px-4"><code className="prose-code">() =&gt; void</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Sends a WebSocket ping frame to the client. The client's WebSocket implementation automatically responds with a pong frame. Use this to measure round-trip latency or to verify that the connection is still alive. The server's idle timeout mechanism uses ping/pong internally.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card bg-slate-50 dark:bg-slate-800/50">
        <h2 id="next" className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Next Steps
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/realtime/pubsub" className="btn-primary">
            Pub/Sub &amp; Event Bus <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/realtime/sse" className="btn-secondary">
            Server-Sent Events
          </Link>
        </div>
      </section>
    </div>
  );
}
