import{j as e,C as s,I as t,L as a,A as i}from"./index-BWrueqsD.js";const o=`import { Vexor } from '@vexorjs/core';
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
});`,r=`import { createSessionManager, type SessionStore } from '@vexorjs/core/auth';
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
});`,n=`const sessions = createSessionManager({
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
});`,c=`import type { Session } from '@vexorjs/core/auth';

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
});`,l=`// Session fixation protection: regenerate the session ID after login
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
});`;function h(){return e.jsxs("div",{className:"space-y-12",children:[e.jsxs("div",{children:[e.jsx("h1",{id:"sessions",className:"text-4xl font-bold text-slate-900 dark:text-white mb-4",children:"Session Management"}),e.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400 mb-4",children:"Sessions are the classical approach to maintaining authenticated state across HTTP requests. Unlike JWTs, where credentials are encoded into a token the client carries, sessions store user state on the server and issue the client only an opaque identifier -- a session ID -- transmitted via a cookie. This fundamental difference gives sessions a critical advantage: the server retains full control over the session lifecycle, meaning you can revoke access instantly by deleting the server-side record."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Vexor's session module provides a pluggable architecture with a simple key-value interface for reading and writing session data, automatic cookie management, and built-in support for session regeneration to prevent fixation attacks. The module is designed around the"," ",e.jsx("code",{className:"prose-code",children:"SessionStore"})," interface, which decouples session logic from storage backends. You can use the built-in memory store for development, Redis for high-performance production deployments, or any SQL database when you need sessions to survive infrastructure changes."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"The trade-off with server-side sessions is that they require shared state. In a horizontally scaled deployment with multiple application instances, every instance must be able to access the same session store. This is why Redis is the most popular choice for production session storage: it provides sub-millisecond reads, automatic TTL-based expiration, and can be shared across any number of application instances. Database-backed sessions work well too, especially if you need audit trails or already have strong database infrastructure."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400",children:"This page covers how sessions work internally, how to configure session stores, cookie security attributes, the session data API, and the critical topic of session fixation prevention through ID regeneration."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"how-it-works",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"How It Works"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["When the session middleware processes an incoming request, it reads the session cookie from the request headers and extracts the session ID. This ID is a cryptographically random string (typically 128 bits of entropy) that serves as a lookup key into the session store. The middleware calls ",e.jsx("code",{className:"prose-code",children:"store.get(id)"})," to retrieve the associated session data. If the ID is missing, invalid, or points to an expired record, the middleware creates a fresh session with a new ID."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"The session cookie itself is signed using an HMAC with the configured secret. This prevents a client from guessing or fabricating session IDs -- even though session IDs are random, the signature provides an additional layer of protection against brute-force attacks on the ID space. When the middleware reads the cookie, it first verifies the signature; if it does not match, the cookie is discarded and a new session is created."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["After the route handler executes, the session middleware checks whether any session data was modified. If so, it calls ",e.jsx("code",{className:"prose-code",children:"store.set(id, data, maxAge)"})," ","to persist the changes. If rolling sessions are enabled, the middleware also refreshes the cookie's expiration on every request, even if the data has not changed, by calling"," ",e.jsx("code",{className:"prose-code",children:"store.touch(id, maxAge)"}),". This sliding window behavior keeps active users logged in while allowing idle sessions to expire naturally."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Session destruction is handled by ",e.jsx("code",{className:"prose-code",children:"store.delete(id)"}),", which removes the server-side record and instructs the browser to clear the cookie by setting its ",e.jsx("code",{className:"prose-code",children:"Max-Age"})," to 0. After destruction, any subsequent request with the old session ID will not find a matching record and will be treated as unauthenticated."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"when-to-use",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"When to Use Sessions vs. JWTs"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Sessions are the better choice when ",e.jsx("strong",{children:"immediate revocation"})," is a hard requirement. If your application needs to log a user out the moment an admin disables their account, or if regulatory compliance demands the ability to terminate all active sessions for a given user, server-side sessions provide this capability natively. With JWTs, achieving the same result requires maintaining a blacklist or checking a token version on every request, which partially negates the statelessness benefit."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Sessions are also preferable for ",e.jsx("strong",{children:"browser-based applications"})," where cookies are the natural credential transport. Cookies with"," ",e.jsx("code",{className:"prose-code",children:"httpOnly"})," and ",e.jsx("code",{className:"prose-code",children:"secure"})," ","flags are not accessible to JavaScript, which makes them immune to XSS-based token theft. JWTs stored in localStorage or sessionStorage, by contrast, can be exfiltrated by any script running on the page."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"On the other hand, sessions require a centralized or shared store, which adds infrastructure complexity. If your architecture is a set of stateless API services consumed by mobile clients or third-party integrations, JWTs may be a simpler fit because they require no shared state. Many production systems use a hybrid approach: sessions for browser-based user interfaces and JWTs for API-to-API communication."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"basic-usage",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Basic Usage"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"createSessionManager"})," factory creates a session manager bound to a specific store and cookie configuration. Registering its middleware globally via ",e.jsx("code",{className:"prose-code",children:"app.addHook('onRequest', ...)"})," ensures that every incoming request has access to the session object on"," ",e.jsx("code",{className:"prose-code",children:"ctx.session"}),". The middleware handles the full lifecycle automatically: reading the session cookie, loading data from the store, and persisting changes after the response."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The session API is deliberately simple. You call ",e.jsx("code",{className:"prose-code",children:"set(key, value)"})," ","to store data, ",e.jsx("code",{className:"prose-code",children:"get(key)"})," to retrieve it, and"," ",e.jsx("code",{className:"prose-code",children:"destroy()"})," to end the session entirely. Data is serialized to JSON when persisted, so you can store any JSON-serializable value -- strings, numbers, booleans, arrays, and plain objects. Avoid storing class instances, functions, or circular references."]}),e.jsx(s,{code:o,filename:"src/app.ts"}),e.jsx(t,{variant:"warning",children:"The default in-memory store is not suitable for production. Sessions are lost on restart and not shared across instances. Use Redis or a database store in production."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"session-store",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Session Stores"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The session store is the backend responsible for persisting session data between requests. Vexor defines a simple four-method interface -- ",e.jsx("code",{className:"prose-code",children:"get"}),","," ",e.jsx("code",{className:"prose-code",children:"set"}),", ",e.jsx("code",{className:"prose-code",children:"delete"}),", and"," ",e.jsx("code",{className:"prose-code",children:"touch"})," -- that any storage backend can implement. This design keeps the session module independent of any specific database or cache technology, and makes it straightforward to swap backends as your infrastructure evolves."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:[e.jsx("strong",{children:"Redis"})," is the most common production choice because it offers sub-millisecond latency, built-in key expiration via TTL, and natural support for distributed deployments. The ",e.jsx("code",{className:"prose-code",children:"EX"})," flag in the SET command tells Redis to automatically delete the key after the specified number of seconds, so you never need to run a separate cleanup job. Redis also supports clustering and replication, giving you high availability for session storage."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:[e.jsx("strong",{children:"Database stores"})," are a good fit when you need durability guarantees that Redis does not provide by default (especially without persistence configured), or when you want to query session data for analytics or auditing purposes. The trade-off is higher latency -- a database round-trip is typically 1-5ms compared to Redis's sub-millisecond reads. For most web applications, this overhead is negligible relative to the total request time."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"touch"})," method is a performance optimization used with rolling sessions. Instead of rewriting the entire session payload on every request (which would include a full JSON serialization and storage write), ",e.jsx("code",{className:"prose-code",children:"touch"})," ","only updates the expiration timestamp. This reduces write amplification significantly for read-heavy workloads where session data rarely changes but the session must be kept alive."]}),e.jsx(s,{code:r,filename:"src/session-stores.ts"}),e.jsxs(t,{variant:"tip",children:["The ",e.jsx("code",{className:"prose-code",children:"touch"})," method extends the session TTL without rewriting the full payload. This is used when ",e.jsx("code",{className:"prose-code",children:"rolling"})," is enabled, to avoid unnecessary writes on read-only requests."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"cookie-config",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Cookie Configuration"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"The session cookie is the browser's only reference to the server-side session, so its security attributes are critically important. Each attribute controls a different aspect of how the browser handles the cookie, and misconfiguring even one can open your application to attack."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"httpOnly"})," flag prevents client-side JavaScript from reading the cookie via ",e.jsx("code",{className:"prose-code",children:"document.cookie"}),". This is your primary defense against XSS-based session hijacking: even if an attacker injects a malicious script, they cannot extract the session ID. The ",e.jsx("code",{className:"prose-code",children:"secure"})," ","flag ensures the cookie is only sent over HTTPS connections, preventing interception over unencrypted networks. Always enable both in production."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"sameSite"})," attribute controls whether the cookie is sent with cross-origin requests. ",e.jsx("code",{className:"prose-code",children:"'strict'"})," prevents the cookie from being sent on any cross-origin request, which provides the strongest CSRF protection but can cause usability issues (for example, clicking a link from an email will not send the cookie). ",e.jsx("code",{className:"prose-code",children:"'lax'"})," is a pragmatic default that sends the cookie on top-level navigations (link clicks) but not on cross-origin POST requests or embedded resources."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"rolling"})," option implements sliding-window expiration: every time the user makes a request, the session's TTL is reset to the full"," ",e.jsx("code",{className:"prose-code",children:"maxAge"}),". This means that active users stay logged in indefinitely, while idle users are automatically logged out after the configured period. The ",e.jsx("code",{className:"prose-code",children:"renewThreshold"})," adds an additional optimization by regenerating the session ID when it is nearing expiration, combining session fixation prevention with natural session lifecycle management."]}),e.jsx(s,{code:n,filename:"src/config.ts"})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"session-data",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Working with Session Data"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"Session"})," object provides a Map-like interface for reading and writing arbitrary key-value pairs. Internally, session data is held in memory for the duration of the request and flushed to the store when the response is sent. This means that multiple ",e.jsx("code",{className:"prose-code",children:"set"})," calls within a single request are batched into one store write, which is both efficient and consistent."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"get"})," method supports TypeScript generics so you can retrieve typed values without manual casting. The ",e.jsx("code",{className:"prose-code",children:"all"})," ","method returns a snapshot of all session data, which is useful for debugging or logging. The ",e.jsx("code",{className:"prose-code",children:"clear"})," method removes all data but preserves the session ID and cookie -- this is different from ",e.jsx("code",{className:"prose-code",children:"destroy"}),", which removes the session entirely and instructs the browser to delete the cookie."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["In most cases, session persistence is handled automatically by the middleware. The"," ",e.jsx("code",{className:"prose-code",children:"save"})," method is available for edge cases where you need to ensure data is persisted before sending a response -- for example, when you need to guarantee that a session write completes before redirecting to another service."]}),e.jsx(s,{code:c,filename:"src/routes/dashboard.ts"})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"regeneration",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Session Regeneration and Fixation Prevention"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Session fixation is an attack where an adversary sets a known session ID in a victim's browser (via a crafted URL, a cross-site scripting vulnerability, or subdomain cookie injection) before the victim logs in. When the victim authenticates, their credentials become associated with the attacker's known session ID, allowing the attacker to access the authenticated session. This attack is possible whenever the session ID remains the same across an authentication state change."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The defense is straightforward: call ",e.jsx("code",{className:"prose-code",children:"session.regenerate()"})," ","immediately after any change in authentication state. This creates a new session ID, deletes the old session record from the store, and sets a new cookie in the response. Even if an attacker planted a session ID beforehand, it becomes useless because the authenticated session now lives under a completely different ID that only the legitimate user's browser knows."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Vexor's ",e.jsx("code",{className:"prose-code",children:"regenerate"})," method accepts an optional"," ",e.jsx("code",{className:"prose-code",children:"keepData"})," flag. When set to ",e.jsx("code",{className:"prose-code",children:"true"}),", existing session data is copied to the new session, which is useful for privilege escalation flows where you want to change the session ID without losing the user's state. When omitted or ",e.jsx("code",{className:"prose-code",children:"false"}),", regeneration starts with a clean slate -- the appropriate choice for initial login where you are about to set fresh session data anyway."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"You should regenerate the session ID in at least three scenarios: after successful login, after privilege escalation (such as entering a sudo mode), and after any password or credential change. This is not merely a best practice -- it is a critical security control listed in the OWASP Session Management Cheat Sheet."}),e.jsx(s,{code:l,filename:"src/routes/auth.ts"}),e.jsxs(t,{variant:"info",children:["Always call ",e.jsx("code",{className:"prose-code",children:"regenerate()"})," after login, privilege escalation, or any change in authentication state. This is a critical defense against session fixation attacks."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"best-practices",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Best Practices"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Following these guidelines ensures your session implementation is both secure and performant."}),e.jsxs("ul",{className:"list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-4",children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Use Redis or a database in production."})," The in-memory store is for development only. It does not survive restarts and cannot be shared across instances."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Always set httpOnly and secure flags."})," These two cookie attributes are your first line of defense against XSS-based session theft and network interception."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Regenerate session IDs after login."})," This prevents session fixation attacks and should be treated as a mandatory security control."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Keep session data small."})," Store only identifiers and flags, not full objects. Large session payloads increase store I/O and serialization cost."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Use rolling sessions with a reasonable maxAge."})," This provides a good balance between user convenience (active users stay logged in) and security (idle sessions expire automatically)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Implement session cleanup."})," If using a database store, schedule periodic cleanup of expired sessions. Redis handles this automatically via TTL-based expiration."]})]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"api-reference",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"API Reference"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Configuration options for ",e.jsx("code",{className:"prose-code",children:"createSessionManager(options)"}),". The secret and a production-grade store are the only required configuration for a secure deployment."]}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Option"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Type"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Default"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Description"})]})}),e.jsxs("tbody",{className:"text-slate-600 dark:text-slate-400",children:[e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"store"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"SessionStore | 'memory'"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"'memory'"})}),e.jsx("td",{className:"py-3 px-4",children:"The storage backend for session data. Pass 'memory' for the built-in in-memory store (development only), or provide an object implementing the SessionStore interface (get, set, delete, touch) for Redis, database, or any custom backend."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"secret"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsx("td",{className:"py-3 px-4",children:"The HMAC secret used to sign the session cookie. This prevents clients from forging or guessing session IDs. Use a strong, random value of at least 256 bits. If this secret is compromised, all active sessions should be considered insecure."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"cookieName"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"'sid'"})}),e.jsx("td",{className:"py-3 px-4",children:"The name of the HTTP cookie that carries the session ID. Choose a name that does not reveal implementation details. Avoid generic names like 'PHPSESSID' or 'JSESSIONID' that disclose your technology stack."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"maxAge"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"number"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"86400"})}),e.jsx("td",{className:"py-3 px-4",children:"The maximum session lifetime in seconds (default is 24 hours). This value is used for both the cookie Max-Age attribute and the TTL passed to the store's set and touch methods. With rolling sessions enabled, this acts as an idle timeout rather than an absolute timeout."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"rolling"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"boolean"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"false"})}),e.jsx("td",{className:"py-3 px-4",children:"When enabled, the session expiration timer is reset on every request. This sliding-window approach keeps active users logged in while expiring idle sessions. The trade-off is increased store writes (mitigated by the touch method)."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"renewThreshold"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"number"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsx("td",{className:"py-3 px-4",children:"When the session's remaining TTL drops below this many seconds, the session ID is automatically regenerated. This provides periodic session fixation protection without requiring manual regeneration calls. Only effective when rolling is enabled."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"cookie"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"CookieOptions"})}),e.jsx("td",{className:"py-3 px-4",children:"See below"}),e.jsx("td",{className:"py-3 px-4",children:"An object controlling cookie security attributes: httpOnly (default true, blocks JavaScript access), secure (default false, set to true in production for HTTPS-only), sameSite ('lax' or 'strict' for CSRF protection), domain (for cross-subdomain sharing), and path (URL scope)."})]})]})]})})]}),e.jsxs("section",{className:"card bg-slate-50 dark:bg-slate-800/50",children:[e.jsx("h2",{id:"next",className:"text-xl font-bold text-slate-900 dark:text-white mb-4",children:"Next Steps"}),e.jsxs("div",{className:"flex flex-wrap gap-3",children:[e.jsxs(a,{to:"/auth/oauth",className:"btn-primary",children:["OAuth & Social Login ",e.jsx(i,{className:"w-4 h-4 ml-2"})]}),e.jsx(a,{to:"/auth/security",className:"btn-secondary",children:"Security Best Practices"})]})]})]})}export{h as default};
