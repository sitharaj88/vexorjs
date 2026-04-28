/**
 * Cloudflare Workers Example
 *
 * Deploys a Vexor app to the Cloudflare edge using the bundled adapter.
 *
 * Local dev: wrangler dev
 * Deploy:    wrangler deploy
 */

import { Vexor, createCloudflareWorker } from '@vexorjs/core';
import type { CloudflareEnv } from '@vexorjs/core';

// Cloudflare bindings — extend `CloudflareEnv` with whatever your wrangler.toml declares.
interface Env extends CloudflareEnv {
  // Example: KV_NAMESPACE: KVNamespace;
  // Example: API_TOKEN: string;
}

// ---------------------------------------------------------------------------
// Build the app
// ---------------------------------------------------------------------------

const app = new Vexor({
  // Workers don't need a port — Vexor handles HTTP via the adapter.
  logging: false,
});

app.get('/', (ctx) => {
  return ctx.json({
    name: 'vexor-cf-worker',
    runtime: 'cloudflare-workers',
    timestamp: Date.now(),
  });
});

app.get('/health', (ctx) => {
  return ctx.json({ status: 'ok' });
});

// Echo back the geo info Cloudflare attaches to the request.
app.get('/geo', (ctx) => {
  const cf = (ctx.request as Request & { cf?: Record<string, unknown> }).cf;
  return ctx.json({
    country: cf?.country ?? null,
    city: cf?.city ?? null,
    colo: cf?.colo ?? null,
    asn: cf?.asn ?? null,
  });
});

app.post('/echo', async (ctx) => {
  const body = await ctx.body<unknown>();
  return ctx.json({ received: body });
});

// ---------------------------------------------------------------------------
// Module worker export — the canonical entry shape for Workers.
// ---------------------------------------------------------------------------

export default createCloudflareWorker(app) as ExportedHandler<Env>;
