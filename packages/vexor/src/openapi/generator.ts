/**
 * OpenAPI Generator
 *
 * Automatically generates OpenAPI 3.1 specifications from Vexor routes.
 */

import type { TSchema, TObject, TProperties } from '../schema/types.js';
import { OptionalKind } from '../schema/types.js';

/**
 * OpenAPI 3.1 Document
 */
export interface OpenAPIDocument {
  openapi: '3.1.0';
  info: OpenAPIInfo;
  servers?: OpenAPIServer[];
  paths: Record<string, OpenAPIPathItem>;
  components?: OpenAPIComponents;
  tags?: OpenAPITag[];
}

/**
 * OpenAPI Info
 */
export interface OpenAPIInfo {
  title: string;
  version: string;
  description?: string;
  termsOfService?: string;
  contact?: {
    name?: string;
    url?: string;
    email?: string;
  };
  license?: {
    name: string;
    url?: string;
  };
}

/**
 * OpenAPI Server
 */
export interface OpenAPIServer {
  url: string;
  description?: string;
  variables?: Record<string, { default: string; enum?: string[]; description?: string }>;
}

/**
 * OpenAPI Tag
 */
export interface OpenAPITag {
  name: string;
  description?: string;
}

/**
 * OpenAPI Path Item
 */
export interface OpenAPIPathItem {
  summary?: string;
  description?: string;
  get?: OpenAPIOperation;
  post?: OpenAPIOperation;
  put?: OpenAPIOperation;
  delete?: OpenAPIOperation;
  patch?: OpenAPIOperation;
  head?: OpenAPIOperation;
  options?: OpenAPIOperation;
  parameters?: OpenAPIParameter[];
}

/**
 * OpenAPI Operation
 */
export interface OpenAPIOperation {
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: OpenAPIParameter[];
  requestBody?: OpenAPIRequestBody;
  responses: Record<string, OpenAPIResponse>;
  security?: OpenAPISecurityRequirement[];
  deprecated?: boolean;
}

/**
 * OpenAPI Parameter
 */
export interface OpenAPIParameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  schema: OpenAPISchema;
}

/**
 * OpenAPI Request Body
 */
export interface OpenAPIRequestBody {
  description?: string;
  required?: boolean;
  content: Record<string, OpenAPIMediaType>;
}

/**
 * OpenAPI Response
 */
export interface OpenAPIResponse {
  description: string;
  headers?: Record<string, { description?: string; schema: OpenAPISchema }>;
  content?: Record<string, OpenAPIMediaType>;
}

/**
 * OpenAPI Media Type
 */
export interface OpenAPIMediaType {
  schema: OpenAPISchema;
  example?: unknown;
  examples?: Record<string, { value: unknown; summary?: string; description?: string }>;
}

/**
 * OpenAPI Schema (JSON Schema compatible)
 */
export type OpenAPISchema = TSchema & {
  nullable?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
};

/**
 * OpenAPI Components
 */
export interface OpenAPIComponents {
  schemas?: Record<string, OpenAPISchema>;
  responses?: Record<string, OpenAPIResponse>;
  parameters?: Record<string, OpenAPIParameter>;
  requestBodies?: Record<string, OpenAPIRequestBody>;
  securitySchemes?: Record<string, OpenAPISecurityScheme>;
}

/**
 * OpenAPI Security Scheme
 */
export interface OpenAPISecurityScheme {
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
  description?: string;
  name?: string;
  in?: 'query' | 'header' | 'cookie';
  scheme?: string;
  bearerFormat?: string;
  flows?: OpenAPIOAuthFlows;
  openIdConnectUrl?: string;
}

/**
 * OpenAPI OAuth Flows
 */
export interface OpenAPIOAuthFlows {
  implicit?: OpenAPIOAuthFlow;
  password?: OpenAPIOAuthFlow;
  clientCredentials?: OpenAPIOAuthFlow;
  authorizationCode?: OpenAPIOAuthFlow;
}

/**
 * OpenAPI OAuth Flow
 */
export interface OpenAPIOAuthFlow {
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  scopes: Record<string, string>;
}

/**
 * OpenAPI Security Requirement
 */
export type OpenAPISecurityRequirement = Record<string, string[]>;

/**
 * Route schema for OpenAPI generation
 */
export interface RouteSchema {
  params?: TSchema;
  query?: TSchema;
  body?: TSchema;
  headers?: TSchema;
  response?: Record<number, TSchema>;
}

/**
 * Route metadata for OpenAPI
 */
export interface RouteMeta {
  summary?: string;
  description?: string;
  tags?: string[];
  operationId?: string;
  deprecated?: boolean;
  security?: OpenAPISecurityRequirement[];
}

/**
 * Route definition for OpenAPI generation
 */
export interface RouteDefinition {
  method: string;
  path: string;
  schema?: RouteSchema;
  meta?: RouteMeta;
}

/**
 * OpenAPI Generator Options
 */
export interface GeneratorOptions {
  info?: Partial<OpenAPIInfo>;
  servers?: OpenAPIServer[];
  tags?: OpenAPITag[];
  securitySchemes?: Record<string, OpenAPISecurityScheme>;
  defaultResponses?: Record<string, OpenAPIResponse>;
}

/**
 * Convert Vexor schema to OpenAPI schema
 */
function toOpenAPISchema(schema: TSchema): OpenAPISchema {
  // Handle optional
  if (OptionalKind in schema) {
    const wrapped = (schema as unknown as { wrapped: TSchema }).wrapped;
    return { ...toOpenAPISchema(wrapped), nullable: true };
  }

  // Start with base schema properties
  let result: Record<string, unknown> = { ...schema };

  // Handle object properties recursively
  if (schema.type === 'object' && 'properties' in schema) {
    const properties: Record<string, OpenAPISchema> = {};
    for (const [key, propSchema] of Object.entries((schema as TObject).properties)) {
      properties[key] = toOpenAPISchema(propSchema);
    }
    result = { ...result, properties };
  }

  // Handle array items recursively
  if (schema.type === 'array' && 'items' in schema) {
    result = { ...result, items: toOpenAPISchema((schema as { items: TSchema }).items) };
  }

  // Handle union (anyOf)
  if ('anyOf' in schema) {
    result = { ...result, anyOf: ((schema as { anyOf: TSchema[] }).anyOf).map(toOpenAPISchema) };
  }

  return result as OpenAPISchema;
}

/**
 * Convert path with :params to OpenAPI format {params}
 */
function toOpenAPIPath(path: string): string {
  return path.replace(/:(\w+)/g, '{$1}');
}

/**
 * Extract parameters from path
 */
function extractPathParams(path: string): string[] {
  const matches = path.match(/:(\w+)/g);
  return matches ? matches.map((m) => m.slice(1)) : [];
}

/**
 * Generate OpenAPI parameters from schema
 */
function generateParameters(
  schema: RouteSchema,
  path: string
): OpenAPIParameter[] {
  const parameters: OpenAPIParameter[] = [];
  const pathParams = extractPathParams(path);

  // Path parameters
  if (schema.params && 'properties' in schema.params) {
    const props = (schema.params as TObject<TProperties>).properties;
    for (const [name, propSchema] of Object.entries(props)) {
      if (pathParams.includes(name)) {
        parameters.push({
          name,
          in: 'path',
          required: true,
          schema: toOpenAPISchema(propSchema),
          description: propSchema.description,
        });
      }
    }
  }

  // Query parameters
  if (schema.query && 'properties' in schema.query) {
    const props = (schema.query as TObject<TProperties>).properties;
    const required = new Set(
      (schema.query as TObject).required ?? []
    );
    for (const [name, propSchema] of Object.entries(props)) {
      const isOptional = OptionalKind in propSchema;
      parameters.push({
        name,
        in: 'query',
        required: !isOptional && required.has(name),
        schema: toOpenAPISchema(propSchema),
        description: propSchema.description,
      });
    }
  }

  // Header parameters
  if (schema.headers && 'properties' in schema.headers) {
    const props = (schema.headers as TObject<TProperties>).properties;
    const required = new Set(
      (schema.headers as TObject).required ?? []
    );
    for (const [name, propSchema] of Object.entries(props)) {
      const isOptional = OptionalKind in propSchema;
      parameters.push({
        name,
        in: 'header',
        required: !isOptional && required.has(name),
        schema: toOpenAPISchema(propSchema),
        description: propSchema.description,
      });
    }
  }

  return parameters;
}

/**
 * Generate OpenAPI request body from schema
 */
function generateRequestBody(schema: TSchema): OpenAPIRequestBody {
  return {
    required: true,
    content: {
      'application/json': {
        schema: toOpenAPISchema(schema),
      },
    },
  };
}

/**
 * Generate OpenAPI responses from schema
 */
function generateResponses(
  responseSchema?: Record<number, TSchema>,
  defaultResponses?: Record<string, OpenAPIResponse>
): Record<string, OpenAPIResponse> {
  const responses: Record<string, OpenAPIResponse> = {};

  // Add default responses
  if (defaultResponses) {
    Object.assign(responses, defaultResponses);
  }

  // Add schema-defined responses
  if (responseSchema) {
    for (const [status, schema] of Object.entries(responseSchema)) {
      responses[status] = {
        description: schema.description ?? `Response ${status}`,
        content: {
          'application/json': {
            schema: toOpenAPISchema(schema),
          },
        },
      };
    }
  }

  // Ensure at least a 200 response
  if (!responses['200'] && !responses['default']) {
    responses['200'] = {
      description: 'Successful response',
    };
  }

  return responses;
}

/**
 * OpenAPI Generator class
 */
export class OpenAPIGenerator {
  private routes: RouteDefinition[] = [];
  private options: GeneratorOptions;
  private schemas: Map<string, OpenAPISchema> = new Map();

  constructor(options: GeneratorOptions = {}) {
    this.options = options;
  }

  /**
   * Add a route to the generator
   */
  addRoute(route: RouteDefinition): void {
    this.routes.push(route);
  }

  /**
   * Add multiple routes
   */
  addRoutes(routes: RouteDefinition[]): void {
    this.routes.push(...routes);
  }

  /**
   * Register a named schema (for $ref)
   */
  registerSchema(name: string, schema: TSchema): void {
    this.schemas.set(name, toOpenAPISchema(schema));
  }

  /**
   * Generate OpenAPI document
   */
  generate(): OpenAPIDocument {
    const paths: Record<string, OpenAPIPathItem> = {};

    for (const route of this.routes) {
      const openAPIPath = toOpenAPIPath(route.path);
      const method = route.method.toLowerCase() as keyof OpenAPIPathItem;

      if (!paths[openAPIPath]) {
        paths[openAPIPath] = {};
      }

      const operation: OpenAPIOperation = {
        summary: route.meta?.summary,
        description: route.meta?.description,
        tags: route.meta?.tags,
        operationId: route.meta?.operationId,
        deprecated: route.meta?.deprecated,
        security: route.meta?.security,
        responses: generateResponses(
          route.schema?.response,
          this.options.defaultResponses
        ),
      };

      // Add parameters
      if (route.schema) {
        const params = generateParameters(route.schema, route.path);
        if (params.length > 0) {
          operation.parameters = params;
        }

        // Add request body
        if (route.schema.body && !['get', 'head', 'delete'].includes(method)) {
          operation.requestBody = generateRequestBody(route.schema.body);
        }
      }

      (paths[openAPIPath] as Record<string, OpenAPIOperation>)[method] = operation;
    }

    // Build components
    const components: OpenAPIComponents = {};

    if (this.schemas.size > 0) {
      components.schemas = Object.fromEntries(this.schemas);
    }

    if (this.options.securitySchemes) {
      components.securitySchemes = this.options.securitySchemes;
    }

    return {
      openapi: '3.1.0',
      info: {
        title: 'Vexor API',
        version: '1.0.0',
        ...this.options.info,
      },
      servers: this.options.servers,
      tags: this.options.tags,
      paths,
      ...(Object.keys(components).length > 0 && { components }),
    };
  }

  /**
   * Generate OpenAPI document as JSON string
   */
  toJSON(pretty = false): string {
    const doc = this.generate();
    return pretty ? JSON.stringify(doc, null, 2) : JSON.stringify(doc);
  }

  /**
   * Generate OpenAPI document as YAML string
   * Note: Requires external YAML library for full support
   */
  toYAML(): string {
    // Basic YAML generation (simplified)
    const doc = this.generate();
    return this.objectToYAML(doc, 0);
  }

  /**
   * Simple object to YAML converter
   */
  private objectToYAML(obj: unknown, indent: number): string {
    const spaces = '  '.repeat(indent);

    if (obj === null || obj === undefined) {
      return 'null';
    }

    if (typeof obj === 'string') {
      if (obj.includes('\n') || obj.includes(':') || obj.includes('#')) {
        return `"${obj.replace(/"/g, '\\"')}"`;
      }
      return obj;
    }

    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return String(obj);
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      return obj
        .map((item) => `${spaces}- ${this.objectToYAML(item, indent + 1).trimStart()}`)
        .join('\n');
    }

    if (typeof obj === 'object') {
      const entries = Object.entries(obj).filter(([, v]) => v !== undefined);
      if (entries.length === 0) return '{}';
      return entries
        .map(([key, value]) => {
          const yamlValue = this.objectToYAML(value, indent + 1);
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            return `${spaces}${key}:\n${yamlValue}`;
          }
          return `${spaces}${key}: ${yamlValue}`;
        })
        .join('\n');
    }

    return String(obj);
  }

  /**
   * Clear all routes and schemas
   */
  clear(): void {
    this.routes = [];
    this.schemas.clear();
  }
}

/**
 * Create an OpenAPI generator
 */
export function createOpenAPIGenerator(options?: GeneratorOptions): OpenAPIGenerator {
  return new OpenAPIGenerator(options);
}
