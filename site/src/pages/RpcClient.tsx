import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import InfoBlock from '../components/InfoBlock';

const serverCode = `import { Vexor, Type } from '@vexorjs/core';

const UserSchema = Type.Object({
  name: Type.String(),
  email: Type.String(),
});

// Register routes with chained verb calls so the route map
// accumulates on the app's type
const app = new Vexor()
  .get('/users/:id', (ctx) => ctx.json({ id: ctx.params.id, name: 'Ada' }))
  .post('/users', { body: UserSchema }, async (ctx) =>
    ctx.status(201).json(await ctx.body())
  )
  .get('/search', { query: Type.Object({ q: Type.String() }) }, (ctx) =>
    ctx.json({ results: [ctx.query.q] })
  );

app.listen(3000);

// Export the app's *type* — this is all the client needs.
// No code generation, no build step.
export type App = typeof app;`;

const clientCode = `import { createClient } from '@vexorjs/core/client';
import type { App } from './server';

const api = createClient<App>({ baseUrl: 'http://localhost:3000' });

// Path strings are constrained per method — a typo or a path that
// was never registered with .get() is a compile error
const user = await api.get('/users/:id', { params: { id: '42' } });
user.data;   // { id: string; name: string } — from the handler's ctx.json()

// \`body\` is required and typed when the route declares a body schema
const created = await api.post('/users', {
  body: { name: 'Ada', email: 'ada@example.com' },
});
created.data;   // { name: string; email: string }
created.status; // 201

// \`query\` is typed from the route's query schema
const found = await api.get('/search', { query: { q: 'vexor' } });
found.data; // { results: string[] }`;

const responseCode = `const res = await api.get('/users/:id', { params: { id: '42' } });

res.data;    // typed payload — what the handler passed to ctx.json()
res.status;  // number         — HTTP status code
res.ok;      // boolean        — true for 2xx responses
res.headers; // Headers        — response headers
res.raw;     // Response       — the underlying fetch Response

// Non-JSON responses yield a string in \`data\`;
// 204 No Content and HEAD requests yield undefined`;

const inProcessCode = `import { createClient } from '@vexorjs/core/client';
import { app, type App } from '../src/app';

// Pass the app's fetch handler: requests are dispatched straight
// into the app in-process — no network, no port, no server to start
const api = createClient<App>({ fetch: app.fetch });

test('creates a user', async () => {
  const res = await api.post('/users', {
    body: { name: 'Ada', email: 'ada@example.com' },
  });

  expect(res.status).toBe(201);
  expect(res.data.name).toBe('Ada'); // res.data is fully typed
});`;

const headersCode = `import { createClient } from '@vexorjs/core/client';
import type { App } from './server';

// Static headers applied to every request
const api = createClient<App>({
  baseUrl: 'https://api.example.com',
  headers: { 'X-Api-Key': process.env.API_KEY! },
});

// Or a factory — evaluated on every request, ideal for tokens
// that rotate or are read from an auth store
const authed = createClient<App>({
  baseUrl: 'https://api.example.com',
  headers: () => ({ Authorization: \`Bearer \${getAccessToken()}\` }),
});

// Per-request headers merge over (and override) client-level ones
await authed.get('/users/:id', {
  params: { id: '42' },
  headers: { 'X-Request-Id': crypto.randomUUID() },
});`;

const escapeHatchCode = `// api.request() bypasses the typed route map entirely:
// any method, any path, untyped response data
const res = await api.request('POST', '/legacy/import', {
  body: { rows: [1, 2, 3] },
  query: { dryRun: true },
  headers: { 'X-Source': 'batch' },
});

res.data; // any — you decide what it is`;

const typedResponseCode = `// ✅ ctx.json() carries its payload type to the client
app.get('/typed', (ctx) => ctx.json({ ready: true }));
// api.get('/typed') → data: { ready: boolean }

// ⚠️ A plain Response gives the client nothing to infer from
app.get('/untyped', () => new Response('ok'));
// api.get('/untyped') → data: unknown`;

export default function RpcClient() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 id="rpc-client" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          RPC Client
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          Vexor ships a fully typed HTTP client for calling your Vexor app from other TypeScript
          code — a frontend, another service, or a test suite. Types flow directly from the
          server's route registrations to the client with <strong>zero code generation</strong>:
          there is no schema compiler, no generated SDK, and no build step to keep in sync. If a
          route changes on the server, every client call site that depends on it fails to compile.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          The mechanism is purely type-level. Each verb call (<code className="prose-code">.get()</code>,{' '}
          <code className="prose-code">.post()</code>, ...) returns a <code className="prose-code">Vexor</code>{' '}
          instance whose type parameter accumulates a map of <code className="prose-code">"METHOD /path"</code>{' '}
          keys to that route's params, query, body, and response types. The server exports this
          type with <code className="prose-code">export type App = typeof app</code>, and{' '}
          <code className="prose-code">createClient&lt;App&gt;()</code> reads the map back out.
          Nothing about the app's runtime behavior changes — the route map has no runtime
          representation at all.
        </p>
      </div>

      {/* Server Setup */}
      <section>
        <h2 id="server-setup" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Exporting the App Type
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For the route map to accumulate, register routes with <strong>chained verb calls</strong>{' '}
          on a single expression. Each call widens the app's type with a new entry: the path
          literal contributes the params type, the schema contributes the query and body types,
          and the handler's return value (via <code className="prose-code">ctx.json()</code>)
          contributes the response type.
        </p>
        <CodeBlock code={serverCode} filename="src/server.ts" showLineNumbers />
        <InfoBlock variant="info" title="Type-Only Export">
          <code className="prose-code">export type App = typeof app</code> is a type-only export —
          importing it from client code pulls in zero server code at runtime. Bundlers erase it
          completely, so it is safe to reference from a browser bundle.
        </InfoBlock>
      </section>

      {/* Creating the Client */}
      <section>
        <h2 id="creating-the-client" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Creating a Client
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Import <code className="prose-code">createClient</code> from{' '}
          <code className="prose-code">@vexorjs/core/client</code> and parameterize it with the
          app type. The path argument of each method is constrained to the paths registered for
          that HTTP verb, so your editor autocompletes them and typos are compile errors. Options
          become <em>required</em> exactly when the route needs them: a path with{' '}
          <code className="prose-code">:tokens</code> requires <code className="prose-code">params</code>,
          and a route with a body schema requires a matching <code className="prose-code">body</code>.
          When nothing is required, the options argument can be omitted entirely.
        </p>
        <CodeBlock code={clientCode} filename="src/client.ts" showLineNumbers />
        <p className="text-slate-600 dark:text-slate-400 mt-4">
          Path parameters are substituted into the URL and encoded automatically —{' '}
          <code className="prose-code">api.get('/users/:id', {'{ params: { id: "42" } }'})</code>{' '}
          requests <code className="prose-code">/users/42</code>. Wildcard routes accept the
          matched segment under the <code className="prose-code">'*'</code> key, and wildcard
          values may contain slashes by design. Query values are appended as a query string;
          arrays produce repeated keys, and <code className="prose-code">undefined</code> values
          are skipped. Request bodies are JSON-serialized with a{' '}
          <code className="prose-code">Content-Type: application/json</code> header unless you set
          one yourself.
        </p>
      </section>

      {/* Response Shape */}
      <section>
        <h2 id="response-shape" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          The Response Object
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Every call resolves to a <code className="prose-code">ClientResponse</code> — the client
          never throws on non-2xx statuses, so error handling is a normal{' '}
          <code className="prose-code">if (!res.ok)</code> branch rather than a try/catch. The{' '}
          <code className="prose-code">data</code> field is parsed for you: JSON responses are
          decoded and typed, non-JSON responses yield the body as a string, and 204/HEAD responses
          yield <code className="prose-code">undefined</code>. The untouched fetch{' '}
          <code className="prose-code">Response</code> stays available as{' '}
          <code className="prose-code">raw</code> for streaming or low-level access.
        </p>
        <CodeBlock code={responseCode} showLineNumbers />
        <InfoBlock variant="warning" title="Response Typing Requires ctx.json()">
          The response type is inferred from what the handler passes to{' '}
          <code className="prose-code">ctx.json(...)</code>. Handlers that return a plain{' '}
          <code className="prose-code">new Response(...)</code> still work at runtime, but the
          client's <code className="prose-code">data</code> is typed as{' '}
          <code className="prose-code">unknown</code> for those routes.
        </InfoBlock>
        <CodeBlock code={typedResponseCode} showLineNumbers />
      </section>

      {/* In-Process Calls */}
      <section>
        <h2 id="in-process-testing" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          In-Process Calls & Testing
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">fetch</code> option replaces the client's transport.
          Pass <code className="prose-code">app.fetch</code> — the app's native fetch handler —
          and every client call is dispatched directly into the app's pipeline in the same
          process. No server is started, no port is bound, and no network is involved, which
          makes this the fastest way to write integration tests: full routing, validation,
          hooks, and error handling are exercised, with fully typed requests and responses.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The same pattern works outside of tests. A monolith can call one of its own modules
          through the typed client, and a worker can invoke the app without HTTP overhead. When
          no <code className="prose-code">baseUrl</code> is provided, the client uses a dummy
          origin internally so that <code className="prose-code">Request</code> construction stays
          valid for in-process dispatch.
        </p>
        <CodeBlock code={inProcessCode} filename="test/users.test.ts" showLineNumbers />
      </section>

      {/* Headers & Auth */}
      <section>
        <h2 id="auth-headers" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Default Headers & Auth Tokens
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">headers</code> client option applies headers to every
          request. It accepts either a static object (for fixed values like an API key) or a
          factory function that is invoked per request — the right choice for authorization
          tokens that refresh over time, since the factory reads the current token at call time
          instead of capturing a stale one at client creation. Headers passed to an individual
          request are merged on top and win on conflict.
        </p>
        <CodeBlock code={headersCode} showLineNumbers />
      </section>

      {/* Escape Hatch */}
      <section>
        <h2 id="escape-hatch" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Escape Hatch: request()
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Sometimes you need to hit a path the type system doesn't know about — a route registered
          dynamically, a proxied legacy endpoint, or an HTTP method without a dedicated helper.{' '}
          <code className="prose-code">api.request(method, path, options)</code> performs the same
          param substitution, query building, header merging, and JSON handling as the typed
          methods, but accepts any method and path and returns untyped data.
        </p>
        <CodeBlock code={escapeHatchCode} showLineNumbers />
      </section>

      {/* API Reference */}
      <section>
        <h2 id="api-reference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          API Reference
        </h2>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">
          createClient&lt;App&gt;(options?)
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Creates a <code className="prose-code">VexorClient</code> typed by the routes of{' '}
          <code className="prose-code">App</code> (the exported <code className="prose-code">typeof app</code>).
          All options are optional.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Option</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">baseUrl</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">string</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Base URL of the server, e.g. <code className="prose-code">https://api.example.com</code>. Trailing slashes are stripped. When omitted, a dummy origin is used internally, which is fine for in-process calls via the <code className="prose-code">fetch</code> option.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">fetch</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(request: Request) =&gt; Response | Promise&lt;Response&gt;</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Fetch implementation. Defaults to the global <code className="prose-code">fetch</code>. Pass <code className="prose-code">app.fetch</code> to call a Vexor app in-process — ideal for tests, monoliths, and workers.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">headers</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{'Record<string, string> | (() => Record<string, string>)'}</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Headers applied to every request. A factory function is invoked per request, which suits rotating auth tokens. Per-request headers override these on conflict.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Request Options
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The second argument to <code className="prose-code">get</code> / <code className="prose-code">post</code> /{' '}
          <code className="prose-code">put</code> / <code className="prose-code">patch</code> /{' '}
          <code className="prose-code">delete</code> / <code className="prose-code">head</code>.
          Whether each field is optional or required depends on the route's type.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Field</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Required When</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">params</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The path contains <code className="prose-code">:tokens</code> or a wildcard</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Values substituted into the path. Keys are inferred from the path literal; the wildcard segment is passed under the <code className="prose-code">'*'</code> key. Values are URL-encoded automatically.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">body</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The route declares a body schema</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">JSON-serialized request body, typed from the route's schema. Sent with <code className="prose-code">Content-Type: application/json</code> unless a Content-Type header is set explicitly. Ignored for GET and HEAD.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">query</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Never (always optional)</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Query string values. Typed exactly when the route declares a query schema; otherwise free-form string/number/boolean values. Arrays produce repeated keys; <code className="prose-code">undefined</code> values are skipped.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">headers</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Never (always optional)</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Per-request headers, merged over the client-level <code className="prose-code">headers</code> option.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          ClientResponse&lt;T&gt;
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Field</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">data</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">T</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The parsed payload, typed from the handler's <code className="prose-code">ctx.json()</code>. Non-JSON responses yield a string; 204 and HEAD yield <code className="prose-code">undefined</code>.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">status</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">HTTP status code.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">ok</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">boolean</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">True for 2xx statuses. The client never throws on error statuses — check this field.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">headers</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Headers</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Response headers.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">raw</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Response</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The underlying fetch <code className="prose-code">Response</code>. Note that the body has already been consumed to produce <code className="prose-code">data</code>.</td>
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
          <Link to="/validation" className="btn-primary">
            Validation <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/advanced/testing" className="btn-secondary">
            Testing
          </Link>
          <Link to="/routing" className="btn-secondary">
            Routing
          </Link>
        </div>
      </section>
    </div>
  );
}
