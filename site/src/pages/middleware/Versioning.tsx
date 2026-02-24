import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const basicUsageCode = `import { Vexor } from '@vexorjs/core';
import { versioning, getApiVersion } from '@vexorjs/core/middleware';

const app = new Vexor();

// Extract API version from requests using URL path strategy
app.addHook('onRequest', versioning({
  strategy: 'path',
  prefix: '/api/v',        // Matches /api/v1, /api/v2, etc.
  defaultVersion: '1',     // Fallback when no version found
  responseHeader: 'X-API-Version',
}));

// Access the resolved version in handlers
app.get('/api/v:version/users', async (ctx) => {
  const version = getApiVersion(ctx);

  if (version === '2') {
    return ctx.json({ users: await getUsersV2() });
  }

  return ctx.json({ users: await getUsersV1() });
});

app.listen(3000);`;

const pathVersioningCode = `import { versioning, getApiVersion, isVersion } from '@vexorjs/core/middleware';

// Path-based versioning: /api/v1/..., /api/v2/...
app.addHook('onRequest', versioning({
  strategy: 'path',
  prefix: '/api/v',
  defaultVersion: '1',
}));

// Version-specific behavior in handlers
app.get('/api/v:version/products', async (ctx) => {
  const products = await getProducts();

  // v1 returns a flat list
  if (isVersion(ctx, '1')) {
    return ctx.json(products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
    })));
  }

  // v2 returns paginated results with metadata
  if (isVersion(ctx, '2')) {
    const { page = 1, limit = 20 } = ctx.query;
    const paginated = products.slice((page - 1) * limit, page * limit);

    return ctx.json({
      data: paginated,
      meta: {
        total: products.length,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(products.length / limit),
      },
    });
  }

  return ctx.status(400).json({ error: \`Unsupported version: \${getApiVersion(ctx)}\` });
});`;

const headerVersioningCode = `import { versioning, getApiVersion } from '@vexorjs/core/middleware';

// Header-based versioning: X-API-Version: 2
app.addHook('onRequest', versioning({
  strategy: 'header',
  header: 'X-API-Version',
  defaultVersion: '1',
}));

// Query-based versioning: ?api-version=2
app.addHook('onRequest', versioning({
  strategy: 'query',
  queryParam: 'api-version',
  defaultVersion: '1',
}));

// Media type versioning: Accept: application/vnd.myapp.v2+json
app.addHook('onRequest', versioning({
  strategy: 'media-type',
  vendor: 'myapp',
  defaultVersion: '1',
}));

// Custom extraction strategy
app.addHook('onRequest', versioning({
  strategy: 'custom',
  extractor: (ctx) => {
    // Extract version from a JWT claim
    const user = ctx.get('user');
    return user?.apiVersion || '1';
  },
  defaultVersion: '1',
}));`;

const versionRouterCode = `import { versioning, createVersionRouter } from '@vexorjs/core/middleware';

app.addHook('onRequest', versioning({
  strategy: 'header',
  header: 'X-API-Version',
  defaultVersion: '1',
}));

// Create a version router that dispatches to the correct handler
const usersRouter = createVersionRouter({
  versions: {
    '1': {
      get: async (ctx) => {
        const users = await db.select({ id: users.id, name: users.name })
          .from(users);
        return ctx.json(users);
      },
      post: async (ctx) => {
        const user = await db.insert(users).values(ctx.body).returning();
        return ctx.status(201).json(user);
      },
    },
    '2': {
      get: async (ctx) => {
        const { page = 1, limit = 20, sort = 'name' } = ctx.query;
        const result = await db.select()
          .from(users)
          .orderBy(users[sort])
          .limit(limit)
          .offset((page - 1) * limit);

        return ctx.json({
          data: result,
          pagination: { page: Number(page), limit: Number(limit) },
        });
      },
      post: async (ctx) => {
        // V2 includes email verification
        const user = await db.insert(users).values(ctx.body).returning();
        await sendVerificationEmail(user.email);
        return ctx.status(201).json({ ...user, verificationSent: true });
      },
    },
  },
  fallback: '1',  // Use v1 handler for unknown versions
});

// Mount the version router
app.get('/api/users', usersRouter.get);
app.post('/api/users', usersRouter.post);`;

const deprecationCode = `import { versioning, deprecated, getApiVersion } from '@vexorjs/core/middleware';

app.addHook('onRequest', versioning({
  strategy: 'header',
  header: 'X-API-Version',
  defaultVersion: '2',
  responseHeader: 'X-API-Version',
}));

// Mark v1 endpoints as deprecated
app.get('/api/users', {
  preHandler: [deprecated(
    'API v1 is deprecated. Please migrate to v2.',
    new Date('2025-06-01'),  // Sunset date
  )],
}, async (ctx) => {
  // The deprecated middleware adds these headers:
  //   Deprecation: true
  //   Sunset: Sat, 01 Jun 2025 00:00:00 GMT
  //   Link: </api/v2/users>; rel="successor-version"
  //   X-Deprecated-Message: API v1 is deprecated...

  const version = getApiVersion(ctx);

  if (version === '1') {
    return ctx.json(await getUsersV1());
  }

  return ctx.json(await getUsersV2());
});

// Apply deprecation to an entire group
const v1Api = app.group('/api/v1', {
  preHandler: [deprecated(
    'v1 API will be removed on June 1, 2025',
    new Date('2025-06-01'),
  )],
});

v1Api.get('/users', async (ctx) => {
  return ctx.json(await getUsersV1());
});

v1Api.get('/products', async (ctx) => {
  return ctx.json(await getProductsV1());
});`;

export default function Versioning() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 id="api-versioning" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          API Versioning
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          APIs evolve. New fields get added, response formats change, endpoints get restructured, and
          breaking changes become unavoidable as your product grows. API versioning lets you make these
          changes without breaking existing clients. By maintaining multiple versions simultaneously, you
          give consumers time to migrate to the new version on their own schedule while continuing to
          serve their existing integrations without interruption.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor's versioning middleware extracts the API version from each incoming request, makes it
          available to your route handlers, and optionally echoes it back in response headers. The
          middleware supports five versioning strategies out of the box -- URL path, HTTP header, query
          parameter, media type (content negotiation), and a fully custom extractor -- so you can adopt
          the approach that best fits your API's design philosophy and your consumers' expectations.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Beyond version extraction, Vexor provides a version router for cleanly organizing version-specific
          handler logic, and a deprecation middleware for signaling to consumers that an old version is
          approaching end-of-life. Together, these tools give you a complete lifecycle management system
          for your API versions: introduce new versions, route traffic to the right handlers, and gracefully
          retire old versions with standard HTTP deprecation headers.
        </p>
      </div>

      {/* How It Works */}
      <section>
        <h2 id="how-it-works" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          How It Works
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The versioning middleware runs as an <code className="prose-code">onRequest</code> hook, which means
          it executes before any route handler or pre-handler middleware. For each incoming request, the
          middleware uses the configured strategy to extract a version string from the request. For the{' '}
          <code className="prose-code">path</code> strategy, it parses the URL path looking for the configured
          prefix pattern. For the <code className="prose-code">header</code> strategy, it reads the specified
          request header. For <code className="prose-code">query</code>, it extracts the version from a query
          parameter. For <code className="prose-code">media-type</code>, it parses the Accept header for a
          vendor-prefixed media type.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Once extracted, the version string is stored on the request context where it can be retrieved by
          any subsequent middleware or handler using <code className="prose-code">getApiVersion(ctx)</code>.
          If the middleware cannot find a version in the request (for example, the header is missing or the
          URL does not contain a version prefix), it falls back to the configured{' '}
          <code className="prose-code">defaultVersion</code>. This fallback ensures that clients who do not
          specify a version still get a deterministic response, and it makes version adoption gradual --
          existing clients that do not send version information continue to work exactly as before.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When <code className="prose-code">responseHeader</code> is configured, the middleware adds the
          resolved version to the specified response header on every response. This is valuable for debugging:
          clients can inspect the response to confirm which version served their request, which is especially
          useful when using default versions or during migration periods where the version might not be
          what the developer expects.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The version router (<code className="prose-code">createVersionRouter</code>) builds on top of this
          system by providing a declarative way to map version strings to handler functions. Instead of
          writing <code className="prose-code">if (version === '1')</code> branches in every handler, you
          define a structured map of versions to handlers, and the router dispatches automatically based on
          the resolved version. This keeps your version-specific logic isolated and makes it easy to add
          or remove versions without touching other code.
        </p>
      </section>

      {/* When to Use */}
      <section>
        <h2 id="when-to-use" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Choosing a Versioning Strategy
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Path versioning (<code className="prose-code">/api/v1/...</code>)</strong> is the most
          widely used strategy and the best choice for most public APIs. The version is visible in the URL,
          which makes it immediately obvious in logs, documentation, browser address bars, and curl
          commands. Developers can see the version at a glance, and caching proxies can easily route
          requests to different backend versions based on the URL path. The main drawback is that the
          version becomes part of the URL structure, which makes URL patterns slightly more complex and
          means resource URLs change between versions.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Header versioning (<code className="prose-code">X-API-Version: 2</code>)</strong> keeps
          URLs clean and version-independent. The same URL always refers to the same resource, regardless
          of version. This is preferred by APIs that follow strict REST principles, since the URL identifies
          the resource and the version is metadata about the desired representation. The drawback is that
          the version is invisible in URLs, which makes browser testing and link sharing harder. Header
          versioning works best for internal APIs and SDKs where the version is set programmatically.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Query parameter versioning (<code className="prose-code">?api-version=2</code>)</strong> is
          a pragmatic middle ground. The version is visible in URLs but does not change the path structure.
          This approach is used by Azure's REST APIs and others that want URL visibility without path
          complexity. It is easy to test in a browser by appending the query parameter. The drawback is
          that query parameters can be lost in URL transformations and are sometimes treated differently by
          caching layers.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Media type versioning (<code className="prose-code">Accept: application/vnd.myapp.v2+json</code>)</strong>{' '}
          is the most "RESTful" approach, using content negotiation to select the API version. This is used
          by GitHub's API and is considered the purest approach from an HTTP design perspective. However, it
          is the hardest to test manually (you need to set custom Accept headers) and the least intuitive
          for developers unfamiliar with content negotiation. Use this for APIs where strict REST compliance
          is a priority.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Custom extraction</strong> is available for any strategy not covered by the built-in
          options. The custom extractor receives the full request context and returns a version string. This
          is useful for exotic strategies like extracting the version from a JWT claim, a subdomain, a
          cookie, or any other request attribute.
        </p>
      </section>

      {/* Basic Usage */}
      <section>
        <h2 id="basic-usage" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Basic Usage
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">versioning</code> middleware extracts the API version
          from each request using a configurable strategy and makes it available to your handlers
          via <code className="prose-code">getApiVersion(ctx)</code>. Register it as a global{' '}
          <code className="prose-code">onRequest</code> hook so the version is available to all
          downstream middleware and handlers.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">defaultVersion</code> determines what happens when a request
          does not include version information. Setting it to your oldest supported version ensures backward
          compatibility: existing clients that predate your versioning scheme continue to get the same
          responses they always have. Setting it to your latest version is riskier but encourages adoption
          of the newest API features.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">responseHeader</code> option is strongly recommended. Including
          the resolved version in every response makes debugging significantly easier, especially when
          clients are migrating between versions or when the default version changes. Clients can
          programmatically check which version served their request without relying on response body
          differences.
        </p>
        <CodeBlock code={basicUsageCode} showLineNumbers />
        <InfoBlock variant="info" title="Version Response Header">
          When <code className="prose-code">responseHeader</code> is set, the resolved version
          is included in every response, making it easy for clients to confirm which version
          served their request. This is especially valuable during migration periods and for
          debugging version-related issues.
        </InfoBlock>
      </section>

      {/* Path Versioning */}
      <section>
        <h2 id="path-versioning" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Path Versioning
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Path versioning embeds the version directly in the URL path, such as{' '}
          <code className="prose-code">/api/v1/products</code> or{' '}
          <code className="prose-code">/api/v2/products</code>. The middleware uses the configured{' '}
          <code className="prose-code">prefix</code> to identify the version segment and extracts the
          version number that follows it. For a prefix of{' '}
          <code className="prose-code">/api/v</code>, the URL{' '}
          <code className="prose-code">/api/v2/products</code> resolves to version{' '}
          <code className="prose-code">'2'</code>.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          In your route definitions, use a path parameter to capture the version segment (e.g.,{' '}
          <code className="prose-code">/api/v:version/products</code>). The versioning middleware has
          already extracted and stored the version by the time your handler runs, so you can use the
          helper functions <code className="prose-code">getApiVersion(ctx)</code> and{' '}
          <code className="prose-code">isVersion(ctx, '2')</code> to branch your logic. The{' '}
          <code className="prose-code">isVersion</code> helper is a convenience function that compares
          the resolved version with a given string, making conditional version checks more readable.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When a version is not recognized by your handler, always return a clear error message with the
          unsupported version value. This helps developers diagnose integration issues quickly instead of
          receiving unexpected 404 errors or falling through to a wrong code path. For forward
          compatibility, consider using the fallback version (via the version router) rather than
          rejecting unknown versions outright.
        </p>
        <CodeBlock code={pathVersioningCode} showLineNumbers />
        <InfoBlock variant="tip" title="Choosing a Strategy">
          Path versioning is recommended for public APIs because it is the most explicit and
          easiest to understand. Developers can see the version in every URL, and it works
          seamlessly with browsers, curl, and API documentation tools. Header or media type
          versioning is better for internal APIs where cleaner URLs are preferred.
        </InfoBlock>
      </section>

      {/* Header Versioning */}
      <section>
        <h2 id="header-versioning" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Header, Query & Media Type Versioning
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor supports four additional versioning strategies beyond URL paths. Each one extracts the
          version from a different part of the request, and all of them work identically once the version
          is extracted -- the same <code className="prose-code">getApiVersion</code>,{' '}
          <code className="prose-code">isVersion</code>, version router, and deprecation tools work
          with any strategy.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">header</code> strategy reads the version from a custom request
          header. The <code className="prose-code">query</code> strategy extracts it from a URL query
          parameter. The <code className="prose-code">media-type</code> strategy parses the Accept header
          for a vendor-prefixed content type following the pattern{' '}
          <code className="prose-code">application/vnd.{'{vendor}'}.v{'{version}'}+json</code>. The{' '}
          <code className="prose-code">custom</code> strategy calls your extractor function with the
          full request context, giving you complete control over where the version comes from.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          You can only use one versioning strategy per application. If you register the versioning
          middleware multiple times with different strategies, the last one wins. If your API needs to
          support multiple version extraction methods (for example, path versioning for public clients
          and header versioning for internal clients), use the <code className="prose-code">custom</code>{' '}
          strategy with a function that checks multiple sources in priority order.
        </p>
        <CodeBlock code={headerVersioningCode} showLineNumbers />
      </section>

      {/* Version Router */}
      <section>
        <h2 id="version-router" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Version Router
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          As your API grows to multiple versions with many endpoints, managing version-specific logic
          with inline <code className="prose-code">if</code> statements becomes unwieldy. The version
          router provides a declarative alternative: you define a structured map of versions to handler
          functions, and the router dispatches the request to the correct handler based on the resolved
          version.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">createVersionRouter</code> function accepts a{' '}
          <code className="prose-code">versions</code> object where keys are version strings and values
          are objects mapping HTTP methods to handler functions. The resulting router object has properties
          for each HTTP method (get, post, put, delete, patch) that you mount on your routes. When a
          request arrives, the router reads the version from the context, looks up the corresponding
          handler, and executes it.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">fallback</code> option determines what happens when a request
          specifies a version that does not have a dedicated handler in the router. Setting fallback to{' '}
          <code className="prose-code">'1'</code> means that unknown versions will use the v1 handler,
          which provides backward compatibility. Setting it to your latest version encourages forward
          compatibility. In either case, the fallback prevents hard errors when a client sends an
          unexpected version.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          This pattern scales well: adding a new version means adding a new entry to the versions object
          without touching existing handlers. Removing an old version means deleting its entry and
          optionally updating the fallback. Each version's code is completely isolated, making it easy
          to test, reason about, and eventually delete when the version is sunset.
        </p>
        <CodeBlock code={versionRouterCode} showLineNumbers />
        <InfoBlock variant="info" title="Fallback Version">
          The <code className="prose-code">fallback</code> option determines which version handler
          is used when a request specifies a version that has no dedicated handler. Set it
          to your latest stable version for forward compatibility, or to your oldest version
          for backward compatibility. Choose based on whether unknown versions are more likely
          to be new clients testing a future version or old clients sending outdated values.
        </InfoBlock>
      </section>

      {/* Deprecation */}
      <section>
        <h2 id="deprecation" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Deprecation
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Deprecation is the final stage of a version's lifecycle. When you decide to retire an old API
          version, you need to communicate this to consumers well in advance, give them a clear migration
          timeline, and continue serving the old version until the sunset date. The{' '}
          <code className="prose-code">deprecated</code> middleware automates this communication by adding
          standard HTTP deprecation headers to every response from deprecated endpoints.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The middleware adds four headers to responses: <code className="prose-code">Deprecation: true</code>{' '}
          signals that the endpoint is deprecated (following the draft-ietf-httpapi-deprecation-header
          specification), <code className="prose-code">Sunset</code> provides the date when the endpoint
          will stop working (following RFC 8594), <code className="prose-code">Link</code> points to the
          successor version with a <code className="prose-code">rel="successor-version"</code> relation,
          and <code className="prose-code">X-Deprecated-Message</code> provides a human-readable
          deprecation message. Well-designed API clients and SDKs can detect these headers and warn
          developers automatically.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          You can apply deprecation at the individual route level or to an entire route group. Applying
          it to a group is efficient for deprecating an entire API version at once -- every endpoint in
          the group automatically gets the deprecation headers. This is the recommended approach because
          it ensures no endpoint in the old version accidentally misses the deprecation signal.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Plan your deprecation timeline carefully. A typical timeline for a public API is: announce
          deprecation 6-12 months before the sunset date, begin logging deprecation header warnings in
          client SDKs, send direct notifications to high-traffic consumers, and finally remove the old
          version after the sunset date. For internal APIs, timelines can be shorter (1-3 months), but
          always communicate clearly through the deprecation headers and direct channels.
        </p>
        <CodeBlock code={deprecationCode} showLineNumbers />
        <InfoBlock variant="warning" title="Sunset Planning">
          Always communicate deprecation timelines well in advance. The{' '}
          <code className="prose-code">Sunset</code> header follows RFC 8594 and lets clients
          programmatically detect upcoming removals. Combine these headers with direct communication
          (emails, changelog entries, dashboard warnings) for the most effective migration experience.
        </InfoBlock>
      </section>

      {/* Best Practices */}
      <section>
        <h2 id="best-practices" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Best Practices
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Version only when you must.</strong> Not every change requires a new version. Additive
          changes (new fields in responses, new optional parameters, new endpoints) are usually backward
          compatible. Reserve version increments for genuinely breaking changes: removing fields, renaming
          fields, changing response structures, changing error formats, or altering the semantics of
          existing parameters.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Support at most two or three versions simultaneously.</strong> Each active version is
          code you must maintain, test, and deploy. Supporting too many versions creates a combinatorial
          explosion of test scenarios and makes it hard to reason about your API's behavior. Aim to
          sunset old versions aggressively, using the deprecation middleware to give consumers clear
          timelines.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Use the version router for clean separation.</strong> Inline version checks
          (<code className="prose-code">if (version === '1')</code>) work for simple cases but become
          hard to maintain as versions multiply. The version router keeps each version's logic in its
          own function, making it easy to add, test, and remove versions independently.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Always set a default version.</strong> The default version ensures that clients who
          do not send version information get a predictable response. Pin the default to a specific
          version (usually the oldest still supported) rather than "latest," so that deploying a new
          version does not unexpectedly break clients who rely on the default.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Include the version in response headers.</strong> The{' '}
          <code className="prose-code">responseHeader</code> option adds no measurable overhead but
          provides significant debugging value. Every response tells the client exactly which version
          served it, eliminating guesswork during migrations and troubleshooting.
        </p>
      </section>

      {/* API Reference */}
      <section>
        <h2 id="api-reference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          API Reference
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          The versioning module provides the main <code className="prose-code">versioning</code> middleware
          for extracting API versions from requests, a <code className="prose-code">createVersionRouter</code>{' '}
          function for declarative version-based routing, helper functions for reading version information
          in handlers, and a <code className="prose-code">deprecated</code> middleware for signaling
          version end-of-life.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">
          versioning(options)
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Creates a middleware that extracts the API version from each request using the configured strategy
          and stores it on the request context. The version is available to all downstream middleware and
          handlers via <code className="prose-code">getApiVersion(ctx)</code>. Register this as a global{' '}
          <code className="prose-code">onRequest</code> hook.
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
                <td className="py-3 px-4"><code className="prose-code">strategy</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">'path' | 'header' | 'query' | 'media-type' | 'custom'</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">'path'</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Determines where the middleware looks for the version in each request. 'path' extracts from the URL path using the prefix option. 'header' reads from the specified request header. 'query' extracts from a URL query parameter. 'media-type' parses the Accept header for a vendor-prefixed content type. 'custom' calls your extractor function with the full request context.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">defaultVersion</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">string</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">'1'</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The version to use when the request does not contain version information. This applies when the header is missing, the URL has no version prefix, or the query parameter is absent. Pin this to a specific version (usually your oldest supported version) to ensure backward compatibility. Changing the default is a breaking change for clients that rely on it.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">header</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">string</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">'X-API-Version'</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The name of the request header to read when using the 'header' strategy. The middleware reads this header's value as the version string. Custom header names should follow the X- prefix convention. Only used when strategy is 'header'.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">queryParam</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">string</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">'api-version'</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The name of the URL query parameter to read when using the 'query' strategy. For example, with the default value, the URL /api/users?api-version=2 resolves to version '2'. Only used when strategy is 'query'.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">vendor</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">string</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">-</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The vendor name used in media type content negotiation. When strategy is 'media-type', the middleware looks for Accept headers matching the pattern application/vnd.{'{vendor}'}.v{'{version}'}+json. For example, with vendor 'myapp', the Accept header 'application/vnd.myapp.v2+json' resolves to version '2'. Required when strategy is 'media-type'.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">prefix</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">string</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">'/api/v'</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The URL path prefix that precedes the version number when using the 'path' strategy. The middleware looks for this prefix in the request URL and extracts the characters that follow it (up to the next slash or end of path) as the version string. For example, with prefix '/api/v', the URL '/api/v2/users' resolves to version '2'.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">responseHeader</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">string</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">-</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">When set, the middleware adds a response header with this name containing the resolved version string. This helps clients confirm which version served their request, which is invaluable for debugging during migrations. Recommended to set this to 'X-API-Version' in all environments.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Helper Functions
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          These functions provide access to version information in handlers and create specialized
          middleware for version-based routing and deprecation.
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
                <td className="py-3 px-4"><code className="prose-code">getApiVersion</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(ctx: Context) =&gt; string</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Returns the resolved API version string from the request context. This is the version that was extracted by the versioning middleware, or the default version if none was found in the request. Only available after the versioning middleware has run.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">isVersion</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(ctx: Context, version: string) =&gt; boolean</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">A convenience function that compares the resolved version with the given string and returns true if they match. Equivalent to getApiVersion(ctx) === version but more readable in conditional expressions. Use this for simple version branching in handlers.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">createVersionRouter</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(options: VersionRouterOptions) =&gt; VersionRouter</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Creates a version-aware router that dispatches requests to version-specific handler functions based on the resolved API version. The returned object has properties for each HTTP method (get, post, put, delete, patch) that can be used as route handlers. The fallback option specifies which version handler to use for unrecognized versions.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">deprecated</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(message: string, sunset?: Date) =&gt; Middleware</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Creates a middleware that adds standard HTTP deprecation headers (Deprecation, Sunset, Link, X-Deprecated-Message) to responses. Apply to individual routes as a preHandler or to entire route groups. The message parameter is included in the X-Deprecated-Message header. The optional sunset Date is formatted as an HTTP date in the Sunset header, signaling when the endpoint will be removed.</td>
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
          <Link to="/infrastructure/caching" className="btn-primary">
            Caching Infrastructure <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/middleware" className="btn-secondary">
            Middleware Overview
          </Link>
        </div>
      </section>
    </div>
  );
}
