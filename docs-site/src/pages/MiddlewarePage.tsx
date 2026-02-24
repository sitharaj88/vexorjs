import CodeBlock from '../components/CodeBlock';

const corsCode = `import { Vexor, cors } from '@vexorjs/core';

const app = new Vexor();

// Basic CORS - allow all origins
app.use(cors());

// Configured CORS
app.use(cors({
  origin: ['https://example.com', 'https://app.example.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Request-Id'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

// Dynamic origin validation
app.use(cors({
  origin: (origin) => {
    // Allow any subdomain of example.com
    return origin?.endsWith('.example.com') ?? false;
  }
}));

// Per-route CORS
app.get('/public', cors({ origin: '*' }), handler);`;

const rateLimitCode = `import { Vexor, rateLimit, slowDown } from '@vexorjs/core';

const app = new Vexor();

// Basic rate limiting
app.use(rateLimit({
  max: 100,              // Max requests per window
  windowMs: 60 * 1000,   // 1 minute window
  message: 'Too many requests, please try again later'
}));

// Rate limit with custom key generator
app.use(rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000, // 1 hour
  keyGenerator: (ctx) => {
    // Rate limit by user ID instead of IP
    return ctx.state.userId || ctx.ip;
  }
}));

// Slow down instead of blocking
app.use(slowDown({
  windowMs: 60 * 1000,
  delayAfter: 50,        // Start delaying after 50 requests
  delayMs: 500,          // Add 500ms delay per request
  maxDelayMs: 5000       // Max delay of 5 seconds
}));

// Different limits for different routes
app.use('/api/auth/*', rateLimit({ max: 5, windowMs: 60000 }));
app.use('/api/*', rateLimit({ max: 100, windowMs: 60000 }));`;

const jwtCode = `import { Vexor, JWT, createJWT, verifyJWT } from '@vexorjs/core';

const app = new Vexor();
const jwt = createJWT({ secret: process.env.JWT_SECRET! });

// Login route - create token
app.post('/auth/login', async (ctx) => {
  const { email, password } = ctx.body;

  // Validate credentials (your logic here)
  const user = await validateUser(email, password);

  // Create access token
  const accessToken = await jwt.sign({
    sub: user.id,
    email: user.email,
    role: user.role
  }, { expiresIn: '15m' });

  // Create refresh token
  const refreshToken = await jwt.sign({
    sub: user.id,
    type: 'refresh'
  }, { expiresIn: '7d' });

  return ctx.json({ accessToken, refreshToken });
});

// JWT middleware for protected routes
const authenticate = async (ctx, next) => {
  const header = ctx.headers.get('authorization');

  if (!header?.startsWith('Bearer ')) {
    return ctx.status(401).json({ error: 'Missing token' });
  }

  try {
    const token = header.slice(7);
    const payload = await jwt.verify(token);
    ctx.state.user = payload;
    await next();
  } catch (error) {
    return ctx.status(401).json({ error: 'Invalid token' });
  }
};

// Protected route
app.get('/api/profile', authenticate, async (ctx) => {
  return ctx.json({ user: ctx.state.user });
});`;

const sessionCode = `import { Vexor, SessionManager, MemorySessionStore } from '@vexorjs/core';

const app = new Vexor();

// Create session manager
const sessions = new SessionManager({
  store: new MemorySessionStore(), // Use Redis in production
  cookie: {
    name: 'session_id',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  },
  secret: process.env.SESSION_SECRET!
});

// Session middleware
app.use(sessions.middleware());

// Login - create session
app.post('/auth/login', async (ctx) => {
  const { email, password } = ctx.body;
  const user = await validateUser(email, password);

  // Store user in session
  ctx.session.set('userId', user.id);
  ctx.session.set('role', user.role);

  return ctx.json({ success: true });
});

// Access session data
app.get('/api/profile', async (ctx) => {
  const userId = ctx.session.get('userId');

  if (!userId) {
    return ctx.status(401).json({ error: 'Not logged in' });
  }

  const user = await getUser(userId);
  return ctx.json({ user });
});

// Logout - destroy session
app.post('/auth/logout', async (ctx) => {
  await ctx.session.destroy();
  return ctx.json({ success: true });
});`;

const compressionCode = `import { Vexor, compression } from '@vexorjs/core';

const app = new Vexor();

// Enable gzip/brotli compression
app.use(compression());

// Configure compression
app.use(compression({
  threshold: 1024,         // Only compress responses > 1KB
  level: 6,                // Compression level (1-9)
  encodings: ['br', 'gzip', 'deflate'] // Preferred order
}));

// Disable compression for specific routes
app.get('/stream', { compress: false }, streamHandler);`;

const cacheCode = `import { Vexor, cacheMiddleware, createMemoryCache, createRedisCache } from '@vexorjs/core';

const app = new Vexor();

// In-memory cache
const memoryCache = createMemoryCache({
  max: 1000,           // Max entries
  ttl: 5 * 60 * 1000   // 5 minutes TTL
});

// Redis cache (for distributed systems)
const redisCache = createRedisCache({
  url: process.env.REDIS_URL!,
  prefix: 'cache:',
  ttl: 5 * 60 * 1000
});

// Cache GET requests
app.use(cacheMiddleware({
  store: memoryCache,
  ttl: 60000,
  methods: ['GET'],
  keyGenerator: (ctx) => \`\${ctx.method}:\${ctx.path}:\${ctx.querystring}\`
}));

// Cache specific route
app.get('/api/products',
  cacheMiddleware({ store: memoryCache, ttl: 300000 }),
  async (ctx) => {
    const products = await db.select().from(products);
    return ctx.json(products);
  }
);

// Manual cache control
app.get('/api/product/:id', async (ctx) => {
  const cacheKey = \`product:\${ctx.params.id}\`;

  // Try cache first
  let product = await memoryCache.get(cacheKey);

  if (!product) {
    product = await db.select().from(products).where(eq(products.id, ctx.params.id)).first();
    await memoryCache.set(cacheKey, product, 300000);
  }

  return ctx.json(product);
});`;

const uploadCode = `import { Vexor, upload, singleUpload, multiUpload } from '@vexorjs/core';

const app = new Vexor();

// Single file upload
app.post('/upload/avatar',
  singleUpload({
    field: 'avatar',
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    destination: './uploads/avatars'
  }),
  async (ctx) => {
    const file = ctx.file;
    return ctx.json({
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype
    });
  }
);

// Multiple files upload
app.post('/upload/gallery',
  multiUpload({
    field: 'images',
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['image/*']
  }),
  async (ctx) => {
    const files = ctx.files;
    return ctx.json({
      count: files.length,
      files: files.map(f => ({ name: f.filename, size: f.size }))
    });
  }
);

// Custom file handling
app.post('/upload/document',
  upload({
    storage: 's3', // or 'local', 'gcs'
    bucket: 'my-bucket',
    maxSize: 50 * 1024 * 1024,
    allowedTypes: ['application/pdf', 'application/msword'],
    filename: (file) => \`\${Date.now()}-\${file.originalname}\`
  }),
  async (ctx) => {
    return ctx.json({ url: ctx.file.url });
  }
);`;

const healthCode = `import { Vexor, healthCheck, databaseCheck, redisCheck, memoryCheck } from '@vexorjs/core';

const app = new Vexor();

// Basic health check
app.use(healthCheck({
  path: '/health'
}));

// Comprehensive health checks
app.use(healthCheck({
  path: '/health',
  checks: [
    databaseCheck('postgres', db),
    redisCheck('redis', redisClient),
    memoryCheck('memory', {
      maxHeapUsed: 500 * 1024 * 1024 // 500MB
    }),
    {
      name: 'external-api',
      check: async () => {
        const res = await fetch('https://api.example.com/health');
        return res.ok;
      }
    }
  ]
}));

// Response format:
// GET /health
// {
//   "status": "healthy",
//   "timestamp": "2024-01-15T10:30:00Z",
//   "checks": {
//     "postgres": { "status": "healthy", "latency": 5 },
//     "redis": { "status": "healthy", "latency": 2 },
//     "memory": { "status": "healthy", "heapUsed": 150000000 },
//     "external-api": { "status": "healthy", "latency": 120 }
//   }
// }`;

const loggingCode = `import { Vexor, createLogger, createRequestLogger } from '@vexorjs/core';

const app = new Vexor();

// Create structured logger
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  pretty: process.env.NODE_ENV !== 'production'
});

// Request logging middleware
app.use(createRequestLogger({
  logger,
  // Skip health check logs
  skip: (ctx) => ctx.path === '/health',
  // Custom log format
  customProps: (ctx) => ({
    userId: ctx.state.userId,
    traceId: ctx.headers.get('x-trace-id')
  })
}));

// Use logger in handlers
app.get('/api/data', async (ctx) => {
  logger.info('Fetching data', { userId: ctx.state.userId });

  try {
    const data = await fetchData();
    return ctx.json(data);
  } catch (error) {
    logger.error('Failed to fetch data', { error: error.message });
    throw error;
  }
});

// Log output (production):
// {"level":"info","time":1705312200000,"msg":"Fetching data","userId":"123"}
// {"level":"info","time":1705312200050,"msg":"request completed","method":"GET","path":"/api/data","status":200,"duration":50}`;

const versioningCode = `import { Vexor, versioning, createVersionRouter } from '@vexorjs/core';

const app = new Vexor();

// URL path versioning
app.use(versioning({
  type: 'path',
  prefix: '/api'
}));

// Header versioning
app.use(versioning({
  type: 'header',
  header: 'X-API-Version',
  default: '1'
}));

// Create versioned routes
const v1Router = createVersionRouter('1');
const v2Router = createVersionRouter('2');

v1Router.get('/users', async (ctx) => {
  return ctx.json({ version: 1, users: await getUsersV1() });
});

v2Router.get('/users', async (ctx) => {
  return ctx.json({ version: 2, users: await getUsersV2() });
});

app.use(v1Router);
app.use(v2Router);

// Deprecation warnings
app.get('/api/v1/old-endpoint',
  deprecated({
    sunset: '2024-06-01',
    alternative: '/api/v2/new-endpoint'
  }),
  handler
);`;

export default function MiddlewarePage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">Middleware</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Vexor includes a comprehensive set of production-ready middleware for common use cases.
        </p>
      </div>

      {/* Middleware List */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { name: 'CORS', href: '#cors' },
          { name: 'Rate Limiting', href: '#rate-limit' },
          { name: 'JWT Auth', href: '#jwt' },
          { name: 'Sessions', href: '#sessions' },
          { name: 'Compression', href: '#compression' },
          { name: 'Caching', href: '#caching' },
          { name: 'File Upload', href: '#upload' },
          { name: 'Health Check', href: '#health' },
          { name: 'Logging', href: '#logging' },
          { name: 'Versioning', href: '#versioning' }
        ].map((item) => (
          <a
            key={item.name}
            href={item.href}
            className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-vexor-500/50 transition-colors text-center text-sm"
          >
            {item.name}
          </a>
        ))}
      </div>

      {/* CORS */}
      <section id="cors">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">CORS</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Cross-Origin Resource Sharing middleware for handling browser security policies.
        </p>
        <CodeBlock code={corsCode} filename="cors.ts" showLineNumbers />
      </section>

      {/* Rate Limiting */}
      <section id="rate-limit">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Rate Limiting</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Protect your API from abuse with flexible rate limiting strategies.
        </p>
        <CodeBlock code={rateLimitCode} filename="rate-limit.ts" showLineNumbers />
      </section>

      {/* JWT */}
      <section id="jwt">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">JWT Authentication</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          JSON Web Token authentication with support for access and refresh tokens.
        </p>
        <CodeBlock code={jwtCode} filename="jwt-auth.ts" showLineNumbers />
      </section>

      {/* Sessions */}
      <section id="sessions">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Session Management</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Server-side session management with multiple storage backends.
        </p>
        <CodeBlock code={sessionCode} filename="sessions.ts" showLineNumbers />
      </section>

      {/* Compression */}
      <section id="compression">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Compression</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Automatic response compression with gzip, deflate, and Brotli support.
        </p>
        <CodeBlock code={compressionCode} filename="compression.ts" showLineNumbers />
      </section>

      {/* Caching */}
      <section id="caching">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Caching</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Response caching with in-memory and Redis backends.
        </p>
        <CodeBlock code={cacheCode} filename="caching.ts" showLineNumbers />
      </section>

      {/* Upload */}
      <section id="upload">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">File Upload</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Handle file uploads with validation, size limits, and storage options.
        </p>
        <CodeBlock code={uploadCode} filename="upload.ts" showLineNumbers />
      </section>

      {/* Health */}
      <section id="health">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Health Checks</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Expose health endpoints for load balancers and monitoring systems.
        </p>
        <CodeBlock code={healthCode} filename="health.ts" showLineNumbers />
      </section>

      {/* Logging */}
      <section id="logging">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Logging</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Structured logging with request tracing and custom formatters.
        </p>
        <CodeBlock code={loggingCode} filename="logging.ts" showLineNumbers />
      </section>

      {/* Versioning */}
      <section id="versioning">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">API Versioning</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Version your API with path, header, or query parameter strategies.
        </p>
        <CodeBlock code={versioningCode} filename="versioning.ts" showLineNumbers />
      </section>

      {/* Next Steps */}
      <section className="p-6 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Next Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="/vexorjs/docs/realtime" className="block p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <h3 className="font-semibold mb-1 text-slate-900 dark:text-white">Real-time &rarr;</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Build WebSocket and SSE applications</p>
          </a>
          <a href="/vexorjs/docs/deployment" className="block p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <h3 className="font-semibold mb-1 text-slate-900 dark:text-white">Deployment &rarr;</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Deploy to Node.js, Bun, Lambda, and Edge</p>
          </a>
        </div>
      </section>
    </div>
  );
}
