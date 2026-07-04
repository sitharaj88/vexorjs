import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const propertiesCode = `// VexorContext is generic: the route's path literal and schema
// narrow params, query, and body() automatically.
class VexorContext<
  TParams extends RouteParams = RouteParams,  // Record<string, string>
  TQuery = ParsedQuery,                       // Record<string, string | string[] | undefined>
  TBody = unknown,
> {
  // Request data (narrowed when the route has a schema / path params)
  params: TParams;
  query: TQuery;
  body<T = TBody>(): Promise<T>;

  // Raw request
  req: VexorRequest;
  method: string;
  path: string;
  headers: Headers;
  requestId: string;

  // State management
  set<T>(key: string, value: T): this;
  get<T>(key: string): T | undefined;
}`;

const typedContextCode = `import { Vexor, Type } from '@vexorjs/core';

const app = new Vexor();

app.post('/orgs/:orgId/users', {
  schema: {
    query: Type.Object({ notify: Type.Optional(Type.String()) }),
    body: Type.Object({ name: Type.String() }),
  },
}, async (ctx) => {
  ctx.params.orgId;               // string (from the path literal)
  ctx.query.notify;               // string | undefined (from the query schema)
  const body = await ctx.body();  // { name: string } (from the body schema)

  return ctx.json(body);
});

// Without schemas, the defaults apply:
app.get('/legacy', async (ctx) => {
  ctx.params;              // RouteParams: Record<string, string>
  ctx.query;               // ParsedQuery: Record<string, string | string[] | undefined>
  await ctx.body();        // unknown (pass a type argument to narrow: ctx.body<T>())
  return ctx.json({ ok: true });
});`;

const responseCode = `// JSON response
ctx.json(data: unknown, status?: number): Response;

// Text response
ctx.text(content: string, status?: number): Response;

// HTML response
ctx.html(content: string, status?: number): Response;

// Set status code (returns the response builder for chaining)
ctx.status(code: number): ResponseBuilder;
ctx.status(201).json(user);

// Send empty response
ctx.empty(status?: number): Response;

// Redirect
ctx.redirect(url: string, status?: number): Response;

// Stream response
ctx.stream(readable: ReadableStream, contentType?: string): Response;`;

const responseHeadersCode = `// Queue a header for the final response.
// Headers set here are applied by the pipeline after onSend hooks run,
// even when a handler returns a raw Response object.
ctx.setResponseHeader('X-Request-Id', ctx.requestId);

// Merge several headers at once
ctx.mergeResponseHeaders({
  'Cache-Control': 'no-store',
  'X-Frame-Options': 'DENY',
});

// Read the headers queued so far (undefined if none set)
const pending = ctx.responseHeaders;  // Record<string, string> | undefined

// Typical use: middleware that must decorate every response
app.addHook('onRequest', (ctx) => {
  ctx.setResponseHeader('Access-Control-Allow-Origin', '*');
});

app.get('/raw', async () => {
  // Even though this bypasses the response helpers entirely,
  // the queued CORS header still lands on the final response.
  return new Response('hello');
});`;

const bodyParsingCode = `// Parse body as JSON (typed from the route schema when available)
const data = await ctx.body();

// Explicit alias with an optional type argument
const json = await ctx.readJson<T>();

// Parse body as text
const text = await ctx.readText();

// Parse body as FormData
const form = await ctx.readFormData();

// Parse body as ArrayBuffer
const buffer = await ctx.readArrayBuffer();`;

const cookiesCode = `// Get a cookie value
const session = ctx.cookie('session');

// All parsed cookies
ctx.cookies; // Record<string, string>

// Set a cookie on the response
ctx.setCookie('session', 'value', {
  httpOnly: true,
  secure: true,
  sameSite: 'Strict',
  maxAge: 60 * 60 * 24, // 1 day
  path: '/',
});

// Clear a cookie
ctx.clearCookie('session');`;

export default function ContextApi() {
  return (
    <div className="space-y-12">
      <div>
        <h1 id="context-api" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Context API
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          The context object provides access to request data, response helpers, and application services.
        </p>
      </div>

      <section>
        <h2 id="properties" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Properties
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="prose-code">VexorContext&lt;TParams, TQuery, TBody&gt;</code> is generic.
          The type parameters are inferred from the route's path literal and schema by the route
          methods, so <code className="prose-code">ctx.params</code>,{' '}
          <code className="prose-code">ctx.query</code>, and{' '}
          <code className="prose-code">ctx.body()</code> return narrowed types inside handlers. The
          defaults (<code className="prose-code">RouteParams</code>,{' '}
          <code className="prose-code">ParsedQuery</code>, <code className="prose-code">unknown</code>)
          keep untyped usage working unchanged.
        </p>
        <CodeBlock code={propertiesCode} language="typescript" />
      </section>

      <section>
        <h2 id="typed-context" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Typed Context
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          You never write the generic parameters yourself. Declaring a route with a path literal
          and (optionally) a schema is enough -- the handler's context is narrowed automatically,
          with no code generation.
        </p>
        <CodeBlock code={typedContextCode} language="typescript" showLineNumbers />
      </section>

      <section>
        <h2 id="response-methods" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Response Methods
        </h2>
        <CodeBlock code={responseCode} language="typescript" />
      </section>

      <section>
        <h2 id="response-headers" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Response Headers
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Handlers often return raw <code className="prose-code">Response</code> objects, which makes
          it hard for middleware to attach headers after the fact.{' '}
          <code className="prose-code">ctx.setResponseHeader()</code> and{' '}
          <code className="prose-code">ctx.mergeResponseHeaders()</code> solve this: headers queued
          on the context are applied to the final response by the middleware pipeline, regardless of
          how the response was produced. This is the mechanism the built-in CORS, request ID, and
          helmet plugins use.
        </p>
        <CodeBlock code={responseHeadersCode} language="typescript" showLineNumbers />
        <InfoBlock variant="info" title="Applied by the Pipeline">
          Queued headers are merged into the response as the last step of the pipeline, after all{' '}
          <code className="prose-code">onSend</code> hooks. They override headers with the same name
          already present on the response, and they are applied even to 404/405 responses produced
          for unmatched routes.
        </InfoBlock>
      </section>

      <section>
        <h2 id="body-parsing" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Body Parsing
        </h2>
        <CodeBlock code={bodyParsingCode} language="typescript" />
      </section>

      <section>
        <h2 id="cookies" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Cookies
        </h2>
        <CodeBlock code={cookiesCode} language="typescript" />
      </section>
    </div>
  );
}
