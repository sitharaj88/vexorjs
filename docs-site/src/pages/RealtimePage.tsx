import CodeBlock from '../components/CodeBlock';

const websocketCode = `import { Vexor, Type } from '@vexorjs/core';

const app = new Vexor();

// Basic WebSocket endpoint
app.ws('/chat', {
  // Optional: validate incoming messages
  message: Type.Object({
    type: Type.Union([Type.Literal('message'), Type.Literal('typing')]),
    content: Type.String()
  })
}, {
  // Connection opened
  open(ws, ctx) {
    console.log('Client connected:', ws.id);
    ws.send(JSON.stringify({ type: 'welcome', id: ws.id }));
  },

  // Message received
  message(ws, data, ctx) {
    console.log('Received:', data);

    // Broadcast to all clients
    ws.publish('chat', JSON.stringify({
      from: ws.id,
      ...data
    }));
  },

  // Connection closed
  close(ws, code, reason, ctx) {
    console.log('Client disconnected:', ws.id);
  },

  // Error occurred
  error(ws, error, ctx) {
    console.error('WebSocket error:', error);
  }
});

app.listen(3000);`;

const wsRoomsCode = `// WebSocket with rooms/channels
app.ws('/chat/:room', {
  open(ws, ctx) {
    const room = ctx.params.room;

    // Subscribe to room
    ws.subscribe(\`room:\${room}\`);

    // Notify room of new user
    ws.publish(\`room:\${room}\`, JSON.stringify({
      type: 'join',
      user: ws.id
    }));
  },

  message(ws, data, ctx) {
    const room = ctx.params.room;

    // Broadcast message to room only
    ws.publish(\`room:\${room}\`, JSON.stringify({
      type: 'message',
      from: ws.id,
      ...data
    }));
  },

  close(ws, code, reason, ctx) {
    const room = ctx.params.room;

    // Notify room of user leaving
    ws.publish(\`room:\${room}\`, JSON.stringify({
      type: 'leave',
      user: ws.id
    }));

    // Unsubscribe from room
    ws.unsubscribe(\`room:\${room}\`);
  }
});`;

const wsAuthCode = `// WebSocket with authentication
app.ws('/secure', {
  // Upgrade hook - runs before connection is established
  async upgrade(ctx) {
    const token = ctx.query.token || ctx.headers.get('authorization')?.slice(7);

    if (!token) {
      return ctx.status(401).text('Unauthorized');
    }

    try {
      const user = await verifyToken(token);
      ctx.state.user = user;
      // Continue with upgrade
    } catch (error) {
      return ctx.status(401).text('Invalid token');
    }
  },

  open(ws, ctx) {
    // User is authenticated
    console.log('Authenticated user connected:', ctx.state.user.id);

    // Subscribe to user-specific channel
    ws.subscribe(\`user:\${ctx.state.user.id}\`);
  },

  message(ws, data, ctx) {
    // Access user in message handler
    const user = ctx.state.user;
    console.log(\`Message from \${user.name}:\`, data);
  }
});`;

const sseCode = `import { Vexor, SSEStream, createSSEStream } from '@vexorjs/core';

const app = new Vexor();

// Basic SSE endpoint
app.get('/events', async (ctx) => {
  const stream = createSSEStream();

  // Send initial event
  stream.send({ event: 'connected', data: { id: Date.now() } });

  // Set up interval to send events
  const interval = setInterval(() => {
    stream.send({
      event: 'tick',
      data: { time: new Date().toISOString() }
    });
  }, 1000);

  // Clean up on disconnect
  ctx.onClose(() => {
    clearInterval(interval);
    stream.close();
  });

  return stream.response();
});

// SSE with async generator
app.get('/progress/:taskId', async (ctx) => {
  const taskId = ctx.params.taskId;

  async function* generateProgress() {
    for (let i = 0; i <= 100; i += 10) {
      yield { event: 'progress', data: { taskId, percent: i } };
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    yield { event: 'complete', data: { taskId } };
  }

  return ctx.sse(generateProgress());
});`;

const sseClientCode = `// Browser client for SSE
const eventSource = new EventSource('/events');

eventSource.onopen = () => {
  console.log('Connected to SSE');
};

eventSource.addEventListener('connected', (event) => {
  const data = JSON.parse(event.data);
  console.log('Connection ID:', data.id);
});

eventSource.addEventListener('tick', (event) => {
  const data = JSON.parse(event.data);
  console.log('Server time:', data.time);
});

eventSource.onerror = (error) => {
  console.error('SSE error:', error);
  eventSource.close();
};

// Clean up
window.addEventListener('beforeunload', () => {
  eventSource.close();
});`;

const pubsubCode = `import { Vexor, createEventBus, MemoryPubSubAdapter } from '@vexorjs/core';

const app = new Vexor();

// Create event bus
const eventBus = createEventBus({
  adapter: new MemoryPubSubAdapter()
});

// Subscribe to events
eventBus.subscribe('user:created', async (data) => {
  console.log('User created:', data);
  // Send welcome email, update analytics, etc.
});

eventBus.subscribe('order:placed', async (data) => {
  console.log('Order placed:', data);
  // Process payment, send confirmation, etc.
});

// Publish events from handlers
app.post('/users', async (ctx) => {
  const user = await createUser(ctx.body);

  // Publish event
  await eventBus.publish('user:created', {
    id: user.id,
    email: user.email,
    createdAt: new Date()
  });

  return ctx.status(201).json(user);
});

app.post('/orders', async (ctx) => {
  const order = await createOrder(ctx.body);

  await eventBus.publish('order:placed', {
    orderId: order.id,
    userId: order.userId,
    total: order.total
  });

  return ctx.status(201).json(order);
});`;

const redisPubsubCode = `import { Vexor, createEventBus, createRedisPubSub } from '@vexorjs/core';

// Redis Pub/Sub for distributed systems
const eventBus = createEventBus({
  adapter: createRedisPubSub({
    url: process.env.REDIS_URL!,
    prefix: 'events:'
  })
});

// Events are now distributed across all instances
eventBus.subscribe('cache:invalidate', async (data) => {
  // All instances receive this event
  await localCache.delete(data.key);
});

// Publish from any instance
app.put('/products/:id', async (ctx) => {
  const product = await updateProduct(ctx.params.id, ctx.body);

  // All instances will invalidate their cache
  await eventBus.publish('cache:invalidate', {
    key: \`product:\${product.id}\`
  });

  return ctx.json(product);
});`;

const circuitBreakerCode = `import { Vexor, CircuitBreaker, createCircuitBreaker, retry } from '@vexorjs/core';

const app = new Vexor();

// Create circuit breaker for external API
const apiBreaker = createCircuitBreaker({
  name: 'external-api',
  timeout: 5000,           // Request timeout
  errorThreshold: 50,      // Open circuit after 50% errors
  volumeThreshold: 10,     // Minimum 10 requests before calculating
  resetTimeout: 30000,     // Try again after 30 seconds

  // Fallback when circuit is open
  fallback: async () => {
    return { data: [], cached: true };
  }
});

// Use circuit breaker
app.get('/api/external-data', async (ctx) => {
  const data = await apiBreaker.fire(async () => {
    const res = await fetch('https://external-api.com/data');
    if (!res.ok) throw new Error('API error');
    return res.json();
  });

  return ctx.json(data);
});

// Retry with exponential backoff
app.get('/api/reliable-data', async (ctx) => {
  const data = await retry(
    async () => {
      const res = await fetch('https://api.example.com/data');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    {
      retries: 3,
      minTimeout: 1000,
      maxTimeout: 10000,
      factor: 2,            // Exponential backoff factor
      onRetry: (error, attempt) => {
        console.log(\`Retry attempt \${attempt}:\`, error.message);
      }
    }
  );

  return ctx.json(data);
});`;

const wsClientCode = `// Browser WebSocket client
const ws = new WebSocket('ws://localhost:3000/chat');

ws.onopen = () => {
  console.log('Connected to WebSocket');

  // Send a message
  ws.send(JSON.stringify({
    type: 'message',
    content: 'Hello, server!'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);

  switch (data.type) {
    case 'welcome':
      console.log('My ID:', data.id);
      break;
    case 'message':
      console.log(\`\${data.from}: \${data.content}\`);
      break;
  }
};

ws.onclose = (event) => {
  console.log('Disconnected:', event.code, event.reason);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

// Send with reconnection logic
function sendWithReconnect(data) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  } else {
    // Queue message and reconnect
    messageQueue.push(data);
    reconnect();
  }
}`;

export default function RealtimePage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-4">Real-time Features</h1>
        <p className="text-lg text-slate-400">
          Build real-time applications with WebSockets, Server-Sent Events, and Pub/Sub.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
          <div className="text-2xl mb-2">&#x1F50C;</div>
          <h3 className="font-semibold mb-1">WebSocket</h3>
          <p className="text-sm text-slate-400">Bidirectional real-time communication with rooms and channels</p>
        </div>
        <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
          <div className="text-2xl mb-2">&#x1F4E1;</div>
          <h3 className="font-semibold mb-1">Server-Sent Events</h3>
          <p className="text-sm text-slate-400">One-way streaming from server to client</p>
        </div>
        <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
          <div className="text-2xl mb-2">&#x1F4E8;</div>
          <h3 className="font-semibold mb-1">Pub/Sub</h3>
          <p className="text-sm text-slate-400">Event-driven architecture with memory or Redis backend</p>
        </div>
      </div>

      {/* WebSocket */}
      <section id="websocket">
        <h2 className="text-2xl font-bold mb-4">WebSocket</h2>
        <p className="text-slate-400 mb-4">
          Create WebSocket endpoints with type-safe message validation and lifecycle hooks.
        </p>
        <CodeBlock code={websocketCode} filename="websocket.ts" showLineNumbers />

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Rooms & Channels</h3>
          <p className="text-slate-400 mb-4">
            Organize connections into rooms for targeted broadcasting.
          </p>
          <CodeBlock code={wsRoomsCode} filename="rooms.ts" showLineNumbers />
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Authentication</h3>
          <p className="text-slate-400 mb-4">
            Authenticate WebSocket connections before they're established.
          </p>
          <CodeBlock code={wsAuthCode} filename="ws-auth.ts" showLineNumbers />
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Client Example</h3>
          <CodeBlock code={wsClientCode} filename="client.js" language="javascript" showLineNumbers />
        </div>
      </section>

      {/* SSE */}
      <section id="sse">
        <h2 className="text-2xl font-bold mb-4">Server-Sent Events (SSE)</h2>
        <p className="text-slate-400 mb-4">
          Stream events to clients for progress updates, notifications, and live data.
        </p>
        <CodeBlock code={sseCode} filename="sse.ts" showLineNumbers />

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Client Example</h3>
          <CodeBlock code={sseClientCode} filename="sse-client.js" language="javascript" showLineNumbers />
        </div>

        <div className="mt-6 p-4 bg-vexor-500/10 border border-vexor-500/20 rounded-xl">
          <p className="text-sm text-slate-300">
            <strong className="text-vexor-400">When to use SSE vs WebSocket:</strong> Use SSE for one-way server-to-client
            streaming (notifications, live updates). Use WebSocket for bidirectional communication (chat, gaming, collaboration).
          </p>
        </div>
      </section>

      {/* Pub/Sub */}
      <section id="pubsub">
        <h2 className="text-2xl font-bold mb-4">Pub/Sub & Event Bus</h2>
        <p className="text-slate-400 mb-4">
          Decouple your application with event-driven architecture.
        </p>
        <CodeBlock code={pubsubCode} filename="pubsub.ts" showLineNumbers />

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Redis Pub/Sub (Distributed)</h3>
          <p className="text-slate-400 mb-4">
            Scale horizontally with Redis-backed pub/sub for multi-instance deployments.
          </p>
          <CodeBlock code={redisPubsubCode} filename="redis-pubsub.ts" showLineNumbers />
        </div>
      </section>

      {/* Circuit Breaker */}
      <section id="resilience">
        <h2 className="text-2xl font-bold mb-4">Resilience Patterns</h2>
        <p className="text-slate-400 mb-4">
          Protect your application from cascading failures with circuit breakers and retries.
        </p>
        <CodeBlock code={circuitBreakerCode} filename="resilience.ts" showLineNumbers />

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
            <h4 className="font-semibold mb-2">Circuit Breaker States</h4>
            <ul className="text-sm text-slate-400 space-y-1">
              <li><strong className="text-green-400">Closed:</strong> Normal operation, requests pass through</li>
              <li><strong className="text-yellow-400">Open:</strong> Failing, requests blocked, fallback used</li>
              <li><strong className="text-blue-400">Half-Open:</strong> Testing if service recovered</li>
            </ul>
          </div>
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
            <h4 className="font-semibold mb-2">Retry Strategies</h4>
            <ul className="text-sm text-slate-400 space-y-1">
              <li><strong>Exponential:</strong> 1s, 2s, 4s, 8s...</li>
              <li><strong>Linear:</strong> 1s, 2s, 3s, 4s...</li>
              <li><strong>Fixed:</strong> 1s, 1s, 1s, 1s...</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
        <h2 className="text-xl font-bold mb-4">Next Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="/vexorjs/docs/deployment" className="block p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors">
            <h3 className="font-semibold mb-1">Deployment &rarr;</h3>
            <p className="text-sm text-slate-400">Deploy to Node.js, Bun, Lambda, and Edge</p>
          </a>
          <a href="/vexorjs/docs/core" className="block p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors">
            <h3 className="font-semibold mb-1">Core Concepts &rarr;</h3>
            <p className="text-sm text-slate-400">Review routing, context, and lifecycle hooks</p>
          </a>
        </div>
      </section>
    </div>
  );
}
