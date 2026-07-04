/**
 * Cross-runtime smoke test.
 *
 * Runs the built @vexorjs/core bundle in-process on Node, Bun, or Deno and
 * exercises routing, validation, middleware, and 405/HEAD semantics through
 * the Web-standard fetch interface (no sockets needed).
 *
 *   node scripts/smoke.mjs
 *   bun  scripts/smoke.mjs
 *   deno run --allow-read --allow-env scripts/smoke.mjs
 */

import { Vexor, Type } from '../packages/vexor/dist/index.js';

const failures = [];

function check(name, condition) {
  if (condition) {
    console.log(`  ok  ${name}`);
  } else {
    failures.push(name);
    console.error(`FAIL  ${name}`);
  }
}

const app = new Vexor({ logging: false });

app.use((ctx) => {
  ctx.setResponseHeader('X-Smoke', 'true');
});

app.get('/', async (ctx) => ctx.json({ hello: 'vexor' }));
app.get('/users/:id', async (ctx) => ctx.json({ id: ctx.params.id }));
app.post(
  '/echo',
  {
    schema: {
      body: Type.Object({
        name: Type.String({ minLength: 1 }),
      }),
    },
  },
  async (ctx) => {
    const body = await ctx.body();
    return ctx.status(201).json(body);
  }
);

// Basic route
const root = await app.fetch(new Request('http://smoke.test/'));
check('GET / returns 200', root.status === 200);
check('GET / returns JSON body', (await root.json()).hello === 'vexor');
check('middleware header applied', root.headers.get('X-Smoke') === 'true');

// Params
const user = await app.fetch(new Request('http://smoke.test/users/42'));
check('route params work', (await user.json()).id === '42');

// Validation accepts good input
const okEcho = await app.fetch(
  new Request('http://smoke.test/echo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'smoke' }),
  })
);
check('valid POST accepted', okEcho.status === 201);

// Validation rejects bad input
const badEcho = await app.fetch(
  new Request('http://smoke.test/echo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '' }),
  })
);
check('invalid POST rejected with 400', badEcho.status === 400);

// 405 + Allow
const wrongMethod = await app.fetch(
  new Request('http://smoke.test/users/42', { method: 'DELETE' })
);
check('405 for wrong method', wrongMethod.status === 405);
check('Allow header present', (wrongMethod.headers.get('Allow') ?? '').includes('GET'));

// HEAD falls back to GET
const head = await app.fetch(new Request('http://smoke.test/', { method: 'HEAD' }));
check('HEAD served from GET', head.status === 200);
check('HEAD has empty body', (await head.text()) === '');

// 404
const missing = await app.fetch(new Request('http://smoke.test/nope'));
check('404 for unknown route', missing.status === 404);

if (failures.length > 0) {
  console.error(`\n${failures.length} smoke check(s) failed`);
  globalThis.process?.exit ? process.exit(1) : Deno.exit(1);
} else {
  console.log('\nAll smoke checks passed');
}
