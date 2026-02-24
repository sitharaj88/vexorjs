import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const basicUsageCode = `import { Vexor } from '@vexorjs/core';
import { compression } from '@vexorjs/core/middleware';

const app = new Vexor();

// Apply compression globally with default settings
// Compresses responses larger than 1KB using gzip
app.addHook('onSend', compression());

app.get('/api/data', async (ctx) => {
  // Large JSON responses are automatically compressed
  const data = await fetchLargeDataset();
  return ctx.json({ data });
});

app.listen(3000);`;

const thresholdLevelCode = `import { compression } from '@vexorjs/core/middleware';

// Customize threshold and compression level
app.addHook('onSend', compression({
  threshold: 512,     // Compress responses larger than 512 bytes
  level: 6,           // Compression level (1=fastest, 9=best, default=6)
}));

// High compression for bandwidth-sensitive APIs
app.addHook('onSend', compression({
  threshold: 256,
  level: 9,           // Maximum compression ratio
}));

// Fast compression for low-latency APIs
app.addHook('onSend', compression({
  threshold: 2048,    // Only compress larger responses
  level: 1,           // Fastest compression
}));`;

const contentFilteringCode = `import { compression, isCompressible } from '@vexorjs/core/middleware';

// Custom filter to control which responses are compressed
app.addHook('onSend', compression({
  filter: (contentType: string) => {
    // Skip compression for already-compressed formats
    if (contentType.includes('image/')) return false;
    if (contentType.includes('video/')) return false;

    // Use built-in check for other types
    return isCompressible(contentType);
  },
}));

// The isCompressible helper checks against a list of
// compressible MIME types (JSON, HTML, CSS, JS, XML, SVG, etc.)
const shouldCompress = isCompressible('application/json');  // true
const skipCompress = isCompressible('image/png');           // false

// Compress only specific content types
app.addHook('onSend', compression({
  filter: (contentType: string) => {
    const compressible = [
      'application/json',
      'text/html',
      'text/css',
      'application/javascript',
    ];
    return compressible.some((type) => contentType.includes(type));
  },
}));`;

const encodingPriorityCode = `import { compression } from '@vexorjs/core/middleware';

// Configure supported encodings and their priority
app.addHook('onSend', compression({
  encodings: ['br', 'gzip', 'deflate'],  // Prefer Brotli, then gzip
  vary: true,  // Add Vary: Accept-Encoding header
}));

// Brotli-only compression (smaller output, slower)
app.addHook('onSend', compression({
  encodings: ['br'],
  level: 4,  // Brotli levels: 0-11 (default 4)
}));

// The middleware respects the client's Accept-Encoding header.
// If the client sends:
//   Accept-Encoding: gzip, br
// and your encodings list is ['br', 'gzip'],
// the response will use Brotli (br) since both
// client and server support it and it has higher priority.`;

const compressSingleCode = `import { compressResponse } from '@vexorjs/core/middleware';

// Compress a single response manually in a handler
app.get('/api/export', async (ctx) => {
  const csvData = await generateLargeCSV();

  ctx.header('Content-Type', 'text/csv');
  ctx.header('Content-Disposition', 'attachment; filename="export.csv"');

  // Manually compress the response
  const compressed = await compressResponse(csvData, ctx, {
    level: 9,
    encodings: ['gzip'],
  });

  return compressed;
});`;

export default function Compression() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 id="compression" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Compression
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          Response compression is one of the simplest and most effective ways to improve your API's
          performance. By compressing response bodies before sending them over the network, you reduce
          bandwidth consumption, decrease transfer times, and improve the experience for clients on slow
          or metered connections. A typical JSON API response compresses by 60-90%, meaning a 50KB payload
          can be reduced to 5-10KB on the wire.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor's compression middleware sits in the response pipeline and automatically compresses
          outgoing responses based on what the client supports. The middleware reads the client's{' '}
          <code className="prose-code">Accept-Encoding</code> header, selects the best available encoding
          algorithm (Brotli, gzip, or deflate), compresses the response body, and sets the{' '}
          <code className="prose-code">Content-Encoding</code> header so the client knows how to decompress
          it. All of this happens transparently -- your handlers return normal responses and the compression
          is applied automatically.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          The middleware supports three compression algorithms: <strong>gzip</strong> (the most widely
          supported, available in every browser and HTTP client), <strong>Brotli</strong> (a newer algorithm
          that achieves 15-25% better compression ratios than gzip, supported by all modern browsers), and{' '}
          <strong>deflate</strong> (an older algorithm included for completeness). You can configure which
          algorithms to offer, their priority order, the compression level, the minimum response size to
          trigger compression, and a filter function that controls which content types are compressed.
        </p>
      </div>

      {/* How It Works */}
      <section>
        <h2 id="how-it-works" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          How It Works
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The compression middleware runs on the <code className="prose-code">onSend</code> hook, which
          fires after your route handler has generated the response but before the response is sent to the
          client. This placement is deliberate: the middleware needs access to the complete response body
          in order to compress it, and it needs to modify the response headers (setting{' '}
          <code className="prose-code">Content-Encoding</code> and removing{' '}
          <code className="prose-code">Content-Length</code>, since the compressed size differs from the
          original).
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When a response is ready to be sent, the middleware first checks three conditions: (1) the
          response body size exceeds the configured <code className="prose-code">threshold</code>, (2) the
          content type passes the <code className="prose-code">filter</code> function, and (3) the client's{' '}
          <code className="prose-code">Accept-Encoding</code> header includes at least one encoding that the
          server supports. If any of these conditions fails, the response is sent uncompressed with no
          additional overhead.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When all conditions are met, the middleware selects the best encoding by intersecting the server's
          configured <code className="prose-code">encodings</code> list (in priority order) with the
          encodings the client accepts. The first encoding that appears in both lists wins. For example, if
          your server prefers <code className="prose-code">['br', 'gzip']</code> and the client sends{' '}
          <code className="prose-code">Accept-Encoding: gzip, br</code>, Brotli is selected because it has
          higher priority in your server configuration. The response body is then compressed using the
          selected algorithm at the configured level, and the{' '}
          <code className="prose-code">Content-Encoding</code> header is set accordingly.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">Vary: Accept-Encoding</code> header (enabled by default via the{' '}
          <code className="prose-code">vary</code> option) is crucial for correct caching behavior. It tells
          intermediate caches (CDNs, proxies) that the response body varies depending on the client's{' '}
          <code className="prose-code">Accept-Encoding</code> header, so they must store separate cached
          copies for different encodings rather than serving a gzip-compressed response to a client that
          only supports Brotli, or vice versa.
        </p>
      </section>

      {/* When to Use */}
      <section>
        <h2 id="when-to-use" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          When to Use Compression
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Almost always.</strong> Compression should be enabled for any API that returns text-based
          responses (JSON, HTML, XML, CSV, plain text). The CPU cost of compression is minimal on modern
          hardware, and the bandwidth savings are substantial. The main exceptions are responses that are
          already compressed (images, videos, ZIP files) and very small responses where the compression
          overhead exceeds the savings.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Choose gzip</strong> as your primary encoding when you need the broadest compatibility. Every
          HTTP client and browser supports gzip, and it provides good compression ratios with moderate CPU
          cost. Use compression level 6 (the default) for a good balance, or level 1 for latency-sensitive
          endpoints where compression speed matters more than ratio.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Choose Brotli</strong> when you want the best possible compression ratios and your clients
          support it (all modern browsers do). Brotli typically achieves 15-25% better compression than gzip
          at equivalent speed. However, Brotli compression at high levels (9-11) is significantly slower than
          gzip, so it is best suited for static or cacheable content where the compression cost is amortized
          across many requests. For dynamic responses, use Brotli level 4 (the default) for a good balance.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Skip compression</strong> for binary formats that are already compressed (JPEG, PNG, WebP,
          MP4, ZIP, gzip archives) and for very small responses below the threshold. Compressing an already-compressed
          file wastes CPU and can actually increase the response size. The default threshold of 1024 bytes
          avoids this for small payloads, since the compression header overhead can exceed the savings for
          very small bodies.
        </p>
      </section>

      {/* Basic Usage */}
      <section>
        <h2 id="basic-usage" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Basic Usage
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">compression</code> middleware automatically compresses
          responses based on the client's <code className="prose-code">Accept-Encoding</code> header.
          With default settings, it compresses responses larger than 1KB using gzip at level 6, which
          provides a good balance between compression ratio and CPU cost for most JSON APIs.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Register the middleware on the <code className="prose-code">onSend</code> hook to ensure it
          runs after your handlers generate the response body. Unlike request-phase middleware (which
          uses <code className="prose-code">onRequest</code> or <code className="prose-code">preHandler</code>),
          compression must run in the response phase so it has access to the complete response body.
          Registering it on the wrong hook will result in uncompressed responses.
        </p>
        <CodeBlock code={basicUsageCode} showLineNumbers />
        <InfoBlock variant="tip" title="Hook Placement">
          Compression middleware should be registered on the{' '}
          <code className="prose-code">onSend</code> hook so it runs after your handler
          generates the response body but before the response is sent to the client. Using
          any other hook will not produce the expected behavior.
        </InfoBlock>
      </section>

      {/* Threshold & Level */}
      <section>
        <h2 id="threshold-level" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Threshold & Level
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">threshold</code> option sets the minimum response body size (in
          bytes) that triggers compression. Responses smaller than this value are sent uncompressed. This
          exists because compression has a fixed overhead: the compressed output includes metadata (headers,
          checksums, dictionary references) that can make very small payloads larger after compression than
          before. The default of 1024 bytes is a well-tested starting point for JSON APIs, but you may want
          to adjust it based on your typical response sizes.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">level</code> option controls the trade-off between compression
          ratio and CPU time. For gzip and deflate, levels range from 1 (fastest, least compression) to 9
          (slowest, best compression). For Brotli, levels range from 0 to 11. The relationship is not linear:
          moving from level 1 to 6 provides significant compression improvement with moderate CPU increase,
          while moving from 6 to 9 provides diminishing returns at rapidly increasing CPU cost. In benchmarks,
          level 6 typically compresses JSON about 2-5% less than level 9 while running 3-5x faster.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The right combination depends on your priorities. For bandwidth-sensitive APIs serving mobile clients
          or operating under data transfer cost constraints, use a lower threshold (256-512 bytes) and a higher
          level (7-9). For latency-sensitive APIs where response time is critical and bandwidth is cheap, use a
          higher threshold (2048+ bytes) and a lower level (1-3). For most APIs, the defaults (1024 byte
          threshold, level 6) are an excellent starting point.
        </p>
        <CodeBlock code={thresholdLevelCode} showLineNumbers />
        <InfoBlock variant="info" title="Compression Tradeoff">
          Compressing very small responses can actually increase their size due to encoding overhead.
          The default threshold of 1024 bytes is a good starting point for most APIs. Monitor your
          average response sizes and adjust if needed -- if most of your responses are under 500 bytes,
          raising the threshold prevents wasted CPU cycles.
        </InfoBlock>
      </section>

      {/* Content Filtering */}
      <section>
        <h2 id="content-filtering" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Content Filtering
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Not all content types benefit from compression. Text-based formats like JSON, HTML, CSS,
          JavaScript, XML, and SVG compress extremely well (typically 60-90% reduction). Binary formats
          that are already compressed -- JPEG, PNG, WebP, MP4, ZIP, gzip archives -- will not compress
          further and attempting to do so wastes CPU. The <code className="prose-code">filter</code> function
          lets you control exactly which content types the middleware should compress.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The default filter uses the built-in <code className="prose-code">isCompressible</code> function,
          which checks the response's <code className="prose-code">Content-Type</code> against a curated list
          of compressible MIME types. This list includes all common text-based formats and excludes binary
          formats that are already compressed. For most APIs that serve JSON, this default is exactly right.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When you need custom filtering -- for example, to skip compression for certain JSON endpoints that
          return tiny responses, or to compress a binary format that your application uses in an uncompressed
          form -- you can provide your own filter function. The function receives the{' '}
          <code className="prose-code">Content-Type</code> header value and returns{' '}
          <code className="prose-code">true</code> to compress or <code className="prose-code">false</code> to
          skip. You can use <code className="prose-code">isCompressible</code> inside your custom filter as
          a fallback for types you have not explicitly handled.
        </p>
        <CodeBlock code={contentFilteringCode} showLineNumbers />
        <InfoBlock variant="warning" title="Pre-compressed Content">
          Never compress already-compressed formats like JPEG, PNG, MP4, or ZIP files.
          Doing so wastes CPU and can actually increase the response size by adding compression
          metadata to data that cannot be further reduced. The default filter handles this
          automatically, but be careful when writing custom filters.
        </InfoBlock>
      </section>

      {/* Encoding Priority */}
      <section>
        <h2 id="encoding-priority" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Encoding Priority
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">encodings</code> option controls which compression algorithms
          your server supports and their priority order. When a client sends an{' '}
          <code className="prose-code">Accept-Encoding</code> header listing multiple algorithms, the
          middleware selects the first encoding from your priority list that the client also supports.
          This gives you control over which algorithm is preferred when multiple options are available.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The default priority is <code className="prose-code">['gzip', 'br', 'deflate']</code>, which
          prefers gzip for the broadest compatibility. If you want to prioritize Brotli for its superior
          compression ratios, reorder the list to <code className="prose-code">['br', 'gzip', 'deflate']</code>.
          Clients that support Brotli will receive Brotli-compressed responses, while older clients that
          only support gzip will fall back gracefully. You can also restrict the available encodings
          entirely -- for example, <code className="prose-code">['br']</code> serves only Brotli and sends
          uncompressed responses to clients that do not support it.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Note that compression levels behave differently for each algorithm. For gzip and deflate,
          the <code className="prose-code">level</code> option ranges from 1 to 9. For Brotli, it ranges
          from 0 to 11. The default Brotli level (4) provides a good balance between speed and compression
          for dynamic content. Higher Brotli levels (9-11) are significantly slower but produce smaller
          output, making them suitable for static assets that are compressed once and served many times. For
          dynamic API responses, Brotli level 4-6 is typically the sweet spot.
        </p>
        <CodeBlock code={encodingPriorityCode} showLineNumbers />
        <InfoBlock variant="tip" title="Brotli for Static Content">
          Brotli (<code className="prose-code">br</code>) achieves 15-25% better compression than gzip
          but is slower to compress at high levels. It is ideal for static or cacheable content where
          the compression cost is amortized over many requests. Use gzip for dynamic responses where
          latency matters more than a few percentage points of compression ratio.
        </InfoBlock>
      </section>

      {/* Manual Compression */}
      <section>
        <h2 id="manual-compression" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Manual Compression
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          In most cases, the global compression middleware handles everything automatically. However,
          there are situations where you need fine-grained control over compression for a specific
          response -- for example, when generating a large CSV export that should use maximum compression
          regardless of the global setting, or when you need to compress a response with specific encoding
          options that differ from the global configuration.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">compressResponse</code> function lets you compress a single
          response manually within a handler. It accepts the response body, the request context (which it
          uses to read the client's <code className="prose-code">Accept-Encoding</code> header), and an
          optional configuration object. The function returns a compressed response with the appropriate{' '}
          <code className="prose-code">Content-Encoding</code> header set. If the client does not support
          any of the specified encodings, the original uncompressed response is returned.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When using manual compression alongside the global compression middleware, be aware that the
          global middleware will skip responses that already have a{' '}
          <code className="prose-code">Content-Encoding</code> header set, so there is no risk of
          double-compression.
        </p>
        <CodeBlock code={compressSingleCode} showLineNumbers />
      </section>

      {/* Best Practices */}
      <section>
        <h2 id="best-practices" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Best Practices
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Enable compression globally, not per-route.</strong> Since compression benefits nearly
          every text-based response, register it once on the <code className="prose-code">onSend</code> hook
          rather than attaching it to individual routes. The content filter and threshold settings handle the
          edge cases (small responses, binary content) automatically.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Consider offloading compression to a reverse proxy.</strong> If your application runs behind
          Nginx, Cloudflare, or another reverse proxy that supports compression, you may get better performance
          by letting the proxy handle compression. Proxies can cache compressed responses and avoid recompressing
          the same content for every request. Application-level compression is still valuable for direct
          client connections, development, and environments without a compression-capable proxy.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Monitor compression effectiveness.</strong> Track the average compression ratio for your
          responses to make sure compression is actually helping. If most of your responses are under the
          threshold, you are paying the overhead of the middleware check without getting the benefit. If
          your compression ratios are poor (less than 20% reduction), check that you are not compressing
          already-compressed content.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Always set the Vary header.</strong> Keep the <code className="prose-code">vary</code> option
          enabled (the default) to ensure CDNs and proxies cache compressed and uncompressed versions of
          your responses separately. Without this header, a cached gzip response might be served to a client
          that does not support gzip, resulting in garbled output.
        </p>
      </section>

      {/* API Reference */}
      <section>
        <h2 id="api-reference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          API Reference
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          The compression module provides the main <code className="prose-code">compression</code> middleware
          factory, a <code className="prose-code">compressResponse</code> function for manual compression,
          and an <code className="prose-code">isCompressible</code> helper for checking MIME type
          compressibility.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">
          compression(options)
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Creates a middleware function that automatically compresses response bodies based on the client's{' '}
          <code className="prose-code">Accept-Encoding</code> header. The middleware checks the response size,
          content type, and client capabilities before deciding whether and how to compress. Register this
          on the <code className="prose-code">onSend</code> hook.
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
                <td className="py-3 px-4"><code className="prose-code">threshold</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">1024</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The minimum response body size in bytes required to trigger compression. Responses smaller than this value are sent uncompressed. This prevents the overhead of compression metadata from making small responses larger. Set lower (256-512) for bandwidth-sensitive APIs or higher (2048+) for latency-sensitive APIs.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">level</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">6</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The compression level controlling the trade-off between CPU usage and compression ratio. For gzip and deflate, valid values are 1 (fastest, least compression) through 9 (slowest, best compression). For Brotli, valid values are 0 through 11, with the default being 4. Level 6 for gzip provides roughly 90% of the compression benefit of level 9 at a fraction of the CPU cost.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">filter</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(contentType: string) =&gt; boolean</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">isCompressible</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">A function that determines whether a response with the given Content-Type should be compressed. The default uses the isCompressible helper, which allows text-based formats (JSON, HTML, CSS, JS, XML, SVG) and blocks already-compressed formats (images, videos, archives). Return true to compress, false to skip. Called once per response.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">encodings</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">string[]</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">['gzip', 'br', 'deflate']</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The compression algorithms the server supports, listed in priority order. The middleware selects the first encoding from this list that the client also supports (as declared in its Accept-Encoding header). Reorder to ['br', 'gzip', 'deflate'] to prefer Brotli when available. Remove entries to disable specific algorithms entirely.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">vary</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">boolean</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">true</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">When true, adds Vary: Accept-Encoding to the response headers. This is essential for correct caching behavior -- it tells CDNs and proxies that the response body varies based on the client's Accept-Encoding header, so they must cache separate versions for different encodings. Only disable this if you are certain no caching layer sits between your server and clients.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Helper Functions
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          These utility functions provide lower-level access to the compression system for use cases
          that require manual control.
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
                <td className="py-3 px-4"><code className="prose-code">compressResponse</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(response: Response, ctx: Context, options?: CompressionOptions) =&gt; Promise&lt;Response&gt;</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Compresses a single response manually within a handler. Reads the client's Accept-Encoding header from the context to select the best available algorithm. Returns the compressed response with Content-Encoding set, or the original response if the client does not support any of the specified encodings. Use this when you need per-response compression settings that differ from the global configuration.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">isCompressible</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(contentType: string) =&gt; boolean</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Checks whether the given MIME type is compressible. Returns true for text-based formats (application/json, text/html, text/css, application/javascript, image/svg+xml, etc.) and false for already-compressed formats (image/jpeg, image/png, video/mp4, application/zip, etc.). Useful for building custom filter functions that extend or override the default behavior.</td>
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
          <Link to="/middleware/upload" className="btn-primary">
            File Upload Middleware <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/middleware" className="btn-secondary">
            Middleware Overview
          </Link>
        </div>
      </section>
    </div>
  );
}
