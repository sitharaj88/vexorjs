import{j as e,C as s,I as t,L as a,A as o}from"./index-Bga0OgzL.js";const n=`import { Vexor, WebSocketServer } from '@vexorjs/core';
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
app.listen(3000, { websocket: wss });`,r=`import { WebSocketServer, Type } from '@vexorjs/core';
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
});`,c=`import { WebSocketServer } from '@vexorjs/core';
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
});`,i=`import { WebSocketServer } from '@vexorjs/core';

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
});`,d=`import { createWebSocketHandler, Type } from '@vexorjs/core';
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
});`,l=`// Get WebSocket server statistics
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
});`;function m(){return e.jsxs("div",{className:"space-y-12",children:[e.jsxs("div",{children:[e.jsx("h1",{id:"websocket",className:"text-4xl font-bold text-slate-900 dark:text-white mb-4",children:"WebSocket"}),e.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400 mb-4",children:"WebSocket is a communication protocol that provides full-duplex, bidirectional messaging between a client and server over a single, long-lived TCP connection. Unlike HTTP's request-response model where the client must initiate every exchange, a WebSocket connection allows both sides to send messages at any time, independently and concurrently. This makes it the protocol of choice for applications that require real-time, low-latency interaction: chat systems, collaborative editing, multiplayer games, live trading platforms, and interactive dashboards."}),e.jsxs("p",{className:"text-lg text-slate-600 dark:text-slate-400 mb-4",children:["A WebSocket connection begins its life as a standard HTTP request. The client sends an HTTP GET with an ",e.jsx("code",{className:"prose-code",children:"Upgrade: websocket"})," header, and the server responds with a ",e.jsx("code",{className:"prose-code",children:"101 Switching Protocols"}),' status. After this handshake, the HTTP connection is "upgraded" to the WebSocket protocol, and both sides switch to a binary framing format. From this point forward, data flows in small frames rather than HTTP messages, eliminating the per-message overhead of HTTP headers and enabling sub-millisecond message delivery.']}),e.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400 mb-4",children:"The WebSocket protocol defines several frame types: text frames carry UTF-8 string data, binary frames carry arbitrary bytes, ping and pong frames serve as heartbeat mechanisms, and close frames initiate connection shutdown. The ping/pong mechanism is particularly important for production deployments: the server periodically sends ping frames, and the client is expected to respond with pong frames. If no pong is received within a timeout, the server considers the client disconnected and cleans up resources."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400",children:["Vexor's ",e.jsx("code",{className:"prose-code",children:"WebSocketServer"})," provides a high-level API built on top of the raw WebSocket protocol. It adds route-based organization (different paths handle different features), topic-based pub/sub for efficient message fan-out, JSON message validation with schema checking, per-route configuration for payload limits and compression, and server-level broadcast and publish capabilities. This layered architecture lets you build complex real-time features without managing raw frames, connection tracking, or subscription lists manually."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"how-it-works",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"How It Works"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["When the Vexor server receives an HTTP request with an ",e.jsx("code",{className:"prose-code",children:"Upgrade: websocket"})," header, it matches the request path against registered WebSocket routes. If a matching route is found, the server completes the HTTP upgrade handshake and creates a ",e.jsx("code",{className:"prose-code",children:"VexorWebSocket"})," instance that wraps the raw connection. Each instance is assigned a unique ",e.jsx("code",{className:"prose-code",children:"ws.id"})," for identification and tracking."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The route's handler callbacks are invoked at key points in the connection lifecycle. The ",e.jsx("code",{className:"prose-code",children:"open"})," handler fires immediately after the connection is established, giving you a chance to perform initial setup like subscribing the client to topics, sending a welcome message, or recording the connection in an external tracking system. The ",e.jsx("code",{className:"prose-code",children:"message"})," handler fires each time the client sends a message. If a ",e.jsx("code",{className:"prose-code",children:"messageSchema"})," is configured, the incoming message is parsed and validated against the schema before reaching your handler; invalid messages are rejected automatically with an error response."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Topic-based routing is the backbone of Vexor's WebSocket architecture. When a client calls ",e.jsx("code",{className:"prose-code",children:"ws.subscribe('room:123')"}),", the server adds that connection to an in-memory set of subscribers for that topic. When any connection calls ",e.jsx("code",{className:"prose-code",children:"ws.publish('room:123', data)"}),", the message is delivered to every subscriber of that topic except the sender. This pub/sub mechanism is implemented at the server level with O(1) per-subscriber delivery, making it efficient even with thousands of active topics and connections."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400",children:["When a client disconnects, either voluntarily or due to a network failure, the ",e.jsx("code",{className:"prose-code",children:"close"})," handler fires with a status code and reason string. The server automatically removes the connection from all topic subscriptions, preventing stale references and ensuring that subsequent publish operations do not attempt to write to closed connections. This automatic cleanup means you rarely need to manage subscriptions manually in the close handler."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"when-to-use",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"When to Use WebSocket"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"WebSocket is the right choice when your application requires bidirectional real-time communication. If the client needs to send frequent, low-latency messages to the server (not just receive updates), WebSocket is the appropriate protocol. Chat applications, collaborative editors, multiplayer games, remote terminals, and interactive whiteboards all fall into this category."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"WebSocket is also appropriate for high-frequency unidirectional streaming where the volume and rate of messages exceeds what SSE can comfortably handle. Financial data feeds that deliver hundreds of updates per second, audio/video signaling channels, and IoT sensor streams often use WebSocket for its lower per-message overhead and binary frame support. SSE is limited to text-based data and incurs slightly more overhead per message due to its line-based format."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"The trade-offs of WebSocket relative to SSE include additional complexity (you must manage connection state, handle reconnection in client code, and deal with the upgrade handshake), reduced compatibility with HTTP infrastructure (some proxies, firewalls, and CDNs interfere with WebSocket upgrades), and the loss of standard HTTP features like caching, compression negotiation, and cookie-based authentication during the upgrade. WebSocket connections also consume a dedicated file descriptor each, whereas SSE over HTTP/2 multiplexes streams over shared connections."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400",children:"As a general principle, use SSE for server-to-client streaming and WebSocket for scenarios where the client must send messages back to the server over the same persistent connection. If you find yourself implementing a WebSocket endpoint where the client only receives data and never sends anything, SSE is likely a simpler and more robust choice."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"basic-usage",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Basic Usage"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Create a ",e.jsx("code",{className:"prose-code",children:"WebSocketServer"})," instance and define routes using the ",e.jsx("code",{className:"prose-code",children:"route()"})," method. Each route maps a URL path to a set of handler callbacks that respond to connection lifecycle events. The four available handlers are ",e.jsx("code",{className:"prose-code",children:"open"})," (connection established), ",e.jsx("code",{className:"prose-code",children:"message"})," (data received from client), ",e.jsx("code",{className:"prose-code",children:"close"})," (connection terminated), and ",e.jsx("code",{className:"prose-code",children:"error"})," (an error occurred)."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Attach the WebSocket server to your Vexor application by passing it to ",e.jsx("code",{className:"prose-code",children:"app.listen()"})," in the options object. Vexor handles the HTTP upgrade negotiation internally, routing incoming WebSocket connections to the correct handler based on the request path. You can define multiple routes on the same server, each serving a different real-time feature at a different path."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Every WebSocket connection receives a unique ",e.jsx("code",{className:"prose-code",children:"ws.id"})," string that persists for the lifetime of the connection. Use this ID for logging, debugging, and correlating messages across handlers. The ",e.jsx("code",{className:"prose-code",children:"ws.send()"})," method sends raw text or binary data, while ",e.jsx("code",{className:"prose-code",children:"ws.json()"})," serializes a JavaScript object as JSON and sends it as a text frame. For most applications, ",e.jsx("code",{className:"prose-code",children:"ws.json()"})," is the preferred method because it handles serialization automatically."]}),e.jsx(s,{code:n,filename:"src/server.ts",showLineNumbers:!0}),e.jsxs(t,{variant:"info",children:["Each WebSocket connection is assigned a unique ",e.jsx("code",{className:"prose-code",children:"ws.id"})," that you can use for tracking, logging, and targeted messaging."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"handling-messages",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Handling Messages"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["In production WebSocket applications, you cannot trust the shape or content of incoming messages. Clients may send malformed JSON, missing fields, or payloads that exceed expected sizes. The ",e.jsx("code",{className:"prose-code",children:"messageSchema"})," option lets you define a schema that incoming messages must conform to. Messages that fail validation are rejected before they reach your handler, preventing your application code from operating on invalid data."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Schema validation uses the same ",e.jsx("code",{className:"prose-code",children:"Type"})," builder used throughout Vexor for HTTP request validation. You can define exact object shapes, union types for messages with different structures, and constraints like minimum and maximum string lengths. When validation is enabled, the ",e.jsx("code",{className:"prose-code",children:"message"})," handler receives the parsed and typed object rather than a raw string, giving you type safety throughout your handler logic."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Per-route configuration lets you tune resource limits for different use cases. The ",e.jsx("code",{className:"prose-code",children:"maxPayloadLength"})," option caps the maximum size of a single message in bytes, protecting the server from memory exhaustion attacks. The ",e.jsx("code",{className:"prose-code",children:"idleTimeout"})," option closes connections that have not sent or received any data within the specified number of seconds, freeing up resources held by abandoned connections. The ",e.jsx("code",{className:"prose-code",children:"compression"})," option enables per-message deflate compression, which reduces bandwidth for text-heavy payloads at the cost of additional CPU usage."]}),e.jsx(s,{code:r,filename:"src/ws/api.ts",showLineNumbers:!0}),e.jsxs(t,{variant:"warning",children:["Always set ",e.jsx("code",{className:"prose-code",children:"maxPayloadLength"})," to prevent clients from sending excessively large messages that could consume server memory."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"topics-pubsub",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Topics and Pub/Sub"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Topic-based pub/sub is the mechanism that makes WebSocket applications scalable. Without topics, sending a message to a specific group of clients requires the server to maintain manual lists of connections and iterate over them. With topics, clients subscribe to named channels, and the server handles fan-out delivery transparently. This decouples message routing from your application logic and makes it trivial to implement features like chat rooms, per-user notifications, and real-time collaboration."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["When a client calls ",e.jsx("code",{className:"prose-code",children:"ws.subscribe('room:123')"}),", the server adds that connection to an internal subscriber set for the topic ",e.jsx("code",{className:"prose-code",children:"room:123"}),". The client can subscribe to any number of topics simultaneously. When any client calls ",e.jsx("code",{className:"prose-code",children:"ws.publish('room:123', data)"}),', the server iterates over all subscribers of that topic and sends the message to each one, excluding the publisher itself. This "exclude sender" behavior is the convention for chat-like applications where the sender already has its own copy of the message.']}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Topic names are arbitrary strings, and a common pattern is to use colon-separated namespaces: ",e.jsx("code",{className:"prose-code",children:"room:general"}),", ",e.jsx("code",{className:"prose-code",children:"user:123:notifications"}),", ",e.jsx("code",{className:"prose-code",children:"game:abc:moves"}),". This naming convention makes it easy to reason about topic scopes and implement access control by checking the topic name in the message handler before allowing a subscribe or publish operation."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["When a client disconnects, all of its topic subscriptions are automatically removed. You do not need to manually unsubscribe in the ",e.jsx("code",{className:"prose-code",children:"close"})," handler. This automatic cleanup prevents dead connections from accumulating in subscriber sets and ensures that publish operations never attempt to write to closed connections."]}),e.jsx(s,{code:c,filename:"src/ws/realtime.ts",showLineNumbers:!0}),e.jsx(t,{variant:"tip",children:"Topic subscriptions are automatically cleaned up when a client disconnects. You do not need to manually unsubscribe in the close handler."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"broadcasting",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Broadcasting"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["While ",e.jsx("code",{className:"prose-code",children:"ws.publish()"}),' sends messages from within a WebSocket handler (in the context of a connected client), server-level broadcast and publish methods let you push messages from anywhere in your application. This is essential for integrating WebSocket updates with the rest of your system: an HTTP endpoint that creates a new order can publish a "new order" event to all connected dashboard clients, a cron job can broadcast system maintenance notifications, and a database change listener can push real-time updates.']}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"wss.broadcast()"})," method sends a message to all subscribers of a topic, including any connection that initiated the broadcast (unlike ",e.jsx("code",{className:"prose-code",children:"ws.publish()"}),", which excludes the sender). The ",e.jsx("code",{className:"prose-code",children:"wss.publish()"})," method works identically at the server level. The ",e.jsx("code",{className:"prose-code",children:"wss.addClient()"})," and ",e.jsx("code",{className:"prose-code",children:"wss.removeClient()"})," methods let you maintain named client groups for manual tracking, though topic subscriptions are usually sufficient for message routing."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["For graceful shutdown, the ",e.jsx("code",{className:"prose-code",children:"wss.closeAll()"})," method closes every active WebSocket connection with a specified close code and reason string. This should be called during the application shutdown sequence so that clients receive a clean close frame and can reconnect to another server instance in a load-balanced deployment, rather than experiencing an abrupt TCP reset."]}),e.jsx(s,{code:i,filename:"src/ws/dashboard.ts",showLineNumbers:!0})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"json-messages",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Type-Safe JSON Messages"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Real-world WebSocket applications typically communicate using structured JSON messages. A chat application might have message, typing indicator, presence update, and room management events, each with a different payload shape. The ",e.jsx("code",{className:"prose-code",children:"createWebSocketHandler()"})," function combined with schema validation provides end-to-end type safety for this pattern."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Define a TypeScript discriminated union for your client message types, then create a matching schema using ",e.jsx("code",{className:"prose-code",children:"Type.Union()"}),". The schema validates that each incoming message matches one of the expected shapes and enforces constraints like minimum and maximum string lengths. The ",e.jsx("code",{className:"prose-code",children:"message"})," handler receives the validated, typed message object, so you can use a type-narrowing switch statement to handle each message type with full type safety and autocompletion."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"This pattern catches protocol errors at the boundary rather than deep inside your business logic. If a client sends a message with a missing field or an invalid type, the validation layer rejects it before your handler executes. This reduces the surface area for bugs and makes your WebSocket handlers as predictable and testable as typed HTTP endpoint handlers."}),e.jsx(s,{code:d,filename:"src/ws/chat.ts",showLineNumbers:!0})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"connection-stats",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Connection Statistics and Monitoring"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Monitoring WebSocket connections in production is critical for understanding resource usage, detecting anomalies, and planning capacity. The ",e.jsx("code",{className:"prose-code",children:"wss.getStats()"})," method provides a snapshot of the server's current state, including the total number of connections established since startup, the number of currently active connections, cumulative message counts, the number of active topics, and server uptime."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The most important metric to track is ",e.jsx("code",{className:"prose-code",children:"activeConnections"}),", which directly correlates with memory and file descriptor consumption. Each active WebSocket connection holds a kernel file descriptor, a send buffer, a receive buffer, and any application-level state you attach to it. If active connections grow unexpectedly, it may indicate clients that are connecting but never disconnecting, or a connection leak in your client-side code."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Exposing statistics through an HTTP endpoint (as shown below) allows monitoring systems to scrape metrics at regular intervals. You can also compute derived metrics like messages per second, average connections per minute, and topic churn rate. For per-client diagnostics, each ",e.jsx("code",{className:"prose-code",children:"VexorWebSocket"})," instance exposes ",e.jsx("code",{className:"prose-code",children:"ws.id"})," and ",e.jsx("code",{className:"prose-code",children:"ws.remoteAddress"}),", and the ",e.jsx("code",{className:"prose-code",children:"ws.ping()"})," method sends a WebSocket ping frame to measure round-trip latency."]}),e.jsx(s,{code:l,filename:"src/ws/monitoring.ts",showLineNumbers:!0})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"best-practices",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Best Practices"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Always set ",e.jsx("code",{className:"prose-code",children:"maxPayloadLength"})," on every WebSocket route. Without a limit, a malicious client can send arbitrarily large messages that consume the server's memory. A sensible default for text-based JSON messaging is 64 KB. For routes that handle file uploads or binary data, increase the limit to match your application's requirements, but always set an explicit ceiling."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Use ",e.jsx("code",{className:"prose-code",children:"messageSchema"})," validation for all production WebSocket routes. Unvalidated messages force you to write defensive parsing code in every handler, which is error-prone and leads to inconsistent error handling. Schema validation centralizes input validation and guarantees that your handler only receives well-formed data."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Implement heartbeat checking with ",e.jsx("code",{className:"prose-code",children:"idleTimeout"}),". Mobile clients, laptop lid closures, and network transitions can leave TCP connections in a half-open state where the server believes the client is still connected but the client is actually gone. The idle timeout detects these zombie connections and closes them, freeing up resources. A timeout of 60 to 120 seconds is appropriate for most applications."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400",children:["Design your message protocol as a discriminated union with a ",e.jsx("code",{className:"prose-code",children:"type"})," field. This pattern makes it trivial to add new message types without breaking existing handlers, and it works naturally with both schema validation and TypeScript type narrowing. Document the message protocol so that client developers know exactly which message shapes are accepted and what responses to expect."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"api-reference",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"API Reference"}),e.jsx("h3",{className:"text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3",children:"WSRouteOptions"}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Option"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Type"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Default"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Description"})]})}),e.jsxs("tbody",{className:"text-slate-600 dark:text-slate-400",children:[e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"messageSchema"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"TSchema"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"undefined"})}),e.jsxs("td",{className:"py-3 px-4",children:["A schema definition used to validate and parse incoming messages before they reach the ",e.jsx("code",{className:"prose-code",children:"message"})," handler. When set, raw string messages are parsed as JSON and validated against the schema. Messages that fail validation are rejected with an error and the handler is not invoked. When not set, raw message strings are passed to the handler as-is."]})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"maxPayloadLength"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"number"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"65536"})}),e.jsx("td",{className:"py-3 px-4",children:"The maximum size of a single incoming message in bytes. Messages exceeding this limit are rejected and the connection may be closed. This is a critical security setting that prevents clients from sending payloads large enough to exhaust server memory. Set this to the maximum message size your application legitimately needs to handle."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"idleTimeout"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"number"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"120"})}),e.jsx("td",{className:"py-3 px-4",children:"The number of seconds a connection can remain idle (no messages sent or received) before it is automatically closed. This detects zombie connections from clients that disconnected without sending a close frame. The server sends ping frames and expects pong responses to determine liveness."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"compression"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"boolean"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"false"})}),e.jsx("td",{className:"py-3 px-4",children:"Enables per-message deflate compression as defined in RFC 7692. When enabled, text and binary frames are compressed before transmission, reducing bandwidth usage for large or repetitive payloads. Compression adds CPU overhead on both sides. Enable it for routes that transfer large JSON payloads; leave it disabled for routes with small, frequent messages where the compression overhead exceeds the bandwidth savings."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"handlers"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"WSHandlers"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsxs("td",{className:"py-3 px-4",children:["An object containing callback functions for connection lifecycle events: ",e.jsx("code",{className:"prose-code",children:"open"})," (connection established), ",e.jsx("code",{className:"prose-code",children:"message"})," (data received), ",e.jsx("code",{className:"prose-code",children:"close"})," (connection terminated with code and reason), and ",e.jsx("code",{className:"prose-code",children:"error"})," (an error occurred on the connection). Only ",e.jsx("code",{className:"prose-code",children:"message"})," is required; the others are optional."]})]})]})]})}),e.jsx("h3",{className:"text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3",children:"VexorWebSocket Methods"}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Method"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Signature"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Default"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Description"})]})}),e.jsxs("tbody",{className:"text-slate-600 dark:text-slate-400",children:[e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"send(data)"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"(data: string | Buffer) => void"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsxs("td",{className:"py-3 px-4",children:["Sends a raw text string or binary buffer to the connected client. Text data is sent as a text frame; binary data is sent as a binary frame. For structured data, prefer ",e.jsx("code",{className:"prose-code",children:"json()"})," which handles serialization automatically."]})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"json(data)"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"(data: unknown) => void"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsxs("td",{className:"py-3 px-4",children:["Serializes the given JavaScript value as JSON and sends it as a text frame. This is the recommended method for sending structured data. The client must parse the received string with ",e.jsx("code",{className:"prose-code",children:"JSON.parse()"})," to reconstruct the object."]})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"close(code?, reason?)"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"(code?: number, reason?: string) => void"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsx("td",{className:"py-3 px-4",children:"Initiates a graceful close of the WebSocket connection by sending a close frame with an optional status code and reason string. The client receives the close frame and can perform its own cleanup. Common codes: 1000 (normal), 1001 (going away), 1008 (policy violation)."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"subscribe(topic)"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"(topic: string) => void"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsx("td",{className:"py-3 px-4",children:"Adds this connection to the subscriber set for the given topic. After subscribing, the connection will receive messages published to this topic by other connections. Subscriptions are automatically cleaned up when the connection closes."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"unsubscribe(topic)"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"(topic: string) => void"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsx("td",{className:"py-3 px-4",children:"Removes this connection from the subscriber set for the given topic. After unsubscribing, the connection will no longer receive messages published to this topic. Has no effect if the connection was not subscribed."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"publish(topic, data)"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"(topic: string, data: string) => void"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsxs("td",{className:"py-3 px-4",children:["Sends a message to all subscribers of the given topic, excluding the calling connection (the sender). The data must be a pre-serialized string. Use ",e.jsx("code",{className:"prose-code",children:"JSON.stringify()"})," to send structured data. This is the primary mechanism for peer-to-peer communication through the server."]})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"ping()"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"() => void"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsx("td",{className:"py-3 px-4",children:"Sends a WebSocket ping frame to the client. The client's WebSocket implementation automatically responds with a pong frame. Use this to measure round-trip latency or to verify that the connection is still alive. The server's idle timeout mechanism uses ping/pong internally."})]})]})]})})]}),e.jsxs("section",{className:"card bg-slate-50 dark:bg-slate-800/50",children:[e.jsx("h2",{id:"next",className:"text-xl font-bold text-slate-900 dark:text-white mb-4",children:"Next Steps"}),e.jsxs("div",{className:"flex flex-wrap gap-3",children:[e.jsxs(a,{to:"/realtime/pubsub",className:"btn-primary",children:["Pub/Sub & Event Bus ",e.jsx(o,{className:"w-4 h-4 ml-2"})]}),e.jsx(a,{to:"/realtime/sse",className:"btn-secondary",children:"Server-Sent Events"})]})]})]})}export{m as default};
