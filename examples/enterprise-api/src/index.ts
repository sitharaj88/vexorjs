/**
 * Enterprise API Example
 *
 * A production-ready API demonstrating all Vexor framework features:
 * - Database integration with @vexorjs/orm (SQLite)
 * - JWT authentication with refresh tokens
 * - Role-based authorization
 * - Password hashing with PBKDF2
 * - Input validation
 * - Structured error handling
 * - Request logging
 * - Rate limiting
 * - CORS configuration
 *
 * Run with: npx tsx src/index.ts
 * Or: npm start
 */

import { Vexor } from '@vexorjs/core';
import { config } from './config/index.js';
import { initializeDatabase, closeDatabase, db } from './db/index.js';
import { cors } from './middleware/cors.js';
import { rateLimit } from './middleware/rate-limit.js';
import { requestLogger } from './middleware/logger.js';
import { errorHandler } from './middleware/error-handler.js';
import { registerAuthRoutes } from './modules/auth/routes.js';
import { registerUserRoutes } from './modules/users/routes.js';
import { registerProductRoutes } from './modules/products/routes.js';

// ============================================================================
// App Setup
// ============================================================================

const app = new Vexor({
  port: config.port,
  logging: config.isDevelopment,
});

// ============================================================================
// Global Middleware
// ============================================================================

// CORS
app.use(cors());

// Request logging
app.use(requestLogger());

// Rate limiting
app.use(rateLimit());

// ============================================================================
// Health Check Routes
// ============================================================================

app.get('/health', async (ctx) => {
  let dbStatus = 'unknown';
  try {
    await db.query('SELECT 1');
    dbStatus = 'connected';
  } catch {
    dbStatus = 'disconnected';
  }

  return ctx.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.nodeEnv,
    database: dbStatus,
  });
});

app.get('/', (ctx) => {
  return ctx.json({
    name: 'Vexor Enterprise API',
    version: '1.0.0',
    description: 'Production-ready API example with all framework features',
    documentation: '/docs',
    endpoints: {
      health: 'GET /health',
      auth: {
        register: 'POST /auth/register',
        login: 'POST /auth/login',
        refresh: 'POST /auth/refresh',
        logout: 'POST /auth/logout',
        me: 'GET /auth/me',
        changePassword: 'POST /auth/change-password',
      },
      users: {
        list: 'GET /users (admin)',
        get: 'GET /users/:id',
        update: 'PUT /users/:id',
        delete: 'DELETE /users/:id (admin)',
      },
      products: {
        list: 'GET /products',
        categories: 'GET /products/categories',
        get: 'GET /products/:id',
        create: 'POST /products (admin)',
        update: 'PUT /products/:id (admin)',
        delete: 'DELETE /products/:id (admin)',
        updateStock: 'PATCH /products/:id/stock (admin)',
      },
    },
  });
});

// ============================================================================
// API Routes
// ============================================================================

registerAuthRoutes(app);
registerUserRoutes(app);
registerProductRoutes(app);

// ============================================================================
// Error Handler
// ============================================================================

app.setErrorHandler(errorHandler);

// ============================================================================
// Server Startup
// ============================================================================

async function start(): Promise<void> {
  try {
    // Initialize database
    console.log('Initializing database...');
    await initializeDatabase();

    // Print routes
    app.printRoutes();

    // Start server
    await app.listen(config.port);

    const addr = app.address();
    if (addr) {
      console.log(`
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   Vexor Enterprise API Server                           │
│                                                         │
│   URL: http://localhost:${addr.port.toString().padEnd(5)}                           │
│   Environment: ${config.nodeEnv.padEnd(12)}                        │
│   Database: SQLite (${config.databaseUrl})
│                                                         │
│   Features:                                             │
│   ✓ JWT Authentication                                  │
│   ✓ Role-based Authorization                            │
│   ✓ Password Hashing (PBKDF2)                           │
│   ✓ Rate Limiting                                       │
│   ✓ CORS                                                │
│   ✓ Structured Logging                                  │
│   ✓ Input Validation                                    │
│                                                         │
│   Quick Start:                                          │
│   1. Run seed: npm run seed                             │
│   2. Login: POST /auth/login                            │
│      { "email": "admin@example.com",                    │
│        "password": "Admin123!" }                        │
│   3. Use token: Authorization: Bearer <token>           │
│                                                         │
└─────────────────────────────────────────────────────────┘
      `);
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown(): Promise<void> {
  console.log('\nShutting down...');
  await closeDatabase();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start the server
start();
