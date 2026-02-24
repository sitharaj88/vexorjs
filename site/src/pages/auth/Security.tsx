import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const securityHeadersCode = `import { Vexor } from '@vexorjs/core';
import { helmet } from '@vexorjs/core/middleware';

const app = new Vexor();

// Apply security headers with sensible defaults
app.use(helmet());

// Or customize individual headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.example.com'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.example.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  xFrameOptions: 'DENY',
  xContentTypeOptions: 'nosniff',
  referrerPolicy: 'strict-origin-when-cross-origin',
  strictTransportSecurity: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  xXssProtection: '1; mode=block',
  permissionsPolicy: {
    camera: [],
    microphone: [],
    geolocation: ['self'],
  },
}));`;

const csrfProtectionCode = `import { Vexor, type Context } from '@vexorjs/core';
import { csrf } from '@vexorjs/core/middleware';

const app = new Vexor();

// CSRF protection via double-submit cookie pattern
app.use(csrf({
  cookie: {
    name: '_csrf',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
  // Token can be sent via header or body field
  headerName: 'X-CSRF-Token',
  bodyField: '_csrf',
  // Skip CSRF checks for these paths (e.g. webhooks)
  ignorePaths: ['/api/webhooks/*'],
  // Skip CSRF for API routes using Bearer tokens
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
}));

// Generate CSRF token for forms
app.get('/csrf-token', async (ctx) => {
  return ctx.json({ token: ctx.csrfToken() });
});

// Alternatively, use the Synchronizer Token pattern
import { csrfSync } from '@vexorjs/core/middleware';

app.use(csrfSync({
  sessionKey: 'csrfSecret',
  tokenLength: 32,
}));`;

const inputSanitizationCode = `import { Vexor, Type } from '@vexorjs/core';
import { sanitize } from '@vexorjs/core/security';

// Always validate and type-check all inputs via schemas
app.post('/posts', {
  body: Type.Object({
    title: Type.String({ minLength: 1, maxLength: 200 }),
    content: Type.String({ minLength: 1, maxLength: 50000 }),
    tags: Type.Array(Type.String({ maxLength: 50 }), { maxItems: 10 }),
  }),
}, async (ctx) => {
  const { title, content, tags } = ctx.body;

  // Sanitize HTML content to prevent stored XSS
  const safeContent = sanitize(content, {
    allowedTags: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'code', 'pre'],
    allowedAttributes: {
      a: ['href', 'title'],
    },
    // Strip everything not in the allowlist
    disallowedTagsMode: 'discard',
  });

  // Use parameterized queries (ORM handles this automatically)
  const post = await db.insert(posts).values({
    title,
    content: safeContent,
    authorId: ctx.get('user').userId,
  }).returning();

  return ctx.status(201).json(post);
});

// Never concatenate user input into SQL queries
// BAD:  db.raw(\`SELECT * FROM users WHERE name = '\${name}'\`)
// GOOD: db.select().from(users).where(eq(users.name, name))`;

const secureCookiesCode = `import { Vexor } from '@vexorjs/core';

const app = new Vexor();

// Set cookies with secure defaults
app.get('/set-preferences', async (ctx) => {
  ctx.cookie('preferences', JSON.stringify({ theme: 'dark' }), {
    httpOnly: true,       // Prevents JavaScript access (XSS mitigation)
    secure: true,         // Only sent over HTTPS
    sameSite: 'strict',   // Prevents cross-site request sending
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
    domain: '.example.com',
  });

  return ctx.json({ success: true });
});

// Signed cookies to detect tampering
app.get('/set-signed', async (ctx) => {
  ctx.signedCookie('userId', '42', process.env.COOKIE_SECRET!, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  });

  return ctx.json({ success: true });
});

// Read and verify signed cookie
app.get('/read-signed', async (ctx) => {
  const userId = ctx.verifySignedCookie('userId', process.env.COOKIE_SECRET!);
  if (!userId) {
    return ctx.status(401).json({ error: 'Invalid or tampered cookie' });
  }
  return ctx.json({ userId });
});`;

const secretManagementCode = `// .env file (NEVER commit this file)
// JWT_SECRET=your-super-secret-key-at-least-32-chars
// SESSION_SECRET=another-strong-random-secret
// DATABASE_URL=postgres://user:pass@host:5432/db
// GOOGLE_CLIENT_SECRET=GOCSPX-...
// REDIS_URL=redis://user:pass@host:6379

import { Vexor } from '@vexorjs/core';

const app = new Vexor();

// Access secrets via environment variables
const jwt = createJWT({
  secret: process.env.JWT_SECRET!,
});

// Validate required environment variables at startup
const requiredEnvVars = [
  'JWT_SECRET',
  'SESSION_SECRET',
  'DATABASE_URL',
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(\`Missing required environment variable: \${envVar}\`);
  }
}

// Use different secrets per environment
const config = {
  jwtSecret: process.env.JWT_SECRET!,
  sessionSecret: process.env.SESSION_SECRET!,
  isProduction: process.env.NODE_ENV === 'production',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
};

// In production, use a secrets manager
// AWS: aws-sdk SecretManager
// GCP: @google-cloud/secret-manager
// Azure: @azure/keyvault-secrets
// HashiCorp: node-vault`;

const securityChecklistItems = [
  { category: 'Authentication', items: [
    'Use strong, unique secrets for JWT signing (minimum 256 bits)',
    'Set short expiration times on access tokens (15 minutes)',
    'Implement refresh token rotation',
    'Hash refresh tokens before storing in the database',
    'Regenerate session IDs after login',
  ]},
  { category: 'HTTP Security', items: [
    'Enable HTTPS in production (use the helmet middleware)',
    'Set Content-Security-Policy headers',
    'Enable HSTS with preload',
    'Set X-Frame-Options to DENY',
    'Configure CORS to allow only trusted origins',
  ]},
  { category: 'Input Handling', items: [
    'Validate all inputs with schemas (params, query, body, headers)',
    'Sanitize HTML content before storage',
    'Use parameterized queries or ORM (never concatenate SQL)',
    'Limit request body size',
    'Rate limit authentication endpoints',
  ]},
  { category: 'Cookies & Sessions', items: [
    'Set httpOnly flag on all sensitive cookies',
    'Set secure flag in production',
    'Use sameSite=strict or sameSite=lax',
    'Sign session cookies to detect tampering',
    'Use server-side session storage in production (Redis or database)',
  ]},
  { category: 'Secrets', items: [
    'Never commit secrets to version control',
    'Use environment variables or a secrets manager',
    'Rotate secrets periodically',
    'Use different secrets per environment',
    'Validate required environment variables at startup',
  ]},
];

export default function Security() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 id="security" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Security Best Practices
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          Web application security is a discipline of defense in depth. No single middleware, header,
          or validation rule can protect your application on its own. Instead, security emerges from
          the careful layering of multiple independent defenses, each addressing a specific class of
          attack. If one layer fails -- perhaps a new bypass is discovered for your CSRF protection --
          the other layers (input validation, cookie security, Content Security Policy) continue to
          protect the application.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The most common web vulnerabilities -- Cross-Site Scripting (XSS), Cross-Site Request
          Forgery (CSRF), SQL injection, and clickjacking -- have been well-understood for decades,
          yet they continue to appear in production applications because developers either overlook
          them or apply defenses incorrectly. This page does not just show you which Vexor middleware
          to enable; it explains the attack vectors themselves, how each defense mechanism works at a
          conceptual level, and the trade-offs involved in different protection strategies.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor provides built-in middleware and utilities for the most critical security concerns:
          HTTP security headers via the <code className="prose-code">helmet</code> middleware, CSRF
          protection with both double-submit cookie and synchronizer token patterns, HTML sanitization
          for preventing stored XSS, secure cookie management with signing support, and startup
          validation for required secrets. Each of these tools is described in detail below, along
          with the threat model it addresses.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Understanding the "why" behind each security measure is just as important as knowing the
          "how." This page aims to give you both, so you can make informed decisions about which
          defenses are critical for your specific application and threat model.
        </p>
      </div>

      {/* Overview */}
      <section>
        <h2 id="overview" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Overview
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Security is a layered concern. No single measure is sufficient on its own. Vexor provides
          built-in middleware and utilities for common security tasks, but it is your responsibility
          to apply them correctly. The links below lead to detailed documentation for related security
          topics across the Vexor framework.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <Link to="/middleware/cors" className="card hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">CORS Configuration</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Control which origins can access your API</p>
          </Link>
          <Link to="/middleware/rate-limiting" className="card hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Rate Limiting</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Prevent brute-force and abuse attacks</p>
          </Link>
          <Link to="/validation" className="card hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Input Validation</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Schema-based validation for all request data</p>
          </Link>
          <Link to="/orm" className="card hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">SQL Injection Prevention</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Parameterized queries via the ORM</p>
          </Link>
        </div>
      </section>

      {/* Understanding XSS */}
      <section>
        <h2 id="understanding-xss" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Understanding Cross-Site Scripting (XSS)
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Cross-Site Scripting occurs when an attacker injects malicious JavaScript into a page that
          other users view. The injected script runs in the context of the victim's browser session,
          giving the attacker access to cookies, session tokens, and the ability to perform actions on
          behalf of the victim. XSS is consistently ranked among the top web vulnerabilities because
          it is both common and devastating in impact.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          There are three main variants. <strong>Reflected XSS</strong> occurs when user input from a
          URL parameter or form field is echoed directly into the page without escaping -- for example,
          a search page that displays "Results for: [user input]" where the input contains a script
          tag. <strong>Stored XSS</strong> is more dangerous: the malicious script is persisted in the
          database (in a comment, profile bio, or forum post) and served to every user who views that
          content. <strong>DOM-based XSS</strong> happens entirely in the browser when client-side
          JavaScript reads untrusted data (from the URL hash or postMessage) and inserts it into the
          DOM without sanitization.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Defense against XSS requires multiple layers. Content Security Policy (CSP) headers restrict
          which scripts the browser is allowed to execute, blocking inline scripts and unauthorized
          external sources. The <code className="prose-code">httpOnly</code> cookie flag prevents
          JavaScript from accessing session cookies, limiting what a successful XSS attack can steal.
          Input sanitization strips dangerous HTML tags and attributes before they are stored. And
          output encoding ensures that any user-generated content displayed in HTML is properly escaped.
          Vexor's helmet middleware, sanitize utility, and schema validation work together to address
          all three layers.
        </p>
      </section>

      {/* Understanding CSRF */}
      <section>
        <h2 id="understanding-csrf" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Understanding Cross-Site Request Forgery (CSRF)
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          A CSRF attack tricks an authenticated user's browser into making an unintended request to
          your application. Because browsers automatically attach cookies to same-origin requests, a
          malicious page can submit a form or trigger a fetch to your API, and the browser will include
          the user's session cookie. If your application does not distinguish between requests initiated
          by the user and requests initiated by a malicious third party, the forged request succeeds
          with the user's full privileges.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The classic example is a banking application: an attacker creates a page with a hidden form
          that POSTs to <code className="prose-code">bank.com/transfer?to=attacker&amount=1000</code>.
          When a logged-in bank customer visits the attacker's page, their browser submits the form
          with the session cookie attached, and the transfer executes without the user's knowledge.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor provides two defense mechanisms. The <strong>double-submit cookie</strong> pattern
          generates a random token, stores it in a cookie, and requires the client to send the same
          token in a request header or form field. Because a cross-origin attacker cannot read the
          cookie value (due to the Same-Origin Policy), they cannot produce the matching header. The{' '}
          <strong>synchronizer token</strong> pattern stores the CSRF secret in the server-side session
          and generates a token from it; the client includes this token in forms, and the server
          validates it against the session secret.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          If your API is consumed exclusively by clients that authenticate with Bearer tokens (not
          cookies), CSRF protection is not necessary for those endpoints. CSRF is only a risk when
          authentication relies on automatically attached credentials like cookies. Use the{' '}
          <code className="prose-code">ignorePaths</code> option to skip CSRF checks for API routes
          that use token-based authentication.
        </p>
      </section>

      {/* Understanding SQL Injection */}
      <section>
        <h2 id="understanding-injection" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Understanding SQL Injection
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          SQL injection occurs when user input is concatenated directly into a SQL query string,
          allowing the attacker to alter the query's structure. A classic example: if your code builds
          a query like <code className="prose-code">SELECT * FROM users WHERE name = '$&#123;name&#125;'</code>{' '}
          and the attacker submits the name <code className="prose-code">'; DROP TABLE users; --</code>,
          the resulting query deletes the entire table. SQL injection can lead to data theft, data
          destruction, authentication bypass, and in some cases, full server compromise.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The defense is simple and absolute: <strong>never concatenate user input into SQL queries</strong>.
          Instead, use parameterized queries (also called prepared statements) or an ORM that generates
          parameterized queries automatically. When you use Vexor's ORM with builder methods like{' '}
          <code className="prose-code">where(eq(users.name, name))</code>, the user input is passed as
          a parameter that the database engine treats as data, not as part of the SQL syntax. The
          input can contain any characters, including SQL metacharacters, without affecting the query
          structure.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Even with an ORM, be cautious with raw query methods. If your ORM provides a{' '}
          <code className="prose-code">raw()</code> function for ad-hoc queries, always use
          parameterized placeholders rather than string interpolation. Schema validation adds a
          second layer of defense by ensuring that inputs conform to expected types and formats
          before they reach the database layer.
        </p>
      </section>

      {/* HTTP Security Headers */}
      <section>
        <h2 id="http-security-headers" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          HTTP Security Headers
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          HTTP security headers instruct the browser to enable or enforce specific security policies.
          The <code className="prose-code">helmet</code> middleware sets a comprehensive suite of these
          headers in a single call. The most important is <strong>Content-Security-Policy (CSP)</strong>,
          which specifies exactly which sources of scripts, styles, images, and other resources the
          browser is allowed to load. A well-configured CSP can block most XSS attacks even if your
          application has an injection vulnerability.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Strict-Transport-Security (HSTS)</strong> tells the browser to always use HTTPS for
          your domain, even if the user types an HTTP URL. The <code className="prose-code">preload</code>{' '}
          flag adds your domain to browser-hardcoded HSTS lists, providing protection from the very
          first visit. <strong>X-Frame-Options: DENY</strong> prevents your pages from being embedded
          in iframes, which blocks clickjacking attacks where an attacker overlays a transparent iframe
          of your application on a malicious page to trick users into clicking buttons they cannot see.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>X-Content-Type-Options: nosniff</strong> prevents the browser from MIME-sniffing a
          response away from its declared content type, which can prevent certain attacks where an
          attacker uploads a file that the browser interprets as a script. The{' '}
          <strong>Permissions-Policy</strong> header restricts access to browser APIs like the camera,
          microphone, and geolocation, ensuring that even if an XSS vulnerability is exploited, the
          attacker cannot access sensitive device features.
        </p>
        <CodeBlock code={securityHeadersCode} filename="src/app.ts" />
        <InfoBlock variant="tip">
          Start with the default <code className="prose-code">helmet()</code> configuration and
          only relax specific directives as needed. The defaults are intentionally strict.
        </InfoBlock>
      </section>

      {/* CSRF Protection */}
      <section>
        <h2 id="csrf-protection" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          CSRF Protection
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor's CSRF middleware implements the double-submit cookie pattern by default. When the
          middleware initializes a session, it generates a cryptographically random token and stores
          it in a cookie. On each state-changing request (POST, PUT, DELETE), the middleware checks
          that the same token is present in either the <code className="prose-code">X-CSRF-Token</code>{' '}
          header or the <code className="prose-code">_csrf</code> body field. Because a cross-origin
          attacker cannot read the cookie value, they cannot reproduce the token in the header.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The synchronizer token pattern is an alternative that stores the CSRF secret in the
          server-side session rather than a cookie. It generates a unique token derived from the secret
          for each form render. This pattern is slightly more secure because the token never appears
          in a cookie (which could theoretically be leaked through subdomain attacks), but it requires
          server-side session infrastructure.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Safe HTTP methods (GET, HEAD, OPTIONS) are excluded from CSRF checks by default because they
          should not have side effects. If your GET endpoints do modify state, that is an HTTP
          semantics violation, and you should refactor them to use POST or PUT. You can also exclude
          specific paths (like webhook endpoints that authenticate via request signatures rather than
          cookies) using the <code className="prose-code">ignorePaths</code> option.
        </p>
        <CodeBlock code={csrfProtectionCode} filename="src/app.ts" />
        <InfoBlock variant="info">
          If your API is consumed only by Bearer-token authenticated clients (no cookies), CSRF
          protection is not necessary for those endpoints. Use{' '}
          <code className="prose-code">ignorePaths</code> to skip them.
        </InfoBlock>
      </section>

      {/* Input Sanitization */}
      <section>
        <h2 id="input-sanitization" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Input Validation and Sanitization
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Input validation and sanitization are complementary defenses that address different threats.
          <strong> Validation</strong> ensures that input conforms to an expected structure -- the right
          type, within acceptable length bounds, matching a known format. It rejects malformed input
          entirely. <strong>Sanitization</strong> transforms input to remove or neutralize dangerous
          content while preserving the safe parts. Validation prevents unexpected data from entering
          your system; sanitization prevents dangerous data from causing harm when it is rendered.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor's schema validation (via the <code className="prose-code">Type</code> module) handles
          the validation layer. Every route can declare schemas for params, query strings, request
          bodies, and headers. Requests that do not match the schema are automatically rejected with
          a 400 response, and the validated data is typed correctly in your handler. This eliminates
          an entire class of bugs where code assumes an input is a string but receives an object, or
          assumes a number is positive but receives a negative value.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">sanitize</code> function handles the sanitization layer,
          specifically for HTML content. When your application accepts rich text (blog posts, comments,
          forum content), you need to allow some HTML tags (paragraphs, bold, links) while stripping
          dangerous ones (scripts, event handlers, iframes). The sanitizer uses an allowlist approach:
          only explicitly permitted tags and attributes are kept; everything else is discarded. This
          is far safer than a denylist approach, which must enumerate every possible attack vector.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Never trust client-side validation as a security measure. Client-side checks improve user
          experience by providing immediate feedback, but they can be bypassed trivially by disabling
          JavaScript, using browser developer tools, or sending requests directly with curl. All
          security-relevant validation must be performed on the server.
        </p>
        <CodeBlock code={inputSanitizationCode} filename="src/routes/posts.ts" />
        <InfoBlock variant="warning">
          Never trust user input. Even if the frontend validates data, always validate and sanitize
          on the server. Client-side validation can be bypassed trivially.
        </InfoBlock>
      </section>

      {/* Secure Cookies */}
      <section>
        <h2 id="secure-cookies" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Secure Cookies
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Cookies are the most common mechanism for maintaining state between the browser and server,
          but they are also a frequent target for attacks. An attacker who steals a session cookie can
          impersonate the user. An attacker who tampers with a cookie's value can inject malicious data
          into your application. Proper cookie security attributes are essential for mitigating these
          risks.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">httpOnly</code> flag is your primary defense against
          XSS-based cookie theft. When set, the browser refuses to expose the cookie to JavaScript
          via <code className="prose-code">document.cookie</code>, which means that even a successful
          XSS attack cannot exfiltrate the cookie value. The <code className="prose-code">secure</code>{' '}
          flag ensures the cookie is only sent over HTTPS connections, preventing network eavesdropping.
          The <code className="prose-code">sameSite</code> attribute restricts cross-origin cookie
          sending, providing an additional layer of CSRF protection.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Signed cookies add integrity verification. When you set a signed cookie, Vexor computes an
          HMAC over the cookie's name and value using your secret key and appends the signature. When
          reading the cookie back, Vexor recomputes the HMAC and compares it. If the value has been
          tampered with, the signatures will not match and the cookie is rejected. This is essential
          for any cookie whose value influences application behavior (user preferences, feature flags,
          shopping cart references) but is not sensitive enough to warrant server-side session storage.
        </p>
        <CodeBlock code={secureCookiesCode} filename="src/routes/preferences.ts" />
      </section>

      {/* Secret Management */}
      <section>
        <h2 id="secret-management" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Secret Management
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Secrets -- JWT signing keys, database passwords, API keys, OAuth client secrets -- are the
          keys to your kingdom. A leaked secret can give an attacker the ability to forge authentication
          tokens, access your database, or impersonate your application to third-party services. Secret
          management is not just about keeping secrets out of source code; it is about establishing
          a complete lifecycle: generation, storage, rotation, and revocation.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The most fundamental rule is <strong>never commit secrets to version control</strong>.
          Environment variables are the standard mechanism for injecting secrets at runtime. Your{' '}
          <code className="prose-code">.env</code> file should be listed in{' '}
          <code className="prose-code">.gitignore</code>, and your CI/CD pipeline should inject secrets
          from a secure secrets manager (AWS Secrets Manager, Google Cloud Secret Manager, HashiCorp
          Vault, or Azure Key Vault). Even if you accidentally committed a secret in the past and
          later removed it, the secret remains in your Git history and should be considered compromised.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Validating required environment variables at startup is a simple but high-value practice.
          Without it, your application might start successfully but fail at runtime when it first
          tries to use a missing secret -- potentially hours later and with a confusing error message.
          By checking at startup, you get an immediate, clear failure that tells you exactly what is
          missing. Use different secrets for each environment (development, staging, production) so
          that compromising one environment does not affect the others.
        </p>
        <CodeBlock code={secretManagementCode} filename="src/config.ts" />
        <InfoBlock variant="warning">
          Add <code className="prose-code">.env</code> to your{' '}
          <code className="prose-code">.gitignore</code> file. Accidentally committing secrets to
          version control is one of the most common security mistakes.
        </InfoBlock>
      </section>

      {/* Security Checklist */}
      <section>
        <h2 id="security-checklist" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Security Checklist
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use this checklist before deploying to production. Each item addresses a specific attack
          vector or vulnerability. The checklist is organized by category, starting with the highest-impact
          items. Not every item applies to every application -- evaluate each one against your specific
          threat model and architecture.
        </p>
        <div className="space-y-6">
          {securityChecklistItems.map((group) => (
            <div key={group.category} className="card">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                {group.category}
              </h3>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span className="w-4 h-4 mt-0.5 shrink-0 rounded border border-slate-300 dark:border-slate-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Next Steps */}
      <section className="card bg-slate-50 dark:bg-slate-800/50">
        <h2 id="next" className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Next Steps
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/observability/metrics" className="btn-primary">
            Metrics & Monitoring <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/auth/authentication" className="btn-secondary">
            JWT Authentication
          </Link>
        </div>
      </section>
    </div>
  );
}
