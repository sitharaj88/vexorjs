import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const basicUsageCode = `import { MemoryPubSubAdapter, createEventBus } from '@vexorjs/core';
import type { Subscription } from '@vexorjs/core';

// Create an in-memory pub/sub adapter
const adapter = new MemoryPubSubAdapter();

// Subscribe to a channel
const subscription: Subscription = await adapter.subscribe('orders', (message) => {
  console.log('New order:', message);
});

// Publish a message to the channel
await adapter.publish('orders', {
  id: 'ord_123',
  userId: 'usr_456',
  total: 99.99,
  items: ['widget-a', 'widget-b'],
});

// Unsubscribe when done
subscription.unsubscribe();
console.log(subscription.active); // false`;

const eventBusCode = `import { createEventBus, MemoryPubSubAdapter } from '@vexorjs/core';

// Define your event types
interface AppEvents {
  'user.created': { id: string; name: string; email: string };
  'user.updated': { id: string; changes: Record<string, unknown> };
  'user.deleted': { id: string };
  'order.placed': { orderId: string; userId: string; total: number };
  'order.shipped': { orderId: string; trackingNumber: string };
}

// Create a typed event bus
const bus = createEventBus<AppEvents>(new MemoryPubSubAdapter());

// Listen for events
bus.on('user.created', async (data) => {
  // data is typed as { id: string; name: string; email: string }
  console.log(\`Welcome, \${data.name}!\`);
  await sendWelcomeEmail(data.email);
});

bus.on('order.placed', async (data) => {
  await updateInventory(data.orderId);
  await notifyWarehouse(data.orderId);
});

// Listen for an event only once
bus.once('user.created', async (data) => {
  await trackFirstUserSignup(data.id);
});

// Emit events from your application code
await bus.emit('user.created', {
  id: 'usr_789',
  name: 'Alice',
  email: 'alice@example.com',
});

await bus.emit('order.placed', {
  orderId: 'ord_456',
  userId: 'usr_789',
  total: 149.99,
});

// Graceful shutdown
await bus.close();`;

const channelGroupsCode = `import { createChannelGroup, MemoryPubSubAdapter } from '@vexorjs/core';
import type { ChannelGroup } from '@vexorjs/core';

const adapter = new MemoryPubSubAdapter();

// Create a channel group with a prefix
const notifications: ChannelGroup = createChannelGroup('notifications', adapter);

// Publish to a specific user's notification channel
// This publishes to "notifications:usr_123"
await notifications.publish('usr_123', {
  type: 'message',
  title: 'New follower',
  body: 'Bob started following you',
});

// Subscribe to a specific user's notifications
const sub = await notifications.subscribe('usr_123', (message) => {
  console.log('Notification for usr_123:', message);
});

// Subscribe to ALL notifications across all users
const globalSub = await notifications.subscribeAll((channel, message) => {
  console.log(\`Notification on \${channel}:\`, message);
  // channel = "usr_123", message = { type: 'message', ... }
});

// Use in an SSE endpoint to stream notifications to clients
import { createSSEStream } from '@vexorjs/core';

app.get('/notifications/stream', async (ctx) => {
  const userId = ctx.get('user').id;

  return createSSEStream((controller) => {
    const sub = notifications.subscribe(userId, (message) => {
      controller.sendEvent('notification', message);
    });

    ctx.req.request.signal.addEventListener('abort', async () => {
      (await sub).unsubscribe();
      controller.close();
    });
  });
});`;

const redisAdapterCode = `import { createRedisPubSub, createEventBus } from '@vexorjs/core';

// Create a Redis-backed pub/sub adapter for multi-instance deployments
const redisPubSub = createRedisPubSub({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,

  // Optional: prefix all channels
  prefix: 'myapp:',

  // Optional: connection pool settings
  maxReconnectAttempts: 10,
  reconnectDelay: 1000,
});

// Use with event bus - works across multiple server instances
const bus = createEventBus(redisPubSub);

// Instance A publishes
await bus.emit('order.placed', {
  orderId: 'ord_789',
  userId: 'usr_123',
  total: 299.99,
});

// Instance B receives the event
bus.on('order.placed', async (data) => {
  console.log('Order received on instance B:', data.orderId);
  await processOrder(data);
});

// Use with channel groups for per-user notifications
import { createChannelGroup } from '@vexorjs/core';

const notifications = createChannelGroup('notifications', redisPubSub);

// Server instance 1: user connects via SSE
const sub = await notifications.subscribe('usr_123', (message) => {
  sseController.sendEvent('notification', message);
});

// Server instance 2: API creates a notification
await notifications.publish('usr_123', {
  type: 'order-shipped',
  orderId: 'ord_789',
  trackingUrl: 'https://track.example.com/xyz',
});
// ^ This message is delivered to the subscriber on instance 1`;

const patternSubscriptionsCode = `import { MemoryPubSubAdapter } from '@vexorjs/core';

const adapter = new MemoryPubSubAdapter();

// Subscribe to channels matching a pattern
// Patterns use glob-style matching
const sub = await adapter.subscribe('orders.*', (message, channel) => {
  console.log(\`Event on \${channel}:\`, message);
});

// All of these trigger the subscription above
await adapter.publish('orders.created', { id: 1 });
await adapter.publish('orders.updated', { id: 1, status: 'paid' });
await adapter.publish('orders.shipped', { id: 1, tracking: 'XYZ' });

// More specific patterns
await adapter.subscribe('chat.room.*', (message, channel) => {
  // Matches chat.room.general, chat.room.support, etc.
});

await adapter.subscribe('user.*.profile', (message, channel) => {
  // Matches user.123.profile, user.456.profile, etc.
});

// Combine with event bus for domain event handling
const bus = createEventBus(adapter);

// Handle all user-related events
bus.on('user.*', async (data, eventName) => {
  console.log(\`User event: \${eventName}\`, data);
  await auditLog.record(eventName, data);
});`;

const integrationCode = `import { Vexor, createEventBus, MemoryPubSubAdapter, createSSEStream } from '@vexorjs/core';
import type { SSEController } from '@vexorjs/core';

const app = new Vexor();
const bus = createEventBus(new MemoryPubSubAdapter());

// HTTP endpoint triggers an event
app.post('/orders', async (ctx) => {
  const order = ctx.body;
  const saved = await db.insert(orders).values(order).returning();

  // Emit the event
  await bus.emit('order.placed', {
    orderId: saved.id,
    userId: order.userId,
    total: order.total,
  });

  return ctx.status(201).json(saved);
});

// SSE endpoint streams events to the client
app.get('/orders/stream', async (ctx) => {
  return createSSEStream((controller: SSEController) => {
    const unsub = bus.on('order.placed', (data) => {
      controller.sendEvent('new-order', data);
    });

    const unsubShipped = bus.on('order.shipped', (data) => {
      controller.sendEvent('order-shipped', data);
    });

    ctx.req.request.signal.addEventListener('abort', () => {
      unsub();
      unsubShipped();
      controller.close();
    });
  });
});

// Background worker reacts to events
bus.on('order.placed', async (data) => {
  await sendOrderConfirmationEmail(data.userId, data.orderId);
  await reserveInventory(data.orderId);
  await notifySlack(\`New order \${data.orderId}: $\${data.total}\`);
});`;

export default function PubSub() {
  return (
    <div className="space-y-12">
      <div>
        <h1 id="pubsub" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Pub/Sub &amp; Event Bus
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          Publish/subscribe (pub/sub) is a messaging pattern that decouples the producers of information from the consumers of that information. Instead of components calling each other directly, a producer publishes a message to a named channel, and any number of subscribers listening on that channel receive the message independently. The publisher does not know who the subscribers are, and the subscribers do not know who published the message. This decoupling is the foundation of event-driven architecture, enabling systems that are modular, extensible, and resilient to change.
        </p>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          In a typical web application, many operations trigger side effects. Creating a new order should send a confirmation email, update inventory counts, notify the warehouse, and push a real-time update to the admin dashboard. Without pub/sub, the order creation handler must call each of these functions directly, creating tight coupling between the order module and the email, inventory, warehouse, and dashboard modules. Adding a new side effect requires modifying the order handler. Removing one requires finding and deleting the call. Pub/sub eliminates this coupling: the order handler publishes an "order placed" event, and each side effect subscribes independently.
        </p>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          Vexor provides a complete pub/sub toolkit with two layers. The lower layer consists of adapter-based pub/sub primitives: <code className="prose-code">MemoryPubSubAdapter</code> for single-process applications and <code className="prose-code">createRedisPubSub()</code> for multi-instance deployments where events must cross server boundaries. The upper layer is the <code className="prose-code">EventBus</code>, a typed, application-level API that wraps any adapter with domain event semantics, TypeScript generics, and convenience methods like <code className="prose-code">once()</code> for one-time subscriptions.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          This two-layer design means you can start with the in-memory adapter during development and seamlessly switch to Redis in production without changing any of your event handling code. The adapter is injected at construction time, and the rest of your application interacts only with the <code className="prose-code">EventBus</code> or <code className="prose-code">ChannelGroup</code> APIs, which are adapter-agnostic.
        </p>
      </div>

      <section>
        <h2 id="how-it-works" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          How It Works
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          At its core, pub/sub operates through a message broker that maintains a registry of channels and their subscribers. When a publisher calls <code className="prose-code">adapter.publish('orders', data)</code>, the broker looks up all subscribers registered for the "orders" channel and delivers the message to each one. This delivery is fan-out: a single publish call can trigger dozens of subscriber callbacks if many consumers are listening.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">MemoryPubSubAdapter</code> implements this broker as an in-memory data structure within the Node.js process. Channels are stored in a <code className="prose-code">Map</code> where each key is a channel name and each value is a set of callback functions. Publishing iterates over the set and invokes each callback with the message. This is extremely fast (microsecond-level latency) but scoped to a single process. Messages published on one server instance are not visible to subscribers on another instance.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The Redis adapter replaces the in-memory map with Redis's native <code className="prose-code">SUBSCRIBE</code> and <code className="prose-code">PUBLISH</code> commands. When a subscriber registers, the adapter issues a <code className="prose-code">SUBSCRIBE</code> command to Redis. When a publisher publishes, the adapter issues a <code className="prose-code">PUBLISH</code> command. Redis handles fan-out across all connected clients, including those on different server instances. This means an event published on server instance A is delivered to subscribers on server instances B, C, and D, enabling horizontal scaling of real-time features.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          The <code className="prose-code">EventBus</code> sits on top of the adapter and adds three capabilities. First, it provides TypeScript generics so that event names and payloads are type-checked at compile time. Second, it serializes and deserializes event data automatically (the adapter deals with raw strings; the event bus handles JSON conversion). Third, it manages subscriber lifecycle with <code className="prose-code">on()</code> (persistent subscription), <code className="prose-code">once()</code> (one-time subscription), and <code className="prose-code">close()</code> (tear down all subscriptions). These features make the event bus the recommended API for application-level event handling.
        </p>
      </section>

      <section>
        <h2 id="when-to-use" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          When to Use Pub/Sub
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Pub/sub is the right pattern when an action in your application should trigger multiple independent side effects, and you want to keep those side effects decoupled from the action itself. If creating an order currently requires calling four different functions, and you anticipate adding more over time, pub/sub lets you add new subscribers without modifying the order creation code. This is the open-closed principle applied to event handling: the system is open for extension (new subscribers) but closed for modification (existing publishers).
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The in-memory adapter is ideal for single-server deployments, development environments, and test suites. It requires no external infrastructure, adds no network latency, and is trivial to set up. The Redis adapter is necessary when your application runs on multiple server instances behind a load balancer. Without a shared broker, events published on one instance are invisible to subscribers on other instances. If a user connects via SSE to instance A but the API request that generates the notification hits instance B, the notification must cross the instance boundary through Redis.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Be aware of the trade-offs. In-memory pub/sub provides no durability: if the process crashes between publishing and subscriber processing, the message is lost. Redis pub/sub has the same characteristic; Redis <code className="prose-code">PUBLISH</code> is fire-and-forget and does not persist messages. If you need guaranteed delivery, message persistence, or retry semantics, consider a dedicated message queue like RabbitMQ or a Redis Streams-based solution. Vexor's pub/sub is designed for real-time event distribution where occasional message loss during failures is acceptable.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Pub/sub also introduces a form of backpressure concern. If subscribers are slow (for example, a subscriber that sends an email for every event) and events are published at high frequency, the subscriber callbacks accumulate in the Node.js event loop. For high-throughput scenarios, consider batching subscriber work, offloading slow operations to a background job queue, or implementing rate limiting on the subscriber side.
        </p>
      </section>

      <section>
        <h2 id="basic-usage" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Basic Usage
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The lowest-level API is the pub/sub adapter itself. Create a <code className="prose-code">MemoryPubSubAdapter</code> instance and use its <code className="prose-code">subscribe()</code> and <code className="prose-code">publish()</code> methods directly. The <code className="prose-code">subscribe()</code> method returns a <code className="prose-code">Subscription</code> object with an <code className="prose-code">unsubscribe()</code> method and an <code className="prose-code">active</code> boolean. Calling <code className="prose-code">unsubscribe()</code> removes the callback from the channel's subscriber set, and subsequent publishes to that channel will not invoke it.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Messages published through the adapter can be any JavaScript value that is serializable as JSON. The adapter handles serialization internally, so you pass objects directly to <code className="prose-code">publish()</code> and receive them as parsed objects in subscriber callbacks. This makes the API natural and eliminates manual <code className="prose-code">JSON.stringify()</code> and <code className="prose-code">JSON.parse()</code> calls in your application code.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For most applications, you will interact with the <code className="prose-code">EventBus</code> rather than the adapter directly. The adapter API is available for low-level scenarios where you need direct channel control, such as building custom abstractions or integrating with third-party libraries that expect a pub/sub interface.
        </p>
        <CodeBlock code={basicUsageCode} filename="src/pubsub.ts" showLineNumbers />
        <InfoBlock variant="tip">
          The in-memory adapter is perfect for development and single-server deployments.
          Switch to the Redis adapter for multi-instance production environments without
          changing your application code.
        </InfoBlock>
      </section>

      <section>
        <h2 id="event-bus" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Event Bus
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">EventBus</code> is the recommended API for application-level event handling. It wraps a pub/sub adapter with a typed, higher-level interface that maps naturally to domain events. You define a TypeScript interface that describes your event names and their corresponding payload types, then pass it as a generic parameter to <code className="prose-code">createEventBus()</code>. From that point forward, every <code className="prose-code">emit()</code> and <code className="prose-code">on()</code> call is fully type-checked: the compiler ensures that event names match the interface keys and payloads match the associated types.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">on()</code> method registers a persistent subscriber for an event. It returns an unsubscribe function that you can call to remove the subscriber. The <code className="prose-code">once()</code> method registers a subscriber that automatically unsubscribes after receiving the first event. This is useful for one-time initialization tasks, first-occurrence tracking, or setup logic that should only run once per application lifecycle.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">emit()</code> method publishes an event with a typed payload. Internally, it serializes the payload and delegates to the underlying adapter's <code className="prose-code">publish()</code> method. All subscribers registered for that event name receive the payload through their callback functions. Subscriber callbacks can be asynchronous, and any errors thrown by a subscriber are caught and logged without affecting other subscribers or the publisher.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">close()</code> method tears down all subscriptions and releases adapter resources. Call this during application shutdown to ensure clean cleanup. After calling <code className="prose-code">close()</code>, the event bus is no longer usable and any subsequent <code className="prose-code">emit()</code> calls will have no effect.
        </p>
        <CodeBlock code={eventBusCode} filename="src/events.ts" showLineNumbers />
        <InfoBlock variant="info">
          The <code className="prose-code">once()</code> method automatically unsubscribes after
          the first event. Use it for one-time setup tasks or first-occurrence tracking.
        </InfoBlock>
      </section>

      <section>
        <h2 id="channel-groups" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Channel Groups
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Many real-time features require per-entity channels: per-user notification streams, per-room chat channels, per-document collaboration sessions. Channel groups provide a namespacing abstraction that organizes these related channels under a common prefix. When you create a channel group with the prefix "notifications," publishing to channel "usr_123" actually publishes to "notifications:usr_123" at the adapter level. This prevents name collisions between different features that might use similar channel names.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">subscribe()</code> method on a channel group subscribes to a specific entity's channel within the group. The <code className="prose-code">subscribeAll()</code> method subscribes to every channel in the group, delivering messages along with the originating channel name. This is useful for admin dashboards that need to monitor all notifications across all users, or analytics systems that need to observe all chat activity across all rooms.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Channel groups integrate naturally with SSE and WebSocket endpoints. A common pattern is to subscribe the channel group to a user's notification channel when they connect via SSE, and pipe each received message to the SSE controller. When the client disconnects, the subscription is cleaned up. This pattern is shown in the example below, where an SSE endpoint streams per-user notifications by subscribing to the user's channel in the notifications group.
        </p>
        <CodeBlock code={channelGroupsCode} filename="src/notifications.ts" showLineNumbers />
      </section>

      <section>
        <h2 id="redis-adapter" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Redis Adapter
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The in-memory adapter is limited to a single process. Events published on one server instance are invisible to subscribers on another. In production, where you typically run multiple server instances behind a load balancer, this is insufficient. A user might connect to instance A via SSE while the API request that triggers a notification lands on instance B. Without a shared broker, the notification never reaches the user.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The Redis adapter solves this by using Redis as a centralized message broker. When a subscriber registers on any server instance, the adapter sends a <code className="prose-code">SUBSCRIBE</code> command to Redis. When a publisher publishes on any instance, the adapter sends a <code className="prose-code">PUBLISH</code> command. Redis delivers the message to all subscribers across all connected instances. This makes event delivery transparent across your entire server fleet.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The Redis adapter creates two separate Redis connections: one dedicated to subscriptions (because Redis clients in subscribe mode cannot issue other commands) and one for publishing. The <code className="prose-code">prefix</code> option namespaces all channel names with a string prefix, preventing collisions between different applications sharing the same Redis instance. The <code className="prose-code">maxReconnectAttempts</code> and <code className="prose-code">reconnectDelay</code> options control automatic reconnection behavior if the Redis connection drops.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Switching from the memory adapter to Redis requires only changing the adapter construction; all event bus, channel group, and subscriber code remains exactly the same. This is the primary design goal of the adapter abstraction: your application logic is adapter-agnostic, and the infrastructure choice is a deployment configuration decision rather than a code architecture decision.
        </p>
        <CodeBlock code={redisAdapterCode} filename="src/redis-events.ts" showLineNumbers />
        <InfoBlock variant="warning">
          The Redis adapter creates two connections: one for subscribing and one for publishing.
          Make sure your Redis server allows enough concurrent connections for your deployment.
        </InfoBlock>
      </section>

      <section>
        <h2 id="pattern-subscriptions" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Pattern Subscriptions
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Sometimes you need to subscribe to multiple channels at once without knowing their exact names ahead of time. Pattern subscriptions use glob-style wildcards to match channel names dynamically. The <code className="prose-code">*</code> wildcard matches any single segment in a dot-separated channel name, so <code className="prose-code">orders.*</code> matches <code className="prose-code">orders.created</code>, <code className="prose-code">orders.updated</code>, and <code className="prose-code">orders.shipped</code>, but not <code className="prose-code">orders.item.added</code>.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          This feature is particularly powerful for cross-cutting concerns like audit logging, analytics, and monitoring. An audit logger can subscribe to <code className="prose-code">user.*</code> and record every user-related event without knowing in advance which specific event types exist. When a new event type like <code className="prose-code">user.password_changed</code> is added to the system, the audit logger picks it up automatically without any code changes.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Pattern subscriptions work with both the memory and Redis adapters. With Redis, they map to Redis's native <code className="prose-code">PSUBSCRIBE</code> command, which supports glob-style pattern matching at the server level. The subscriber callback receives both the message and the actual channel name that matched, so you can differentiate between different event types within a single subscription handler.
        </p>
        <CodeBlock code={patternSubscriptionsCode} filename="src/patterns.ts" showLineNumbers />
      </section>

      <section>
        <h2 id="full-integration" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Full Integration Example
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The real power of pub/sub emerges when it ties together HTTP endpoints, SSE streaming, and background processing through a single event bus. In this pattern, an HTTP handler performs a database write and emits an event. Multiple independent subscribers react to the event: one streams it to connected SSE clients for real-time UI updates, another sends a confirmation email, and a third notifies external systems. None of these subscribers know about each other, and adding a new reaction requires only registering a new subscriber.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The SSE integration deserves special attention. The SSE endpoint subscribes to the event bus when a client connects, forwarding each event to the SSE controller. When the client disconnects, the subscription is cleaned up via the abort signal handler. This creates a bridge between the event bus (which operates across the entire server) and individual client connections (which are tied to specific SSE streams). The event bus acts as the central nervous system, and SSE connections are the endpoints that deliver events to browsers.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          This architecture scales cleanly. In development, the memory adapter handles everything within a single process. In production, swapping to the Redis adapter makes the event bus work across all server instances. The HTTP handler, SSE endpoint, and background subscribers remain unchanged. The only difference is the adapter construction line, which is typically controlled by an environment variable or configuration file.
        </p>
        <CodeBlock code={integrationCode} filename="src/app.ts" showLineNumbers />
      </section>

      <section>
        <h2 id="best-practices" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Best Practices
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Define a centralized TypeScript interface for all your application events. This serves as both documentation and a compile-time contract. When you add a new event, add it to the interface. When you change a payload shape, update the interface and let the compiler find every subscriber that needs to be updated. This is vastly more reliable than searching for string event names across the codebase.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Keep subscriber callbacks fast. The event bus invokes subscribers synchronously on the publishing thread (in the Node.js event loop sense). If a subscriber performs a slow operation like sending an email or calling an external API, it delays the return of the <code className="prose-code">emit()</code> call and blocks other subscribers from being notified. For slow operations, have the subscriber enqueue a job to a background worker rather than performing the work inline.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Always clean up subscriptions. In SSE and WebSocket handlers, unsubscribe from the event bus when the client disconnects. In application shutdown handlers, call <code className="prose-code">bus.close()</code> to tear down all subscriptions and release adapter resources. Leaked subscriptions accumulate over time and can lead to memory growth and duplicate event processing.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Use the memory adapter for tests even if your production deployment uses Redis. Tests should not depend on external infrastructure, and the memory adapter provides identical behavior for subscriber registration and message delivery. This keeps your test suite fast and portable while still exercising all of your event handling logic.
        </p>
      </section>

      <section>
        <h2 id="api-reference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          API Reference
        </h2>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">
          EventBus Methods
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
                <td className="py-3 px-4"><code className="prose-code">emit(event, data)</code></td>
                <td className="py-3 px-4"><code className="prose-code">(event: string, data: T) =&gt; Promise&lt;void&gt;</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Publishes a typed event with the given payload to all registered subscribers. The payload is serialized as JSON and delivered to each subscriber callback. Returns a promise that resolves after all subscribers have been notified. Errors thrown by individual subscribers are caught and logged without affecting other subscribers or the caller.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">on(event, handler)</code></td>
                <td className="py-3 px-4"><code className="prose-code">(event: string, handler: (data: T) =&gt; void) =&gt; () =&gt; void</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Registers a persistent subscriber for the specified event. The handler is invoked every time the event is emitted. Returns an unsubscribe function that removes the handler when called. The handler receives the typed event payload as its argument. Multiple handlers can be registered for the same event.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">once(event, handler)</code></td>
                <td className="py-3 px-4"><code className="prose-code">(event: string, handler: (data: T) =&gt; void) =&gt; () =&gt; void</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Registers a one-time subscriber that is automatically removed after the first event delivery. The returned unsubscribe function can also be used to cancel the subscription before the event fires. Useful for initialization tasks, first-occurrence tracking, or setup logic that should execute exactly once.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">close()</code></td>
                <td className="py-3 px-4"><code className="prose-code">() =&gt; Promise&lt;void&gt;</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Removes all subscribers and releases the underlying adapter resources. After calling <code className="prose-code">close()</code>, the event bus is no longer usable. Subsequent <code className="prose-code">emit()</code> calls will have no effect. Call this during application shutdown to ensure clean resource cleanup and prevent memory leaks from lingering subscriptions.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          ChannelGroup Methods
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
                <td className="py-3 px-4"><code className="prose-code">publish(channel, data)</code></td>
                <td className="py-3 px-4"><code className="prose-code">(channel: string, data: unknown) =&gt; Promise&lt;void&gt;</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Publishes a message to a specific channel within the group. The channel name is automatically prefixed with the group's namespace (e.g., publishing to "usr_123" in a "notifications" group publishes to "notifications:usr_123"). The data is serialized as JSON and delivered to all subscribers of that prefixed channel.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">subscribe(channel, handler)</code></td>
                <td className="py-3 px-4"><code className="prose-code">(channel: string, handler: Function) =&gt; Promise&lt;Subscription&gt;</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Subscribes to a specific channel within the group. The handler receives the deserialized message payload each time a message is published to that channel. Returns a <code className="prose-code">Subscription</code> object with <code className="prose-code">unsubscribe()</code> and <code className="prose-code">active</code> properties for lifecycle management.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">subscribeAll(handler)</code></td>
                <td className="py-3 px-4"><code className="prose-code">(handler: (channel, data) =&gt; void) =&gt; Promise&lt;Subscription&gt;</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Subscribes to all channels within the group using a wildcard pattern. The handler receives both the channel name (without the group prefix) and the message payload, allowing you to distinguish between different entities within the group. Useful for admin monitoring, analytics, and cross-entity event processing.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Subscription
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Property</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Default</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">unsubscribe()</code></td>
                <td className="py-3 px-4"><code className="prose-code">() =&gt; void</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Cancels the subscription and removes the handler from the channel's subscriber set. After calling this, the handler will no longer be invoked for new messages. Calling <code className="prose-code">unsubscribe()</code> multiple times is safe and has no additional effect.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">active</code></td>
                <td className="py-3 px-4"><code className="prose-code">boolean</code></td>
                <td className="py-3 px-4"><code className="prose-code">true</code></td>
                <td className="py-3 px-4">A read-only property that indicates whether the subscription is still active. Returns <code className="prose-code">true</code> after creation and <code className="prose-code">false</code> after <code className="prose-code">unsubscribe()</code> has been called. Useful for conditional logic that needs to check subscription state before performing cleanup or re-subscription.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          createRedisPubSub Options
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
                <td className="py-3 px-4"><code className="prose-code">host</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4"><code className="prose-code">'localhost'</code></td>
                <td className="py-3 px-4">The hostname or IP address of the Redis server. In production, this is typically an internal DNS name or IP address of your Redis instance. For clustered Redis deployments, point this to the primary node or a Redis proxy.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">port</code></td>
                <td className="py-3 px-4"><code className="prose-code">number</code></td>
                <td className="py-3 px-4"><code className="prose-code">6379</code></td>
                <td className="py-3 px-4">The port number on which the Redis server is listening. The standard Redis port is 6379. Cloud-hosted Redis services may use a different port, which is typically provided in the connection string.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">password</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4"><code className="prose-code">undefined</code></td>
                <td className="py-3 px-4">The password for Redis authentication. When set, the adapter sends an <code className="prose-code">AUTH</code> command after connecting. Leave undefined for Redis instances that do not require authentication (common in development but not recommended in production).</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">prefix</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4"><code className="prose-code">''</code></td>
                <td className="py-3 px-4">A string prefix prepended to all channel names. Use this to namespace your application's channels when sharing a Redis instance with other applications or services. For example, a prefix of "myapp:" causes a publish to channel "orders" to actually publish to "myapp:orders" in Redis.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">maxReconnectAttempts</code></td>
                <td className="py-3 px-4"><code className="prose-code">number</code></td>
                <td className="py-3 px-4"><code className="prose-code">10</code></td>
                <td className="py-3 px-4">The maximum number of times the adapter will attempt to reconnect to Redis after a connection failure. After exhausting all attempts, the adapter enters a disconnected state and subsequent operations will fail. Set to a higher value in environments where Redis restarts are expected, such as during rolling deployments.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">reconnectDelay</code></td>
                <td className="py-3 px-4"><code className="prose-code">number</code></td>
                <td className="py-3 px-4"><code className="prose-code">1000</code></td>
                <td className="py-3 px-4">The delay in milliseconds between consecutive reconnection attempts. A fixed delay is used to provide predictable recovery timing. For environments with intermittent Redis connectivity, consider increasing this value to avoid overwhelming the Redis server with rapid connection attempts during partial outages.</td>
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
          <Link to="/cli" className="btn-primary">
            CLI Reference <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/realtime/websocket" className="btn-secondary">
            WebSocket
          </Link>
        </div>
      </section>
    </div>
  );
}
