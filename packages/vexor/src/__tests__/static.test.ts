/**
 * Static file serving tests
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Vexor } from '../core/app.js';
import { VexorRequest } from '../core/request.js';
import { serveStatic, getMimeType } from '../middleware/static.js';

let root: string;

function makeRequest(path: string, headers?: Record<string, string>, method = 'GET'): VexorRequest {
  const request = new Request(`http://localhost${path}`, { method, headers });
  return new VexorRequest(request, request);
}

function createApp(): Vexor {
  const app = new Vexor();
  app.get('/assets/*', serveStatic({ root, maxAge: 3600 }));
  return app;
}

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), 'vexor-static-'));
  await writeFile(join(root, 'hello.txt'), 'hello world');
  await writeFile(join(root, 'index.html'), '<h1>home</h1>');
  await writeFile(join(root, '.secret'), 'hidden');
  await mkdir(join(root, 'sub'));
  await writeFile(join(root, 'sub', 'index.html'), '<h1>sub</h1>');
  await writeFile(join(root, 'sub', 'data.json'), '{"a":1}');
});

afterAll(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('serveStatic', () => {
  it('serves a file with the right content type and cache headers', async () => {
    const app = createApp();
    const response = await app.handle(makeRequest('/assets/hello.txt'));

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('hello world');
    expect(response.headers.get('Content-Type')).toContain('text/plain');
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600');
    expect(response.headers.get('ETag')).toBeTruthy();
  });

  it('returns 304 when If-None-Match matches the ETag', async () => {
    const app = createApp();
    const first = await app.handle(makeRequest('/assets/hello.txt'));
    const etag = first.headers.get('ETag')!;

    const second = await app.handle(makeRequest('/assets/hello.txt', { 'If-None-Match': etag }));

    expect(second.status).toBe(304);
    expect(await second.text()).toBe('');
  });

  it('serves the index file for directories', async () => {
    const app = createApp();

    const rootIndex = await app.handle(makeRequest('/assets/'));
    expect(rootIndex.status).toBe(200);
    expect(await rootIndex.text()).toBe('<h1>home</h1>');

    const subIndex = await app.handle(makeRequest('/assets/sub'));
    expect(subIndex.status).toBe(200);
    expect(await subIndex.text()).toBe('<h1>sub</h1>');
  });

  it('serves nested files', async () => {
    const app = createApp();
    const response = await app.handle(makeRequest('/assets/sub/data.json'));

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/json');
  });

  it('blocks path traversal', async () => {
    const app = createApp();

    for (const attempt of [
      '/assets/../package.json',
      '/assets/..%2f..%2fpackage.json',
      '/assets/%2e%2e/%2e%2e/etc/passwd',
    ]) {
      const response = await app.handle(makeRequest(attempt));
      expect([403, 404]).toContain(response.status);
    }
  });

  it('hides dotfiles by default', async () => {
    const app = createApp();
    const response = await app.handle(makeRequest('/assets/.secret'));

    expect(response.status).toBe(404);
  });

  it('returns 404 for missing files', async () => {
    const app = createApp();
    const response = await app.handle(makeRequest('/assets/nope.txt'));

    expect(response.status).toBe(404);
  });

  it('answers HEAD without a body', async () => {
    const app = createApp();
    const response = await app.handle(makeRequest('/assets/hello.txt', undefined, 'HEAD'));

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Length')).toBe('11');
    expect(await response.text()).toBe('');
  });
});

describe('getMimeType', () => {
  it('maps common extensions', () => {
    expect(getMimeType('a.html')).toContain('text/html');
    expect(getMimeType('a.css')).toContain('text/css');
    expect(getMimeType('a.svg')).toBe('image/svg+xml');
    expect(getMimeType('a.woff2')).toBe('font/woff2');
  });

  it('falls back to octet-stream', () => {
    expect(getMimeType('a.unknownext')).toBe('application/octet-stream');
    expect(getMimeType('no-extension')).toBe('application/octet-stream');
  });
});
