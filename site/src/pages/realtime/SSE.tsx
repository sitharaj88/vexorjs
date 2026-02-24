import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const basicUsageCode = `import { Vexor, createSSEStream } from '@vexorjs/core';
import type { SSEController } from '@vexorjs/core';

const app = new Vexor();

app.get('/events', async (ctx) => {
  return createSSEStream((controller: SSEController) => {
    // Send a named event
    controller.sendEvent('connected', {
      message: 'Stream established',
      timestamp: new Date().toISOString(),
    });

    // Send periodic updates
    const interval = setInterval(() => {
      controller.sendData({
        time: new Date().toISOString(),
        value: Math.random(),
      });
    }, 1000);

    // Clean up when the client disconnects
    ctx.req.request.signal.addEventListener('abort', () => {
      clearInterval(interval);
      controller.close();
    });
  });
});`;

const controllerCode = `import { createSSEStream } from '@vexorjs/core';
import type { SSEController } from '@vexorjs/core';

app.get('/notifications/:userId', async (ctx) => {
  const { userId } = ctx.params;

  return createSSEStream((controller: SSEController) => {
    // send() writes a raw SSE message string
    controller.send('data: hello\\n\\n');

    // sendData() serializes the payload as JSON on a data: line
    controller.sendData({ type: 'welcome', userId });

    // sendEvent() writes a named event with JSON data
    controller.sendEvent('notification', {
      id: 1,
      title: 'New message',
      body: 'You have a new message from Alice',
    });

    // sendComment() writes an SSE comment (useful for keep-alive)
    controller.sendComment('keep-alive ping');

    // Check if the stream is still open
    if (!controller.closed) {
      controller.sendData({ status: 'still connected' });
    }

    // Close the stream programmatically
    // controller.close();
  });
});`;

const generatorCode = `import { sseFromGenerator } from '@vexorjs/core';

// Stream data from an async generator
app.get('/feed', async (ctx) => {
  async function* generateFeed() {
    const posts = await db.select().from(posts).orderBy(posts.createdAt, 'desc').limit(50);

    for (const post of posts) {
      yield {
        event: 'post',
        data: {
          id: post.id,
          title: post.title,
          author: post.authorName,
          createdAt: post.createdAt,
        },
      };
    }

    // Stream new posts as they arrive
    for await (const post of subscribeToNewPosts()) {
      yield {
        event: 'new-post',
        data: {
          id: post.id,
          title: post.title,
          author: post.authorName,
        },
      };
    }
  }

  return sseFromGenerator(generateFeed());
});

// Stream from an async iterable (e.g., database cursor)
import { sseFromIterable } from '@vexorjs/core';

app.get('/export', async (ctx) => {
  const cursor = db.select().from(users).cursor(100);

  const iterable = {
    async *[Symbol.asyncIterator]() {
      for await (const batch of cursor) {
        for (const user of batch) {
          yield { event: 'user', data: user };
        }
      }
    },
  };

  return sseFromIterable(iterable);
});`;

const eventTypesCode = `import { createSSEStream } from '@vexorjs/core';

app.get('/dashboard/events', async (ctx) => {
  return createSSEStream((controller) => {
    // Different event types for different UI updates
    controller.sendEvent('metrics', {
      cpu: 45.2,
      memory: 72.1,
      requests: 1523,
    });

    controller.sendEvent('alert', {
      level: 'warning',
      message: 'Memory usage above 70%',
    });

    controller.sendEvent('deployment', {
      service: 'api-server',
      version: '2.3.1',
      status: 'rolling-out',
    });

    // Client listens to specific events:
    // eventSource.addEventListener('metrics', handler)
    // eventSource.addEventListener('alert', handler)
    // eventSource.addEventListener('deployment', handler)
  });
});`;

const keepAliveCode = `import { createSSEStream } from '@vexorjs/core';

// Keep-alive prevents proxies and load balancers from closing idle connections
app.get('/events', async (ctx) => {
  return createSSEStream(
    (controller) => {
      // Your event logic here
      const unsubscribe = eventBus.on('update', (data) => {
        controller.sendEvent('update', data);
      });

      ctx.req.request.signal.addEventListener('abort', () => {
        unsubscribe();
        controller.close();
      });
    },
    {
      // Send a comment every 15 seconds to keep the connection alive
      keepAlive: 15000,
      keepAliveComment: 'ping',

      // Set the client retry interval (ms) on reconnect
      retry: 3000,

      // Custom headers
      headers: {
        'X-Accel-Buffering': 'no', // Disable Nginx buffering
      },
    }
  );
});`;

const clientCode = `// Browser client - vanilla JavaScript
const events = new EventSource('/events');

// Listen for unnamed data events
events.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Message:', data);
};

// Listen for named events
events.addEventListener('notification', (event) => {
  const notification = JSON.parse(event.data);
  showNotification(notification.title, notification.body);
});

events.addEventListener('metrics', (event) => {
  const metrics = JSON.parse(event.data);
  updateDashboard(metrics);
});

// Handle connection events
events.onopen = () => {
  console.log('Connected to SSE stream');
};

events.onerror = (error) => {
  console.error('SSE error:', error);
  // EventSource automatically reconnects
};

// Close the connection when done
function disconnect() {
  events.close();
}

// React hook example
function useSSE<T>(url: string, event?: string) {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    const source = new EventSource(url);

    const handler = (e: MessageEvent) => {
      setData(JSON.parse(e.data));
    };

    if (event) {
      source.addEventListener(event, handler);
    } else {
      source.onmessage = handler;
    }

    return () => source.close();
  }, [url, event]);

  return data;
}`;

export default function SSE() {
  return (
    <div className="space-y-12">
      <div>
        <h1 id="server-sent-events" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Server-Sent Events
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          Server-Sent Events (SSE) is a web standard for pushing real-time updates from server to client over a plain HTTP connection. Unlike WebSockets, which require a protocol upgrade and establish a bidirectional channel, SSE works within the familiar HTTP request-response model. The client opens a regular HTTP GET request, the server responds with a special <code className="prose-code">text/event-stream</code> content type, and then keeps the response body open, writing events to it as they occur. The connection remains open indefinitely until the client disconnects or the server closes it.
        </p>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          The simplicity of SSE is its greatest strength. Because it uses standard HTTP, it works through corporate proxies, firewalls, and CDNs that may block WebSocket upgrades. Authentication works the same way as any other HTTP endpoint -- cookies, tokens, and headers all function normally. There is no separate connection negotiation, no framing protocol to implement, and no special server infrastructure required. Any HTTP server that can stream a response body can serve SSE.
        </p>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          On the client side, browsers provide the native <code className="prose-code">EventSource</code> API, which handles connection management automatically. If the connection drops due to a network interruption, the browser automatically reconnects after a configurable delay and resumes receiving events. The server can assign IDs to events, and on reconnection the client sends the last received ID in a <code className="prose-code">Last-Event-ID</code> header, allowing the server to replay missed events. This built-in resilience makes SSE exceptionally reliable for real-time features without any custom reconnection logic.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Vexor provides a clean API for creating SSE streams with <code className="prose-code">createSSEStream()</code>, which returns a properly formatted SSE response and gives you an <code className="prose-code">SSEController</code> for writing events, data, and comments. It also supports generator-based streaming with <code className="prose-code">sseFromGenerator()</code> and <code className="prose-code">sseFromIterable()</code>, which let you pipe async data sources directly into an SSE response.
        </p>
      </div>

      <section>
        <h2 id="how-it-works" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          How It Works
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The SSE protocol is built on a simple text-based format transmitted over a long-lived HTTP response. When a client connects to an SSE endpoint, the server responds with <code className="prose-code">Content-Type: text/event-stream</code> and <code className="prose-code">Cache-Control: no-cache</code> headers. The response body is never closed by the server; instead, it remains open as a stream, and the server writes individual events to it as plain text lines.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Each event in the stream is a block of text lines terminated by a blank line (two consecutive newlines). Lines beginning with <code className="prose-code">data:</code> carry the event payload. Lines beginning with <code className="prose-code">event:</code> specify a named event type. Lines beginning with <code className="prose-code">id:</code> assign an identifier used for reconnection resumption. Lines beginning with <code className="prose-code">:</code> are comments, invisible to the client but useful for keep-alive signals that prevent intermediary proxies from closing idle connections.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When the connection is interrupted, the browser's <code className="prose-code">EventSource</code> implementation waits for a retry interval (defaulting to 3 seconds, configurable via a <code className="prose-code">retry:</code> line from the server) and then reconnects. If the server has been sending event IDs, the reconnection request includes a <code className="prose-code">Last-Event-ID</code> header, enabling the server to replay any events the client missed during the disconnection. This mechanism provides at-least-once delivery semantics without any application-level retry logic.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Internally, Vexor's <code className="prose-code">createSSEStream()</code> creates a <code className="prose-code">ReadableStream</code> and wires it to the HTTP response. The <code className="prose-code">SSEController</code> wraps the stream's writer with convenience methods that handle the text formatting: escaping newlines in data payloads, prefixing lines with the correct field names, and terminating events with blank lines. This ensures that the raw bytes written to the response always conform to the SSE specification.
        </p>
      </section>

      <section>
        <h2 id="when-to-use" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          When to Use SSE vs WebSocket
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          SSE is the right choice when your communication pattern is unidirectional: the server pushes updates to the client, and the client does not need to send data back over the same connection. Common use cases include live dashboards, notification streams, stock tickers, build log streaming, progress bars for long-running operations, and live feeds. For all of these, the client only receives data; any client-to-server communication (like dismissing a notification) happens through separate HTTP requests.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          WebSockets are the better choice when you need true bidirectional communication where both sides send messages frequently over the same connection. Chat applications, collaborative editors, multiplayer games, and interactive terminals all require the client to send data to the server in real time, making WebSockets the appropriate protocol.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          SSE has several practical advantages over WebSockets. It works through HTTP/2 multiplexing, so multiple SSE streams share a single TCP connection rather than requiring a separate connection per stream. It passes through HTTP proxies and load balancers without special configuration. It supports standard HTTP authentication. And the automatic reconnection provided by the browser's <code className="prose-code">EventSource</code> API is robust and requires no custom code. The main limitation of SSE is the browser connection limit: most browsers allow around 6 concurrent HTTP connections per domain, so if you open many SSE streams, you may exhaust this limit. HTTP/2 largely mitigates this issue through stream multiplexing.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          As a general rule, start with SSE for server-to-client streaming and only reach for WebSockets when the client must send frequent, low-latency messages back to the server. SSE is simpler to implement, debug, and operate in production, and it handles the vast majority of real-time update scenarios.
        </p>
      </section>

      <section>
        <h2 id="basic-usage" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Basic Usage
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          To create an SSE endpoint, use <code className="prose-code">createSSEStream()</code> inside a route handler. This function takes a callback that receives an <code className="prose-code">SSEController</code>, which provides methods for writing events to the stream. The function returns a <code className="prose-code">Response</code> object with the correct SSE headers that Vexor sends to the client.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The callback executes immediately when a client connects and is responsible for setting up event sources. This might involve subscribing to an event bus, starting a timer, or listening to a database change stream. When the client disconnects, the request's abort signal fires, and you should clean up any subscriptions or timers to prevent memory leaks. Always register a cleanup handler on <code className="prose-code">ctx.req.request.signal</code> to handle disconnections gracefully.
        </p>
        <CodeBlock code={basicUsageCode} filename="src/routes/events.ts" showLineNumbers />
        <InfoBlock variant="tip">
          SSE is ideal for one-way server-to-client streaming: live feeds, notifications,
          dashboards, and progress updates. For bidirectional communication, use WebSockets instead.
        </InfoBlock>
      </section>

      <section>
        <h2 id="stream-controller" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Stream Controller
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">SSEController</code> is the interface between your application logic and the raw SSE text stream. It provides four methods for writing different types of SSE content, each of which handles the text formatting and line-prefixing automatically so you never need to construct raw SSE strings manually.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">sendData()</code> method serializes a JavaScript object as JSON and writes it as an unnamed <code className="prose-code">data:</code> event. The client receives it through the <code className="prose-code">onmessage</code> handler. The <code className="prose-code">sendEvent()</code> method does the same but adds an <code className="prose-code">event:</code> line, creating a named event that the client listens for with <code className="prose-code">addEventListener()</code>. Named events are powerful for multiplexing different types of updates over a single connection.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">send()</code> method writes a raw string directly to the stream, giving you full control over the SSE format for advanced use cases. The <code className="prose-code">sendComment()</code> method writes an SSE comment (a line starting with <code className="prose-code">:</code>) that is silently ignored by the client. Comments are primarily used for keep-alive signals to prevent proxies from closing the connection during idle periods. The <code className="prose-code">closed</code> property lets you check whether the stream is still open before attempting to write.
        </p>
        <CodeBlock code={controllerCode} filename="src/routes/notifications.ts" showLineNumbers />
      </section>

      <section>
        <h2 id="generator-pattern" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Generator Pattern
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Async generators provide a natural way to express streaming data sources. Rather than writing imperative code with callbacks and event subscriptions, you define a generator function that yields events one at a time. Vexor consumes these yielded values and writes them to the SSE stream. This pattern is especially clean for data sources that are inherently sequential, such as database cursors, file readers, or paginated API responses.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">sseFromGenerator()</code> function takes an async generator that yields objects with optional <code className="prose-code">event</code> and required <code className="prose-code">data</code> fields. Each yielded object becomes one SSE event. The generator runs lazily: it only advances when the previous event has been written to the stream, providing natural backpressure. If the client disconnects, the generator is terminated and any cleanup logic in its <code className="prose-code">finally</code> block executes.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">sseFromIterable()</code> function works similarly but accepts any async iterable, including custom objects that implement <code className="prose-code">Symbol.asyncIterator</code>. This makes it easy to stream from database cursors that batch-load rows, message queues that deliver events one at a time, or any other data source that exposes an async iteration protocol.
        </p>
        <CodeBlock code={generatorCode} filename="src/routes/feed.ts" showLineNumbers />
      </section>

      <section>
        <h2 id="event-types" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Event Types
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Named events are one of the most useful features of the SSE protocol. Without named events, all data sent through the stream arrives at the client's <code className="prose-code">onmessage</code> handler, and the client must parse each message to determine what type of update it represents. Named events eliminate this by letting the server tag each event with a type string, and the client subscribes to specific types using <code className="prose-code">addEventListener()</code>.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          This enables a single SSE connection to carry multiple independent data streams. A dashboard endpoint might send <code className="prose-code">metrics</code> events every second, <code className="prose-code">alert</code> events when thresholds are exceeded, and <code className="prose-code">deployment</code> events when a new version rolls out. On the client, each event type has its own handler, keeping the code clean and decoupled. This is more efficient than opening separate SSE connections for each data type, especially given browser connection limits.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Event types are arbitrary strings chosen by the application. There is no registration or schema required. The server sends an event with any type it wants, and the client either has a listener for that type or silently ignores it. This makes it easy to add new event types incrementally without coordinating deployments between client and server.
        </p>
        <CodeBlock code={eventTypesCode} filename="src/routes/dashboard.ts" showLineNumbers />
      </section>

      <section>
        <h2 id="keep-alive" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Keep-Alive and Connection Options
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Long-lived HTTP connections can be terminated by intermediary infrastructure. Load balancers, reverse proxies (especially Nginx and AWS ALB), and corporate firewalls often close connections that appear idle for too long, typically after 60 to 120 seconds. Since SSE connections may go long periods without events (for example, a notification stream where notifications are infrequent), keep-alive signals are essential for production deployments.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor's keep-alive feature sends periodic SSE comments to the stream at a configurable interval. SSE comments are lines starting with a colon character and are silently ignored by the browser's <code className="prose-code">EventSource</code> implementation. They generate just enough network traffic to convince intermediary systems that the connection is still active, without triggering any application-level processing on the client.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">retry</code> option sets the client's reconnection interval by sending a <code className="prose-code">retry:</code> field in the SSE stream. This tells the browser how many milliseconds to wait before reconnecting after a disconnection. The default browser behavior varies, but explicitly setting this value ensures consistent reconnection timing across clients. A value of 3,000 to 5,000 milliseconds is appropriate for most applications.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When running behind Nginx, you must disable response buffering by setting the <code className="prose-code">X-Accel-Buffering: no</code> header. Without this, Nginx buffers the entire response body and delivers events in batches rather than streaming them individually, which defeats the purpose of SSE. The <code className="prose-code">headers</code> option lets you set this and any other custom headers on the SSE response.
        </p>
        <CodeBlock code={keepAliveCode} filename="src/routes/events.ts" showLineNumbers />
        <InfoBlock variant="warning">
          When running behind Nginx, set the <code className="prose-code">X-Accel-Buffering: no</code> header
          to disable response buffering. Otherwise events may be batched and delivered with delay.
        </InfoBlock>
      </section>

      <section>
        <h2 id="client-integration" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Client Integration
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The browser's native <code className="prose-code">EventSource</code> API is the standard way to consume SSE streams from client-side JavaScript. Creating a new <code className="prose-code">EventSource</code> opens a connection to the specified URL and begins receiving events. The API is intentionally simple: you attach event handlers and the browser manages the connection lifecycle, including automatic reconnection with the last event ID.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Unnamed events (those sent with <code className="prose-code">sendData()</code>) arrive at the <code className="prose-code">onmessage</code> handler. Named events (those sent with <code className="prose-code">sendEvent()</code>) must be consumed with <code className="prose-code">addEventListener()</code> using the event type as the first argument. The <code className="prose-code">onopen</code> callback fires when the connection is established, and <code className="prose-code">onerror</code> fires when the connection drops. After an error, the browser automatically attempts to reconnect.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For React applications, wrapping <code className="prose-code">EventSource</code> in a custom hook provides a clean integration point. The hook creates the event source on mount, updates state when events arrive, and closes the connection on unmount. This pattern ensures that the SSE connection is properly tied to the component lifecycle and does not leak when the component is removed from the DOM.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Note that <code className="prose-code">EventSource</code> only supports GET requests and does not allow custom headers. If your SSE endpoint requires authentication via a bearer token header, you will need to use a polyfill like <code className="prose-code">eventsource</code> from npm or pass the token as a query parameter. Cookie-based authentication works natively since the browser includes cookies with all same-origin requests.
        </p>
        <CodeBlock code={clientCode} filename="src/client/events.ts" showLineNumbers />
      </section>

      <section>
        <h2 id="best-practices" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Best Practices
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Always register a cleanup handler on the request abort signal. When a client disconnects, any subscriptions, timers, or database listeners created for that stream must be torn down. Without cleanup, these resources accumulate with each connection cycle (connect, disconnect, reconnect) and eventually exhaust server memory or connection limits.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use named events to multiplex different data types over a single connection. Opening one SSE connection per data type wastes browser connection slots and increases server resource consumption. A single endpoint that sends <code className="prose-code">metrics</code>, <code className="prose-code">alerts</code>, and <code className="prose-code">notifications</code> as named events is more efficient and easier to manage than three separate SSE endpoints.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Enable keep-alive for any SSE endpoint that may go longer than 30 seconds between events. A keep-alive interval of 15 to 30 seconds is generally sufficient to prevent intermediary timeouts. In environments with aggressive timeout policies, use a shorter interval.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Monitor the number of active SSE connections. Each connection consumes a file descriptor and a small amount of memory on the server. If your application serves thousands of concurrent SSE clients, ensure your server's file descriptor limits and memory are sized accordingly. Consider using HTTP/2, which multiplexes multiple streams over a single TCP connection and dramatically reduces per-connection overhead.
        </p>
      </section>

      <section>
        <h2 id="api-reference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          API Reference
        </h2>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">
          createSSEStream Options
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
                <td className="py-3 px-4"><code className="prose-code">retry</code></td>
                <td className="py-3 px-4"><code className="prose-code">number</code></td>
                <td className="py-3 px-4"><code className="prose-code">undefined</code></td>
                <td className="py-3 px-4">Sets the client's reconnection interval in milliseconds by sending a <code className="prose-code">retry:</code> field in the SSE stream. When the connection drops, the browser waits this many milliseconds before attempting to reconnect. If not set, the browser uses its default retry interval, which is typically around 3 seconds but varies by implementation.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">headers</code></td>
                <td className="py-3 px-4"><code className="prose-code">Record&lt;string, string&gt;</code></td>
                <td className="py-3 px-4"><code className="prose-code">{'{}'}</code></td>
                <td className="py-3 px-4">Additional HTTP response headers to include alongside the standard SSE headers (<code className="prose-code">Content-Type</code>, <code className="prose-code">Cache-Control</code>, <code className="prose-code">Connection</code>). Use this to set proxy-related headers like <code className="prose-code">X-Accel-Buffering: no</code> for Nginx, CORS headers, or custom application headers.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">keepAlive</code></td>
                <td className="py-3 px-4"><code className="prose-code">number</code></td>
                <td className="py-3 px-4"><code className="prose-code">undefined</code></td>
                <td className="py-3 px-4">The interval in milliseconds at which keep-alive comments are sent to the stream. When set, a timer sends an SSE comment at this frequency to prevent proxies and load balancers from closing the connection due to inactivity. The comment is invisible to client application code. If not set, no keep-alive comments are sent.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">keepAliveComment</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4"><code className="prose-code">'ping'</code></td>
                <td className="py-3 px-4">The text content of keep-alive comment lines. This value is written after the colon prefix (e.g., <code className="prose-code">: ping</code>). The content is purely informational and has no effect on the client, but can be useful for identifying keep-alive traffic in network logs and debugging tools.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          SSEController Methods
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
                <td className="py-3 px-4"><code className="prose-code">send(raw)</code></td>
                <td className="py-3 px-4"><code className="prose-code">(raw: string) =&gt; void</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Writes a raw, pre-formatted SSE string directly to the stream. The string must include the appropriate field prefixes (<code className="prose-code">data:</code>, <code className="prose-code">event:</code>, etc.) and a trailing blank line. Use this for advanced scenarios where you need full control over the SSE output format.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">sendData(data)</code></td>
                <td className="py-3 px-4"><code className="prose-code">(data: unknown) =&gt; void</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Serializes the given value as JSON and sends it as an unnamed <code className="prose-code">data:</code> event. The client receives this event through the <code className="prose-code">onmessage</code> handler. Multi-line JSON is automatically split across multiple <code className="prose-code">data:</code> lines per the SSE specification.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">sendEvent(name, data)</code></td>
                <td className="py-3 px-4"><code className="prose-code">(name: string, data: unknown) =&gt; void</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Sends a named event with JSON data. Writes an <code className="prose-code">event:</code> line followed by <code className="prose-code">data:</code> lines. The client must use <code className="prose-code">addEventListener(name, handler)</code> to receive named events; they do not trigger <code className="prose-code">onmessage</code>.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">sendComment(text)</code></td>
                <td className="py-3 px-4"><code className="prose-code">(text: string) =&gt; void</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Writes an SSE comment line (prefixed with <code className="prose-code">:</code>) that is silently ignored by the browser. Primarily used for keep-alive signals, but can also be used to embed debug information in the stream that is visible in network inspection tools.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">close()</code></td>
                <td className="py-3 px-4"><code className="prose-code">() =&gt; void</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Closes the underlying stream, ending the HTTP response. The client's <code className="prose-code">EventSource</code> will detect the closure and automatically attempt to reconnect after the retry interval. Call this when the server intentionally wants to end the stream.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">closed</code></td>
                <td className="py-3 px-4"><code className="prose-code">boolean</code></td>
                <td className="py-3 px-4"><code className="prose-code">false</code></td>
                <td className="py-3 px-4">A read-only property indicating whether the stream has been closed, either by the server calling <code className="prose-code">close()</code> or by the client disconnecting. Always check this property before writing to the stream if there is any possibility the client has disconnected since your last write.</td>
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
          <Link to="/realtime/websocket" className="btn-primary">
            WebSocket <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/realtime/pubsub" className="btn-secondary">
            Pub/Sub &amp; Event Bus
          </Link>
        </div>
      </section>
    </div>
  );
}
