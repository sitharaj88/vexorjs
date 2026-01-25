/**
 * Request and Response Tests
 */

import { describe, it, expect } from 'vitest';
import { VexorRequest, createRequest } from '../core/request.js';
import { VexorResponse, ResponseBuilder } from '../core/response.js';

describe('VexorRequest', () => {
  describe('basic properties', () => {
    it('should parse URL correctly', () => {
      const request = createRequest('http://localhost:3000/users?page=1&limit=10');

      expect(request.method).toBe('GET');
      expect(request.path).toBe('/users');
      expect(request.host).toBe('localhost:3000');
    });

    it('should parse query string', () => {
      const request = createRequest('http://localhost/search?q=test&page=1');

      expect(request.query).toEqual({ q: 'test', page: '1' });
      expect(request.queryParam('q')).toBe('test');
    });

    it('should handle multiple query values', () => {
      const request = createRequest('http://localhost/filter?tag=a&tag=b&tag=c');

      expect(request.query.tag).toEqual(['a', 'b', 'c']);
    });

    it('should parse cookies from header', () => {
      const nativeRequest = new Request('http://localhost/', {
        headers: { cookie: 'session=abc123; theme=dark' },
      });
      const request = new VexorRequest(nativeRequest);

      expect(request.cookies).toEqual({ session: 'abc123', theme: 'dark' });
      expect(request.cookie('session')).toBe('abc123');
    });

    it('should handle route params', () => {
      const request = createRequest('http://localhost/users/123');
      request.setParams({ id: '123' });

      expect(request.params).toEqual({ id: '123' });
    });
  });

  describe('headers', () => {
    it('should access headers', () => {
      const nativeRequest = new Request('http://localhost/', {
        headers: {
          'Content-Type': 'application/json',
          'X-Custom': 'value',
        },
      });
      const request = new VexorRequest(nativeRequest);

      expect(request.header('content-type')).toBe('application/json');
      expect(request.header('x-custom')).toBe('value');
      expect(request.contentType).toBe('application/json');
    });

    it('should check accept header', () => {
      const nativeRequest = new Request('http://localhost/', {
        headers: { accept: 'application/json, text/html' },
      });
      const request = new VexorRequest(nativeRequest);

      expect(request.accepts('application/json')).toBe(true);
      expect(request.accepts('text/html')).toBe(true);
      expect(request.accepts('text/xml')).toBe(false);
    });
  });

  describe('body parsing', () => {
    it('should parse JSON body', async () => {
      const nativeRequest = new Request('http://localhost/', {
        method: 'POST',
        body: JSON.stringify({ name: 'test' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const request = new VexorRequest(nativeRequest);

      const body = await request.json<{ name: string }>();
      expect(body).toEqual({ name: 'test' });
    });

    it('should parse text body', async () => {
      const nativeRequest = new Request('http://localhost/', {
        method: 'POST',
        body: 'Hello, World!',
      });
      const request = new VexorRequest(nativeRequest);

      const body = await request.text();
      expect(body).toBe('Hello, World!');
    });
  });
});

describe('VexorResponse', () => {
  describe('static helpers', () => {
    it('should create JSON response', () => {
      const response = VexorResponse.json({ message: 'hello' });

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe('application/json; charset=utf-8');
    });

    it('should create JSON response with custom status', () => {
      const response = VexorResponse.json({ id: 1 }, 201);

      expect(response.status).toBe(201);
    });

    it('should create text response', () => {
      const response = VexorResponse.text('Hello');

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe('text/plain; charset=utf-8');
    });

    it('should create HTML response', () => {
      const response = VexorResponse.html('<h1>Hello</h1>');

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8');
    });

    it('should create redirect response', () => {
      const response = VexorResponse.redirect('/new-location');

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe('/new-location');
    });

    it('should create empty response', () => {
      const response = VexorResponse.empty();

      expect(response.status).toBe(204);
    });
  });

  describe('error responses', () => {
    it('should create 404 response', () => {
      const response = VexorResponse.notFound();

      expect(response.status).toBe(404);
    });

    it('should create 400 response', () => {
      const response = VexorResponse.badRequest('Invalid input');

      expect(response.status).toBe(400);
    });

    it('should create 401 response', () => {
      const response = VexorResponse.unauthorized();

      expect(response.status).toBe(401);
    });

    it('should create 403 response', () => {
      const response = VexorResponse.forbidden();

      expect(response.status).toBe(403);
    });

    it('should create validation error response', async () => {
      const response = VexorResponse.validationError([
        { field: 'email', message: 'Invalid email' },
      ]);

      expect(response.status).toBe(422);
      const body = await response.json();
      expect(body).toHaveProperty('errors');
    });
  });

  describe('ResponseBuilder', () => {
    it('should chain methods', () => {
      const response = new ResponseBuilder()
        .status(201)
        .header('X-Custom', 'value')
        .json({ created: true });

      expect(response.status).toBe(201);
      expect(response.headers.get('x-custom')).toBe('value');
    });

    it('should set cookies', () => {
      const response = new ResponseBuilder()
        .cookie('session', 'abc123', { httpOnly: true, secure: true })
        .json({ ok: true });

      const setCookie = response.headers.get('set-cookie');
      expect(setCookie).toContain('session=abc123');
      expect(setCookie).toContain('HttpOnly');
      expect(setCookie).toContain('Secure');
    });

    it('should clear cookies', () => {
      const response = new ResponseBuilder()
        .clearCookie('session')
        .json({ ok: true });

      const setCookie = response.headers.get('set-cookie');
      expect(setCookie).toContain('Max-Age=0');
    });
  });
});
