# Enterprise API Example

A production-ready REST API demonstrating all Vexor framework features with comprehensive security, database integration, and testing.

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [API Reference](#api-reference)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Products](#products)
- [Configuration](#configuration)
- [Database](#database)
- [Security](#security)
- [Middleware](#middleware)
- [Testing](#testing)
- [Error Handling](#error-handling)
- [Development](#development)

---

## Features

| Feature | Implementation |
|---------|----------------|
| **Database** | SQLite with @vexorjs/orm |
| **Authentication** | JWT with access/refresh tokens |
| **Authorization** | Role-based access control (RBAC) |
| **Password Security** | PBKDF2 with 100,000 iterations |
| **Rate Limiting** | Per-IP/user request throttling |
| **CORS** | Configurable cross-origin support |
| **Input Validation** | Request body/query validation |
| **Error Handling** | Structured error responses |
| **Logging** | Structured JSON logging |
| **Testing** | 46 comprehensive tests with Vitest |

---

## Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Navigate to example directory
cd examples/enterprise-api

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Seed the database with sample data
npm run seed

# Start the server
npm start
```

### First Request

```bash
# Health check
curl http://localhost:3000/health

# Login with seeded admin user
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "Admin123!"}'

# Use the returned token for authenticated requests
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer <your-access-token>"
```

---

## Project Structure

```
enterprise-api/
├── src/
│   ├── index.ts                    # Application entry point
│   ├── config/
│   │   └── index.ts                # Environment configuration
│   ├── db/
│   │   ├── index.ts                # Database connection & initialization
│   │   ├── schema.ts               # Type-safe table definitions
│   │   ├── migrate.ts              # Migration runner
│   │   └── seed.ts                 # Database seeding
│   ├── middleware/
│   │   ├── cors.ts                 # CORS configuration
│   │   ├── error-handler.ts        # Error handling & custom errors
│   │   ├── logger.ts               # Request logging
│   │   └── rate-limit.ts           # Rate limiting
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── routes.ts           # Auth endpoints
│   │   │   ├── service.ts          # Auth business logic
│   │   │   └── middleware.ts       # Auth middleware
│   │   ├── users/
│   │   │   └── routes.ts           # User management endpoints
│   │   └── products/
│   │       └── routes.ts           # Product management endpoints
│   └── utils/
│       ├── password.ts             # Password hashing (PBKDF2)
│       └── validation.ts           # Input validation helpers
├── tests/
│   ├── setup.ts                    # Test configuration
│   ├── auth.test.ts                # Authentication tests
│   ├── users.test.ts               # User management tests
│   └── products.test.ts            # Product management tests
├── data/                           # SQLite database storage
├── .env.example                    # Environment template
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## Architecture

### Request Flow

```
Client Request
      │
      ▼
┌─────────────┐
│    CORS     │ ← Handles cross-origin requests
└─────────────┘
      │
      ▼
┌─────────────┐
│   Logger    │ ← Logs request method, path, timing
└─────────────┘
      │
      ▼
┌─────────────┐
│ Rate Limit  │ ← Throttles excessive requests
└─────────────┘
      │
      ▼
┌─────────────┐
│   Router    │ ← Matches route, applies route-specific hooks
└─────────────┘
      │
      ▼
┌─────────────┐
│Auth Middleware│ ← Validates JWT (if protected route)
└─────────────┘
      │
      ▼
┌─────────────┐
│   Handler   │ ← Business logic
└─────────────┘
      │
      ▼
┌─────────────┐
│Error Handler│ ← Catches and formats errors
└─────────────┘
      │
      ▼
   Response
```

### Module Architecture

Each module follows a consistent structure:

- **routes.ts** - HTTP endpoint definitions with input validation
- **service.ts** - Business logic and database operations
- **middleware.ts** - Module-specific middleware (e.g., auth)

---

## API Reference

### Base URL

```
http://localhost:3000
```

### Response Format

All responses follow this structure:

```json
// Success Response
{
  "data": { ... },
  "message": "Operation successful"
}

// Paginated Response
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}

// Error Response
{
  "error": "ValidationError",
  "code": "VALIDATION_ERROR",
  "message": "Email is required",
  "details": [
    { "field": "email", "message": "Email is required" }
  ],
  "requestId": "req_abc123"
}
```

---

### Authentication

#### Register a New User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "message": "Registration successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "a1b2c3d4e5f6...",
    "expiresIn": 3600
  }
}
```

**Validation Rules:**
- Email: Valid email format, unique
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
- Name: Min 2 characters

---

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": { ... },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "a1b2c3d4e5f6...",
    "expiresIn": 3600
  }
}
```

---

#### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "a1b2c3d4e5f6..."
}
```

**Response (200 OK):**
```json
{
  "message": "Token refreshed",
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "new-refresh-token...",
    "expiresIn": 3600
  }
}
```

---

#### Logout

```http
POST /auth/logout
Content-Type: application/json

{
  "refreshToken": "a1b2c3d4e5f6..."
}
```

---

#### Logout All Devices

```http
POST /auth/logout-all
Authorization: Bearer <access-token>
```

Invalidates all refresh tokens for the authenticated user.

---

#### Get Current User

```http
GET /auth/me
Authorization: Bearer <access-token>
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

#### Change Password

```http
POST /auth/change-password
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}
```

---

### Users

#### List Users (Admin Only)

```http
GET /users
Authorization: Bearer <admin-token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 100) |
| `search` | string | Search by name or email |
| `role` | string | Filter by role (admin, user) |
| `isActive` | boolean | Filter by active status |

---

#### Get User by ID

```http
GET /users/:id
Authorization: Bearer <access-token>
```

**Authorization:**
- Users can only view their own profile
- Admins can view any user

---

#### Update User

```http
PUT /users/:id
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

**Authorization:**
- Users can update: `name`, `email` (self only)
- Admins can update: `name`, `email`, `role`, `isActive` (any user)

---

#### Delete User (Admin Only)

```http
DELETE /users/:id
Authorization: Bearer <admin-token>
```

**Note:** Performs soft delete (sets `is_active = 0`). Admins cannot delete themselves.

---

#### Get User Orders

```http
GET /users/:id/orders
Authorization: Bearer <access-token>
```

---

### Products

#### List Products (Public)

```http
GET /products
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |
| `search` | string | Search by name or description |
| `category` | string | Filter by category |
| `minPrice` | number | Minimum price filter |
| `maxPrice` | number | Maximum price filter |
| `inStock` | boolean | Only show in-stock products |

**Note:** Non-admins only see active products (`is_active = 1`).

---

#### Get Product Categories (Public)

```http
GET /products/categories
```

**Response:**
```json
{
  "categories": [
    { "category": "Electronics", "count": 25 },
    { "category": "Books", "count": 15 }
  ]
}
```

---

#### Get Product by ID (Public)

```http
GET /products/:id
```

---

#### Create Product (Admin Only)

```http
POST /products
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "stock": 100,
  "category": "Electronics"
}
```

---

#### Update Product (Admin Only)

```http
PUT /products/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 79.99,
  "isActive": true
}
```

---

#### Delete Product (Admin Only)

```http
DELETE /products/:id
Authorization: Bearer <admin-token>
```

**Note:** Performs soft delete (sets `is_active = 0`).

---

#### Update Product Stock (Admin Only)

```http
PATCH /products/:id/stock
Authorization: Bearer <admin-token>
Content-Type: application/json

# Relative adjustment
{ "adjustment": -10 }

# Absolute value
{ "absolute": 500 }
```

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment (development, production, test) |
| `PORT` | `3000` | Server port |
| `HOST` | `0.0.0.0` | Server host |
| `DATABASE_URL` | `./data/enterprise.db` | SQLite database path |
| `JWT_SECRET` | *required in prod* | JWT signing secret (min 32 chars) |
| `JWT_EXPIRES_IN` | `1h` | Access token expiry |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token expiry |
| `CORS_ORIGIN` | `*` | Allowed CORS origins |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per window |
| `LOG_LEVEL` | `info` | Log level (debug, info, warn, error) |
| `LOG_FORMAT` | `json` | Log format (json, pretty) |

### Example .env

```env
NODE_ENV=production
PORT=8080
DATABASE_URL=./data/production.db
JWT_SECRET=your-super-secret-production-key-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_MAX_REQUESTS=50
LOG_LEVEL=warn
```

---

## Database

### Schema

#### Users Table

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT 1,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### Refresh Tokens Table

```sql
CREATE TABLE refresh_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### Products Table

```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  category VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT 1,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### Orders Table

```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  shipping_address TEXT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### Order Items Table

```sql
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### Audit Logs Table

```sql
CREATE TABLE audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100),
  details TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Seeding

```bash
# Seed with sample data
npm run seed
```

Creates:
- Admin user: `admin@example.com` / `Admin123!`
- Regular user: `user@example.com` / `User1234!`
- Sample products in various categories

---

## Security

### Password Hashing

Passwords are hashed using **PBKDF2** with:
- **Algorithm**: SHA-512
- **Iterations**: 100,000
- **Salt Length**: 32 bytes
- **Key Length**: 64 bytes

```typescript
// Format: salt:iterations:hash
const hashed = "a1b2c3...:100000:d4e5f6...";
```

Verification uses **timing-safe comparison** to prevent timing attacks.

### JWT Tokens

- **Access Token**: Short-lived (1 hour default), contains user ID, email, role
- **Refresh Token**: Long-lived (7 days default), stored in database
- **Algorithm**: HS256 with secret key

### Rate Limiting

- **Global**: 100 requests per minute per IP
- **Auth endpoints**: 5 requests per 15 minutes per IP
- **Headers included**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Input Validation

All user inputs are validated:
- Email format verification
- Password complexity requirements
- Type coercion and sanitization
- SQL injection prevention via parameterized queries

---

## Middleware

### CORS (`src/middleware/cors.ts`)

```typescript
app.use(cors({
  origin: '*',           // Allowed origins
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  headers: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,        // Preflight cache (24 hours)
}));
```

### Request Logger (`src/middleware/logger.ts`)

Logs each request with:
- Method and path
- Response status
- Duration (ms)
- Request ID

### Rate Limiter (`src/middleware/rate-limit.ts`)

```typescript
app.use(rateLimit({
  windowMs: 60000,       // 1 minute window
  maxRequests: 100,      // Max 100 requests per window
  keyGenerator: (ctx) => ctx.ip,  // Key by IP
}));
```

### Error Handler (`src/middleware/error-handler.ts`)

Custom error classes:
- `ValidationError` (400)
- `AuthenticationError` (401)
- `AuthorizationError` (403)
- `NotFoundError` (404)
- `ConflictError` (409)
- `RateLimitError` (429)
- `InternalError` (500)

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Test Structure

```
tests/
├── setup.ts           # Test app setup, seeding, utilities
├── auth.test.ts       # 18 authentication tests
├── users.test.ts      # 14 user management tests
└── products.test.ts   # 14 product management tests
```

### Test Coverage

| Module | Tests |
|--------|-------|
| Authentication | 18 tests |
| Users | 14 tests |
| Products | 14 tests |
| **Total** | **46 tests** |

### Example Test

```typescript
describe('POST /auth/login', () => {
  it('should login with valid credentials', async () => {
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'Admin123!',
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.tokens.accessToken).toBeDefined();
    expect(data.user.email).toBe('admin@test.com');
  });
});
```

---

## Error Handling

### Error Response Format

```json
{
  "error": "ValidationError",
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "password", "message": "Password must be at least 8 characters" }
  ],
  "requestId": "req_ml1q8abc_123def",
  "stack": "..." // Only in development
}
```

### HTTP Status Codes

| Code | Error Type | Description |
|------|------------|-------------|
| 400 | ValidationError | Invalid input data |
| 401 | AuthenticationError | Missing or invalid token |
| 403 | AuthorizationError | Insufficient permissions |
| 404 | NotFoundError | Resource not found |
| 409 | ConflictError | Resource conflict (e.g., duplicate email) |
| 429 | RateLimitError | Too many requests |
| 500 | InternalError | Server error |

---

## Development

### Available Scripts

```bash
npm start           # Start production server
npm run dev         # Start with hot reload (tsx watch)
npm run seed        # Seed database with sample data
npm run migrate     # Run database migrations
npm test            # Run tests
npm run test:watch  # Run tests in watch mode
npm run build       # Build TypeScript
npm run typecheck   # Type check without emitting
```

### Adding a New Module

1. Create module directory: `src/modules/your-module/`
2. Add route file with handlers
3. Add service file for business logic
4. Register routes in `src/index.ts`:
   ```typescript
   import { registerYourModuleRoutes } from './modules/your-module/routes.js';
   registerYourModuleRoutes(app);
   ```
5. Add tests in `tests/your-module.test.ts`

### Vexor Patterns Used

#### Hook-based Middleware

```typescript
app.get('/protected', {
  hooks: { preHandler: [requireAuth(), requireAdmin()] }
}, async (ctx) => {
  // Handler logic
});
```

#### Context State

```typescript
// Setting state
ctx.set('userId', 123);

// Getting state
const userId = ctx.get<number>('userId');
```

#### Structured Responses

```typescript
// JSON response
return ctx.json({ data: result });

// With status code
return ctx.status(201).json({ message: 'Created' });
```

---

## License

MIT
