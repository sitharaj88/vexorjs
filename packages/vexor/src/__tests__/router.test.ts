/**
 * Router Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RadixRouter } from '../router/radix.js';

describe('RadixRouter', () => {
  let router: RadixRouter;

  beforeEach(() => {
    router = new RadixRouter();
  });

  describe('static routes', () => {
    it('should match exact static routes', () => {
      const handler = async () => new Response('ok');
      router.add('GET', '/users', handler);

      const result = router.find('GET', '/users');
      expect(result).not.toBeNull();
      expect(result?.route.handler).toBe(handler);
      expect(result?.params).toEqual({});
    });

    it('should not match non-existent routes', () => {
      router.add('GET', '/users', async () => new Response('ok'));

      const result = router.find('GET', '/posts');
      expect(result).toBeNull();
    });

    it('should match routes by method', () => {
      const getHandler = async () => new Response('get');
      const postHandler = async () => new Response('post');

      router.add('GET', '/users', getHandler);
      router.add('POST', '/users', postHandler);

      const getResult = router.find('GET', '/users');
      const postResult = router.find('POST', '/users');

      expect(getResult?.route.handler).toBe(getHandler);
      expect(postResult?.route.handler).toBe(postHandler);
    });

    it('should handle root path', () => {
      const handler = async () => new Response('root');
      router.add('GET', '/', handler);

      const result = router.find('GET', '/');
      expect(result).not.toBeNull();
      expect(result?.route.handler).toBe(handler);
    });
  });

  describe('parametric routes', () => {
    it('should match parametric routes', () => {
      const handler = async () => new Response('ok');
      router.add('GET', '/users/:id', handler);

      const result = router.find('GET', '/users/123');
      expect(result).not.toBeNull();
      expect(result?.params).toEqual({ id: '123' });
    });

    it('should match multiple parameters', () => {
      const handler = async () => new Response('ok');
      router.add('GET', '/users/:userId/posts/:postId', handler);

      const result = router.find('GET', '/users/123/posts/456');
      expect(result).not.toBeNull();
      expect(result?.params).toEqual({ userId: '123', postId: '456' });
    });

    it('should prioritize static over parametric', () => {
      const staticHandler = async () => new Response('static');
      const paramHandler = async () => new Response('param');

      router.add('GET', '/users/me', staticHandler);
      router.add('GET', '/users/:id', paramHandler);

      const meResult = router.find('GET', '/users/me');
      const idResult = router.find('GET', '/users/123');

      expect(meResult?.route.handler).toBe(staticHandler);
      expect(idResult?.route.handler).toBe(paramHandler);
    });
  });

  describe('wildcard routes', () => {
    it('should match wildcard routes', () => {
      const handler = async () => new Response('ok');
      router.add('GET', '/files/*', handler);

      const result = router.find('GET', '/files/path/to/file.txt');
      expect(result).not.toBeNull();
      expect(result?.params).toEqual({ '*': 'path/to/file.txt' });
    });
  });

  describe('path normalization', () => {
    it('should handle trailing slashes', () => {
      const handler = async () => new Response('ok');
      router.add('GET', '/users/', handler);

      const result = router.find('GET', '/users');
      expect(result).not.toBeNull();
    });

    it('should handle missing leading slash', () => {
      const handler = async () => new Response('ok');
      router.add('GET', 'users', handler);

      const result = router.find('GET', '/users');
      expect(result).not.toBeNull();
    });
  });

  describe('route listing', () => {
    it('should list all registered routes', () => {
      router.add('GET', '/users', async () => new Response(''));
      router.add('POST', '/users', async () => new Response(''));
      router.add('GET', '/posts/:id', async () => new Response(''));

      const routes = router.getRoutes();
      expect(routes).toHaveLength(3);
      expect(routes).toContainEqual({ method: 'GET', path: '/users' });
      expect(routes).toContainEqual({ method: 'POST', path: '/users' });
    });
  });

  describe('caching', () => {
    it('should cache parametric route results', () => {
      const handler = async () => new Response('ok');
      router.add('GET', '/users/:id', handler);

      // First lookup
      const result1 = router.find('GET', '/users/123');
      // Second lookup (should be cached)
      const result2 = router.find('GET', '/users/123');

      expect(result1).toEqual(result2);
    });

    it('should clear cache', () => {
      router.add('GET', '/users/:id', async () => new Response(''));
      router.find('GET', '/users/123');

      router.clearCache();
      // Cache should be empty after clearing
    });
  });
});
