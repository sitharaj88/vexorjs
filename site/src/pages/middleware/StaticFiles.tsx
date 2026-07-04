import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const basicUsageCode = `import { Vexor } from '@vexorjs/core';
import { serveStatic } from '@vexorjs/core/middleware';

const app = new Vexor();

// Serve everything under ./public at /assets/*
// GET /assets/css/site.css → ./public/css/site.css
app.get('/assets/*', serveStatic({
  root: './public',
  maxAge: 3600,  // Cache-Control: public, max-age=3600
}));

app.listen(3000);`;

const cachingCode = `import { serveStatic } from '@vexorjs/core/middleware';

// Hashed build output (app.3f2a9c.js) never changes, so cache it forever
app.get('/static/*', serveStatic({
  root: './dist/assets',
  maxAge: 31536000,   // one year
  immutable: true,    // Cache-Control: public, max-age=31536000, immutable
}));

// Content that may change: rely on ETag revalidation instead
app.get('/media/*', serveStatic({
  root: './uploads',
  // maxAge defaults to 0 → Cache-Control: no-cache
  // etag defaults to true → conditional requests get 304 Not Modified
}));

// The revalidation flow:
//
//   GET /media/photo.jpg
//   → 200 OK
//   → ETag: W/"8a3f-19c2b4d1e00"
//
//   GET /media/photo.jpg
//   If-None-Match: W/"8a3f-19c2b4d1e00"
//   → 304 Not Modified (no body sent)`;

const indexAndDotfilesCode = `import { serveStatic } from '@vexorjs/core/middleware';

// Directory requests resolve to an index file
// GET /site/       → ./www/index.html
// GET /site/docs   → ./www/docs/index.html (if docs is a directory)
app.get('/site/*', serveStatic({
  root: './www',
  index: 'index.html',  // the default; false disables directory resolution
}));

// Dotfile policy applies to every path segment under the root
app.get('/files/*', serveStatic({
  root: './shared',
  dotfiles: 'ignore',  // default: .env, .git/config, etc. → 404
  // dotfiles: 'deny'  → 403 Forbidden
  // dotfiles: 'allow' → served like any other file
}));

// Extra headers on every file response
app.get('/downloads/*', serveStatic({
  root: './downloads',
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'Content-Disposition': 'attachment',
  },
}));`;

const sendFileCode = `import { sendFile, getMimeType } from '@vexorjs/core/middleware';

// Serve a single file from any handler
app.get('/report', async (ctx) => {
  return sendFile(ctx, './reports/latest.pdf', { maxAge: 60 });
});

// SPA fallback: send index.html for any unmatched client route
app.get('/app/*', async (ctx) => {
  return sendFile(ctx, './dist/index.html');
});

// sendFile handles the details for you:
// - Content-Type from the file extension
// - Content-Length from the file size
// - ETag / If-None-Match → 304 Not Modified
// - Cache-Control from maxAge / immutable
// - HEAD requests answered with headers only
// - Missing file → 404 JSON response
// - Body streamed from disk, never buffered

// Look up a MIME type directly
getMimeType('logo.svg');    // 'image/svg+xml'
getMimeType('app.js');      // 'text/javascript; charset=utf-8'
getMimeType('data.unknown'); // 'application/octet-stream'`;

const securityCode = `// Path traversal attempts are neutralized before touching the disk.
//
//   GET /assets/../../etc/passwd
//   GET /assets/..%2f..%2fetc/passwd
//
// The requested sub-path is URL-decoded, normalized, and resolved
// against the root directory. If the resolved path escapes the root,
// the handler responds 403 Forbidden without any filesystem access.
//
// Paths containing NUL bytes (%00) are rejected with 404 — a classic
// trick for truncating file paths in lower-level APIs.
//
// Dotfiles are hidden by default ('ignore' → 404), so secrets like
// .env or .git/config are never exposed accidentally.

app.get('/assets/*', serveStatic({ root: './public' }));
// Nothing outside ./public is ever readable through this route.`;

export default function StaticFiles() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 id="static-files" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Static Files
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          Most applications need to serve assets straight from disk -- stylesheets, JavaScript
          bundles, images, fonts, downloads. Vexor's <code className="prose-code">serveStatic</code>{' '}
          handler turns a directory into an HTTP-accessible file tree with correct MIME types,
          conditional requests, cache headers, and streaming, while protecting you from the classic
          static-serving pitfalls like path traversal and accidental dotfile exposure.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          You register it as a normal route handler on a trailing-wildcard route. The wildcard
          segment (<code className="prose-code">ctx.params['*']</code>) becomes the file path
          relative to your configured root directory, so{' '}
          <code className="prose-code">GET /assets/css/site.css</code> with{' '}
          <code className="prose-code">root: './public'</code> serves{' '}
          <code className="prose-code">./public/css/site.css</code>. Because it is just a handler,
          it composes with everything else in Vexor -- groups, hooks, compression, logging.
        </p>
      </div>

      {/* Basic Usage */}
      <section>
        <h2 id="basic-usage" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Basic Usage
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Mount <code className="prose-code">serveStatic</code> on a GET route ending in{' '}
          <code className="prose-code">/*</code>. The only required option is{' '}
          <code className="prose-code">root</code>, the directory to serve from (resolved to an
          absolute path once, lazily, on the first request). HEAD requests are handled
          automatically -- they return the same headers as GET with no body, so you do not need a
          separate HEAD route.
        </p>
        <CodeBlock code={basicUsageCode} showLineNumbers />
        <InfoBlock variant="warning" title="Runtime Support">
          <code className="prose-code">serveStatic</code> and{' '}
          <code className="prose-code">sendFile</code> use <code className="prose-code">node:fs</code>{' '}
          and are intended for the Node, Bun, and Deno adapters. On edge runtimes (Cloudflare
          Workers, Vercel Edge) there is no filesystem -- serve static assets through the
          platform's own asset handling instead.
        </InfoBlock>
      </section>

      {/* Caching */}
      <section>
        <h2 id="caching" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Caching &amp; Conditional Requests
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Every file response carries a <code className="prose-code">Cache-Control</code> header
          derived from the <code className="prose-code">maxAge</code> option (in seconds). The
          default is <code className="prose-code">0</code>, which produces{' '}
          <code className="prose-code">Cache-Control: no-cache</code> -- browsers may store the
          file but must revalidate before using it. A positive value produces{' '}
          <code className="prose-code">public, max-age=N</code>, and adding{' '}
          <code className="prose-code">immutable: true</code> appends the{' '}
          <code className="prose-code">immutable</code> directive, which tells browsers to skip
          revalidation entirely for the lifetime of the cache entry. Use it for build output with
          hashed filenames, where the content at a given URL can never change.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Revalidation is handled with weak ETags computed from the file's size and modification
          time (enabled by default, disable with <code className="prose-code">etag: false</code>).
          When a request arrives with an <code className="prose-code">If-None-Match</code> header
          matching the current ETag, the handler responds{' '}
          <code className="prose-code">304 Not Modified</code> with no body -- the browser reuses
          its cached copy and no file data crosses the wire. Combined with the default{' '}
          <code className="prose-code">no-cache</code> policy, this gives you always-fresh content
          at nearly zero bandwidth cost for unchanged files.
        </p>
        <CodeBlock code={cachingCode} showLineNumbers />
        <InfoBlock variant="tip" title="The Two-Tier Strategy">
          Serve hashed build assets with <code className="prose-code">maxAge: 31536000</code> and{' '}
          <code className="prose-code">immutable: true</code>, and serve the HTML that references
          them with the default <code className="prose-code">maxAge: 0</code>. Deploys are
          instant (the HTML revalidates) while assets are cached forever.
        </InfoBlock>
      </section>

      {/* Index & Dotfiles */}
      <section>
        <h2 id="index-and-dotfiles" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Index Files, Dotfiles &amp; Custom Headers
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When the requested path resolves to a directory, the handler looks for an index file
          inside it -- <code className="prose-code">index.html</code> by default. Set{' '}
          <code className="prose-code">index</code> to a different filename to change this, or to{' '}
          <code className="prose-code">false</code> to disable directory resolution entirely
          (directory requests then return 404).
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Dotfiles -- any path segment starting with a dot, in any position under the root -- are
          governed by the <code className="prose-code">dotfiles</code> option. The default{' '}
          <code className="prose-code">'ignore'</code> responds 404 as if the file did not exist,{' '}
          <code className="prose-code">'deny'</code> responds 403 Forbidden, and{' '}
          <code className="prose-code">'allow'</code> serves them normally. Stick with the default
          unless you have a specific reason not to; it keeps files like{' '}
          <code className="prose-code">.env</code> invisible even if they end up inside your
          public directory by mistake.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">headers</code> option sets extra headers on every file
          response -- useful for security headers or forcing downloads with{' '}
          <code className="prose-code">Content-Disposition</code>.
        </p>
        <CodeBlock code={indexAndDotfilesCode} showLineNumbers />
      </section>

      {/* sendFile */}
      <section>
        <h2 id="send-file" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Serving Single Files with sendFile
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="prose-code">serveStatic</code> maps a URL prefix onto a directory, but
          sometimes you need to serve one specific file from inside a handler -- a generated
          report, a download endpoint with its own authorization, or an SPA fallback. The{' '}
          <code className="prose-code">sendFile(ctx, filePath, options)</code> helper does exactly
          that: it accepts the same caching options (<code className="prose-code">maxAge</code>,{' '}
          <code className="prose-code">immutable</code>, <code className="prose-code">etag</code>,{' '}
          <code className="prose-code">headers</code>) and returns a{' '}
          <code className="prose-code">Response</code> streaming the file from disk.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Files are streamed, never buffered into memory, so serving a multi-gigabyte file costs
          the same memory as serving a favicon. If the path does not exist or is not a regular
          file, <code className="prose-code">sendFile</code> returns a 404 JSON response. The{' '}
          <code className="prose-code">getMimeType(path)</code> helper exposes the same
          extension-to-MIME lookup the handlers use, falling back to{' '}
          <code className="prose-code">application/octet-stream</code> for unknown extensions.
        </p>
        <CodeBlock code={sendFileCode} showLineNumbers />
        <InfoBlock variant="info" title="Authorization-Gated Downloads">
          Because <code className="prose-code">sendFile</code> is called from inside your handler,
          you can run any checks first -- verify a session, check purchase records, log the
          download -- and only then stream the file. <code className="prose-code">serveStatic</code>{' '}
          routes can be protected the same way with <code className="prose-code">preHandler</code>{' '}
          hooks.
        </InfoBlock>
      </section>

      {/* Security */}
      <section>
        <h2 id="security" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Security
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The classic static-serving vulnerability is path traversal: a request like{' '}
          <code className="prose-code">/assets/../../etc/passwd</code> that walks out of the public
          directory. <code className="prose-code">serveStatic</code> defends against this by
          URL-decoding the wildcard segment, resolving it against the absolute root path, and
          verifying the result is still inside the root before touching the filesystem. Anything
          that escapes gets a 403 Forbidden. Encoded traversal (<code className="prose-code">%2e%2e%2f</code>)
          is caught the same way because decoding happens first.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Paths containing NUL bytes are rejected outright with a 404, and the default dotfile
          policy hides hidden files and directories at every level of the tree. Malformed
          percent-encoding that fails to decode also returns 404 rather than throwing.
        </p>
        <CodeBlock code={securityCode} showLineNumbers />
      </section>

      {/* API Reference */}
      <section>
        <h2 id="api-reference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          API Reference
        </h2>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">
          serveStatic(options)
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Creates a route handler that serves files from a directory. Register it on a
          trailing-wildcard GET route; the wildcard segment is used as the file path relative
          to <code className="prose-code">root</code>.
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
                <td className="py-3 px-4"><code className="prose-code">root</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">string</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">required</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Directory to serve files from. Resolved to an absolute path; no request can read files outside it.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">index</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">string | false</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">'index.html'</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">File served when the requested path resolves to a directory. Set to false to disable directory resolution (directories then return 404).</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">maxAge</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">0</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Cache-Control max-age in seconds. 0 (the default) sends Cache-Control: no-cache so clients revalidate with ETags; a positive value sends public, max-age=N.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">immutable</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">boolean</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">false</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Appends the immutable directive to Cache-Control, telling browsers never to revalidate within max-age. Only use for content-hashed filenames.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">etag</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">boolean</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">true</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Sends a weak ETag (from file size + mtime) and answers matching If-None-Match requests with 304 Not Modified. Set to false to disable conditional requests.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">dotfiles</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">'ignore' | 'deny' | 'allow'</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">'ignore'</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Policy for path segments starting with a dot, applied at every level under root. 'ignore' returns 404, 'deny' returns 403, 'allow' serves them normally.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">headers</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Record&lt;string, string&gt;</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">-</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Extra headers set on every file response, e.g. security headers or Content-Disposition.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Helper Functions
        </h3>
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
                <td className="py-3 px-4"><code className="prose-code">sendFile</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(ctx, filePath, options?) =&gt; Promise&lt;Response&gt;</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Streams a single file as a Response with Content-Type, Content-Length, Cache-Control, and ETag handling. Accepts the maxAge, immutable, etag, and headers options. Returns a 404 JSON response if the file does not exist. HEAD requests receive headers only.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">getMimeType</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(filePath: string) =&gt; string</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Returns the MIME type for a file path based on its extension (covering common web, font, media, and archive types), or application/octet-stream when unknown.</td>
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
          <Link to="/routing" className="btn-secondary">
            Wildcard Routing
          </Link>
        </div>
      </section>
    </div>
  );
}
