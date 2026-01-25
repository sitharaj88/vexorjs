import CodeBlock from '../../components/CodeBlock';

const sseCode = `import { Vexor, SSEStream } from 'vexor';

const app = new Vexor();

// Server-Sent Events endpoint
app.get('/events', async (ctx) => {
  const stream = new SSEStream();

  // Send initial connection message
  stream.sendEvent('connected', { timestamp: new Date().toISOString() });

  // Simulate periodic updates
  const interval = setInterval(() => {
    stream.sendEvent('update', {
      time: new Date().toISOString(),
      value: Math.random(),
    });
  }, 1000);

  // Clean up on disconnect
  ctx.req.request.signal.addEventListener('abort', () => {
    clearInterval(interval);
    stream.close();
  });

  return stream.getResponse();
});`;

const sseClientCode = `// Client-side JavaScript
const events = new EventSource('/events');

events.addEventListener('connected', (e) => {
  console.log('Connected:', JSON.parse(e.data));
});

events.addEventListener('update', (e) => {
  const data = JSON.parse(e.data);
  console.log('Update:', data);
});

events.onerror = (error) => {
  console.error('SSE error:', error);
};

// Close connection when done
// events.close();`;

const pubSubCode = `import { Vexor, SSEStream, MemoryPubSubAdapter } from 'vexor';

const app = new Vexor();
const pubsub = new MemoryPubSubAdapter();

// Subscribe to channel updates
app.get('/chat/:room/events', async (ctx) => {
  const { room } = ctx.params;
  const stream = new SSEStream();

  // Subscribe to room messages
  const subscription = await pubsub.subscribe(\`chat:\${room}\`, (message) => {
    stream.sendEvent('message', message);
  });

  stream.sendEvent('joined', { room });

  ctx.req.request.signal.addEventListener('abort', () => {
    subscription.unsubscribe();
    stream.close();
  });

  return stream.getResponse();
});

// Publish message to room
app.post('/chat/:room/send', {
  body: Type.Object({
    user: Type.String(),
    message: Type.String(),
  }),
}, async (ctx) => {
  const { room } = ctx.params;
  const { user, message } = ctx.body;

  await pubsub.publish(\`chat:\${room}\`, {
    user,
    message,
    timestamp: new Date().toISOString(),
  });

  return ctx.json({ sent: true });
});`;

const redisPubSubCode = `import { RedisPubSubAdapter } from 'vexor';
import Redis from 'ioredis';

// Use Redis for horizontal scaling
const redis = new Redis(process.env.REDIS_URL);
const pubsub = new RedisPubSubAdapter(redis);

// Now pub/sub works across multiple server instances
app.get('/notifications', async (ctx) => {
  const userId = ctx.get('user').id;
  const stream = new SSEStream();

  const subscription = await pubsub.subscribe(\`user:\${userId}\`, (data) => {
    stream.sendEvent('notification', data);
  });

  ctx.req.request.signal.addEventListener('abort', () => {
    subscription.unsubscribe();
    stream.close();
  });

  return stream.getResponse();
});`;

const broadcastCode = `// Broadcasting to multiple clients
const clients = new Set<SSEStream>();

app.get('/broadcast', async (ctx) => {
  const stream = new SSEStream();
  clients.add(stream);

  ctx.req.request.signal.addEventListener('abort', () => {
    clients.delete(stream);
    stream.close();
  });

  return stream.getResponse();
});

// Broadcast to all connected clients
function broadcast(event: string, data: unknown) {
  for (const client of clients) {
    client.sendEvent(event, data);
  }
}

// Endpoint to trigger broadcast
app.post('/announce', async (ctx) => {
  const message = await ctx.readJson();
  broadcast('announcement', message);
  return ctx.json({ sent: true, clients: clients.size });
});`;

export default function RealTime() {
  return (
    <div className="space-y-12">
      <div>
        <h1 id="realtime" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Real-Time Guide
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Build real-time features with Server-Sent Events and Pub/Sub patterns.
        </p>
      </div>

      <section>
        <h2 id="sse" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Server-Sent Events (SSE)
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          SSE provides a simple, unidirectional real-time channel from server to client.
        </p>
        <CodeBlock code={sseCode} showLineNumbers />
      </section>

      <section>
        <h2 id="sse-client" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          SSE Client
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Connect to SSE endpoints from the browser.
        </p>
        <CodeBlock code={sseClientCode} language="javascript" />
      </section>

      <section>
        <h2 id="pubsub" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Pub/Sub Pattern
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use publish/subscribe for multi-client real-time features like chat.
        </p>
        <CodeBlock code={pubSubCode} showLineNumbers />
      </section>

      <section>
        <h2 id="redis" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Scaling with Redis
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use Redis Pub/Sub for horizontal scaling across multiple server instances.
        </p>
        <CodeBlock code={redisPubSubCode} />
      </section>

      <section>
        <h2 id="broadcast" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Broadcasting
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Send messages to all connected clients.
        </p>
        <CodeBlock code={broadcastCode} showLineNumbers />
      </section>
    </div>
  );
}
