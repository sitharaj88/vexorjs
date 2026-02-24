import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const basicUsageCode = `import { Vexor } from '@vexorjs/core';
import { cors } from '@vexorjs/core/middleware';

const app = new Vexor();

// Apply CORS with default options (allows all origins)
app.addHook('onRequest', cors());

// Or use the permissive shorthand
import { simpleCors } from '@vexorjs/core/middleware';
app.addHook('onRequest', simpleCors());

// Restrict to a single origin
app.addHook('onRequest', cors({
  origin: 'https://myapp.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.listen(3000);`;

const allowSpecificOriginsCode = `import { cors, corsWithOrigins } from '@vexorjs/core/middleware';

// Whitelist multiple origins
app.addHook('onRequest', corsWithOrigins([
  'https://myapp.com',
  'https://admin.myapp.com',
  'https://staging.myapp.com',
]));

// Dynamic origin based on request
app.addHook('onRequest', cors({
  origin: (requestOrigin: string) => {
    // Allow any subdomain of myapp.com
    if (requestOrigin.endsWith('.myapp.com')) {
      return requestOrigin;
    }

    // Allow localhost in development
    if (process.env.NODE_ENV === 'development') {
      if (requestOrigin.startsWith('http://localhost:')) {
        return requestOrigin;
      }
    }

    return false; // Reject other origins
  },
}));`;

const patternMatchingCode = `import { corsWithPattern } from '@vexorjs/core/middleware';

// Match origins with a regex pattern
app.addHook('onRequest', corsWithPattern(
  /^https:\\/\\/.*\\.myapp\\.com$/
));

// Multiple patterns
app.addHook('onRequest', cors({
  origin: (requestOrigin: string) => {
    const patterns = [
      /^https:\\/\\/.*\\.myapp\\.com$/,
      /^https:\\/\\/.*\\.myapp\\.dev$/,
      /^http:\\/\\/localhost:\\d+$/,
    ];

    const isAllowed = patterns.some((p) => p.test(requestOrigin));
    return isAllowed ? requestOrigin : false;
  },
}));`;

const credentialsCode = `import { cors } from '@vexorjs/core/middleware';

// Enable credentials (cookies, authorization headers)
app.addHook('onRequest', cors({
  origin: 'https://myapp.com',  // Must be specific, not '*'
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Request-Id', 'X-Total-Count'],
  maxAge: 86400,  // Cache preflight for 24 hours
}));

// The browser will now include cookies in cross-origin requests
// and the response headers listed in exposedHeaders will be
// accessible to client-side JavaScript.

app.get('/api/user', async (ctx) => {
  // Cookies are available in cross-origin requests
  const session = ctx.req.cookie('session_id');

  // These headers are readable by the browser
  ctx.header('X-Request-Id', crypto.randomUUID());
  ctx.header('X-Total-Count', '42');

  return ctx.json({ user: await getUser(session) });
});`;

const preflightCode = `import { cors } from '@vexorjs/core/middleware';

// CORS preflight happens automatically for:
// - Non-simple methods (PUT, DELETE, PATCH)
// - Custom headers
// - Content-Type other than form-data, text/plain, application/x-www-form-urlencoded

app.addHook('onRequest', cors({
  origin: 'https://myapp.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Request-Id',
    'X-Custom-Header',
  ],
  maxAge: 600,  // Cache preflight response for 10 minutes
}));

// The middleware automatically handles OPTIONS requests.
// For a PUT /api/users request, the browser first sends:
//
//   OPTIONS /api/users
//   Origin: https://myapp.com
//   Access-Control-Request-Method: PUT
//   Access-Control-Request-Headers: Content-Type, Authorization
//
// Vexor responds with 204 and appropriate CORS headers,
// then the browser proceeds with the actual PUT request.`;

const perRouteCode = `import { cors } from '@vexorjs/core/middleware';

// Different CORS policies for different route groups
const publicCors = cors({ origin: '*' });
const privateCors = cors({
  origin: 'https://myapp.com',
  credentials: true,
});

// Public API - allow all origins
const publicApi = app.group('/api/public', {
  preHandler: [publicCors],
});

publicApi.get('/status', async (ctx) => {
  return ctx.json({ status: 'ok' });
});

// Private API - restrict to specific origin
const privateApi = app.group('/api/private', {
  preHandler: [privateCors],
});

privateApi.get('/user', async (ctx) => {
  return ctx.json({ user: ctx.get('user') });
});`;

export default function Cors() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 id="cors" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          CORS
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          Cross-Origin Resource Sharing (CORS) is a browser security mechanism that controls which domains
          can make requests to your API. If you have ever seen the error "No 'Access-Control-Allow-Origin'
          header is present on the requested resource" in your browser console, you have encountered CORS
          enforcement. Vexor's CORS middleware handles the complex handshake between browser and server so
          your API responds with the correct headers, and your frontend can communicate with your backend
          across origins without friction.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          CORS exists because browsers enforce a security policy called the <strong>same-origin policy</strong>,
          which prevents JavaScript on one origin (e.g., <code className="prose-code">https://app.example.com</code>)
          from making requests to a different origin (e.g., <code className="prose-code">https://api.example.com</code>).
          This protects users from malicious websites that might try to read data from services the user is
          logged into. CORS provides a controlled way to relax this restriction: your server tells the browser
          which origins are allowed, which HTTP methods they can use, and which headers they can send.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Vexor provides flexible CORS configuration with support for static origin whitelists, regex-based
          pattern matching, dynamic origin validation functions, and per-route policies. The middleware
          handles both simple requests and the more complex preflight handshake automatically, so you only
          need to declare your policy and Vexor takes care of the HTTP-level details.
        </p>
      </div>

      {/* How It Works */}
      <section>
        <h2 id="how-it-works" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          How It Works
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The CORS protocol operates in two modes depending on the type of request the browser needs to make.
          For <strong>simple requests</strong> -- those using GET, HEAD, or POST with standard content types
          and no custom headers -- the browser sends the request directly with an{' '}
          <code className="prose-code">Origin</code> header. The CORS middleware inspects this header, checks
          it against your configuration, and if the origin is allowed, adds an{' '}
          <code className="prose-code">Access-Control-Allow-Origin</code> response header set to the allowed
          origin. If the origin is not allowed, the middleware omits the header and the browser blocks the
          response from being read by JavaScript.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For <strong>non-simple requests</strong> -- those using methods like PUT, DELETE, or PATCH, or
          sending custom headers like <code className="prose-code">Authorization</code> -- the browser
          performs a <strong>preflight</strong> check before the actual request. It sends an OPTIONS request
          with <code className="prose-code">Access-Control-Request-Method</code> and{' '}
          <code className="prose-code">Access-Control-Request-Headers</code> headers, asking the server
          whether the intended request is permitted. Vexor's CORS middleware intercepts this OPTIONS request,
          validates the method and headers against your configuration, and responds with the appropriate{' '}
          <code className="prose-code">Access-Control-Allow-*</code> headers and a 204 (No Content) status.
          Only after the preflight succeeds does the browser send the actual request.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">maxAge</code> option tells browsers how long (in seconds) they can
          cache the preflight response. Without caching, the browser sends a preflight OPTIONS request before
          every non-simple request, which doubles the latency for those calls. A reasonable{' '}
          <code className="prose-code">maxAge</code> (e.g., 600 seconds for 10 minutes, or 86400 for 24 hours)
          dramatically reduces this overhead in production. The browser stores the preflight result per
          origin+method+headers combination and reuses it for subsequent requests that match.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When <code className="prose-code">credentials: true</code> is set, the middleware adds the{' '}
          <code className="prose-code">Access-Control-Allow-Credentials: true</code> header, which tells
          the browser it is safe to include cookies and HTTP authentication in cross-origin requests. This
          is a sensitive setting with an important constraint: when credentials are enabled, the{' '}
          <code className="prose-code">Access-Control-Allow-Origin</code> header cannot be set to{' '}
          <code className="prose-code">*</code>. It must reflect the exact requesting origin. Vexor enforces
          this automatically -- if you set <code className="prose-code">credentials: true</code> with a
          wildcard origin, the middleware echoes back the specific requesting origin instead.
        </p>
      </section>

      {/* When to Use */}
      <section>
        <h2 id="when-to-use" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Choosing an Origin Strategy
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Use a wildcard (<code className="prose-code">*</code>)</strong> for truly public APIs that
          any website should be able to call -- for example, public data feeds, open status endpoints, or
          CDN-backed static assets. Wildcards cannot be combined with credentials, so this approach is only
          suitable for unauthenticated, read-only endpoints.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Use a static whitelist</strong> when you know all the domains that need access upfront. This
          is the most common pattern for web applications where your frontend is deployed to a known set
          of domains (production, staging, development). The <code className="prose-code">corsWithOrigins</code>{' '}
          helper makes this easy to set up and maintain.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Use a dynamic origin function</strong> when your allowed origins follow a pattern but cannot
          be enumerated statically -- for example, allowing any subdomain of your root domain, or allowing
          any origin in development mode. The function receives the requesting origin and returns either the
          allowed origin string or <code className="prose-code">false</code> to reject it.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Use regex pattern matching</strong> via <code className="prose-code">corsWithPattern</code> for
          convenient subdomain matching. This is essentially a specialized form of the dynamic function
          approach, optimized for the common case of pattern-based origin validation. Always anchor your
          patterns with <code className="prose-code">^</code> and <code className="prose-code">$</code> to
          prevent partial matches that could create security vulnerabilities.
        </p>
      </section>

      {/* Basic Usage */}
      <section>
        <h2 id="basic-usage" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Basic Usage
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">cors</code> middleware sets the appropriate response
          headers and handles preflight OPTIONS requests automatically. With no options, it allows
          all origins -- equivalent to setting <code className="prose-code">Access-Control-Allow-Origin: *</code>.
          This is convenient during development but should be restricted in production.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">simpleCors</code> shorthand is an alias for{' '}
          <code className="prose-code">cors()</code> with no arguments. Both produce identical behavior:
          they allow all origins, all standard methods, and reflect any requested headers. When you need
          to restrict access, pass an options object to <code className="prose-code">cors()</code> with
          the specific origin, methods, and headers your API supports.
        </p>
        <CodeBlock code={basicUsageCode} showLineNumbers />
        <InfoBlock variant="warning" title="Production Security">
          Avoid using <code className="prose-code">origin: '*'</code> in production. A wildcard allows
          any website on the internet to make requests to your API from user browsers, which can
          expose data to malicious sites. Always restrict origins to the specific domains that need
          access to your API.
        </InfoBlock>
      </section>

      {/* Allow Specific Origins */}
      <section>
        <h2 id="allow-specific-origins" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Allow Specific Origins
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The most common CORS configuration is a static whitelist of allowed origins. The{' '}
          <code className="prose-code">corsWithOrigins</code> helper accepts an array of origin strings
          and automatically handles the matching logic. When a request arrives, the middleware checks the{' '}
          <code className="prose-code">Origin</code> header against the list, and if it matches, reflects
          that specific origin back in the <code className="prose-code">Access-Control-Allow-Origin</code>{' '}
          response header. If the origin is not in the list, the CORS header is omitted entirely.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For more complex scenarios, you can pass a function to the <code className="prose-code">origin</code>{' '}
          option. This function is called for every request with the value of the{' '}
          <code className="prose-code">Origin</code> header, and it must return either the allowed origin
          string or <code className="prose-code">false</code>. This is useful for environments where the
          allowed origins change dynamically -- for example, allowing localhost with any port in development,
          or loading the whitelist from a database or environment variable.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Note that the origin string must match exactly, including the protocol and port. For example,{' '}
          <code className="prose-code">https://myapp.com</code> and{' '}
          <code className="prose-code">http://myapp.com</code> are different origins, as are{' '}
          <code className="prose-code">https://myapp.com</code> and{' '}
          <code className="prose-code">https://myapp.com:443</code> (even though port 443 is the default
          for HTTPS). When in doubt, check the exact origin your browser sends by inspecting the{' '}
          <code className="prose-code">Origin</code> header in your browser's network tab.
        </p>
        <CodeBlock code={allowSpecificOriginsCode} showLineNumbers />
      </section>

      {/* Pattern Matching */}
      <section>
        <h2 id="pattern-matching" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Pattern Matching
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When your allowed origins follow a predictable pattern -- such as all subdomains of a root domain --
          regex-based matching is more maintainable than listing every possible subdomain. The{' '}
          <code className="prose-code">corsWithPattern</code> helper accepts a regular expression and tests
          each incoming origin against it. If the pattern matches, the specific requesting origin is reflected
          in the response header.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Regex-based CORS matching requires careful attention to security. An unanchored pattern like{' '}
          <code className="prose-code">/\.myapp\.com/</code> would match{' '}
          <code className="prose-code">https://evil-myapp.com</code> because the pattern does not assert the
          start of the string. Always use <code className="prose-code">^</code> and{' '}
          <code className="prose-code">$</code> anchors, and escape dots properly. The pattern{' '}
          <code className="prose-code">{`/^https:\\/\\/.*\\.myapp\\.com$/`}</code> correctly matches only
          HTTPS subdomains of <code className="prose-code">myapp.com</code> and rejects look-alike domains.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For situations where you need to match against multiple patterns, combine them in a dynamic origin
          function that tests the origin against each pattern in sequence. This gives you the convenience of
          regex matching with the flexibility to handle multiple domain families, different protocols for
          development versus production, and any other combination of rules.
        </p>
        <CodeBlock code={patternMatchingCode} showLineNumbers />
        <InfoBlock variant="tip" title="Regex Safety">
          Anchor your regex patterns with <code className="prose-code">^</code> and{' '}
          <code className="prose-code">$</code> to prevent partial matches. For example,{' '}
          <code className="prose-code">/\.myapp\.com$/</code> would also match{' '}
          <code className="prose-code">evil-myapp.com</code> because the dot is not anchored at a
          subdomain boundary. Consider using a pattern like{' '}
          <code className="prose-code">{`/^https:\\/\\/[a-z0-9-]+\\.myapp\\.com$/`}</code> for stricter
          subdomain validation.
        </InfoBlock>
      </section>

      {/* Credentials & Cookies */}
      <section>
        <h2 id="credentials" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Credentials & Cookies
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          By default, browsers do not include cookies or HTTP authentication headers in cross-origin
          requests. This is a deliberate security measure: without it, any website could make
          authenticated requests to services the user is logged into, potentially reading or modifying
          private data. To opt into sending credentials cross-origin, both the client and server must
          explicitly agree.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          On the server side, you enable this by setting <code className="prose-code">credentials: true</code>,
          which adds the <code className="prose-code">Access-Control-Allow-Credentials: true</code> header
          to responses. On the client side, the fetch call must include{' '}
          <code className="prose-code">credentials: 'include'</code> (or the equivalent in your HTTP library).
          Both sides must opt in for cookies to be sent. There is an important constraint: when credentials
          are enabled, the <code className="prose-code">Access-Control-Allow-Origin</code> header must be
          set to a specific origin, not <code className="prose-code">*</code>. Browsers enforce this
          strictly and will reject the response if the header is a wildcard.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">exposedHeaders</code> option controls which response headers
          are accessible to JavaScript running in the browser. By default, browsers only expose a small
          set of "CORS-safelisted" response headers (Cache-Control, Content-Language, Content-Type,
          Expires, Last-Modified, Pragma). If your API returns custom headers like{' '}
          <code className="prose-code">X-Request-Id</code> or{' '}
          <code className="prose-code">X-Total-Count</code> that the frontend needs to read, you must
          list them in <code className="prose-code">exposedHeaders</code>.
        </p>
        <CodeBlock code={credentialsCode} showLineNumbers />
        <InfoBlock variant="info" title="Exposed Headers">
          By default, browsers only expose a limited set of response headers to JavaScript.
          Use <code className="prose-code">exposedHeaders</code> to make custom headers
          readable on the client side. This is commonly needed for pagination headers, request
          tracing IDs, and rate limit information.
        </InfoBlock>
      </section>

      {/* Preflight */}
      <section>
        <h2 id="preflight" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Preflight Requests
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Browsers send a preflight OPTIONS request before making cross-origin requests that use
          non-simple methods (PUT, DELETE, PATCH) or include custom headers (like{' '}
          <code className="prose-code">Authorization</code>). The preflight is the browser's way
          of asking the server "is this request going to be allowed?" before actually sending it.
          Vexor's CORS middleware intercepts these OPTIONS requests automatically and responds with
          the appropriate headers based on your configuration.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">maxAge</code> option is critical for performance. Without it,
          browsers send a preflight request before every non-simple cross-origin request, effectively
          doubling the number of HTTP round trips for PUT, DELETE, and PATCH operations. Setting{' '}
          <code className="prose-code">maxAge</code> to a reasonable value (600 for 10 minutes during
          development, 86400 for 24 hours in production) lets browsers cache the preflight result and
          skip the OPTIONS request for subsequent calls to the same endpoint with the same method and
          headers.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">allowedHeaders</code> option must include every custom
          header your client will send. If the client sends an{' '}
          <code className="prose-code">Authorization</code> header but it is not listed in{' '}
          <code className="prose-code">allowedHeaders</code>, the preflight will fail and the browser
          will not send the actual request. When debugging CORS issues, always check that the
          headers listed in the preflight request's{' '}
          <code className="prose-code">Access-Control-Request-Headers</code> are included in your{' '}
          <code className="prose-code">allowedHeaders</code> configuration.
        </p>
        <CodeBlock code={preflightCode} showLineNumbers />
      </section>

      {/* Per-Route CORS */}
      <section>
        <h2 id="per-route-cors" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Per-Route Policies
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Not every endpoint in your API needs the same CORS policy. Public endpoints that serve
          open data can use a permissive wildcard origin, while private endpoints that handle
          user data should restrict access to your own frontend domains and enable credentials.
          Vexor supports this by letting you create multiple CORS middleware instances with
          different configurations and apply them to different route groups.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When using per-route CORS, avoid also applying a global CORS middleware with{' '}
          <code className="prose-code">addHook('onRequest', cors(...))</code>, as the global
          middleware would run first and set headers that may conflict with your route-specific
          configuration. Instead, apply CORS at the route group level using{' '}
          <code className="prose-code">preHandler</code>, which gives you precise control over
          which policy applies to which routes.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          A common architecture is to have three tiers: a public CORS policy for open endpoints
          (wildcard origin, no credentials), a private CORS policy for authenticated endpoints
          (specific origins, credentials enabled), and a restrictive policy for admin endpoints
          (admin domain only, credentials enabled, minimal exposed headers). Route groups make
          this straightforward to implement and maintain.
        </p>
        <CodeBlock code={perRouteCode} showLineNumbers />
      </section>

      {/* Best Practices */}
      <section>
        <h2 id="best-practices" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Best Practices
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Start restrictive, then open up.</strong> Begin with a specific origin whitelist and
          only allow additional origins as needed. It is much safer to start with a deny-by-default
          policy and grant access explicitly than to start with a wildcard and try to restrict later.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Cache preflight responses aggressively.</strong> Set{' '}
          <code className="prose-code">maxAge</code> to at least 600 seconds (10 minutes) in production.
          Preflight caching has no security downside -- it only means the browser does not re-check
          the CORS policy as frequently -- and it significantly reduces latency for PUT, DELETE, and
          PATCH operations.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Be explicit about allowed headers.</strong> Rather than reflecting all requested
          headers (the default behavior when <code className="prose-code">allowedHeaders</code> is
          not set), list the specific headers your API expects. This acts as an additional layer of
          documentation and prevents unexpected headers from being passed through.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Use the Vary header correctly.</strong> When your CORS response varies by origin
          (which it does whenever you use a whitelist or dynamic function rather than a fixed string),
          the <code className="prose-code">Vary: Origin</code> header should be present to prevent
          caches from serving incorrect CORS headers. Vexor adds this automatically when the origin
          is dynamic.
        </p>
      </section>

      {/* API Reference */}
      <section>
        <h2 id="api-reference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          API Reference
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          The CORS module provides the main <code className="prose-code">cors</code> middleware factory along
          with several convenience helpers for common origin validation patterns. All functions return a
          Vexor middleware suitable for use with <code className="prose-code">addHook</code> or{' '}
          <code className="prose-code">preHandler</code>.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">
          cors(options)
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Creates a CORS middleware with the specified configuration. The middleware handles both simple
          requests (adding CORS headers to the response) and preflight OPTIONS requests (responding with
          a 204 and the appropriate access control headers). When called with no arguments, it uses
          permissive defaults that allow all origins.
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
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">origin</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">string | string[] | RegExp | (origin: string) =&gt; string | false</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">'*'</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Determines which origins are allowed to access your API. A string value is used directly as the Access-Control-Allow-Origin header. An array of strings is treated as a whitelist -- the middleware checks the incoming Origin header against the list and reflects the matching origin. A RegExp tests the origin and reflects it if it matches. A function receives the origin string and must return either the allowed origin or false to reject it. When set to '*', all origins are allowed but credentials cannot be used.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">methods</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">string[]</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE']</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The HTTP methods allowed for cross-origin requests. This list is sent in the Access-Control-Allow-Methods header during preflight responses. Only include methods your API actually supports -- listing methods that do not exist on your routes can be misleading and may mask 405 errors behind CORS failures.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">allowedHeaders</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">string[]</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Reflects request headers</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The request headers that are permitted in cross-origin requests. This is sent in the Access-Control-Allow-Headers header during preflight. If not specified, the middleware reflects whatever headers the browser requests (from Access-Control-Request-Headers), which is permissive but convenient during development. In production, explicitly list the headers your API expects for better security and documentation.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">exposedHeaders</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">string[]</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">[]</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Response headers that should be accessible to JavaScript in the browser. By default, browsers only expose a small set of "CORS-safelisted" response headers. If your API returns custom headers (like X-Request-Id, X-Total-Count, or rate limit headers) that the frontend needs to read, they must be listed here. This is sent as the Access-Control-Expose-Headers header.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">credentials</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">boolean</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">false</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">When true, the middleware adds Access-Control-Allow-Credentials: true to responses, which tells the browser it is safe to include cookies and HTTP authentication in cross-origin requests. When credentials are enabled, the origin must be a specific value -- browsers reject responses with Access-Control-Allow-Origin: * when credentials are in use. The client must also opt in by setting credentials: 'include' in the fetch options.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">maxAge</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">-</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">How long, in seconds, the browser should cache the preflight response. This is sent as the Access-Control-Max-Age header. When set, the browser skips the preflight OPTIONS request for subsequent calls to the same endpoint with the same method and headers, significantly reducing latency. Set to 600 (10 minutes) during development and up to 86400 (24 hours) in production. If omitted, each non-simple request triggers a new preflight.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Helper Functions
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          These convenience functions create pre-configured CORS middleware for common origin validation
          patterns. Each returns a standard Vexor middleware function.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Function</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Signature</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">simpleCors</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">() =&gt; Middleware</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Creates a permissive CORS middleware that allows all origins, all standard methods, and reflects any requested headers. Equivalent to calling cors() with no arguments. Convenient for development and public APIs, but not recommended for production endpoints that handle sensitive data.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">corsWithOrigins</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(origins: string[]) =&gt; Middleware</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Creates a CORS middleware that only allows the specified origins. The middleware checks the incoming Origin header against the array and reflects the matching origin in the response. If the origin is not in the array, CORS headers are omitted and the browser blocks the response. Origins must match exactly, including protocol and port.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">corsWithPattern</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(pattern: RegExp) =&gt; Middleware</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Creates a CORS middleware that allows origins matching the provided regular expression. The middleware tests the incoming Origin header against the pattern and reflects the origin if it matches. Always use anchored patterns (^ and $) to prevent partial matches that could allow unintended origins through.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Next Steps */}
      <section className="card bg-slate-50 dark:bg-slate-800/50">
        <h2 id="next-steps" className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Next Steps
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/middleware/compression" className="btn-primary">
            Compression Middleware <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/middleware" className="btn-secondary">
            Middleware Overview
          </Link>
        </div>
      </section>
    </div>
  );
}
