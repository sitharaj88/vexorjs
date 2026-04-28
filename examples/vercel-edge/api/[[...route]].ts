/**
 * Vercel Edge Function — Vexor catch-all route.
 *
 * This file lives at `api/[[...route]].ts` so a single file handles every
 * request and Vexor's router takes over from there.
 *
 * Local dev: vercel dev
 * Deploy:    vercel deploy
 */

import { Vexor, createVercelEdgeHandler } from '@vexorjs/core';

export const config = {
  runtime: 'edge',
};

const app = new Vexor({
  logging: false,
});

app.get('/', (ctx) => {
  return ctx.json({
    name: 'vexor-vercel-edge',
    runtime: 'vercel-edge',
    timestamp: Date.now(),
  });
});

app.get('/health', (ctx) => {
  return ctx.json({ status: 'ok' });
});

// Echo back Vercel's geo info, attached by the platform.
app.get('/geo', (ctx) => {
  const headers = ctx.headers;
  return ctx.json({
    country: headers.get('x-vercel-ip-country') ?? null,
    region: headers.get('x-vercel-ip-country-region') ?? null,
    city: headers.get('x-vercel-ip-city') ?? null,
    latitude: headers.get('x-vercel-ip-latitude') ?? null,
    longitude: headers.get('x-vercel-ip-longitude') ?? null,
  });
});

app.post('/echo', async (ctx) => {
  const body = await ctx.body<unknown>();
  return ctx.json({ received: body });
});

export default createVercelEdgeHandler(app);
