# Microservices Example

This example demonstrates a microservices architecture using Vexor with:
- API Gateway pattern
- Circuit breakers for fault tolerance
- Distributed tracing
- Rate limiting
- Service aggregation

## Architecture

```
                    ┌─────────────────────────────────────────┐
                    │              API Gateway                │
                    │              (Port 3010)                │
                    │                                         │
                    │  • Request routing                      │
                    │  • Circuit breaker                      │
                    │  • Rate limiting                        │
                    │  • Distributed tracing                  │
                    │  • Request aggregation                  │
                    └─────────────────────────────────────────┘
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            │                         │                         │
            ▼                         ▼                         ▼
┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│    User Service     │   │   Product Service   │   │   Order Service     │
│    (Port 3011)      │   │    (Port 3012)      │   │    (Port 3013)      │
│                     │   │                     │   │                     │
│  • User CRUD        │   │  • Product catalog  │   │  • Order management │
│  • User stats       │   │  • Stock tracking   │   │  • Order workflow   │
└─────────────────────┘   └─────────────────────┘   └─────────────────────┘
```

## Quick Start

Open 4 terminal windows and run each service:

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

## Services

### API Gateway (Port 3010)

The gateway handles:
- **Request Routing**: Forwards requests to appropriate services
- **Circuit Breaker**: Prevents cascade failures when services are down
- **Rate Limiting**: 100 requests per minute per client
- **Tracing**: Adds trace IDs for distributed tracing
- **Aggregation**: Combines data from multiple services

### User Service (Port 3011)

Manages user data:
- `GET /users` - List users
- `GET /users/:id` - Get user
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /stats` - User statistics

### Product Service (Port 3012)

Manages product catalog:
- `GET /products` - List products (with filters)
- `GET /products/:id` - Get product
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `PATCH /products/:id/stock` - Update stock
- `DELETE /products/:id` - Delete product
- `GET /stats` - Product statistics

### Order Service (Port 3013)

Manages orders:
- `GET /orders` - List orders
- `GET /orders/:id` - Get order
- `POST /orders` - Create order
- `PUT /orders/:id/status` - Update status
- `DELETE /orders/:id` - Delete order (pending only)
- `GET /stats` - Order statistics

## Testing

### Basic Requests

```bash
# Check gateway health (shows all service status)
curl http://localhost:3010/health

# Get users via gateway
curl http://localhost:3010/api/users

# Get products via gateway
curl http://localhost:3010/api/products

# Get orders via gateway
curl http://localhost:3010/api/orders
```

### Aggregated Requests

```bash
# Get user with their orders (combines user + orders services)
curl http://localhost:3010/api/users/1/full

# Get dashboard (combines stats from all services)
curl http://localhost:3010/api/dashboard
```

### Monitoring

```bash
# View metrics
curl http://localhost:3010/metrics

# View recent traces
curl http://localhost:3010/traces
```

### Circuit Breaker Testing

```bash
# 1. Stop the user service (Ctrl+C in that terminal)

# 2. Make requests to user service via gateway
curl http://localhost:3010/api/users
# Returns data from service (if cached) or error

# 3. After 3 failures, circuit opens
curl http://localhost:3010/api/users
# Returns: {"error": "Service users is temporarily unavailable"}

# 4. Check circuit state
curl http://localhost:3010/health
# Shows: "users": { "status": "unhealthy", "circuitState": "OPEN" }

# 5. Force circuit states (for testing)
curl -X POST http://localhost:3010/debug/circuit/users/close
curl -X POST http://localhost:3010/debug/circuit/users/open
curl -X POST http://localhost:3010/debug/circuit/users/reset
```

### Rate Limiting

```bash
# Make many requests quickly
for i in {1..110}; do curl -s http://localhost:3010/api/users > /dev/null; done

# Check rate limit headers
curl -i http://localhost:3010/api/users
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 89
# X-RateLimit-Reset: 1234567890
```

## Distributed Tracing

Every request through the gateway gets a trace ID:

```bash
curl -i http://localhost:3010/api/users
# X-Trace-Id: abc123-...
# X-Span-Id: def456-...
```

You can pass your own trace ID:
```bash
curl -H "X-Trace-Id: my-trace-123" http://localhost:3010/api/users
```

View traces:
```bash
curl http://localhost:3010/traces
```

## Configuration

### Circuit Breaker Settings

In `gateway.ts`:
```typescript
new CircuitBreaker({
  name: 'users-service',
  failureThreshold: 3,    // Open after 3 failures
  resetTimeout: 30000,    // Try again after 30s
  halfOpenRequests: 2,    // Allow 2 test requests when half-open
})
```

### Rate Limiting

In `gateway.ts`:
```typescript
const RATE_LIMIT = 100;   // requests per window
const RATE_WINDOW = 60000; // 1 minute window
```

## Features Demonstrated

1. **Service Independence**: Each service runs independently and can be scaled separately
2. **Fault Tolerance**: Circuit breakers prevent cascade failures
3. **Observability**: Distributed tracing and metrics collection
4. **Gateway Pattern**: Single entry point for all services
5. **Request Aggregation**: Combine data from multiple services in one request
6. **Rate Limiting**: Protect services from traffic spikes
