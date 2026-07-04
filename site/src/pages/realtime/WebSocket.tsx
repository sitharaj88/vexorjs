import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const basicUsageCode = `import { Vexor } from '@vexorjs/core';

const app = new Vexor();

// First-class WebSocket routes, registered on the app itself
app.ws('/chat/:room', {
  open(ws, ctx) {
    console.log('Client connected:', ws.id);
    ws.subscribe(ctx.params.room);
    ws.json({ type: 'welcome', room: ctx.params.room });
  },

  message(ws, data, ctx) {
    // Text frames arrive JSON-parsed; if the payload is not
    // valid JSON, \`data\` is the raw string
    ws.publish(ctx.params.room, JSON.stringify(data));
  },

  close(ws, code, reason, ctx) {
    console.log(\`Client \${ws.id} left \${ctx.params.room}: \${code} \${reason}\`);
  },

  error(ws, error, ctx) {
    console.error(\`WebSocket error for \${ws.id}:\`, error);
  },
});

// On Node.js, WebSocket routes are served through the optional
// \`ws\` package: npm install ws
app.listen(3000);`;

const routeParamsCode = `// :params and trailing wildcards use the same radix router
// as your HTTP routes
app.ws('/games/:gameId/players/:playerId', {
  open(ws, ctx) {
    const { gameId, playerId } = ctx.params;
    ws.subscribe(\`game:\${gameId}\`);
    ws.json({ joined: gameId, as: playerId });
  },
});

app.ws('/streams/*', {
  open(ws, ctx) {
    // ctx is built from the HTTP upgrade request, so params,
    // query, headers, and cookies read like any HTTP handler
    const token = ctx.query.token;
    const origin = ctx.header('origin');

    if (!token) {
      ws.close(1008, 'Missing token');
      return;
    }

    console.log(\`Stream opened from \${origin}\`);
  },
});`;

const messagesCode = `app.ws('/api', {
  message(ws, data, ctx) {
    // Payloads that are not valid JSON arrive as the raw string
    if (typeof data === 'string') {
      ws.send(\`echo: \${data}\`);
      return;
    }

    // JSON payloads arrive already parsed — narrow the shape yourself
    const msg = data as { type: string; channel?: string };

    switch (msg.type) {
      case 'ping':
        ws.json({ type: 'pong', timestamp: Date.now() });
        break;

      case 'subscribe':
        if (msg.channel) {
          ws.subscribe(msg.channel);
          ws.json({ type: 'subscribed', channel: msg.channel });
        }
        break;

      default:
        ws.json({ type: 'error', message: \`Unknown type: \${msg.type}\` });
    }
  },

  // Heartbeat frames have their own handlers
  ping(ws, data) {
    console.log('ping received from', ws.id);
  },
  pong(ws, data) {
    console.log('pong received from', ws.id);
  },
});`;

const topicsCode = `app.ws('/rooms/:roomId', {
  open(ws, ctx) {
    // Subscribe this connection to the room's topic
    ws.subscribe(\`room:\${ctx.params.roomId}\`);

    // Notify everyone else in the room (publish excludes the sender)
    ws.publish(\`room:\${ctx.params.roomId}\`, JSON.stringify({
      type: 'user-joined',
      userId: ws.id,
    }));
  },

  message(ws, data, ctx) {
    const topic = \`room:\${ctx.params.roomId}\`;

    // Relay chat messages to every other subscriber
    ws.publish(topic, JSON.stringify({
      type: 'new-message',
      from: ws.id,
      payload: data,
      timestamp: Date.now(),
    }));
  },

  close(ws) {
    // Subscriptions are cleaned up automatically on disconnect —
    // no manual unsubscribe needed here
  },
});`;

const hubCode = `// The connection hub is available as app.websockets from
// anywhere in your application
const hub = app.websockets;

// Broadcast to every connected client, across all ws routes
hub.broadcast(JSON.stringify({ type: 'announcement', text: 'Deploy at 5pm' }));

// Publish to all subscribers of a topic (unlike ws.publish(),
// this does not exclude anyone)
hub.publish('dashboard-updates', JSON.stringify({ type: 'metrics', cpu: 42 }));

// Inspect subscribers and connections
const dashboards = hub.getSubscribers('dashboard-updates');
console.log(\`\${dashboards.length} dashboards connected\`);
console.log(\`\${hub.clients.size} total connections\`);

// Push real-time updates from ordinary HTTP handlers
app.post('/orders', async (ctx) => {
  const order = await createOrder(await ctx.body());

  app.websockets.publish('orders', JSON.stringify({
    type: 'order-created',
    order,
  }));

  return ctx.status(201).json(order);
});

// Stats snapshot
const stats = hub.getStats();
// { clients: number, topics: number, subscriptions: Map<string, number> }`;

const shutdownCode = `// With gracefulShutdown enabled, SIGTERM/SIGINT trigger a clean close
const app = new Vexor({ gracefulShutdown: true });

// app.close() closes every WebSocket connection first with
// code 1001 ("Server shutting down"), then drains in-flight
// HTTP requests before stopping the server
await app.close({ timeout: 10_000 });`;

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
        <p className="text-slate-600 dark:text-slate-400">
          Vexor makes WebSockets a first-class part of the app: <code className="prose-code">app.ws(path, handlers)</code>{' '}
          registers a WebSocket route right next to your HTTP routes, with the same{' '}
          <code className="prose-code">:param</code> and wildcard path matching. Each connection is
          wrapped in a <code className="prose-code">VexorWebSocket</code> with topic-based pub/sub
          built in, and the app-wide hub at <code className="prose-code">app.websockets</code> lets
          any part of your application broadcast or publish to connected clients.
        </p>
      </div>

      <section>
        <h2 id="how-it-works" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          How It Works
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When you call <code className="prose-code">app.ws()</code>, the route is stored in a
          registry backed by the same radix router that serves HTTP routes, so{' '}
          <code className="prose-code">:params</code> and trailing wildcards behave identically.
          On <code className="prose-code">app.listen()</code>, Vexor hooks the HTTP server's{' '}
          <code className="prose-code">upgrade</code> event: incoming upgrade requests are matched
          against the registry, unmatched paths receive a 404 and the socket is closed, and
          matched paths complete the handshake through the <code className="prose-code">ws</code>{' '}
          package.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For every accepted connection, Vexor builds a <code className="prose-code">VexorContext</code>{' '}
          from the upgrade request. Your handlers receive it alongside the socket, so route
          params, query string, headers, and cookies are read exactly like in an HTTP handler.
          The connection itself is wrapped in a <code className="prose-code">VexorWebSocket</code>{' '}
          with a unique <code className="prose-code">ws.id</code>, and registered with the
          app-wide hub.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Incoming text frames are parsed as JSON before reaching your{' '}
          <code className="prose-code">message</code> handler; payloads that are not valid JSON
          fall back to the raw string. Binary frames are delivered as-is. Topic-based routing is
          the backbone of fan-out: <code className="prose-code">ws.subscribe(topic)</code> adds the
          connection to an in-memory subscriber set, and{' '}
          <code className="prose-code">ws.publish(topic, message)</code> delivers to every
          subscriber except the sender.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          When a client disconnects — voluntarily or through a network failure — the{' '}
          <code className="prose-code">close</code> handler fires with a status code and reason,
          and the server automatically removes the connection from the hub and from all topic
          subscriptions. You rarely need to manage subscriptions manually in the close handler.
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
          Register a WebSocket route with <code className="prose-code">app.ws(path, handlers)</code>.
          The handlers object accepts callbacks for the connection lifecycle:{' '}
          <code className="prose-code">open(ws, ctx)</code> fires when a connection is established,{' '}
          <code className="prose-code">message(ws, data, ctx)</code> fires for each incoming frame,{' '}
          <code className="prose-code">close(ws, code, reason, ctx)</code> fires on disconnect,{' '}
          <code className="prose-code">error(ws, error, ctx)</code> fires on connection errors, and{' '}
          <code className="prose-code">ping(ws, data)</code> / <code className="prose-code">pong(ws, data)</code>{' '}
          fire for heartbeat frames. All handlers are optional.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Every connection receives a unique <code className="prose-code">ws.id</code> string that
          persists for its lifetime — use it for logging, debugging, and correlating messages
          across handlers. The <code className="prose-code">ws.send()</code> method sends raw text
          or binary data, while <code className="prose-code">ws.json()</code> serializes a
          JavaScript value as JSON and sends it as a text frame; for structured data,{' '}
          <code className="prose-code">ws.json()</code> is the preferred method.
        </p>
        <CodeBlock code={basicUsageCode} filename="src/server.ts" showLineNumbers />
        <InfoBlock variant="warning" title="Runtime Support">
          <code className="prose-code">app.ws()</code> currently runs on the <strong>Node.js</strong>{' '}
          runtime via the optional <code className="prose-code">ws</code> package — install it with{' '}
          <code className="prose-code">npm install ws</code>. Other runtimes are not wired up yet:
          calling <code className="prose-code">app.listen()</code> on Bun with WebSocket routes
          registered throws a clear error (use <code className="prose-code">Bun.serve({'{ websocket }'})</code>{' '}
          directly for now).
        </InfoBlock>
      </section>

      <section>
        <h2 id="route-params" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Route Params and the Upgrade Context
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          WebSocket paths support <code className="prose-code">:params</code> and trailing
          wildcards through the same radix router as HTTP routes. Every handler receives a{' '}
          <code className="prose-code">ctx</code> built from the HTTP upgrade request:{' '}
          <code className="prose-code">ctx.params</code> holds the matched path parameters,{' '}
          <code className="prose-code">ctx.query</code> the parsed query string, and{' '}
          <code className="prose-code">ctx.header(name)</code> / <code className="prose-code">ctx.cookie(name)</code>{' '}
          expose the upgrade request's headers and cookies. This is the natural place for
          connection-time authentication: read a token from the query string or a cookie in{' '}
          <code className="prose-code">open</code>, and call{' '}
          <code className="prose-code">ws.close(1008, ...)</code> to reject the connection.
        </p>
        <CodeBlock code={routeParamsCode} filename="src/ws/routes.ts" showLineNumbers />
      </section>

      <section>
        <h2 id="handling-messages" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Handling Messages
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Incoming text frames are automatically parsed as JSON before your{' '}
          <code className="prose-code">message</code> handler runs. If the payload is not valid
          JSON, the handler receives the raw string instead, so a quick{' '}
          <code className="prose-code">typeof data === 'string'</code> check distinguishes plain
          text from structured messages. Binary frames are passed through untouched.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Because clients can send anything, treat <code className="prose-code">data</code> as{' '}
          <code className="prose-code">unknown</code> and validate or narrow it at the top of the
          handler before acting on it. A discriminated union with a{' '}
          <code className="prose-code">type</code> field is the standard pattern — it keeps the
          protocol extensible and works naturally with TypeScript narrowing.
        </p>
        <CodeBlock code={messagesCode} filename="src/ws/api.ts" showLineNumbers />
      </section>

      <section>
        <h2 id="topics-pubsub" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Topics and Pub/Sub
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Topic-based pub/sub is the mechanism that makes WebSocket applications scalable. Without topics, sending a message to a specific group of clients requires the server to maintain manual lists of connections and iterate over them. With topics, clients subscribe to named channels, and the server handles fan-out delivery transparently. This decouples message routing from your application logic and makes it trivial to implement features like chat rooms, per-user notifications, and real-time collaboration.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When a client calls <code className="prose-code">ws.subscribe('room:123')</code>, the server adds that connection to an internal subscriber set for the topic <code className="prose-code">room:123</code>. The client can subscribe to any number of topics simultaneously. When any connection calls <code className="prose-code">ws.publish('room:123', data)</code>, the server sends the message to every subscriber of that topic <strong>excluding the sender</strong> — the convention for chat-like applications where the sender already has its own copy of the message.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Topic names are arbitrary strings, and a common pattern is to use colon-separated namespaces: <code className="prose-code">room:general</code>, <code className="prose-code">user:123:notifications</code>, <code className="prose-code">game:abc:moves</code>. This naming convention makes it easy to reason about topic scopes and implement access control by checking the topic name before allowing a subscribe or publish operation.
        </p>
        <CodeBlock code={topicsCode} filename="src/ws/rooms.ts" showLineNumbers />
        <InfoBlock variant="tip">
          Topic subscriptions are automatically cleaned up when a client disconnects. You do not
          need to manually unsubscribe in the close handler.
        </InfoBlock>
      </section>

      <section>
        <h2 id="connection-hub" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          The Connection Hub: app.websockets
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          While <code className="prose-code">ws.publish()</code> sends messages from within a
          handler in the context of a connected client, the hub at{' '}
          <code className="prose-code">app.websockets</code> lets you push messages from anywhere
          in your application. This is essential for integrating real-time updates with the rest
          of your system: an HTTP endpoint that creates an order can publish an event to all
          connected dashboards, a cron job can broadcast maintenance notices, and a database
          change listener can push live updates.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="prose-code">broadcast(message)</code> sends to every connected client
          across all WebSocket routes. <code className="prose-code">publish(topic, message)</code>{' '}
          sends to all subscribers of a topic — unlike <code className="prose-code">ws.publish()</code>,
          it does not exclude anyone. <code className="prose-code">getSubscribers(topic)</code>{' '}
          returns the <code className="prose-code">VexorWebSocket</code> instances subscribed to a
          topic, and <code className="prose-code">clients</code> is a{' '}
          <code className="prose-code">Map</code> of connection IDs to sockets for direct,
          targeted messaging. <code className="prose-code">getStats()</code> returns a snapshot
          with the client count, topic count, and per-topic subscription counts.
        </p>
        <CodeBlock code={hubCode} filename="src/ws/hub.ts" showLineNumbers />
      </section>

      <section>
        <h2 id="graceful-shutdown" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Graceful Shutdown
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          WebSocket connections don't "finish" the way in-flight HTTP requests do, so{' '}
          <code className="prose-code">app.close()</code> closes them first — every connection
          receives a close frame with code <code className="prose-code">1001</code> ("Server
          shutting down") before the HTTP listener drains and stops. Clients that implement
          reconnection logic can treat 1001 as a signal to reconnect elsewhere, which is exactly
          what you want in a load-balanced rolling deploy.
        </p>
        <CodeBlock code={shutdownCode} showLineNumbers />
      </section>

      <section>
        <h2 id="best-practices" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Best Practices
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Authenticate at connection time.</strong> The upgrade request is your one chance
          to see headers and cookies before the socket opens. Validate a token in the{' '}
          <code className="prose-code">open</code> handler (from{' '}
          <code className="prose-code">ctx.query</code> or <code className="prose-code">ctx.cookie()</code>)
          and close unauthorized connections with code 1008 (policy violation) immediately.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Validate every incoming message.</strong> The auto-JSON parsing gives you a
          convenient value, not a trusted one. Narrow the payload's shape at the top of the{' '}
          <code className="prose-code">message</code> handler before acting on it, and respond
          with a structured error for anything unexpected.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Design your message protocol as a discriminated union</strong> with a{' '}
          <code className="prose-code">type</code> field. This pattern makes it trivial to add new
          message types without breaking existing handlers, and it works naturally with
          TypeScript type narrowing. Document the protocol so client developers know exactly
          which message shapes are accepted and what responses to expect.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          <strong>Shut down cleanly.</strong> Rely on <code className="prose-code">app.close()</code>{' '}
          (or the <code className="prose-code">gracefulShutdown</code> config) so clients receive a
          proper 1001 close frame instead of an abrupt TCP reset, and can reconnect to another
          instance behind your load balancer.
        </p>
      </section>

      <section>
        <h2 id="api-reference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          API Reference
        </h2>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">
          Event Handlers
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The second argument to <code className="prose-code">app.ws(path, handlers)</code>. All
          handlers are optional and may return promises. <code className="prose-code">ctx</code> is
          the <code className="prose-code">VexorContext</code> built from the upgrade request.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Handler</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Signature</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">open</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(ws, ctx) =&gt; void | Promise&lt;void&gt;</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Fires when a connection is established. Subscribe to topics, send a welcome message, or authenticate here.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">message</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(ws, data, ctx) =&gt; void | Promise&lt;void&gt;</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Fires per incoming frame. Text frames are auto-parsed as JSON (falling back to the raw string); binary frames pass through untouched.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">close</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(ws, code, reason, ctx) =&gt; void | Promise&lt;void&gt;</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Fires when the connection ends. The client is already removed from the hub and all topics.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">error</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(ws, error, ctx) =&gt; void | Promise&lt;void&gt;</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Fires when an error occurs on the connection.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">ping</code> / <code className="prose-code">pong</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(ws, data: ArrayBuffer) =&gt; void</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Fire when heartbeat frames are received. Useful for measuring latency or tracking liveness.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          VexorWebSocket
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Member</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Signature</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">id</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">string</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Unique connection ID, stable for the connection's lifetime.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">remoteAddress</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">string</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The client's remote address.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">topics</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Set&lt;string&gt;</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Topics this connection is currently subscribed to.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">send(message)</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(message: string | ArrayBuffer | Uint8Array) =&gt; void</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Sends a raw text or binary frame. No-op if the connection is not open.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">json(data)</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(data: unknown) =&gt; void</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Serializes the value as JSON and sends it as a text frame. Preferred for structured data.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">close(code?, reason?)</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(code?: number, reason?: string) =&gt; void</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Gracefully closes the connection. Defaults to code 1000. Common codes: 1000 (normal), 1001 (going away), 1008 (policy violation).</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">subscribe(topic)</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(topic: string) =&gt; void</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Adds the connection to the topic's subscriber set. Cleaned up automatically on disconnect.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">unsubscribe(topic)</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(topic: string) =&gt; void</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Removes the connection from the topic's subscriber set.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">isSubscribed(topic)</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(topic: string) =&gt; boolean</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Checks whether the connection is subscribed to a topic.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">publish(topic, message)</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(topic: string, message: string | ArrayBuffer | Uint8Array) =&gt; void</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Sends a message to all subscribers of the topic, <strong>excluding this connection</strong> (the sender). Use <code className="prose-code">JSON.stringify()</code> for structured payloads.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">ping(data?)</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(data?: ArrayBuffer) =&gt; void</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Pings the client to verify liveness or measure round-trip latency.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          app.websockets (Hub)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Member</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Signature</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">clients</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Map&lt;string, VexorWebSocket&gt;</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">All connected clients, keyed by connection ID. Use for direct, targeted messaging.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">broadcast(message)</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(message: string | ArrayBuffer | Uint8Array) =&gt; void</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Sends a message to every connected client, across all WebSocket routes.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">publish(topic, message)</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(topic: string, message: string | ArrayBuffer | Uint8Array) =&gt; void</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Sends a message to all subscribers of a topic. Unlike <code className="prose-code">ws.publish()</code>, no client is excluded.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">getSubscribers(topic)</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(topic: string) =&gt; VexorWebSocket[]</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Returns the connections currently subscribed to a topic.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">closeAll(code?, reason?)</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(code?: number, reason?: string) =&gt; void</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Closes every connection. Called automatically by <code className="prose-code">app.close()</code> with code 1001.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">getStats()</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{'() => { clients, topics, subscriptions }'}</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Snapshot of the hub: total client count, topic count, and a <code className="prose-code">Map</code> of per-topic subscriber counts.</td>
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
