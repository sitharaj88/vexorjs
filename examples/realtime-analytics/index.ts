/**
 * Real-Time Analytics Dashboard Example
 *
 * Demonstrates Vexor's streaming features:
 * - Server-Sent Events (SSE) for real-time updates
 * - Streaming responses with generators
 * - Event aggregation and broadcasting
 * - Time-series data handling
 *
 * Run with: npx tsx examples/realtime-analytics/index.ts
 */

import { Vexor, SSEStream, MemoryPubSubAdapter } from '@vexorjs/core';

// ============================================================================
// App Setup
// ============================================================================

const app = new Vexor({
  port: 3003,
  logging: true,
});

// Initialize Pub/Sub for event distribution
const pubsub = new MemoryPubSubAdapter();

// ============================================================================
// Analytics Data Structures
// ============================================================================

interface PageView {
  id: string;
  path: string;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  referrer?: string;
  userAgent: string;
  country?: string;
  duration?: number;
}

interface AnalyticsEvent {
  id: string;
  name: string;
  category: string;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  properties: Record<string, unknown>;
}

interface MetricSnapshot {
  timestamp: Date;
  activeUsers: number;
  pageViews: number;
  events: number;
  avgLoadTime: number;
  topPages: { path: string; views: number }[];
  topEvents: { name: string; count: number }[];
  trafficSources: { source: string; count: number }[];
}

// In-memory storage
const pageViews: PageView[] = [];
const events: AnalyticsEvent[] = [];
const activeSessions = new Map<string, { lastSeen: Date; userId?: string; path: string }>();

// Metrics aggregation
let lastMinuteViews = 0;
let lastMinuteEvents = 0;

// ============================================================================
// Simple Validation
// ============================================================================

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

interface ValidationResult<T> {
  valid: boolean;
  value?: T;
  errors?: { field: string; message: string }[];
}

interface PageViewInput {
  path: string;
  sessionId: string;
  userId?: string;
  referrer?: string;
  userAgent?: string;
  duration?: number;
}

interface EventInput {
  name: string;
  category: string;
  sessionId: string;
  userId?: string;
  properties?: Record<string, unknown>;
}

function validatePageView(data: unknown): ValidationResult<PageViewInput> {
  if (!isObject(data)) {
    return { valid: false, errors: [{ field: 'body', message: 'Invalid request body' }] };
  }

  const errors: { field: string; message: string }[] = [];

  if (typeof data.path !== 'string' || !data.path) {
    errors.push({ field: 'path', message: 'Path is required' });
  }
  if (typeof data.sessionId !== 'string' || !data.sessionId) {
    errors.push({ field: 'sessionId', message: 'Session ID is required' });
  }
  if (data.userId !== undefined && typeof data.userId !== 'string') {
    errors.push({ field: 'userId', message: 'User ID must be a string' });
  }
  if (data.referrer !== undefined && typeof data.referrer !== 'string') {
    errors.push({ field: 'referrer', message: 'Referrer must be a string' });
  }
  if (data.userAgent !== undefined && typeof data.userAgent !== 'string') {
    errors.push({ field: 'userAgent', message: 'User agent must be a string' });
  }
  if (data.duration !== undefined && typeof data.duration !== 'number') {
    errors.push({ field: 'duration', message: 'Duration must be a number' });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    value: {
      path: data.path as string,
      sessionId: data.sessionId as string,
      userId: data.userId as string | undefined,
      referrer: data.referrer as string | undefined,
      userAgent: data.userAgent as string | undefined,
      duration: data.duration as number | undefined,
    },
  };
}

function validateEvent(data: unknown): ValidationResult<EventInput> {
  if (!isObject(data)) {
    return { valid: false, errors: [{ field: 'body', message: 'Invalid request body' }] };
  }

  const errors: { field: string; message: string }[] = [];

  if (typeof data.name !== 'string' || !data.name) {
    errors.push({ field: 'name', message: 'Event name is required' });
  }
  if (typeof data.category !== 'string' || !data.category) {
    errors.push({ field: 'category', message: 'Category is required' });
  }
  if (typeof data.sessionId !== 'string' || !data.sessionId) {
    errors.push({ field: 'sessionId', message: 'Session ID is required' });
  }
  if (data.userId !== undefined && typeof data.userId !== 'string') {
    errors.push({ field: 'userId', message: 'User ID must be a string' });
  }
  if (data.properties !== undefined && !isObject(data.properties)) {
    errors.push({ field: 'properties', message: 'Properties must be an object' });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    value: {
      name: data.name as string,
      category: data.category as string,
      sessionId: data.sessionId as string,
      userId: data.userId as string | undefined,
      properties: data.properties as Record<string, unknown> | undefined,
    },
  };
}

// ============================================================================
// SSE Connections Management
// ============================================================================

const sseConnections = new Set<SSEStream>();

function broadcastMetrics(metrics: MetricSnapshot): void {
  const data = JSON.stringify(metrics);
  for (const stream of sseConnections) {
    stream.sendEvent('metrics', data);
  }
}

function broadcastEvent(eventType: string, eventData: unknown): void {
  const data = JSON.stringify(eventData);
  for (const stream of sseConnections) {
    stream.sendEvent(eventType, data);
  }
}

// ============================================================================
// Analytics Aggregation
// ============================================================================

function getMetricsSnapshot(): MetricSnapshot {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60000);
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);

  // Filter recent data
  const recentViews = pageViews.filter(v => v.timestamp >= oneMinuteAgo);
  const recentEvents = events.filter(e => e.timestamp >= oneMinuteAgo);

  // Active users (sessions with activity in last 5 minutes)
  const activeUserCount = Array.from(activeSessions.values())
    .filter(s => s.lastSeen >= fiveMinutesAgo)
    .length;

  // Top pages
  const pageCounts = new Map<string, number>();
  for (const view of recentViews) {
    pageCounts.set(view.path, (pageCounts.get(view.path) || 0) + 1);
  }
  const topPages = Array.from(pageCounts.entries())
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  // Top events
  const eventCounts = new Map<string, number>();
  for (const event of recentEvents) {
    eventCounts.set(event.name, (eventCounts.get(event.name) || 0) + 1);
  }
  const topEvents = Array.from(eventCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Traffic sources
  const sourceCounts = new Map<string, number>();
  for (const view of recentViews) {
    const source = view.referrer ?
      (view.referrer.includes('google') ? 'Google' :
       view.referrer.includes('facebook') ? 'Facebook' :
       view.referrer.includes('twitter') ? 'Twitter' : 'Other') :
      'Direct';
    sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
  }
  const trafficSources = Array.from(sourceCounts.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  // Average load time
  const viewsWithDuration = recentViews.filter(v => v.duration !== undefined);
  const avgLoadTime = viewsWithDuration.length > 0
    ? viewsWithDuration.reduce((sum, v) => sum + (v.duration || 0), 0) / viewsWithDuration.length
    : 0;

  return {
    timestamp: now,
    activeUsers: activeUserCount,
    pageViews: recentViews.length,
    events: recentEvents.length,
    avgLoadTime: Math.round(avgLoadTime),
    topPages,
    topEvents,
    trafficSources,
  };
}

// Periodic metrics broadcast
setInterval(() => {
  const metrics = getMetricsSnapshot();
  broadcastMetrics(metrics);
  pubsub.publish('metrics', metrics);
}, 1000); // Every second

// Clean up old data periodically
setInterval(() => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  // Remove old page views
  while (pageViews.length > 0 && pageViews[0].timestamp < oneHourAgo) {
    pageViews.shift();
  }

  // Remove old events
  while (events.length > 0 && events[0].timestamp < oneHourAgo) {
    events.shift();
  }

  // Remove inactive sessions
  for (const [sessionId, session] of activeSessions) {
    if (session.lastSeen < oneHourAgo) {
      activeSessions.delete(sessionId);
    }
  }
}, 60000); // Every minute

// ============================================================================
// Simulated Traffic Generator
// ============================================================================

const paths = ['/', '/products', '/about', '/contact', '/pricing', '/blog', '/docs'];
const eventNames = ['click', 'scroll', 'form_submit', 'purchase', 'signup', 'login'];
const categories = ['engagement', 'conversion', 'navigation'];
const referrers = [
  'https://google.com/search',
  'https://facebook.com',
  'https://twitter.com',
  null,
  null, // More direct traffic
];

function generateRandomTraffic(): void {
  const sessionId = `session_${Math.random().toString(36).slice(2, 11)}`;
  const userId = Math.random() > 0.3 ? `user_${Math.floor(Math.random() * 1000)}` : undefined;
  const path = paths[Math.floor(Math.random() * paths.length)];
  const referrer = referrers[Math.floor(Math.random() * referrers.length)];

  // Track page view
  const view: PageView = {
    id: crypto.randomUUID(),
    path,
    timestamp: new Date(),
    userId,
    sessionId,
    referrer: referrer || undefined,
    userAgent: 'Mozilla/5.0 (simulated)',
    duration: Math.floor(Math.random() * 5000) + 500,
  };

  pageViews.push(view);
  activeSessions.set(sessionId, { lastSeen: new Date(), userId, path });
  lastMinuteViews++;

  broadcastEvent('pageview', view);

  // Randomly generate events
  if (Math.random() > 0.5) {
    const eventName = eventNames[Math.floor(Math.random() * eventNames.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];

    const event: AnalyticsEvent = {
      id: crypto.randomUUID(),
      name: eventName,
      category,
      timestamp: new Date(),
      userId,
      sessionId,
      properties: {
        page: path,
        value: Math.random() > 0.8 ? Math.floor(Math.random() * 100) : undefined,
      },
    };

    events.push(event);
    lastMinuteEvents++;

    broadcastEvent('event', event);
  }
}

// Generate random traffic
setInterval(() => {
  if (Math.random() > 0.3) { // 70% chance of traffic each interval
    generateRandomTraffic();
  }
}, 500); // Every 500ms

// ============================================================================
// Routes
// ============================================================================

// Health check
app.get('/health', (ctx) => {
  return ctx.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    stats: {
      activeConnections: sseConnections.size,
      totalPageViews: pageViews.length,
      totalEvents: events.length,
      activeSessions: activeSessions.size,
    },
  });
});

// Root
app.get('/', (ctx) => {
  return ctx.json({
    name: 'Vexor Real-Time Analytics',
    version: '1.0.0',
    features: ['SSE Streaming', 'Real-time Metrics', 'Event Tracking'],
    endpoints: {
      tracking: ['POST /track/pageview', 'POST /track/event'],
      streaming: ['GET /stream/metrics', 'GET /stream/events'],
      api: ['GET /api/metrics', 'GET /api/pageviews', 'GET /api/events'],
    },
  });
});

// ============================================================================
// Tracking Endpoints
// ============================================================================

app.group('/track', (track) => {
  // Track page view
  track.post('/pageview', async (ctx) => {
    const body = await ctx.readJson();
    const result = validatePageView(body);

    if (!result.valid) {
      return ctx.validationError(result.errors!);
    }

    const data = result.value!;
    const view: PageView = {
      id: crypto.randomUUID(),
      path: data.path,
      timestamp: new Date(),
      userId: data.userId,
      sessionId: data.sessionId,
      referrer: data.referrer,
      userAgent: data.userAgent || ctx.header('user-agent') || 'unknown',
      duration: data.duration,
    };

    pageViews.push(view);
    activeSessions.set(data.sessionId, {
      lastSeen: new Date(),
      userId: data.userId,
      path: data.path,
    });
    lastMinuteViews++;

    broadcastEvent('pageview', view);

    return ctx.status(201).json({ id: view.id, recorded: true });
  });

  // Track event
  track.post('/event', async (ctx) => {
    const body = await ctx.readJson();
    const result = validateEvent(body);

    if (!result.valid) {
      return ctx.validationError(result.errors!);
    }

    const data = result.value!;
    const event: AnalyticsEvent = {
      id: crypto.randomUUID(),
      name: data.name,
      category: data.category,
      timestamp: new Date(),
      userId: data.userId,
      sessionId: data.sessionId,
      properties: data.properties || {},
    };

    events.push(event);
    lastMinuteEvents++;

    broadcastEvent('event', event);

    return ctx.status(201).json({ id: event.id, recorded: true });
  });
});

// ============================================================================
// Streaming Endpoints (SSE)
// ============================================================================

app.group('/stream', (stream) => {
  // Stream real-time metrics
  stream.get('/metrics', (ctx) => {
    const sseStream = new SSEStream();
    sseConnections.add(sseStream);

    // Send initial metrics
    const initialMetrics = getMetricsSnapshot();
    sseStream.sendEvent('metrics', JSON.stringify(initialMetrics));

    // Handle disconnect - access signal via the underlying Request
    const signal = ctx.req.request.signal;
    if (signal) {
      signal.addEventListener('abort', () => {
        sseConnections.delete(sseStream);
        sseStream.close();
      });
    }

    return sseStream.getResponse();
  });

  // Stream all events
  stream.get('/events', (ctx) => {
    const sseStream = new SSEStream();
    sseConnections.add(sseStream);

    sseStream.sendEvent('connected', JSON.stringify({ timestamp: new Date().toISOString() }));

    const signal = ctx.req.request.signal;
    if (signal) {
      signal.addEventListener('abort', () => {
        sseConnections.delete(sseStream);
        sseStream.close();
      });
    }

    return sseStream.getResponse();
  });

  // Stream filtered events by category
  stream.get('/events/:category', async (ctx) => {
    const category = ctx.params.category;
    const sseStream = new SSEStream();

    // Subscribe to events and filter by category
    const subscription = await pubsub.subscribe<AnalyticsEvent>('events', (event) => {
      if (event.category === category) {
        sseStream.sendEvent('event', JSON.stringify(event));
      }
    });

    sseStream.sendEvent('connected', JSON.stringify({
      category,
      timestamp: new Date().toISOString(),
    }));

    const signal = ctx.req.request.signal;
    if (signal) {
      signal.addEventListener('abort', () => {
        subscription.unsubscribe();
        sseStream.close();
      });
    }

    return sseStream.getResponse();
  });
});

// ============================================================================
// API Endpoints
// ============================================================================

app.group('/api', (api) => {
  // Get current metrics snapshot
  api.get('/metrics', (ctx) => {
    return ctx.json(getMetricsSnapshot());
  });

  // Get historical metrics
  api.get('/metrics/history', (ctx) => {
    const minutes = parseInt(ctx.queryParam('minutes') as string) || 60;
    const interval = parseInt(ctx.queryParam('interval') as string) || 5; // minutes

    const now = new Date();
    const history: Array<{
      timestamp: Date;
      pageViews: number;
      events: number;
    }> = [];

    for (let i = 0; i < minutes / interval; i++) {
      const start = new Date(now.getTime() - (i + 1) * interval * 60000);
      const end = new Date(now.getTime() - i * interval * 60000);

      const viewCount = pageViews.filter(v => v.timestamp >= start && v.timestamp < end).length;
      const eventCount = events.filter(e => e.timestamp >= start && e.timestamp < end).length;

      history.unshift({
        timestamp: start,
        pageViews: viewCount,
        events: eventCount,
      });
    }

    return ctx.json({ history, interval, totalMinutes: minutes });
  });

  // Get recent page views
  api.get('/pageviews', (ctx) => {
    const limit = parseInt(ctx.queryParam('limit') as string) || 100;
    const path = ctx.queryParam('path');

    let filtered = [...pageViews].reverse();

    if (path) {
      filtered = filtered.filter(v => v.path === path);
    }

    return ctx.json({
      data: filtered.slice(0, limit),
      total: filtered.length,
    });
  });

  // Get recent events
  api.get('/events', (ctx) => {
    const limit = parseInt(ctx.queryParam('limit') as string) || 100;
    const name = ctx.queryParam('name');
    const category = ctx.queryParam('category');

    let filtered = [...events].reverse();

    if (name) {
      filtered = filtered.filter(e => e.name === name);
    }
    if (category) {
      filtered = filtered.filter(e => e.category === category);
    }

    return ctx.json({
      data: filtered.slice(0, limit),
      total: filtered.length,
    });
  });

  // Get active sessions
  api.get('/sessions', (ctx) => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60000);

    const active = Array.from(activeSessions.entries())
      .filter(([, session]) => session.lastSeen >= fiveMinutesAgo)
      .map(([id, session]) => ({
        sessionId: id,
        ...session,
      }));

    return ctx.json({
      active: active.length,
      sessions: active,
    });
  });

  // Get top pages
  api.get('/top/pages', (ctx) => {
    const minutes = parseInt(ctx.queryParam('minutes') as string) || 60;
    const limit = parseInt(ctx.queryParam('limit') as string) || 10;

    const since = new Date(Date.now() - minutes * 60000);
    const recentViews = pageViews.filter(v => v.timestamp >= since);

    const pageCounts = new Map<string, number>();
    for (const view of recentViews) {
      pageCounts.set(view.path, (pageCounts.get(view.path) || 0) + 1);
    }

    const topPages = Array.from(pageCounts.entries())
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);

    return ctx.json({ topPages, period: `${minutes} minutes` });
  });

  // Get top events
  api.get('/top/events', (ctx) => {
    const minutes = parseInt(ctx.queryParam('minutes') as string) || 60;
    const limit = parseInt(ctx.queryParam('limit') as string) || 10;

    const since = new Date(Date.now() - minutes * 60000);
    const recentEvents = events.filter(e => e.timestamp >= since);

    const eventCounts = new Map<string, number>();
    for (const event of recentEvents) {
      eventCounts.set(event.name, (eventCounts.get(event.name) || 0) + 1);
    }

    const topEvents = Array.from(eventCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return ctx.json({ topEvents, period: `${minutes} minutes` });
  });
});

// ============================================================================
// Dashboard HTML (Simple visualization)
// ============================================================================

app.get('/dashboard', () => {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Real-Time Analytics Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      padding: 20px;
    }
    h1 { color: #38bdf8; margin-bottom: 20px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
    .card {
      background: #1e293b;
      border-radius: 12px;
      padding: 20px;
      border: 1px solid #334155;
    }
    .card h3 { color: #94a3b8; font-size: 14px; margin-bottom: 8px; }
    .card .value { font-size: 36px; font-weight: bold; color: #38bdf8; }
    .card .change { font-size: 14px; color: #22c55e; }
    .list { margin-top: 15px; }
    .list-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #334155;
    }
    .list-item:last-child { border-bottom: none; }
    .events-feed {
      background: #1e293b;
      border-radius: 12px;
      padding: 20px;
      margin-top: 20px;
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #334155;
    }
    .event-item {
      padding: 8px;
      margin: 4px 0;
      background: #0f172a;
      border-radius: 6px;
      font-size: 13px;
    }
    .event-item .type { color: #f472b6; }
    .event-item .path { color: #38bdf8; }
    .event-item .time { color: #64748b; font-size: 11px; }
    .connected { color: #22c55e; }
    .disconnected { color: #ef4444; }
  </style>
</head>
<body>
  <h1>Real-Time Analytics Dashboard</h1>
  <p id="status" class="disconnected">Connecting...</p>

  <div class="grid" style="margin-top: 20px;">
    <div class="card">
      <h3>Active Users</h3>
      <div class="value" id="activeUsers">-</div>
    </div>
    <div class="card">
      <h3>Page Views (last min)</h3>
      <div class="value" id="pageViews">-</div>
    </div>
    <div class="card">
      <h3>Events (last min)</h3>
      <div class="value" id="events">-</div>
    </div>
    <div class="card">
      <h3>Avg Load Time</h3>
      <div class="value" id="loadTime">-</div>
      <div class="change">ms</div>
    </div>
  </div>

  <div class="grid" style="margin-top: 20px;">
    <div class="card">
      <h3>Top Pages</h3>
      <div class="list" id="topPages"></div>
    </div>
    <div class="card">
      <h3>Top Events</h3>
      <div class="list" id="topEvents"></div>
    </div>
    <div class="card">
      <h3>Traffic Sources</h3>
      <div class="list" id="trafficSources"></div>
    </div>
  </div>

  <div class="events-feed">
    <h3 style="margin-bottom: 10px;">Live Event Feed</h3>
    <div id="eventFeed"></div>
  </div>

  <script>
    const eventSource = new EventSource('/stream/metrics');
    const statusEl = document.getElementById('status');
    const feedEl = document.getElementById('eventFeed');

    eventSource.onopen = () => {
      statusEl.textContent = 'Connected';
      statusEl.className = 'connected';
    };

    eventSource.onerror = () => {
      statusEl.textContent = 'Disconnected - Reconnecting...';
      statusEl.className = 'disconnected';
    };

    eventSource.addEventListener('metrics', (e) => {
      const data = JSON.parse(e.data);

      document.getElementById('activeUsers').textContent = data.activeUsers;
      document.getElementById('pageViews').textContent = data.pageViews;
      document.getElementById('events').textContent = data.events;
      document.getElementById('loadTime').textContent = data.avgLoadTime;

      document.getElementById('topPages').innerHTML = data.topPages
        .map(p => '<div class="list-item"><span>' + p.path + '</span><span>' + p.views + '</span></div>')
        .join('');

      document.getElementById('topEvents').innerHTML = data.topEvents
        .map(e => '<div class="list-item"><span>' + e.name + '</span><span>' + e.count + '</span></div>')
        .join('');

      document.getElementById('trafficSources').innerHTML = data.trafficSources
        .map(s => '<div class="list-item"><span>' + s.source + '</span><span>' + s.count + '</span></div>')
        .join('');
    });

    eventSource.addEventListener('pageview', (e) => {
      const data = JSON.parse(e.data);
      const item = document.createElement('div');
      item.className = 'event-item';
      item.innerHTML = '<span class="type">pageview</span> <span class="path">' + data.path + '</span> <span class="time">' + new Date(data.timestamp).toLocaleTimeString() + '</span>';
      feedEl.insertBefore(item, feedEl.firstChild);
      if (feedEl.children.length > 50) feedEl.removeChild(feedEl.lastChild);
    });

    eventSource.addEventListener('event', (e) => {
      const data = JSON.parse(e.data);
      const item = document.createElement('div');
      item.className = 'event-item';
      item.innerHTML = '<span class="type">' + data.name + '</span> <span class="path">' + data.category + '</span> <span class="time">' + new Date(data.timestamp).toLocaleTimeString() + '</span>';
      feedEl.insertBefore(item, feedEl.firstChild);
      if (feedEl.children.length > 50) feedEl.removeChild(feedEl.lastChild);
    });
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
});

// ============================================================================
// Error Handler
// ============================================================================

app.setErrorHandler(async (error, ctx) => {
  console.error(`Error: ${error.message}`);
  return ctx.status(500).json({
    error: 'Internal server error',
    requestId: ctx.requestId,
  });
});

// Print routes
app.printRoutes();

// Start server
app.listen(3003).then(() => {
  const addr = app.address();
  if (addr) {
    console.log(`
    Real-Time Analytics Server started!

    Server URL: http://localhost:${addr.port}
    Dashboard: http://localhost:${addr.port}/dashboard

    Features:
    - Real-time metrics via SSE
    - Automatic traffic simulation
    - Live event feed
    - Historical data API

    API Endpoints:

    Tracking:
    - POST /track/pageview - Record a page view
    - POST /track/event    - Record an event

    Streaming (SSE):
    - GET /stream/metrics  - Real-time metrics stream
    - GET /stream/events   - All events stream
    - GET /stream/events/:category - Filtered events

    API:
    - GET /api/metrics         - Current metrics snapshot
    - GET /api/metrics/history - Historical metrics
    - GET /api/pageviews       - Recent page views
    - GET /api/events          - Recent events
    - GET /api/sessions        - Active sessions
    - GET /api/top/pages       - Top pages
    - GET /api/top/events      - Top events

    Example: Track a page view
    curl -X POST http://localhost:${addr.port}/track/pageview \\
      -H "Content-Type: application/json" \\
      -d '{"path": "/products", "sessionId": "abc123"}'

    Example: Listen to metrics stream
    curl http://localhost:${addr.port}/stream/metrics
    `);
  }
});
