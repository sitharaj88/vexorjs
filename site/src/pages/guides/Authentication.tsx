import CodeBlock from '../../components/CodeBlock';

const jwtSetupCode = `import { Vexor, Type } from '@vexorjs/core';
import { JWT } from '@vexorjs/core/auth';

const app = new Vexor();

// Initialize JWT with secret
const jwt = new JWT({
  secret: process.env.JWT_SECRET!,
  expiresIn: '7d',
});

// Login endpoint
app.post('/auth/login', {
  body: Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: 8 }),
  }),
}, async (ctx) => {
  const { email, password } = ctx.body;

  // Verify credentials (implement your own logic)
  const user = await verifyCredentials(email, password);
  if (!user) {
    return ctx.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate token
  const token = await jwt.sign({ userId: user.id, role: user.role });

  return ctx.json({ token, user: { id: user.id, email: user.email } });
});`;

const jwtMiddlewareCode = `// Authentication middleware
async function authMiddleware(ctx: Context) {
  const header = ctx.req.header('Authorization');
  if (!header?.startsWith('Bearer ')) {
    return ctx.status(401).json({ error: 'Missing token' });
  }

  const token = header.slice(7);

  try {
    const payload = await jwt.verify(token);
    ctx.set('user', payload);
  } catch (error) {
    return ctx.status(401).json({ error: 'Invalid token' });
  }
}

// Protected routes
app.get('/profile', {
  preHandler: [authMiddleware],
}, async (ctx) => {
  const user = ctx.get('user');
  return ctx.json({ user });
});

// Role-based authorization
async function adminOnly(ctx: Context) {
  const user = ctx.get('user');
  if (user?.role !== 'admin') {
    return ctx.status(403).json({ error: 'Admin access required' });
  }
}

app.get('/admin/users', {
  preHandler: [authMiddleware, adminOnly],
}, async (ctx) => {
  const users = await db.select().from(usersTable);
  return ctx.json({ users });
});`;

const sessionCode = `import { SessionManager } from '@vexorjs/core/auth';

// Create session manager
const sessions = new SessionManager({
  store: 'memory', // or 'redis', 'database'
  secret: process.env.SESSION_SECRET!,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
});

// Initialize session middleware
app.addHook('onRequest', sessions.middleware());

// Login with session
app.post('/auth/login', async (ctx) => {
  const { email, password } = await ctx.readJson();

  const user = await verifyCredentials(email, password);
  if (!user) {
    return ctx.status(401).json({ error: 'Invalid credentials' });
  }

  // Store user in session
  ctx.session.set('userId', user.id);
  ctx.session.set('role', user.role);

  return ctx.json({ user: { id: user.id, email: user.email } });
});

// Check session
app.get('/profile', async (ctx) => {
  const userId = ctx.session.get('userId');
  if (!userId) {
    return ctx.status(401).json({ error: 'Not logged in' });
  }

  const user = await db.select().from(users).where(eq(users.id, userId)).first();
  return ctx.json({ user });
});

// Logout
app.post('/auth/logout', async (ctx) => {
  ctx.session.destroy();
  return ctx.json({ success: true });
});`;

const refreshTokenCode = `// Token refresh pattern
const accessJwt = new JWT({ secret: ACCESS_SECRET, expiresIn: '15m' });
const refreshJwt = new JWT({ secret: REFRESH_SECRET, expiresIn: '7d' });

// Login returns both tokens
app.post('/auth/login', async (ctx) => {
  const user = await verifyCredentials(ctx.body.email, ctx.body.password);

  const accessToken = await accessJwt.sign({ userId: user.id });
  const refreshToken = await refreshJwt.sign({ userId: user.id });

  // Store refresh token in database
  await db.insert(refreshTokens).values({
    userId: user.id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return ctx.json({ accessToken, refreshToken });
});

// Refresh endpoint
app.post('/auth/refresh', async (ctx) => {
  const { refreshToken } = ctx.body;

  try {
    const payload = await refreshJwt.verify(refreshToken);

    // Verify token exists in database
    const stored = await db.select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, refreshToken))
      .first();

    if (!stored) {
      return ctx.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate new access token
    const accessToken = await accessJwt.sign({ userId: payload.userId });

    return ctx.json({ accessToken });
  } catch {
    return ctx.status(401).json({ error: 'Invalid refresh token' });
  }
});`;

export default function Authentication() {
  return (
    <div className="space-y-12">
      <div>
        <h1 id="authentication" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Authentication Guide
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Learn how to implement secure authentication in your Vexor application.
        </p>
      </div>

      <section>
        <h2 id="jwt" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          JWT Authentication
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          JSON Web Tokens are the recommended approach for stateless APIs.
        </p>
        <CodeBlock code={jwtSetupCode} showLineNumbers />
      </section>

      <section>
        <h2 id="jwt-middleware" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Protecting Routes
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use middleware to protect routes and implement role-based access control.
        </p>
        <CodeBlock code={jwtMiddlewareCode} showLineNumbers />
      </section>

      <section>
        <h2 id="sessions" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Session-Based Authentication
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For traditional web applications, session-based auth may be preferred.
        </p>
        <CodeBlock code={sessionCode} showLineNumbers />
      </section>

      <section>
        <h2 id="refresh-tokens" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Refresh Tokens
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Implement secure token refresh for better security.
        </p>
        <CodeBlock code={refreshTokenCode} showLineNumbers />
      </section>
    </div>
  );
}
