import{j as e,C as t,I as s,L as a,A as n}from"./index-Bga0OgzL.js";const r=`import { Vexor, createSSEStream } from '@vexorjs/core';
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
});`,o=`import { createSSEStream } from '@vexorjs/core';
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
});`,i=`import { sseFromGenerator } from '@vexorjs/core';

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
});`,c=`import { createSSEStream } from '@vexorjs/core';

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
});`,l=`import { createSSEStream } from '@vexorjs/core';

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
});`,d=`// Browser client - vanilla JavaScript
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
}`;function m(){return e.jsxs("div",{className:"space-y-12",children:[e.jsxs("div",{children:[e.jsx("h1",{id:"server-sent-events",className:"text-4xl font-bold text-slate-900 dark:text-white mb-4",children:"Server-Sent Events"}),e.jsxs("p",{className:"text-lg text-slate-600 dark:text-slate-400 mb-4",children:["Server-Sent Events (SSE) is a web standard for pushing real-time updates from server to client over a plain HTTP connection. Unlike WebSockets, which require a protocol upgrade and establish a bidirectional channel, SSE works within the familiar HTTP request-response model. The client opens a regular HTTP GET request, the server responds with a special ",e.jsx("code",{className:"prose-code",children:"text/event-stream"})," content type, and then keeps the response body open, writing events to it as they occur. The connection remains open indefinitely until the client disconnects or the server closes it."]}),e.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400 mb-4",children:"The simplicity of SSE is its greatest strength. Because it uses standard HTTP, it works through corporate proxies, firewalls, and CDNs that may block WebSocket upgrades. Authentication works the same way as any other HTTP endpoint -- cookies, tokens, and headers all function normally. There is no separate connection negotiation, no framing protocol to implement, and no special server infrastructure required. Any HTTP server that can stream a response body can serve SSE."}),e.jsxs("p",{className:"text-lg text-slate-600 dark:text-slate-400 mb-4",children:["On the client side, browsers provide the native ",e.jsx("code",{className:"prose-code",children:"EventSource"})," API, which handles connection management automatically. If the connection drops due to a network interruption, the browser automatically reconnects after a configurable delay and resumes receiving events. The server can assign IDs to events, and on reconnection the client sends the last received ID in a ",e.jsx("code",{className:"prose-code",children:"Last-Event-ID"})," header, allowing the server to replay missed events. This built-in resilience makes SSE exceptionally reliable for real-time features without any custom reconnection logic."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400",children:["Vexor provides a clean API for creating SSE streams with ",e.jsx("code",{className:"prose-code",children:"createSSEStream()"}),", which returns a properly formatted SSE response and gives you an ",e.jsx("code",{className:"prose-code",children:"SSEController"})," for writing events, data, and comments. It also supports generator-based streaming with ",e.jsx("code",{className:"prose-code",children:"sseFromGenerator()"})," and ",e.jsx("code",{className:"prose-code",children:"sseFromIterable()"}),", which let you pipe async data sources directly into an SSE response."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"how-it-works",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"How It Works"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The SSE protocol is built on a simple text-based format transmitted over a long-lived HTTP response. When a client connects to an SSE endpoint, the server responds with ",e.jsx("code",{className:"prose-code",children:"Content-Type: text/event-stream"})," and ",e.jsx("code",{className:"prose-code",children:"Cache-Control: no-cache"})," headers. The response body is never closed by the server; instead, it remains open as a stream, and the server writes individual events to it as plain text lines."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Each event in the stream is a block of text lines terminated by a blank line (two consecutive newlines). Lines beginning with ",e.jsx("code",{className:"prose-code",children:"data:"})," carry the event payload. Lines beginning with ",e.jsx("code",{className:"prose-code",children:"event:"})," specify a named event type. Lines beginning with ",e.jsx("code",{className:"prose-code",children:"id:"})," assign an identifier used for reconnection resumption. Lines beginning with ",e.jsx("code",{className:"prose-code",children:":"})," are comments, invisible to the client but useful for keep-alive signals that prevent intermediary proxies from closing idle connections."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["When the connection is interrupted, the browser's ",e.jsx("code",{className:"prose-code",children:"EventSource"})," implementation waits for a retry interval (defaulting to 3 seconds, configurable via a ",e.jsx("code",{className:"prose-code",children:"retry:"})," line from the server) and then reconnects. If the server has been sending event IDs, the reconnection request includes a ",e.jsx("code",{className:"prose-code",children:"Last-Event-ID"})," header, enabling the server to replay any events the client missed during the disconnection. This mechanism provides at-least-once delivery semantics without any application-level retry logic."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400",children:["Internally, Vexor's ",e.jsx("code",{className:"prose-code",children:"createSSEStream()"})," creates a ",e.jsx("code",{className:"prose-code",children:"ReadableStream"})," and wires it to the HTTP response. The ",e.jsx("code",{className:"prose-code",children:"SSEController"})," wraps the stream's writer with convenience methods that handle the text formatting: escaping newlines in data payloads, prefixing lines with the correct field names, and terminating events with blank lines. This ensures that the raw bytes written to the response always conform to the SSE specification."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"when-to-use",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"When to Use SSE vs WebSocket"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"SSE is the right choice when your communication pattern is unidirectional: the server pushes updates to the client, and the client does not need to send data back over the same connection. Common use cases include live dashboards, notification streams, stock tickers, build log streaming, progress bars for long-running operations, and live feeds. For all of these, the client only receives data; any client-to-server communication (like dismissing a notification) happens through separate HTTP requests."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"WebSockets are the better choice when you need true bidirectional communication where both sides send messages frequently over the same connection. Chat applications, collaborative editors, multiplayer games, and interactive terminals all require the client to send data to the server in real time, making WebSockets the appropriate protocol."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["SSE has several practical advantages over WebSockets. It works through HTTP/2 multiplexing, so multiple SSE streams share a single TCP connection rather than requiring a separate connection per stream. It passes through HTTP proxies and load balancers without special configuration. It supports standard HTTP authentication. And the automatic reconnection provided by the browser's ",e.jsx("code",{className:"prose-code",children:"EventSource"})," API is robust and requires no custom code. The main limitation of SSE is the browser connection limit: most browsers allow around 6 concurrent HTTP connections per domain, so if you open many SSE streams, you may exhaust this limit. HTTP/2 largely mitigates this issue through stream multiplexing."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400",children:"As a general rule, start with SSE for server-to-client streaming and only reach for WebSockets when the client must send frequent, low-latency messages back to the server. SSE is simpler to implement, debug, and operate in production, and it handles the vast majority of real-time update scenarios."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"basic-usage",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Basic Usage"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["To create an SSE endpoint, use ",e.jsx("code",{className:"prose-code",children:"createSSEStream()"})," inside a route handler. This function takes a callback that receives an ",e.jsx("code",{className:"prose-code",children:"SSEController"}),", which provides methods for writing events to the stream. The function returns a ",e.jsx("code",{className:"prose-code",children:"Response"})," object with the correct SSE headers that Vexor sends to the client."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The callback executes immediately when a client connects and is responsible for setting up event sources. This might involve subscribing to an event bus, starting a timer, or listening to a database change stream. When the client disconnects, the request's abort signal fires, and you should clean up any subscriptions or timers to prevent memory leaks. Always register a cleanup handler on ",e.jsx("code",{className:"prose-code",children:"ctx.req.request.signal"})," to handle disconnections gracefully."]}),e.jsx(t,{code:r,filename:"src/routes/events.ts",showLineNumbers:!0}),e.jsx(s,{variant:"tip",children:"SSE is ideal for one-way server-to-client streaming: live feeds, notifications, dashboards, and progress updates. For bidirectional communication, use WebSockets instead."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"stream-controller",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Stream Controller"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"SSEController"})," is the interface between your application logic and the raw SSE text stream. It provides four methods for writing different types of SSE content, each of which handles the text formatting and line-prefixing automatically so you never need to construct raw SSE strings manually."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"sendData()"})," method serializes a JavaScript object as JSON and writes it as an unnamed ",e.jsx("code",{className:"prose-code",children:"data:"})," event. The client receives it through the ",e.jsx("code",{className:"prose-code",children:"onmessage"})," handler. The ",e.jsx("code",{className:"prose-code",children:"sendEvent()"})," method does the same but adds an ",e.jsx("code",{className:"prose-code",children:"event:"})," line, creating a named event that the client listens for with ",e.jsx("code",{className:"prose-code",children:"addEventListener()"}),". Named events are powerful for multiplexing different types of updates over a single connection."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"send()"})," method writes a raw string directly to the stream, giving you full control over the SSE format for advanced use cases. The ",e.jsx("code",{className:"prose-code",children:"sendComment()"})," method writes an SSE comment (a line starting with ",e.jsx("code",{className:"prose-code",children:":"}),") that is silently ignored by the client. Comments are primarily used for keep-alive signals to prevent proxies from closing the connection during idle periods. The ",e.jsx("code",{className:"prose-code",children:"closed"})," property lets you check whether the stream is still open before attempting to write."]}),e.jsx(t,{code:o,filename:"src/routes/notifications.ts",showLineNumbers:!0})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"generator-pattern",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Generator Pattern"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Async generators provide a natural way to express streaming data sources. Rather than writing imperative code with callbacks and event subscriptions, you define a generator function that yields events one at a time. Vexor consumes these yielded values and writes them to the SSE stream. This pattern is especially clean for data sources that are inherently sequential, such as database cursors, file readers, or paginated API responses."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"sseFromGenerator()"})," function takes an async generator that yields objects with optional ",e.jsx("code",{className:"prose-code",children:"event"})," and required ",e.jsx("code",{className:"prose-code",children:"data"})," fields. Each yielded object becomes one SSE event. The generator runs lazily: it only advances when the previous event has been written to the stream, providing natural backpressure. If the client disconnects, the generator is terminated and any cleanup logic in its ",e.jsx("code",{className:"prose-code",children:"finally"})," block executes."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"sseFromIterable()"})," function works similarly but accepts any async iterable, including custom objects that implement ",e.jsx("code",{className:"prose-code",children:"Symbol.asyncIterator"}),". This makes it easy to stream from database cursors that batch-load rows, message queues that deliver events one at a time, or any other data source that exposes an async iteration protocol."]}),e.jsx(t,{code:i,filename:"src/routes/feed.ts",showLineNumbers:!0})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"event-types",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Event Types"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Named events are one of the most useful features of the SSE protocol. Without named events, all data sent through the stream arrives at the client's ",e.jsx("code",{className:"prose-code",children:"onmessage"})," handler, and the client must parse each message to determine what type of update it represents. Named events eliminate this by letting the server tag each event with a type string, and the client subscribes to specific types using ",e.jsx("code",{className:"prose-code",children:"addEventListener()"}),"."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["This enables a single SSE connection to carry multiple independent data streams. A dashboard endpoint might send ",e.jsx("code",{className:"prose-code",children:"metrics"})," events every second, ",e.jsx("code",{className:"prose-code",children:"alert"})," events when thresholds are exceeded, and ",e.jsx("code",{className:"prose-code",children:"deployment"})," events when a new version rolls out. On the client, each event type has its own handler, keeping the code clean and decoupled. This is more efficient than opening separate SSE connections for each data type, especially given browser connection limits."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Event types are arbitrary strings chosen by the application. There is no registration or schema required. The server sends an event with any type it wants, and the client either has a listener for that type or silently ignores it. This makes it easy to add new event types incrementally without coordinating deployments between client and server."}),e.jsx(t,{code:c,filename:"src/routes/dashboard.ts",showLineNumbers:!0})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"keep-alive",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Keep-Alive and Connection Options"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Long-lived HTTP connections can be terminated by intermediary infrastructure. Load balancers, reverse proxies (especially Nginx and AWS ALB), and corporate firewalls often close connections that appear idle for too long, typically after 60 to 120 seconds. Since SSE connections may go long periods without events (for example, a notification stream where notifications are infrequent), keep-alive signals are essential for production deployments."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Vexor's keep-alive feature sends periodic SSE comments to the stream at a configurable interval. SSE comments are lines starting with a colon character and are silently ignored by the browser's ",e.jsx("code",{className:"prose-code",children:"EventSource"})," implementation. They generate just enough network traffic to convince intermediary systems that the connection is still active, without triggering any application-level processing on the client."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"retry"})," option sets the client's reconnection interval by sending a ",e.jsx("code",{className:"prose-code",children:"retry:"})," field in the SSE stream. This tells the browser how many milliseconds to wait before reconnecting after a disconnection. The default browser behavior varies, but explicitly setting this value ensures consistent reconnection timing across clients. A value of 3,000 to 5,000 milliseconds is appropriate for most applications."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["When running behind Nginx, you must disable response buffering by setting the ",e.jsx("code",{className:"prose-code",children:"X-Accel-Buffering: no"})," header. Without this, Nginx buffers the entire response body and delivers events in batches rather than streaming them individually, which defeats the purpose of SSE. The ",e.jsx("code",{className:"prose-code",children:"headers"})," option lets you set this and any other custom headers on the SSE response."]}),e.jsx(t,{code:l,filename:"src/routes/events.ts",showLineNumbers:!0}),e.jsxs(s,{variant:"warning",children:["When running behind Nginx, set the ",e.jsx("code",{className:"prose-code",children:"X-Accel-Buffering: no"})," header to disable response buffering. Otherwise events may be batched and delivered with delay."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"client-integration",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Client Integration"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The browser's native ",e.jsx("code",{className:"prose-code",children:"EventSource"})," API is the standard way to consume SSE streams from client-side JavaScript. Creating a new ",e.jsx("code",{className:"prose-code",children:"EventSource"})," opens a connection to the specified URL and begins receiving events. The API is intentionally simple: you attach event handlers and the browser manages the connection lifecycle, including automatic reconnection with the last event ID."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Unnamed events (those sent with ",e.jsx("code",{className:"prose-code",children:"sendData()"}),") arrive at the ",e.jsx("code",{className:"prose-code",children:"onmessage"})," handler. Named events (those sent with ",e.jsx("code",{className:"prose-code",children:"sendEvent()"}),") must be consumed with ",e.jsx("code",{className:"prose-code",children:"addEventListener()"})," using the event type as the first argument. The ",e.jsx("code",{className:"prose-code",children:"onopen"})," callback fires when the connection is established, and ",e.jsx("code",{className:"prose-code",children:"onerror"})," fires when the connection drops. After an error, the browser automatically attempts to reconnect."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["For React applications, wrapping ",e.jsx("code",{className:"prose-code",children:"EventSource"})," in a custom hook provides a clean integration point. The hook creates the event source on mount, updates state when events arrive, and closes the connection on unmount. This pattern ensures that the SSE connection is properly tied to the component lifecycle and does not leak when the component is removed from the DOM."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Note that ",e.jsx("code",{className:"prose-code",children:"EventSource"})," only supports GET requests and does not allow custom headers. If your SSE endpoint requires authentication via a bearer token header, you will need to use a polyfill like ",e.jsx("code",{className:"prose-code",children:"eventsource"})," from npm or pass the token as a query parameter. Cookie-based authentication works natively since the browser includes cookies with all same-origin requests."]}),e.jsx(t,{code:d,filename:"src/client/events.ts",showLineNumbers:!0})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"best-practices",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Best Practices"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Always register a cleanup handler on the request abort signal. When a client disconnects, any subscriptions, timers, or database listeners created for that stream must be torn down. Without cleanup, these resources accumulate with each connection cycle (connect, disconnect, reconnect) and eventually exhaust server memory or connection limits."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Use named events to multiplex different data types over a single connection. Opening one SSE connection per data type wastes browser connection slots and increases server resource consumption. A single endpoint that sends ",e.jsx("code",{className:"prose-code",children:"metrics"}),", ",e.jsx("code",{className:"prose-code",children:"alerts"}),", and ",e.jsx("code",{className:"prose-code",children:"notifications"})," as named events is more efficient and easier to manage than three separate SSE endpoints."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Enable keep-alive for any SSE endpoint that may go longer than 30 seconds between events. A keep-alive interval of 15 to 30 seconds is generally sufficient to prevent intermediary timeouts. In environments with aggressive timeout policies, use a shorter interval."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400",children:"Monitor the number of active SSE connections. Each connection consumes a file descriptor and a small amount of memory on the server. If your application serves thousands of concurrent SSE clients, ensure your server's file descriptor limits and memory are sized accordingly. Consider using HTTP/2, which multiplexes multiple streams over a single TCP connection and dramatically reduces per-connection overhead."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"api-reference",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"API Reference"}),e.jsx("h3",{className:"text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3",children:"createSSEStream Options"}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Option"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Type"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Default"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Description"})]})}),e.jsxs("tbody",{className:"text-slate-600 dark:text-slate-400",children:[e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"retry"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"number"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"undefined"})}),e.jsxs("td",{className:"py-3 px-4",children:["Sets the client's reconnection interval in milliseconds by sending a ",e.jsx("code",{className:"prose-code",children:"retry:"})," field in the SSE stream. When the connection drops, the browser waits this many milliseconds before attempting to reconnect. If not set, the browser uses its default retry interval, which is typically around 3 seconds but varies by implementation."]})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"headers"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"Record<string, string>"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"{}"})}),e.jsxs("td",{className:"py-3 px-4",children:["Additional HTTP response headers to include alongside the standard SSE headers (",e.jsx("code",{className:"prose-code",children:"Content-Type"}),", ",e.jsx("code",{className:"prose-code",children:"Cache-Control"}),", ",e.jsx("code",{className:"prose-code",children:"Connection"}),"). Use this to set proxy-related headers like ",e.jsx("code",{className:"prose-code",children:"X-Accel-Buffering: no"})," for Nginx, CORS headers, or custom application headers."]})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"keepAlive"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"number"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"undefined"})}),e.jsx("td",{className:"py-3 px-4",children:"The interval in milliseconds at which keep-alive comments are sent to the stream. When set, a timer sends an SSE comment at this frequency to prevent proxies and load balancers from closing the connection due to inactivity. The comment is invisible to client application code. If not set, no keep-alive comments are sent."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"keepAliveComment"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"'ping'"})}),e.jsxs("td",{className:"py-3 px-4",children:["The text content of keep-alive comment lines. This value is written after the colon prefix (e.g., ",e.jsx("code",{className:"prose-code",children:": ping"}),"). The content is purely informational and has no effect on the client, but can be useful for identifying keep-alive traffic in network logs and debugging tools."]})]})]})]})}),e.jsx("h3",{className:"text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3",children:"SSEController Methods"}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Method"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Signature"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Default"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Description"})]})}),e.jsxs("tbody",{className:"text-slate-600 dark:text-slate-400",children:[e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"send(raw)"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"(raw: string) => void"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsxs("td",{className:"py-3 px-4",children:["Writes a raw, pre-formatted SSE string directly to the stream. The string must include the appropriate field prefixes (",e.jsx("code",{className:"prose-code",children:"data:"}),", ",e.jsx("code",{className:"prose-code",children:"event:"}),", etc.) and a trailing blank line. Use this for advanced scenarios where you need full control over the SSE output format."]})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"sendData(data)"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"(data: unknown) => void"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsxs("td",{className:"py-3 px-4",children:["Serializes the given value as JSON and sends it as an unnamed ",e.jsx("code",{className:"prose-code",children:"data:"})," event. The client receives this event through the ",e.jsx("code",{className:"prose-code",children:"onmessage"})," handler. Multi-line JSON is automatically split across multiple ",e.jsx("code",{className:"prose-code",children:"data:"})," lines per the SSE specification."]})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"sendEvent(name, data)"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"(name: string, data: unknown) => void"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsxs("td",{className:"py-3 px-4",children:["Sends a named event with JSON data. Writes an ",e.jsx("code",{className:"prose-code",children:"event:"})," line followed by ",e.jsx("code",{className:"prose-code",children:"data:"})," lines. The client must use ",e.jsx("code",{className:"prose-code",children:"addEventListener(name, handler)"})," to receive named events; they do not trigger ",e.jsx("code",{className:"prose-code",children:"onmessage"}),"."]})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"sendComment(text)"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"(text: string) => void"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsxs("td",{className:"py-3 px-4",children:["Writes an SSE comment line (prefixed with ",e.jsx("code",{className:"prose-code",children:":"}),") that is silently ignored by the browser. Primarily used for keep-alive signals, but can also be used to embed debug information in the stream that is visible in network inspection tools."]})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"close()"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"() => void"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsxs("td",{className:"py-3 px-4",children:["Closes the underlying stream, ending the HTTP response. The client's ",e.jsx("code",{className:"prose-code",children:"EventSource"})," will detect the closure and automatically attempt to reconnect after the retry interval. Call this when the server intentionally wants to end the stream."]})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"closed"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"boolean"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"false"})}),e.jsxs("td",{className:"py-3 px-4",children:["A read-only property indicating whether the stream has been closed, either by the server calling ",e.jsx("code",{className:"prose-code",children:"close()"})," or by the client disconnecting. Always check this property before writing to the stream if there is any possibility the client has disconnected since your last write."]})]})]})]})})]}),e.jsxs("section",{className:"card bg-slate-50 dark:bg-slate-800/50",children:[e.jsx("h2",{id:"next",className:"text-xl font-bold text-slate-900 dark:text-white mb-4",children:"Next Steps"}),e.jsxs("div",{className:"flex flex-wrap gap-3",children:[e.jsxs(a,{to:"/realtime/websocket",className:"btn-primary",children:["WebSocket ",e.jsx(n,{className:"w-4 h-4 ml-2"})]}),e.jsx(a,{to:"/realtime/pubsub",className:"btn-secondary",children:"Pub/Sub & Event Bus"})]})]})]})}export{m as default};
