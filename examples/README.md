# Vexor Examples

This directory contains example applications demonstrating various features of the Vexor framework.

## Quick Start

All examples can be run with either Node.js (via tsx) or Bun:

```bash
# Using Node.js
npx tsx examples/<example>/index.ts

# Using Bun
bun run examples/<example>/index.ts
```

## Examples Overview

| Example | Port | Features |
|---------|------|----------|
| [basic-api](./basic-api/) | 3000 | CRUD, Middleware, Route Groups |
| [realtime-chat](./realtime-chat/) | 3001 | WebSocket, Pub/Sub, JWT Auth |
| [ecommerce-api](./ecommerce-api/) | 3002 | ORM, Validation, Transactions |
| [microservices](./microservices/) | 3010-3013 | Circuit Breaker, Tracing, Gateway |
| [realtime-analytics](./realtime-analytics/) | 3003 | SSE, Streaming, Real-time Data |

---

## 1. Basic API

**Location:** `examples/basic-api/`

A simple REST API demonstrating core Vexor features.

### Features
- CRUD operations for users
- Middleware (request logging, request ID)
- Route groups (`/api/v1`)
- Error handling
- Request validation

### Run
```bash
npx tsx examples/basic-api/index.ts
```

### Endpoints
- `GET /health` - Health check
- `GET /users` - List users (with pagination)
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

---

## 2. Real-Time Chat

**Location:** `examples/realtime-chat/`

A real-time chat application with rooms, authentication, and message broadcasting.

### Features
- **WebSocket** support for real-time messaging
- **Pub/Sub** for room-based message broadcasting
- **JWT Authentication** for secure access
- User presence tracking
- Typing indicators
- Message history

### Run
```bash
npx tsx examples/realtime-chat/index.ts
```

### Endpoints

**REST API:**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user (auth required)
- `GET /rooms` - List chat rooms
- `POST /rooms` - Create room (auth required)
- `GET /rooms/:id/messages` - Get room messages

**WebSocket:**
- `ws://localhost:3001/ws?token=JWT_TOKEN`

**WebSocket Commands:**
```json
{"type": "join_room", "roomId": "general"}
{"type": "send_message", "roomId": "general", "content": "Hello!"}
{"type": "leave_room", "roomId": "general"}
{"type": "typing", "roomId": "general"}
```

### Quick Test
```bash
# Register
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "password123"}'

# Connect WebSocket (using wscat)
wscat -c "ws://localhost:3001/ws?token=YOUR_TOKEN"
```

---

## 3. E-Commerce API

**Location:** `examples/ecommerce-api/`

A full-featured e-commerce API with product catalog, shopping cart, and order management.

### Features
- **Schema Validation** with TypeBox
- **ORM Integration** with type-safe queries
- **Transactions** for order processing
- **Authentication & Authorization** (admin/customer roles)
- Shopping cart management
- Order status workflow
- Product filtering and pagination

### Run
```bash
npx tsx examples/ecommerce-api/index.ts
```

### Test Accounts
- **Admin:** admin@shop.com / admin123
- **Customer:** customer@example.com / customer123

### Endpoints

**Authentication:**
- `POST /auth/register` - Register
- `POST /auth/login` - Login
- `GET /auth/me` - Current user

**Products:**
- `GET /products` - List products (with filters)
- `GET /products/:slug` - Get product details
- `POST /products` - Create (admin)
- `PUT /products/:id` - Update (admin)
- `DELETE /products/:id` - Delete (admin)

**Categories:**
- `GET /categories` - List categories
- `GET /categories/:slug` - Category with products

**Cart:**
- `GET /cart` - View cart
- `POST /cart` - Add item
- `PUT /cart/:id` - Update quantity
- `DELETE /cart/:id` - Remove item
- `DELETE /cart` - Clear cart

**Orders:**
- `GET /orders` - List orders
- `POST /orders` - Create order (checkout)
- `GET /orders/:id` - Order details
- `PUT /orders/:id/status` - Update status (admin)

### Quick Test
```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:3002/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "customer@example.com", "password": "customer123"}' | jq -r '.token')

# Browse products
curl http://localhost:3002/products

# Add to cart
curl -X POST http://localhost:3002/cart \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 2}'

# Checkout
curl -X POST http://localhost:3002/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shippingAddress": {
      "street": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "zip": "94102",
      "country": "USA"
    }
  }'
```

---

## 4. Microservices

**Location:** `examples/microservices/`

A microservices architecture with API Gateway, service discovery, and resilience patterns.

### Components

| Service | Port | Description |
|---------|------|-------------|
| Gateway | 3010 | API Gateway with routing |
| User Service | 3011 | User management |
| Product Service | 3012 | Product catalog |
| Order Service | 3013 | Order management |

### Features
- **API Gateway** pattern with request routing
- **Circuit Breaker** for fault tolerance
- **Rate Limiting** (100 req/min per client)
- **Distributed Tracing** with OpenTelemetry
- **Metrics Collection** for monitoring
- **Request Aggregation** (combine multiple services)

### Run

Start all services in separate terminals:

```bash
# Terminal 1: API Gateway
npx tsx examples/microservices/gateway.ts

# Terminal 2: User Service
npx tsx examples/microservices/user-service.ts

# Terminal 3: Product Service
npx tsx examples/microservices/product-service.ts

# Terminal 4: Order Service
npx tsx examples/microservices/order-service.ts
```

### Gateway Endpoints

**Service Proxies:**
- `GET/POST /api/users/*` → User Service
- `GET/POST /api/products/*` → Product Service
- `GET/POST /api/orders/*` → Order Service

**Aggregation:**
- `GET /api/users/:id/full` - User with orders
- `GET /api/dashboard` - Combined stats from all services

**Monitoring:**
- `GET /health` - Gateway and service health
- `GET /metrics` - Prometheus-style metrics
- `GET /traces` - Recent distributed traces

**Debug:**
- `POST /debug/circuit/:service/open` - Force open circuit
- `POST /debug/circuit/:service/close` - Force close circuit
- `POST /debug/circuit/:service/reset` - Reset circuit breaker

### Quick Test
```bash
# Health check (shows all service status)
curl http://localhost:3010/health

# Get users via gateway
curl http://localhost:3010/api/users

# Get aggregated user data
curl http://localhost:3010/api/users/1/full

# View metrics
curl http://localhost:3010/metrics

# Test circuit breaker (stop user-service, then)
curl http://localhost:3010/api/users
# Will return 503 after failures threshold
```

---

## 5. Real-Time Analytics

**Location:** `examples/realtime-analytics/`

A real-time analytics dashboard with streaming metrics and event tracking.

### Features
- **Server-Sent Events (SSE)** for real-time updates
- **Streaming Responses** for continuous data
- **Event Aggregation** and broadcasting
- **Time-series Data** handling
- Live dashboard UI
- Simulated traffic generation

### Run
```bash
npx tsx examples/realtime-analytics/index.ts
```

### Dashboard
Open in browser: http://localhost:3003/dashboard

### Endpoints

**Tracking:**
- `POST /track/pageview` - Record page view
- `POST /track/event` - Record custom event

**Streaming (SSE):**
- `GET /stream/metrics` - Real-time metrics
- `GET /stream/events` - All events stream
- `GET /stream/events/:category` - Filtered by category

**API:**
- `GET /api/metrics` - Current snapshot
- `GET /api/metrics/history` - Historical data
- `GET /api/pageviews` - Recent page views
- `GET /api/events` - Recent events
- `GET /api/sessions` - Active sessions
- `GET /api/top/pages` - Top pages
- `GET /api/top/events` - Top events

### Quick Test
```bash
# Track a page view
curl -X POST http://localhost:3003/track/pageview \
  -H "Content-Type: application/json" \
  -d '{"path": "/products", "sessionId": "session123"}'

# Track an event
curl -X POST http://localhost:3003/track/event \
  -H "Content-Type: application/json" \
  -d '{"name": "purchase", "category": "conversion", "sessionId": "session123"}'

# Stream metrics (will continuously receive data)
curl http://localhost:3003/stream/metrics

# Get current metrics
curl http://localhost:3003/api/metrics
```

---

## Running All Examples

You can run multiple examples simultaneously as they use different ports:

```bash
# Basic API on 3000
npx tsx examples/basic-api/index.ts &

# Chat on 3001
npx tsx examples/realtime-chat/index.ts &

# E-commerce on 3002
npx tsx examples/ecommerce-api/index.ts &

# Analytics on 3003
npx tsx examples/realtime-analytics/index.ts &

# Microservices on 3010-3013
npx tsx examples/microservices/gateway.ts &
npx tsx examples/microservices/user-service.ts &
npx tsx examples/microservices/product-service.ts &
npx tsx examples/microservices/order-service.ts &
```

---

## Common Patterns Demonstrated

### Middleware
```typescript
app.use(async (ctx) => {
  console.log(`${ctx.method} ${ctx.path}`);
});
```

### Route Groups
```typescript
app.group('/api/v1', (api) => {
  api.get('/users', handler);
});
```

### Authentication
```typescript
async function authMiddleware(ctx) {
  const token = ctx.header('authorization')?.replace('Bearer ', '');
  // verify token...
}

app.get('/protected', authMiddleware, handler);
```

### Validation
```typescript
const Schema = Type.Object({
  name: Type.String({ minLength: 2 }),
  email: Type.String({ format: 'email' }),
});

const validator = createValidator(Schema);
const result = validator.safeParse(data);
```

### WebSocket
```typescript
app.ws('/ws', {
  open(ws, ctx) { /* connection opened */ },
  message(ws, data, ctx) { /* message received */ },
  close(ws, ctx) { /* connection closed */ },
});
```

### SSE Streaming
```typescript
app.get('/stream', (ctx) => {
  const emitter = new SSEEmitter();
  emitter.send('event-name', JSON.stringify(data));
  return emitter.toResponse();
});
```

### Error Handling
```typescript
app.setErrorHandler(async (error, ctx) => {
  return ctx.status(500).json({ error: error.message });
});
```

---

## Need Help?

- Read the [Vexor Documentation](../docs/)
- Check the [API Reference](../docs/api-reference/)
- Open an issue on [GitHub](https://github.com/your-org/vexor/issues)
