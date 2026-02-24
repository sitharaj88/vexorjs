/**
 * HTTP Server Implementations
 *
 * Server implementations for various frameworks to benchmark.
 */

/**
 * Vexor server
 *
 * Note: Uses relative paths for local development. Run with tsx.
 */
export async function createVexorServer(port: number) {
  // @ts-ignore - relative import for local development
  const { Vexor } = await import('../../../packages/vexor/src/index.js');

  const app = new Vexor();

  // Health check
  app.get('/health', {}, async (ctx) => {
    return ctx.json({ status: 'ok' });
  });

  // Simple JSON response
  app.get('/json', {}, async (ctx) => {
    return ctx.json({ message: 'Hello, World!' });
  });

  // Dynamic route
  app.get('/user/:id', {}, async (ctx) => {
    return ctx.json({ id: ctx.params.id, name: 'User ' + ctx.params.id });
  });

  // POST with body parsing
  app.post('/echo', {}, async (ctx) => {
    const body = await ctx.readJson();
    return ctx.json(body);
  });

  // Validated route (simple validation)
  app.post('/user', {}, async (ctx) => {
    const body = await ctx.readJson() as { name?: string; email?: string };
    // Simple validation
    if (!body.name || typeof body.name !== 'string') {
      return ctx.status(400).json({ error: 'Name is required' });
    }
    if (!body.email || typeof body.email !== 'string') {
      return ctx.status(400).json({ error: 'Email is required' });
    }
    return ctx.json({ id: 1, name: body.name, email: body.email });
  });

  // Start server
  const server = await app.listen(port);
  console.log(`Vexor server listening on port ${port}`);

  return {
    server,
    close: async () => {
      await app.close();
    },
  };
}

/**
 * Fastify server
 */
export async function createFastifyServer(port: number) {
  const Fastify = (await import('fastify')).default;

  const app = Fastify({ logger: false });

  // Health check
  app.get('/health', async () => {
    return { status: 'ok' };
  });

  // Simple JSON response
  app.get('/json', async () => {
    return { message: 'Hello, World!' };
  });

  // Dynamic route
  app.get('/user/:id', async (request) => {
    const { id } = request.params as { id: string };
    return { id, name: 'User ' + id };
  });

  // POST with body parsing
  app.post('/echo', async (request) => {
    return request.body;
  });

  // Validated route (using JSON Schema)
  app.post('/user', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
        },
      },
    },
  }, async (request) => {
    return { id: 1, ...(request.body as object) };
  });

  await app.listen({ port, host: '0.0.0.0' });
  console.log(`Fastify server listening on port ${port}`);

  return {
    server: app,
    close: async () => {
      await app.close();
    },
  };
}

/**
 * Hono server
 */
export async function createHonoServer(port: number) {
  const { Hono } = await import('hono');
  const { serve } = await import('@hono/node-server');

  const app = new Hono();

  // Health check
  app.get('/health', (c) => {
    return c.json({ status: 'ok' });
  });

  // Simple JSON response
  app.get('/json', (c) => {
    return c.json({ message: 'Hello, World!' });
  });

  // Dynamic route
  app.get('/user/:id', (c) => {
    const id = c.req.param('id');
    return c.json({ id, name: 'User ' + id });
  });

  // POST with body parsing
  app.post('/echo', async (c) => {
    const body = await c.req.json();
    return c.json(body);
  });

  // Validated route (manual validation)
  app.post('/user', async (c) => {
    const body = await c.req.json();
    return c.json({ id: 1, ...body });
  });

  const server = serve({ fetch: app.fetch, port });
  console.log(`Hono server listening on port ${port}`);

  return {
    server,
    close: async () => {
      server.close();
    },
  };
}

/**
 * Express server
 */
export async function createExpressServer(port: number) {
  const express = (await import('express')).default;

  const app = express();
  app.use(express.json());

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Simple JSON response
  app.get('/json', (_req, res) => {
    res.json({ message: 'Hello, World!' });
  });

  // Dynamic route
  app.get('/user/:id', (req, res) => {
    res.json({ id: req.params.id, name: 'User ' + req.params.id });
  });

  // POST with body parsing
  app.post('/echo', (req, res) => {
    res.json(req.body);
  });

  // POST user
  app.post('/user', (req, res) => {
    res.json({ id: 1, ...req.body });
  });

  const server = app.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
  });

  return {
    server,
    close: async () => {
      server.close();
    },
  };
}

/**
 * Native Node.js HTTP server (baseline)
 */
export async function createNodeServer(port: number) {
  const http = await import('http');

  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? '/', `http://localhost:${port}`);

    res.setHeader('Content-Type', 'application/json');

    if (url.pathname === '/health') {
      res.end(JSON.stringify({ status: 'ok' }));
    } else if (url.pathname === '/json') {
      res.end(JSON.stringify({ message: 'Hello, World!' }));
    } else if (url.pathname.startsWith('/user/')) {
      const id = url.pathname.split('/')[2];
      res.end(JSON.stringify({ id, name: 'User ' + id }));
    } else if (req.method === 'POST' && url.pathname === '/echo') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        res.end(body);
      });
    } else if (req.method === 'POST' && url.pathname === '/user') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        const parsed = JSON.parse(body);
        res.end(JSON.stringify({ id: 1, ...parsed }));
      });
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Not Found' }));
    }
  });

  server.listen(port, () => {
    console.log(`Node HTTP server listening on port ${port}`);
  });

  return {
    server,
    close: async () => {
      server.close();
    },
  };
}

/**
 * Server factory
 */
export type ServerType = 'vexor' | 'fastify' | 'hono' | 'express' | 'node';

export const serverFactories: Record<ServerType, (port: number) => Promise<{ server: unknown; close: () => Promise<void> }>> = {
  vexor: createVexorServer,
  fastify: createFastifyServer,
  hono: createHonoServer,
  express: createExpressServer,
  node: createNodeServer,
};
