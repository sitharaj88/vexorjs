import{j as e,C as s,I as t,L as a,A as r}from"./index-Bga0OgzL.js";const i=`import { createJWT } from '@vexorjs/core/auth';

// Create a JWT instance with a shared secret
const jwt = createJWT({
  secret: process.env.JWT_SECRET!,
  algorithm: 'HS256',
  expiresIn: '1h',
  issuer: 'my-app',
});

// Sign a token
const token = await jwt.sign({ userId: 42, role: 'admin' });

// Verify a token
const payload = await jwt.verify(token);
console.log(payload.userId); // 42

// Decode without verification (useful for inspecting claims)
const decoded = jwt.decode(token);
console.log(decoded.header); // { alg: 'HS256', typ: 'JWT' }
console.log(decoded.payload); // { userId: 42, role: 'admin', iat: ..., exp: ... }`,o=`import { createJWT } from '@vexorjs/core/auth';
import type { JWTPayload } from '@vexorjs/core/auth';

interface UserPayload extends JWTPayload {
  userId: number;
  role: 'admin' | 'editor' | 'viewer';
  permissions: string[];
}

const jwt = createJWT({ secret: process.env.JWT_SECRET! });

// Sign with typed payload
const token = await jwt.sign<UserPayload>({
  userId: 1,
  role: 'admin',
  permissions: ['users:read', 'users:write', 'posts:delete'],
});

// Sign with per-token options
const shortLivedToken = await jwt.sign(
  { userId: 1, role: 'viewer' },
  { expiresIn: '15m', audience: 'api.example.com' },
);

// Sign with explicit expiration timestamp
const tokenWithExp = await jwt.sign(
  { userId: 1 },
  { exp: Math.floor(Date.now() / 1000) + 3600 },
);`,n=`import { createJWT, JWTExpiredError, JWTInvalidError } from '@vexorjs/core/auth';

const jwt = createJWT({
  secret: process.env.JWT_SECRET!,
  issuer: 'my-app',
  audience: 'api.example.com',
  clockTolerance: 30, // allow 30 seconds of clock skew
});

try {
  const payload = await jwt.verify(token);
  console.log('User ID:', payload.userId);
} catch (error) {
  if (error instanceof JWTExpiredError) {
    console.error('Token expired at:', error.expiredAt);
    // Prompt user to refresh
  } else if (error instanceof JWTInvalidError) {
    console.error('Token invalid:', error.message);
    // Reject the request
  }
}

// Verify with per-call options
const payload = await jwt.verify(token, {
  audience: 'admin.example.com',
  clockTolerance: 60,
});`,c=`import { createJWT } from '@vexorjs/core/auth';
import { readFileSync } from 'node:fs';

// RSA key pair for asymmetric signing
const jwt = createJWT({
  algorithm: 'RS256',
  privateKey: readFileSync('./keys/private.pem', 'utf-8'),
  publicKey: readFileSync('./keys/public.pem', 'utf-8'),
  expiresIn: '1h',
});

// Sign with private key
const token = await jwt.sign({ userId: 42 });

// Verify with public key (can be done by any service that has the public key)
const payload = await jwt.verify(token);

// You can also create a verify-only instance for downstream services
const verifier = createJWT({
  algorithm: 'RS256',
  publicKey: readFileSync('./keys/public.pem', 'utf-8'),
});

const verified = await verifier.verify(token);`,d=`import { Vexor, type Context } from '@vexorjs/core';
import { createJWT } from '@vexorjs/core/auth';

const app = new Vexor();
const jwt = createJWT({
  secret: process.env.JWT_SECRET!,
  expiresIn: '1h',
});

// Reusable authentication middleware
async function authenticate(ctx: Context) {
  const header = ctx.req.header('Authorization');
  if (!header?.startsWith('Bearer ')) {
    return ctx.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  try {
    const payload = await jwt.verify(header.slice(7));
    ctx.set('user', payload);
  } catch {
    return ctx.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Role-based authorization factory
function requireRole(...roles: string[]) {
  return async (ctx: Context) => {
    const user = ctx.get('user');
    if (!user || !roles.includes(user.role)) {
      return ctx.status(403).json({ error: 'Insufficient permissions' });
    }
  };
}

// Public route
app.post('/auth/login', async (ctx) => {
  const { email, password } = ctx.body;
  const user = await verifyCredentials(email, password);
  if (!user) return ctx.status(401).json({ error: 'Invalid credentials' });

  const token = await jwt.sign({ userId: user.id, role: user.role });
  return ctx.json({ token });
});

// Protected route
app.get('/profile', { preHandler: [authenticate] }, async (ctx) => {
  const user = ctx.get('user');
  return ctx.json({ userId: user.userId, role: user.role });
});

// Admin-only route
app.delete('/users/:id', {
  preHandler: [authenticate, requireRole('admin')],
}, async (ctx) => {
  await deleteUser(ctx.params.id);
  return ctx.status(204).send();
});`,l=`import { createJWT } from '@vexorjs/core/auth';

// Separate instances for access and refresh tokens
const accessJwt = createJWT({
  secret: process.env.ACCESS_SECRET!,
  expiresIn: '15m',
});

const refreshJwt = createJWT({
  secret: process.env.REFRESH_SECRET!,
  expiresIn: '7d',
});

// Login returns both tokens
app.post('/auth/login', async (ctx) => {
  const user = await verifyCredentials(ctx.body.email, ctx.body.password);
  if (!user) return ctx.status(401).json({ error: 'Invalid credentials' });

  const accessToken = await accessJwt.sign({ userId: user.id, role: user.role });
  const refreshToken = await refreshJwt.sign({ userId: user.id, tokenVersion: user.tokenVersion });

  // Store refresh token hash in database for revocation support
  await db.insert(refreshTokens).values({
    userId: user.id,
    tokenHash: await hash(refreshToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return ctx.json({ accessToken, refreshToken });
});

// Refresh endpoint: exchange a valid refresh token for a new access token
app.post('/auth/refresh', async (ctx) => {
  const { refreshToken } = ctx.body;

  try {
    const payload = await refreshJwt.verify(refreshToken);

    // Check that the token has not been revoked
    const stored = await db.select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, await hash(refreshToken)))
      .first();

    if (!stored) {
      return ctx.status(401).json({ error: 'Token has been revoked' });
    }

    const user = await db.select().from(users).where(eq(users.id, payload.userId)).first();
    if (!user || user.tokenVersion !== payload.tokenVersion) {
      return ctx.status(401).json({ error: 'Token is no longer valid' });
    }

    const accessToken = await accessJwt.sign({ userId: user.id, role: user.role });
    return ctx.json({ accessToken });
  } catch {
    return ctx.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Revoke all refresh tokens for a user (e.g. on password change)
app.post('/auth/revoke-all', { preHandler: [authenticate] }, async (ctx) => {
  const user = ctx.get('user');
  await db.delete(refreshTokens).where(eq(refreshTokens.userId, user.userId));
  await db.update(users).set({ tokenVersion: sql\`token_version + 1\` }).where(eq(users.id, user.userId));
  return ctx.json({ message: 'All sessions revoked' });
});`;function p(){return e.jsxs("div",{className:"space-y-12",children:[e.jsxs("div",{children:[e.jsx("h1",{id:"authentication",className:"text-4xl font-bold text-slate-900 dark:text-white mb-4",children:"JWT Authentication"}),e.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400 mb-4",children:"JSON Web Tokens (JWTs) are the predominant mechanism for stateless authentication in modern web APIs. Rather than storing session state on the server and looking it up on every request, a JWT encodes the user's identity and permissions directly into a cryptographically signed token that the client carries. This eliminates the need for a centralized session store and makes horizontal scaling straightforward, because any server in a cluster can verify the token independently without shared state."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Vexor's JWT module provides a complete, type-safe toolkit for creating, signing, verifying, and decoding tokens. It supports both symmetric (HMAC) and asymmetric (RSA) signing algorithms, giving you the flexibility to choose the right trust model for your architecture. Whether you are building a monolithic application where a single secret suffices, or a microservice mesh where only one service should be able to mint tokens while many can verify them, Vexor's ",e.jsx("code",{className:"prose-code",children:"createJWT"})," API covers both scenarios with minimal configuration."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Understanding the internals of JWT is important for making sound security decisions. A JWT is not encrypted by default -- it is merely signed. Anyone who possesses a token can decode its payload and read the claims inside. The signature guarantees only integrity and authenticity: that the claims have not been tampered with and that the token was issued by a trusted party. This means you should never store sensitive data such as passwords or credit card numbers inside a JWT payload."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400",children:"This page walks through the structure of a JWT, the difference between HMAC and RSA signing, token lifecycle management, middleware integration patterns, and secure refresh token rotation -- everything you need to implement production-grade authentication in Vexor."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"how-it-works",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"How It Works"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["A JWT consists of three Base64URL-encoded segments separated by dots:"," ",e.jsx("code",{className:"prose-code",children:"header.payload.signature"}),". The ",e.jsx("strong",{children:"header"})," is a small JSON object declaring the token type (always ",e.jsx("code",{className:"prose-code",children:"JWT"}),") and the signing algorithm (for example, ",e.jsx("code",{className:"prose-code",children:"HS256"})," or"," ",e.jsx("code",{className:"prose-code",children:"RS256"}),"). The ",e.jsx("strong",{children:"payload"})," contains the claims -- key-value pairs that carry information about the authenticated subject, such as a user ID, role, issued-at timestamp (",e.jsx("code",{className:"prose-code",children:"iat"}),"), and expiration time (",e.jsx("code",{className:"prose-code",children:"exp"}),"). The ",e.jsx("strong",{children:"signature"})," is produced by applying the declared algorithm to the concatenation of the encoded header and payload, using a secret key."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["When Vexor signs a token with ",e.jsx("code",{className:"prose-code",children:"HS256"}),", it computes an HMAC-SHA256 digest over the header and payload using a shared secret that both the issuer and verifier know. This is called ",e.jsx("strong",{children:"symmetric signing"})," because the same key is used for both operations. It is fast, simple, and appropriate for single-service deployments or tightly coupled backends that can securely share the same secret."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["With ",e.jsx("code",{className:"prose-code",children:"RS256"}),", Vexor uses ",e.jsx("strong",{children:"asymmetric signing"}),": the token is signed with an RSA private key and verified with the corresponding public key. The private key never leaves the authentication service, while the public key can be freely distributed to any downstream service that needs to verify tokens. This is the preferred approach in microservice architectures because it maintains a clear separation of trust -- only the auth service can mint tokens, but any service can verify them without possessing the signing secret."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["During verification, Vexor decodes the header to determine which algorithm was used, then recomputes the signature using the appropriate key. If the recomputed signature matches the one in the token, the claims are authentic. Vexor then checks the ",e.jsx("code",{className:"prose-code",children:"exp"})," ","claim against the current time (with optional clock tolerance), validates"," ",e.jsx("code",{className:"prose-code",children:"iss"})," and ",e.jsx("code",{className:"prose-code",children:"aud"})," claims if configured, and returns the decoded payload. If any check fails, a specific error type is thrown so you can distinguish between expired tokens and structurally invalid ones."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"when-to-use",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"When to Use JWT vs. Sessions"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["JWTs are ideal when you need ",e.jsx("strong",{children:"stateless authentication"})," -- when you want the server to authenticate requests without querying an external store. This is a natural fit for RESTful APIs consumed by mobile apps, single-page applications, or third-party integrations where the client sends a Bearer token with every request. Because the server does not need to look up session data, JWT-based auth scales horizontally without any shared infrastructure."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The primary trade-off is ",e.jsx("strong",{children:"revocation difficulty"}),'. Once a JWT is issued, it remains valid until it expires. You cannot "log out" a user by deleting server-side state the way you can with sessions. To mitigate this, keep access token lifetimes short (15 minutes or less) and use refresh tokens for long-lived sessions. If immediate revocation is critical -- for example, when a user changes their password or an admin disables an account -- consider a hybrid approach where you check a token version or blacklist against a fast cache like Redis.']}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Choose ",e.jsx("code",{className:"prose-code",children:"HS256"})," when all services that need to verify tokens share the same trust boundary and can securely share a secret. Choose"," ",e.jsx("code",{className:"prose-code",children:"RS256"})," when you need to distribute verification capability without sharing signing authority -- for example, when an API gateway or third-party service needs to validate tokens it did not create. The RSA approach adds computational overhead (signing is roughly 10x slower than HMAC), but verification speed is comparable, and the security model is significantly stronger for distributed systems."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"basic-usage",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Basic Usage"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The entry point to Vexor's JWT system is the ",e.jsx("code",{className:"prose-code",children:"createJWT"})," ","factory function. It accepts a configuration object specifying your secret (or key pair), default algorithm, and token lifetime, then returns a reusable instance with"," ",e.jsx("code",{className:"prose-code",children:"sign"}),", ",e.jsx("code",{className:"prose-code",children:"verify"}),", and"," ",e.jsx("code",{className:"prose-code",children:"decode"})," methods. The instance caches the key material internally, so you should create it once at application startup and reuse it throughout your codebase."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"sign"})," method serializes your payload into the JWT format and applies the configured algorithm. The ",e.jsx("code",{className:"prose-code",children:"verify"})," ","method validates the signature, checks expiration and other registered claims, and returns the decoded payload. The ",e.jsx("code",{className:"prose-code",children:"decode"})," method is a convenience that Base64-decodes the header and payload without verifying the signature -- useful for debugging or reading claims in contexts where you do not need cryptographic assurance."]}),e.jsx(s,{code:i,filename:"src/auth.ts"})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"signing-tokens",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Signing Tokens"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Token signing is the process of encoding your claims and producing a cryptographic signature that proves the token's authenticity. When you call ",e.jsx("code",{className:"prose-code",children:"jwt.sign(payload)"}),", Vexor constructs the JWT header from your configured algorithm, merges your custom claims with registered claims (",e.jsx("code",{className:"prose-code",children:"iat"}),", ",e.jsx("code",{className:"prose-code",children:"exp"}),","," ",e.jsx("code",{className:"prose-code",children:"iss"}),", ",e.jsx("code",{className:"prose-code",children:"aud"}),"), Base64URL-encodes both parts, and computes the signature over the concatenated result."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Vexor supports TypeScript generics on the ",e.jsx("code",{className:"prose-code",children:"sign"})," method, allowing you to enforce the shape of token payloads at compile time. This catches mistakes like misspelled claim names or missing required fields before your code ever runs. You can also override default configuration on a per-call basis -- for example, issuing a short-lived token for a password reset flow while your main tokens use a longer lifetime."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"A critical best practice is to keep payloads small. Every byte in the token is sent with every HTTP request (typically in the Authorization header), so large payloads increase bandwidth usage and parsing time. Store only identifiers and roles in the token, and look up full user profiles from your database when needed. A well-designed JWT payload is typically under 500 bytes."}),e.jsx(s,{code:o,filename:"src/auth.ts"}),e.jsx(t,{variant:"tip",children:"Keep token payloads small. Store only identifiers and roles, not full user objects. Large tokens increase bandwidth and parsing cost on every request."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"verifying-tokens",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Verifying Tokens"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Verification is the most security-critical step in JWT authentication. When"," ",e.jsx("code",{className:"prose-code",children:"jwt.verify(token)"})," is called, Vexor performs a sequence of checks in strict order. First, it splits the token into its three segments and decodes the header to determine the algorithm. It then recomputes the signature using the configured key and compares it to the signature segment using a constant-time comparison function to prevent timing attacks. Only after the signature is confirmed does Vexor decode and inspect the payload claims."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Claim validation includes checking that the ",e.jsx("code",{className:"prose-code",children:"exp"})," (expiration) timestamp has not passed, that the ",e.jsx("code",{className:"prose-code",children:"iss"})," (issuer) matches your configured issuer, and that the ",e.jsx("code",{className:"prose-code",children:"aud"})," (audience) matches one of your expected audience values. The ",e.jsx("code",{className:"prose-code",children:"clockTolerance"})," option allows a configurable number of seconds of clock skew, which is essential in distributed systems where server clocks may not be perfectly synchronized."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Vexor throws typed error classes so that your error handling can distinguish between different failure modes. A ",e.jsx("code",{className:"prose-code",children:"JWTExpiredError"})," means the token was valid but has exceeded its lifetime -- the correct response is typically to prompt the client to use a refresh token. A ",e.jsx("code",{className:"prose-code",children:"JWTInvalidError"})," means the signature did not match or the token structure was malformed -- this likely indicates tampering or a misconfigured secret, and the request should be rejected outright."]}),e.jsx(s,{code:n,filename:"src/middleware/auth.ts"}),e.jsxs(t,{variant:"info",children:["The ",e.jsx("code",{className:"prose-code",children:"clockTolerance"})," option (in seconds) accounts for clock drift between servers. A value of 30 seconds is a safe default for distributed systems."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"rsa-keys",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Asymmetric Signing with RSA Keys"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Asymmetric algorithms like ",e.jsx("code",{className:"prose-code",children:"RS256"})," use a pair of mathematically related keys: a private key for signing and a public key for verification. The security of this scheme rests on the computational infeasibility of deriving the private key from the public key. This separation makes RSA the right choice for architectures where multiple services need to verify tokens but only one service should be authorized to issue them."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"In a typical microservice deployment, the authentication service holds the RSA private key and uses it to sign tokens during login. Every other service -- the user service, the order service, the API gateway -- only needs the public key. If any of those services is compromised, the attacker gains the ability to verify tokens (which is already public knowledge) but cannot forge new ones. Contrast this with HMAC, where compromising the shared secret on any service gives the attacker full signing capability."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Vexor allows you to create verify-only instances by providing just the public key. This is the recommended pattern for downstream services: they can validate incoming tokens without any risk of accidentally being used to issue tokens. The private key should be loaded from a secrets manager or environment variable, never from a file committed to version control."}),e.jsx(s,{code:c,filename:"src/auth.ts"}),e.jsx(t,{variant:"warning",children:"Never commit private keys to version control. Use environment variables or a secrets manager to inject keys at runtime."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"middleware-integration",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Middleware Integration"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["In practice, JWT verification is almost always performed in middleware rather than in individual route handlers. This pattern centralizes authentication logic, ensures consistency across all protected routes, and keeps your handlers focused on business logic. Vexor's"," ",e.jsx("code",{className:"prose-code",children:"preHandler"})," hook is the ideal place to run authentication middleware because it executes after routing but before the handler, giving you access to route parameters and the ability to short-circuit with an error response."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The pattern below demonstrates two layers of middleware: an ",e.jsx("code",{className:"prose-code",children:"authenticate"})," ","function that verifies the Bearer token and attaches the decoded payload to the request context, and a ",e.jsx("code",{className:"prose-code",children:"requireRole"})," factory that checks the user's role against a list of allowed roles. These can be composed using Vexor's"," ",e.jsx("code",{className:"prose-code",children:"preHandler"})," array to build fine-grained access control without duplicating logic. The authentication middleware extracts the token from the"," ",e.jsx("code",{className:"prose-code",children:"Authorization"}),' header, strips the "Bearer " prefix, and delegates to ',e.jsx("code",{className:"prose-code",children:"jwt.verify"})," for the actual cryptographic check."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"This separation of authentication (who are you?) from authorization (what can you do?) is a fundamental security pattern. The authenticate middleware establishes identity; the role middleware enforces permissions. You can extend this model with more granular permission checks, tenant isolation, or feature flags as your application grows."}),e.jsx(s,{code:d,filename:"src/app.ts"})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"refresh-tokens",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Refresh Token Rotation"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Short-lived access tokens are a security best practice because they limit the window of opportunity if a token is stolen. However, requiring users to log in every 15 minutes would be a terrible experience. Refresh tokens solve this by acting as long-lived credentials that can be exchanged for new access tokens without re-entering credentials. The two-token pattern creates a layered security model: access tokens are low-risk because they expire quickly, and refresh tokens are higher-risk but can be revoked server-side."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Vexor implements this by using two separate JWT instances with different secrets and lifetimes. The access token (typically 15 minutes) is used for API authentication. The refresh token (typically 7 days) is used solely to obtain new access tokens. Critically, the refresh token's hash is stored in the database, which enables server-side revocation. When a user changes their password, logs out from all devices, or an admin disables an account, you delete the stored hash and the refresh token becomes useless even though it has not expired cryptographically."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"tokenVersion"})," field provides an additional layer of protection. Each time a user's credentials are invalidated (password change, security breach), the token version is incremented. Even if an attacker has a valid refresh token, the version mismatch causes the refresh endpoint to reject it. This is known as refresh token rotation -- a defense-in-depth strategy recommended by OAuth 2.0 security best practices."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Always hash refresh tokens before storing them in the database. If the database is compromised, raw tokens stored in plaintext could be used to impersonate any user. By storing only the hash, you ensure that a database breach does not directly translate into account takeover."}),e.jsx(s,{code:l,filename:"src/routes/auth.ts"}),e.jsx(t,{variant:"warning",children:"Always hash refresh tokens before storing them in the database. If the database is compromised, raw tokens cannot be extracted and reused."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"best-practices",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Best Practices"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Following these guidelines will help you avoid common pitfalls with JWT-based authentication."}),e.jsxs("ul",{className:"list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-4",children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Use strong secrets."})," HMAC secrets should be at least 256 bits (32 bytes) of cryptographically random data. A short or guessable secret can be brute-forced offline by anyone who captures a single token."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Keep access tokens short-lived."})," A 15-minute lifetime is a good starting point. This limits exposure if a token is leaked and reduces the need for revocation infrastructure."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Never store secrets in tokens."})," JWTs are encoded, not encrypted. Anyone can decode the payload. Store only identifiers and roles."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Validate all registered claims."})," Always configure"," ",e.jsx("code",{className:"prose-code",children:"issuer"})," and ",e.jsx("code",{className:"prose-code",children:"audience"})," ","to prevent tokens issued for one service from being accepted by another."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Use RS256 in microservice architectures."})," The separation of signing and verification keys is a meaningful security improvement when multiple services handle tokens."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Implement token rotation for refresh tokens."})," Store hashes, not raw tokens. Increment a token version on sensitive operations like password changes."]})]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"api-reference",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"API Reference"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Configuration options for ",e.jsx("code",{className:"prose-code",children:"createJWT(options)"}),". All options except the signing key are optional and have sensible defaults."]}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Option"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Type"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Default"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Description"})]})}),e.jsxs("tbody",{className:"text-slate-600 dark:text-slate-400",children:[e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"secret"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsx("td",{className:"py-3 px-4",children:"The shared secret used for HMAC signing and verification (HS256, HS384, HS512). Must be at least 256 bits of cryptographically random data for HS256. Required when using symmetric algorithms; mutually exclusive with the RSA key options."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"publicKey"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsx("td",{className:"py-3 px-4",children:"A PEM-encoded RSA public key used for token verification with asymmetric algorithms. Can be provided alone to create a verify-only instance that cannot sign new tokens. Required alongside privateKey for full RS256/RS384/RS512 capability."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"privateKey"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsx("td",{className:"py-3 px-4",children:"A PEM-encoded RSA private key used for token signing with asymmetric algorithms. Should only be present on the authentication service. Always load from environment variables or a secrets manager, never from version-controlled files."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"algorithm"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"'HS256'"})}),e.jsx("td",{className:"py-3 px-4",children:"The signing algorithm to use. Supported values are HS256, HS384, HS512 (symmetric HMAC) and RS256, RS384, RS512 (asymmetric RSA). HS256 is the most common choice for single-service deployments; RS256 is recommended for microservice architectures."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"expiresIn"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string | number"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"'1h'"})}),e.jsx("td",{className:"py-3 px-4",children:"The default lifetime of signed tokens, applied as the exp claim. Accepts human-readable strings like '15m', '2h', '7d', or a number of seconds. Can be overridden per-call in the sign method's options parameter."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"issuer"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsx("td",{className:"py-3 px-4",children:"Sets the iss (issuer) claim on signed tokens and validates it during verification. Use this to ensure tokens created by one application are not accepted by another. The value is typically your application name or domain."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"audience"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string | string[]"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsx("td",{className:"py-3 px-4",children:"Sets the aud (audience) claim on signed tokens and validates it during verification. When an array is provided, verification succeeds if any value matches. Useful for restricting tokens to specific API endpoints or services."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"clockTolerance"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"number"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"0"})}),e.jsx("td",{className:"py-3 px-4",children:"The number of seconds of clock skew to tolerate when checking the exp and nbf claims. In distributed systems where server clocks may drift, a value of 30 seconds prevents spurious token rejections. Set to 0 (the default) for strict expiration enforcement."})]})]})]})})]}),e.jsxs("section",{className:"card bg-slate-50 dark:bg-slate-800/50",children:[e.jsx("h2",{id:"next",className:"text-xl font-bold text-slate-900 dark:text-white mb-4",children:"Next Steps"}),e.jsxs("div",{className:"flex flex-wrap gap-3",children:[e.jsxs(a,{to:"/auth/sessions",className:"btn-primary",children:["Session Management ",e.jsx(r,{className:"w-4 h-4 ml-2"})]}),e.jsx(a,{to:"/auth/oauth",className:"btn-secondary",children:"OAuth & Social Login"})]})]})]})}export{p as default};
