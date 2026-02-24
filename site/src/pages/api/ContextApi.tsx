import CodeBlock from '../../components/CodeBlock';

const propertiesCode = `interface Context {
  // Request data (typed when schemas defined)
  params: Record<string, string>;
  query: Record<string, unknown>;
  body: unknown;

  // Raw request
  req: VexorRequest;

  // State management
  set(key: string, value: unknown): void;
  get<T>(key: string): T | undefined;

  // Services
  service<T>(name: string): T;
  db: Database; // When ORM configured
}`;

const responseCode = `// JSON response
ctx.json(data: unknown, status?: number): Response;

// Text response
ctx.text(content: string, status?: number): Response;

// HTML response
ctx.html(content: string, status?: number): Response;

// Set status code (chainable)
ctx.status(code: number): Context;

// Set header (chainable)
ctx.header(name: string, value: string): Context;

// Send empty response
ctx.send(): Response;

// Redirect
ctx.redirect(url: string, status?: 301 | 302 | 303 | 307 | 308): Response;

// Stream response
ctx.stream(stream: ReadableStream, contentType?: string): Response;`;

const bodyParsingCode = `// Parse body as JSON
const data = await ctx.readJson<T>();

// Parse body as text
const text = await ctx.readText();

// Parse body as FormData
const form = await ctx.readFormData();

// Parse body as ArrayBuffer
const buffer = await ctx.readArrayBuffer();

// Parse body as Blob
const blob = await ctx.readBlob();`;

const cookiesCode = `// Get cookie value
const session = ctx.cookies.get('session');

// Set cookie
ctx.cookies.set('session', 'value', {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 60 * 60 * 24, // 1 day
  path: '/',
});

// Delete cookie
ctx.cookies.delete('session');`;

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
        <CodeBlock code={propertiesCode} language="typescript" />
      </section>

      <section>
        <h2 id="response-methods" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Response Methods
        </h2>
        <CodeBlock code={responseCode} language="typescript" />
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
