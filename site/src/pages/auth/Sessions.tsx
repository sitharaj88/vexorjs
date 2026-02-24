import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const basicUsageCode = `import { Vexor } from '@vexorjs/core';
import { createSessionManager } from '@vexorjs/core/auth';

const app = new Vexor();

// Create a session manager with default in-memory store
const sessions = createSessionManager({
  secret: process.env.SESSION_SECRET!,
  cookieName: 'sid',
  maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
});

// Register session middleware globally
app.addHook('onRequest', sessions.middleware());

// Login: store user data in session
app.post('/auth/login', async (ctx) => {
  const { email, password } = ctx.body;
  const user = await verifyCredentials(email, password);
  if (!user) return ctx.status(401).json({ error: 'Invalid credentials' });

  // Set session data
  ctx.session.set('userId', user.id);
  ctx.session.set('role', user.role);
  ctx.session.set('loginAt', Date.now());

  return ctx.json({ user: { id: user.id, email: user.email } });
});

// Read session data
app.get('/profile', async (ctx) => {
  const userId = ctx.session.get('userId');
  if (!userId) return ctx.status(401).json({ error: 'Not authenticated' });

  const user = await db.select().from(users).where(eq(users.id, userId)).first();
  return ctx.json({ user });
});

// Logout: destroy session
app.post('/auth/logout', async (ctx) => {
  await ctx.session.destroy();
  return ctx.json({ success: true });
});`;

const sessionStoreCode = `import { createSessionManager, type SessionStore } from '@vexorjs/core/auth';
import { Redis } from 'ioredis';

// Built-in memory store (development only)
const devSessions = createSessionManager({
  store: 'memory',
  secret: process.env.SESSION_SECRET!,
});

// Redis store for production
const redis = new Redis(process.env.REDIS_URL!);

const redisSessions = createSessionManager({
  store: {
    async get(id: string) {
      const data = await redis.get(\`session:\${id}\`);
      return data ? JSON.parse(data) : null;
    },
    async set(id: string, data: Record<string, unknown>, maxAge: number) {
      await redis.set(\`session:\${id}\`, JSON.stringify(data), 'EX', maxAge);
    },
    async delete(id: string) {
      await redis.del(\`session:\${id}\`);
    },
    async touch(id: string, maxAge: number) {
      await redis.expire(\`session:\${id}\`, maxAge);
    },
  },
  secret: process.env.SESSION_SECRET!,
});

// Database store
const dbSessions = createSessionManager({
  store: {
    async get(id: string) {
      const row = await db.select().from(sessionsTable)
        .where(eq(sessionsTable.id, id))
        .first();
      if (!row || row.expiresAt < new Date()) return null;
      return JSON.parse(row.data);
    },
    async set(id: string, data: Record<string, unknown>, maxAge: number) {
      const expiresAt = new Date(Date.now() + maxAge * 1000);
      await db.insert(sessionsTable)
        .values({ id, data: JSON.stringify(data), expiresAt })
        .onConflict('id')
        .doUpdate({ data: JSON.stringify(data), expiresAt });
    },
    async delete(id: string) {
      await db.delete(sessionsTable).where(eq(sessionsTable.id, id));
    },
    async touch(id: string, maxAge: number) {
      const expiresAt = new Date(Date.now() + maxAge * 1000);
      await db.update(sessionsTable)
        .set({ expiresAt })
        .where(eq(sessionsTable.id, id));
    },
  },
  secret: process.env.SESSION_SECRET!,
});`;

const cookieConfigCode = `const sessions = createSessionManager({
  secret: process.env.SESSION_SECRET!,
  cookieName: 'app.sid',       // cookie name sent to browser
  maxAge: 60 * 60 * 24,        // 24 hours in seconds

  // Cookie options
  cookie: {
    httpOnly: true,             // not accessible via JavaScript
    secure: true,               // only sent over HTTPS
    sameSite: 'strict',         // CSRF protection
    domain: '.example.com',     // shared across subdomains
    path: '/',                  // available for all routes
  },

  // Rolling sessions: reset expiry on each request
  rolling: true,

  // Renew session ID when less than this many seconds remain
  renewThreshold: 60 * 60,     // renew when < 1 hour left
});`;

const sessionDataCode = `import type { Session } from '@vexorjs/core/auth';

// The session object is available on ctx.session after middleware runs

app.get('/dashboard', async (ctx) => {
  const session: Session = ctx.session;

  // Check if a key exists
  if (!session.has('userId')) {
    return ctx.status(401).json({ error: 'Not authenticated' });
  }

  // Get a single value
  const userId = session.get('userId');           // string | undefined
  const role = session.get<string>('role');        // typed get

  // Get all session data
  const allData = session.all();
  // { userId: 42, role: 'admin', loginAt: 1700000000000 }

  // Set a value
  session.set('lastAccess', Date.now());

  // Delete a specific key
  session.delete('temporaryFlag');

  // Clear all session data (keeps session ID)
  session.clear();

  // Save session explicitly (usually automatic)
  await session.save();

  return ctx.json({ userId, role });
});`;

const regenerationCode = `// Session fixation protection: regenerate the session ID after login
app.post('/auth/login', async (ctx) => {
  const { email, password } = ctx.body;
  const user = await verifyCredentials(email, password);
  if (!user) return ctx.status(401).json({ error: 'Invalid credentials' });

  // Regenerate session ID to prevent session fixation attacks
  // This creates a new session ID while preserving existing data
  await ctx.session.regenerate();

  ctx.session.set('userId', user.id);
  ctx.session.set('role', user.role);
  ctx.session.set('loginAt', Date.now());

  return ctx.json({ user: { id: user.id, email: user.email } });
});

// Destroy vs regenerate:
// - destroy(): removes all data and the session itself
// - regenerate(): creates new ID, optionally preserves data
// - clear(): removes all data but keeps the session ID

app.post('/auth/elevate', async (ctx) => {
  // Regenerate and keep existing data
  await ctx.session.regenerate({ keepData: true });

  ctx.session.set('elevated', true);
  ctx.session.set('elevatedAt', Date.now());

  return ctx.json({ elevated: true });
});`;

export default function Sessions() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 id="sessions" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Session Management
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          Sessions are the classical approach to maintaining authenticated state across HTTP requests.
          Unlike JWTs, where credentials are encoded into a token the client carries, sessions store
          user state on the server and issue the client only an opaque identifier -- a session ID --
          transmitted via a cookie. This fundamental difference gives sessions a critical advantage:
          the server retains full control over the session lifecycle, meaning you can revoke access
          instantly by deleting the server-side record.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor's session module provides a pluggable architecture with a simple key-value interface
          for reading and writing session data, automatic cookie management, and built-in support for
          session regeneration to prevent fixation attacks. The module is designed around the{' '}
          <code className="prose-code">SessionStore</code> interface, which decouples session logic
          from storage backends. You can use the built-in memory store for development, Redis for
          high-performance production deployments, or any SQL database when you need sessions to
          survive infrastructure changes.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The trade-off with server-side sessions is that they require shared state. In a horizontally
          scaled deployment with multiple application instances, every instance must be able to access
          the same session store. This is why Redis is the most popular choice for production session
          storage: it provides sub-millisecond reads, automatic TTL-based expiration, and can be shared
          across any number of application instances. Database-backed sessions work well too, especially
          if you need audit trails or already have strong database infrastructure.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          This page covers how sessions work internally, how to configure session stores, cookie
          security attributes, the session data API, and the critical topic of session fixation
          prevention through ID regeneration.
        </p>
      </div>

      {/* How It Works */}
      <section>
        <h2 id="how-it-works" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          How It Works
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When the session middleware processes an incoming request, it reads the session cookie from
          the request headers and extracts the session ID. This ID is a cryptographically random string
          (typically 128 bits of entropy) that serves as a lookup key into the session store. The
          middleware calls <code className="prose-code">store.get(id)</code> to retrieve the associated
          session data. If the ID is missing, invalid, or points to an expired record, the middleware
          creates a fresh session with a new ID.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The session cookie itself is signed using an HMAC with the configured secret. This prevents
          a client from guessing or fabricating session IDs -- even though session IDs are random, the
          signature provides an additional layer of protection against brute-force attacks on the ID
          space. When the middleware reads the cookie, it first verifies the signature; if it does not
          match, the cookie is discarded and a new session is created.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          After the route handler executes, the session middleware checks whether any session data was
          modified. If so, it calls <code className="prose-code">store.set(id, data, maxAge)</code>{' '}
          to persist the changes. If rolling sessions are enabled, the middleware also refreshes the
          cookie's expiration on every request, even if the data has not changed, by calling{' '}
          <code className="prose-code">store.touch(id, maxAge)</code>. This sliding window behavior
          keeps active users logged in while allowing idle sessions to expire naturally.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Session destruction is handled by <code className="prose-code">store.delete(id)</code>,
          which removes the server-side record and instructs the browser to clear the cookie by
          setting its <code className="prose-code">Max-Age</code> to 0. After destruction, any
          subsequent request with the old session ID will not find a matching record and will be
          treated as unauthenticated.
        </p>
      </section>

      {/* When to Use */}
      <section>
        <h2 id="when-to-use" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          When to Use Sessions vs. JWTs
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Sessions are the better choice when <strong>immediate revocation</strong> is a hard
          requirement. If your application needs to log a user out the moment an admin disables their
          account, or if regulatory compliance demands the ability to terminate all active sessions for
          a given user, server-side sessions provide this capability natively. With JWTs, achieving the
          same result requires maintaining a blacklist or checking a token version on every request,
          which partially negates the statelessness benefit.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Sessions are also preferable for <strong>browser-based applications</strong> where cookies
          are the natural credential transport. Cookies with{' '}
          <code className="prose-code">httpOnly</code> and <code className="prose-code">secure</code>{' '}
          flags are not accessible to JavaScript, which makes them immune to XSS-based token theft.
          JWTs stored in localStorage or sessionStorage, by contrast, can be exfiltrated by any
          script running on the page.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          On the other hand, sessions require a centralized or shared store, which adds infrastructure
          complexity. If your architecture is a set of stateless API services consumed by mobile clients
          or third-party integrations, JWTs may be a simpler fit because they require no shared state.
          Many production systems use a hybrid approach: sessions for browser-based user interfaces
          and JWTs for API-to-API communication.
        </p>
      </section>

      {/* Basic Usage */}
      <section>
        <h2 id="basic-usage" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Basic Usage
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">createSessionManager</code> factory creates a session
          manager bound to a specific store and cookie configuration. Registering its middleware
          globally via <code className="prose-code">app.addHook('onRequest', ...)</code> ensures
          that every incoming request has access to the session object on{' '}
          <code className="prose-code">ctx.session</code>. The middleware handles the full lifecycle
          automatically: reading the session cookie, loading data from the store, and persisting
          changes after the response.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The session API is deliberately simple. You call <code className="prose-code">set(key, value)</code>{' '}
          to store data, <code className="prose-code">get(key)</code> to retrieve it, and{' '}
          <code className="prose-code">destroy()</code> to end the session entirely. Data is serialized
          to JSON when persisted, so you can store any JSON-serializable value -- strings, numbers,
          booleans, arrays, and plain objects. Avoid storing class instances, functions, or circular
          references.
        </p>
        <CodeBlock code={basicUsageCode} filename="src/app.ts" />
        <InfoBlock variant="warning">
          The default in-memory store is not suitable for production. Sessions are lost on restart
          and not shared across instances. Use Redis or a database store in production.
        </InfoBlock>
      </section>

      {/* Session Store */}
      <section>
        <h2 id="session-store" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Session Stores
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The session store is the backend responsible for persisting session data between requests.
          Vexor defines a simple four-method interface -- <code className="prose-code">get</code>,{' '}
          <code className="prose-code">set</code>, <code className="prose-code">delete</code>, and{' '}
          <code className="prose-code">touch</code> -- that any storage backend can implement. This
          design keeps the session module independent of any specific database or cache technology,
          and makes it straightforward to swap backends as your infrastructure evolves.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Redis</strong> is the most common production choice because it offers sub-millisecond
          latency, built-in key expiration via TTL, and natural support for distributed deployments.
          The <code className="prose-code">EX</code> flag in the SET command tells Redis to
          automatically delete the key after the specified number of seconds, so you never need to
          run a separate cleanup job. Redis also supports clustering and replication, giving you high
          availability for session storage.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Database stores</strong> are a good fit when you need durability guarantees that
          Redis does not provide by default (especially without persistence configured), or when you
          want to query session data for analytics or auditing purposes. The trade-off is higher
          latency -- a database round-trip is typically 1-5ms compared to Redis's sub-millisecond
          reads. For most web applications, this overhead is negligible relative to the total request
          time.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">touch</code> method is a performance optimization used with
          rolling sessions. Instead of rewriting the entire session payload on every request (which
          would include a full JSON serialization and storage write), <code className="prose-code">touch</code>{' '}
          only updates the expiration timestamp. This reduces write amplification significantly for
          read-heavy workloads where session data rarely changes but the session must be kept alive.
        </p>
        <CodeBlock code={sessionStoreCode} filename="src/session-stores.ts" />
        <InfoBlock variant="tip">
          The <code className="prose-code">touch</code> method extends the session TTL without
          rewriting the full payload. This is used when <code className="prose-code">rolling</code> is
          enabled, to avoid unnecessary writes on read-only requests.
        </InfoBlock>
      </section>

      {/* Cookie Config */}
      <section>
        <h2 id="cookie-config" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Cookie Configuration
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The session cookie is the browser's only reference to the server-side session, so its
          security attributes are critically important. Each attribute controls a different aspect
          of how the browser handles the cookie, and misconfiguring even one can open your application
          to attack.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">httpOnly</code> flag prevents client-side JavaScript from
          reading the cookie via <code className="prose-code">document.cookie</code>. This is your
          primary defense against XSS-based session hijacking: even if an attacker injects a malicious
          script, they cannot extract the session ID. The <code className="prose-code">secure</code>{' '}
          flag ensures the cookie is only sent over HTTPS connections, preventing interception over
          unencrypted networks. Always enable both in production.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">sameSite</code> attribute controls whether the cookie is
          sent with cross-origin requests. <code className="prose-code">'strict'</code> prevents the
          cookie from being sent on any cross-origin request, which provides the strongest CSRF
          protection but can cause usability issues (for example, clicking a link from an email will
          not send the cookie). <code className="prose-code">'lax'</code> is a pragmatic default that
          sends the cookie on top-level navigations (link clicks) but not on cross-origin POST
          requests or embedded resources.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">rolling</code> option implements sliding-window expiration:
          every time the user makes a request, the session's TTL is reset to the full{' '}
          <code className="prose-code">maxAge</code>. This means that active users stay logged in
          indefinitely, while idle users are automatically logged out after the configured period.
          The <code className="prose-code">renewThreshold</code> adds an additional optimization
          by regenerating the session ID when it is nearing expiration, combining session fixation
          prevention with natural session lifecycle management.
        </p>
        <CodeBlock code={cookieConfigCode} filename="src/config.ts" />
      </section>

      {/* Session Data */}
      <section>
        <h2 id="session-data" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Working with Session Data
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">Session</code> object provides a Map-like interface for
          reading and writing arbitrary key-value pairs. Internally, session data is held in memory
          for the duration of the request and flushed to the store when the response is sent. This
          means that multiple <code className="prose-code">set</code> calls within a single request
          are batched into one store write, which is both efficient and consistent.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">get</code> method supports TypeScript generics so you can
          retrieve typed values without manual casting. The <code className="prose-code">all</code>{' '}
          method returns a snapshot of all session data, which is useful for debugging or logging.
          The <code className="prose-code">clear</code> method removes all data but preserves the
          session ID and cookie -- this is different from <code className="prose-code">destroy</code>,
          which removes the session entirely and instructs the browser to delete the cookie.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          In most cases, session persistence is handled automatically by the middleware. The{' '}
          <code className="prose-code">save</code> method is available for edge cases where you need
          to ensure data is persisted before sending a response -- for example, when you need to
          guarantee that a session write completes before redirecting to another service.
        </p>
        <CodeBlock code={sessionDataCode} filename="src/routes/dashboard.ts" />
      </section>

      {/* Regeneration */}
      <section>
        <h2 id="regeneration" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Session Regeneration and Fixation Prevention
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Session fixation is an attack where an adversary sets a known session ID in a victim's
          browser (via a crafted URL, a cross-site scripting vulnerability, or subdomain cookie
          injection) before the victim logs in. When the victim authenticates, their credentials become
          associated with the attacker's known session ID, allowing the attacker to access the
          authenticated session. This attack is possible whenever the session ID remains the same
          across an authentication state change.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The defense is straightforward: call <code className="prose-code">session.regenerate()</code>{' '}
          immediately after any change in authentication state. This creates a new session ID, deletes
          the old session record from the store, and sets a new cookie in the response. Even if an
          attacker planted a session ID beforehand, it becomes useless because the authenticated
          session now lives under a completely different ID that only the legitimate user's browser
          knows.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor's <code className="prose-code">regenerate</code> method accepts an optional{' '}
          <code className="prose-code">keepData</code> flag. When set to <code className="prose-code">true</code>,
          existing session data is copied to the new session, which is useful for privilege escalation
          flows where you want to change the session ID without losing the user's state. When omitted
          or <code className="prose-code">false</code>, regeneration starts with a clean slate -- the
          appropriate choice for initial login where you are about to set fresh session data anyway.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          You should regenerate the session ID in at least three scenarios: after successful login,
          after privilege escalation (such as entering a sudo mode), and after any password or
          credential change. This is not merely a best practice -- it is a critical security control
          listed in the OWASP Session Management Cheat Sheet.
        </p>
        <CodeBlock code={regenerationCode} filename="src/routes/auth.ts" />
        <InfoBlock variant="info">
          Always call <code className="prose-code">regenerate()</code> after login, privilege
          escalation, or any change in authentication state. This is a critical defense against
          session fixation attacks.
        </InfoBlock>
      </section>

      {/* Best Practices */}
      <section>
        <h2 id="best-practices" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Best Practices
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Following these guidelines ensures your session implementation is both secure and performant.
        </p>
        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-4">
          <li>
            <strong>Use Redis or a database in production.</strong> The in-memory store is for
            development only. It does not survive restarts and cannot be shared across instances.
          </li>
          <li>
            <strong>Always set httpOnly and secure flags.</strong> These two cookie attributes are
            your first line of defense against XSS-based session theft and network interception.
          </li>
          <li>
            <strong>Regenerate session IDs after login.</strong> This prevents session fixation
            attacks and should be treated as a mandatory security control.
          </li>
          <li>
            <strong>Keep session data small.</strong> Store only identifiers and flags, not full
            objects. Large session payloads increase store I/O and serialization cost.
          </li>
          <li>
            <strong>Use rolling sessions with a reasonable maxAge.</strong> This provides a good
            balance between user convenience (active users stay logged in) and security (idle
            sessions expire automatically).
          </li>
          <li>
            <strong>Implement session cleanup.</strong> If using a database store, schedule periodic
            cleanup of expired sessions. Redis handles this automatically via TTL-based expiration.
          </li>
        </ul>
      </section>

      {/* API Reference */}
      <section>
        <h2 id="api-reference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          API Reference
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Configuration options for <code className="prose-code">createSessionManager(options)</code>.
          The secret and a production-grade store are the only required configuration for a secure deployment.
        </p>
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
                <td className="py-3 px-4"><code className="prose-code">store</code></td>
                <td className="py-3 px-4"><code className="prose-code">SessionStore | 'memory'</code></td>
                <td className="py-3 px-4"><code className="prose-code">'memory'</code></td>
                <td className="py-3 px-4">The storage backend for session data. Pass 'memory' for the built-in in-memory store (development only), or provide an object implementing the SessionStore interface (get, set, delete, touch) for Redis, database, or any custom backend.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">secret</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">The HMAC secret used to sign the session cookie. This prevents clients from forging or guessing session IDs. Use a strong, random value of at least 256 bits. If this secret is compromised, all active sessions should be considered insecure.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">cookieName</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4"><code className="prose-code">'sid'</code></td>
                <td className="py-3 px-4">The name of the HTTP cookie that carries the session ID. Choose a name that does not reveal implementation details. Avoid generic names like 'PHPSESSID' or 'JSESSIONID' that disclose your technology stack.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">maxAge</code></td>
                <td className="py-3 px-4"><code className="prose-code">number</code></td>
                <td className="py-3 px-4"><code className="prose-code">86400</code></td>
                <td className="py-3 px-4">The maximum session lifetime in seconds (default is 24 hours). This value is used for both the cookie Max-Age attribute and the TTL passed to the store's set and touch methods. With rolling sessions enabled, this acts as an idle timeout rather than an absolute timeout.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">rolling</code></td>
                <td className="py-3 px-4"><code className="prose-code">boolean</code></td>
                <td className="py-3 px-4"><code className="prose-code">false</code></td>
                <td className="py-3 px-4">When enabled, the session expiration timer is reset on every request. This sliding-window approach keeps active users logged in while expiring idle sessions. The trade-off is increased store writes (mitigated by the touch method).</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">renewThreshold</code></td>
                <td className="py-3 px-4"><code className="prose-code">number</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">When the session's remaining TTL drops below this many seconds, the session ID is automatically regenerated. This provides periodic session fixation protection without requiring manual regeneration calls. Only effective when rolling is enabled.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">cookie</code></td>
                <td className="py-3 px-4"><code className="prose-code">CookieOptions</code></td>
                <td className="py-3 px-4">See below</td>
                <td className="py-3 px-4">An object controlling cookie security attributes: httpOnly (default true, blocks JavaScript access), secure (default false, set to true in production for HTTPS-only), sameSite ('lax' or 'strict' for CSRF protection), domain (for cross-subdomain sharing), and path (URL scope).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Next Steps */}
      <section className="card bg-slate-50 dark:bg-slate-800/50">
        <h2 id="next" className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Next Steps
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/auth/oauth" className="btn-primary">
            OAuth & Social Login <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/auth/security" className="btn-secondary">
            Security Best Practices
          </Link>
        </div>
      </section>
    </div>
  );
}
