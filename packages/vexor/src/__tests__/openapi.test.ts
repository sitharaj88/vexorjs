/**
 * OpenAPI Generator Tests
 *
 * Tests for the OpenAPI 3.1 specification generator
 */

import { describe, it, expect } from 'vitest';
import { Type } from '../schema/type.js';
import { OpenAPIGenerator, createOpenAPIGenerator } from '../openapi/generator.js';

describe('OpenAPI Generator', () => {
  describe('Basic Generation', () => {
    it('should generate basic OpenAPI document', () => {
      const generator = new OpenAPIGenerator({
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
      });

      const doc = generator.generate();

      expect(doc.openapi).toBe('3.1.0');
      expect(doc.info.title).toBe('Test API');
      expect(doc.info.version).toBe('1.0.0');
      expect(doc.paths).toEqual({});
    });

    it('should use default info if not provided', () => {
      const generator = new OpenAPIGenerator();
      const doc = generator.generate();

      expect(doc.info.title).toBe('Vexor API');
      expect(doc.info.version).toBe('1.0.0');
    });
  });

  describe('Route Registration', () => {
    it('should add GET route', () => {
      const generator = new OpenAPIGenerator();

      generator.addRoute({
        method: 'GET',
        path: '/users',
        schema: {
          response: {
            200: Type.Array(Type.Object({
              id: Type.String(),
              name: Type.String(),
            })),
          },
        },
      });

      const doc = generator.generate();

      expect(doc.paths['/users']).toBeDefined();
      expect(doc.paths['/users'].get).toBeDefined();
      expect(doc.paths['/users'].get?.responses['200']).toBeDefined();
    });

    it('should add POST route with body', () => {
      const generator = new OpenAPIGenerator();

      generator.addRoute({
        method: 'POST',
        path: '/users',
        schema: {
          body: Type.Object({
            name: Type.String(),
            email: Type.String({ format: 'email' }),
          }),
          response: {
            201: Type.Object({
              id: Type.String(),
            }),
          },
        },
      });

      const doc = generator.generate();

      expect(doc.paths['/users'].post?.requestBody).toBeDefined();
      expect(doc.paths['/users'].post?.requestBody?.content['application/json']).toBeDefined();
    });

    it('should convert path params from :param to {param}', () => {
      const generator = new OpenAPIGenerator();

      generator.addRoute({
        method: 'GET',
        path: '/users/:id',
        schema: {
          params: Type.Object({
            id: Type.String(),
          }),
        },
      });

      const doc = generator.generate();

      expect(doc.paths['/users/{id}']).toBeDefined();
      expect(doc.paths['/users/{id}'].get?.parameters).toBeDefined();
    });

    it('should add query parameters', () => {
      const generator = new OpenAPIGenerator();

      generator.addRoute({
        method: 'GET',
        path: '/users',
        schema: {
          query: Type.Object({
            page: Type.Number(),
            limit: Type.Number(),
          }),
        },
      });

      const doc = generator.generate();

      const params = doc.paths['/users'].get?.parameters;
      expect(params).toBeDefined();
      expect(params?.some(p => p.name === 'page' && p.in === 'query')).toBe(true);
      expect(params?.some(p => p.name === 'limit' && p.in === 'query')).toBe(true);
    });

    it('should add header parameters', () => {
      const generator = new OpenAPIGenerator();

      generator.addRoute({
        method: 'GET',
        path: '/protected',
        schema: {
          headers: Type.Object({
            authorization: Type.String(),
          }),
        },
      });

      const doc = generator.generate();

      const params = doc.paths['/protected'].get?.parameters;
      expect(params?.some(p => p.name === 'authorization' && p.in === 'header')).toBe(true);
    });
  });

  describe('Route Metadata', () => {
    it('should add route summary and description', () => {
      const generator = new OpenAPIGenerator();

      generator.addRoute({
        method: 'GET',
        path: '/users',
        meta: {
          summary: 'Get all users',
          description: 'Retrieves a list of all users in the system',
        },
      });

      const doc = generator.generate();

      expect(doc.paths['/users'].get?.summary).toBe('Get all users');
      expect(doc.paths['/users'].get?.description).toBe('Retrieves a list of all users in the system');
    });

    it('should add tags', () => {
      const generator = new OpenAPIGenerator();

      generator.addRoute({
        method: 'GET',
        path: '/users',
        meta: {
          tags: ['users', 'admin'],
        },
      });

      const doc = generator.generate();

      expect(doc.paths['/users'].get?.tags).toEqual(['users', 'admin']);
    });

    it('should add operationId', () => {
      const generator = new OpenAPIGenerator();

      generator.addRoute({
        method: 'GET',
        path: '/users',
        meta: {
          operationId: 'getUsers',
        },
      });

      const doc = generator.generate();

      expect(doc.paths['/users'].get?.operationId).toBe('getUsers');
    });

    it('should mark route as deprecated', () => {
      const generator = new OpenAPIGenerator();

      generator.addRoute({
        method: 'GET',
        path: '/old-endpoint',
        meta: {
          deprecated: true,
        },
      });

      const doc = generator.generate();

      expect(doc.paths['/old-endpoint'].get?.deprecated).toBe(true);
    });
  });

  describe('Multiple HTTP Methods', () => {
    it('should support multiple methods on same path', () => {
      const generator = new OpenAPIGenerator();

      generator.addRoute({
        method: 'GET',
        path: '/users',
        meta: { summary: 'Get users' },
      });

      generator.addRoute({
        method: 'POST',
        path: '/users',
        meta: { summary: 'Create user' },
      });

      const doc = generator.generate();

      expect(doc.paths['/users'].get?.summary).toBe('Get users');
      expect(doc.paths['/users'].post?.summary).toBe('Create user');
    });

    it('should support all HTTP methods', () => {
      const generator = new OpenAPIGenerator();
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'] as const;

      for (const method of methods) {
        generator.addRoute({
          method,
          path: '/test',
        });
      }

      const doc = generator.generate();

      expect(doc.paths['/test'].get).toBeDefined();
      expect(doc.paths['/test'].post).toBeDefined();
      expect(doc.paths['/test'].put).toBeDefined();
      expect(doc.paths['/test'].delete).toBeDefined();
      expect(doc.paths['/test'].patch).toBeDefined();
      expect(doc.paths['/test'].head).toBeDefined();
      expect(doc.paths['/test'].options).toBeDefined();
    });
  });

  describe('Server Configuration', () => {
    it('should add servers', () => {
      const generator = new OpenAPIGenerator({
        servers: [
          { url: 'https://api.example.com', description: 'Production' },
          { url: 'https://staging.example.com', description: 'Staging' },
        ],
      });

      const doc = generator.generate();

      expect(doc.servers).toHaveLength(2);
      expect(doc.servers?.[0].url).toBe('https://api.example.com');
    });
  });

  describe('Tags Configuration', () => {
    it('should add global tags', () => {
      const generator = new OpenAPIGenerator({
        tags: [
          { name: 'users', description: 'User operations' },
          { name: 'posts', description: 'Post operations' },
        ],
      });

      const doc = generator.generate();

      expect(doc.tags).toHaveLength(2);
      expect(doc.tags?.[0].name).toBe('users');
    });
  });

  describe('Security Schemes', () => {
    it('should add security schemes', () => {
      const generator = new OpenAPIGenerator({
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      });

      const doc = generator.generate();

      expect(doc.components?.securitySchemes?.bearerAuth).toBeDefined();
      expect(doc.components?.securitySchemes?.bearerAuth.type).toBe('http');
    });
  });

  describe('JSON Output', () => {
    it('should generate JSON string', () => {
      const generator = new OpenAPIGenerator({
        info: { title: 'Test', version: '1.0.0' },
      });

      const json = generator.toJSON();

      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('should generate pretty JSON', () => {
      const generator = new OpenAPIGenerator();
      const json = generator.toJSON(true);

      expect(json).toContain('\n');
    });
  });

  describe('createOpenAPIGenerator helper', () => {
    it('should create generator instance', () => {
      const generator = createOpenAPIGenerator({
        info: { title: 'Test', version: '1.0.0' },
      });

      expect(generator).toBeInstanceOf(OpenAPIGenerator);
    });
  });

  describe('Complex Schemas', () => {
    it('should handle nested objects in schema', () => {
      const generator = new OpenAPIGenerator();

      generator.addRoute({
        method: 'POST',
        path: '/orders',
        schema: {
          body: Type.Object({
            user: Type.Object({
              id: Type.String(),
              address: Type.Object({
                street: Type.String(),
                city: Type.String(),
              }),
            }),
            items: Type.Array(Type.Object({
              productId: Type.String(),
              quantity: Type.Number(),
            })),
          }),
        },
      });

      const doc = generator.generate();

      const bodySchema = doc.paths['/orders'].post?.requestBody?.content['application/json'].schema;
      expect(bodySchema?.properties?.user).toBeDefined();
      expect(bodySchema?.properties?.items).toBeDefined();
    });

    it('should handle union types', () => {
      const generator = new OpenAPIGenerator();

      generator.addRoute({
        method: 'GET',
        path: '/result',
        schema: {
          response: {
            200: Type.Union([
              Type.Object({ success: Type.Literal(true), data: Type.String() }),
              Type.Object({ success: Type.Literal(false), error: Type.String() }),
            ]),
          },
        },
      });

      const doc = generator.generate();

      const responseSchema = doc.paths['/result'].get?.responses['200'].content?.['application/json'].schema;
      expect(responseSchema?.anyOf).toBeDefined();
    });
  });
});
