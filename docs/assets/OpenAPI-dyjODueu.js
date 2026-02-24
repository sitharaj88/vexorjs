import{j as e,C as t,I as s,L as a,A as r}from"./index-Bga0OgzL.js";const o=`import { Vexor, Type } from '@vexorjs/core';
import { createOpenAPIGenerator } from '@vexorjs/core/openapi';

const app = new Vexor();

// Create an OpenAPI spec generator
const openapi = createOpenAPIGenerator({
  info: {
    title: 'My API',
    version: '1.0.0',
    description: 'A sample API built with Vexor',
  },
  servers: [
    { url: 'https://api.example.com', description: 'Production' },
    { url: 'http://localhost:3000', description: 'Development' },
  ],
});

// Define routes with schema annotations
app.get('/users', {
  query: Type.Object({
    page: Type.Optional(Type.Integer({ minimum: 1 })),
    limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })),
  }),
  response: {
    200: Type.Object({
      users: Type.Array(Type.Object({
        id: Type.String(),
        name: Type.String(),
        email: Type.String(),
      })),
      total: Type.Integer(),
    }),
  },
  meta: {
    summary: 'List users',
    description: 'Returns a paginated list of all users',
    tags: ['Users'],
  },
}, async (ctx) => {
  // handler...
});

// Auto-discover routes from the Vexor app
openapi.addRoutes(app);

// Serve the JSON spec
app.get('/openapi.json', async (ctx) => {
  return ctx.json(openapi.generate());
});

app.listen(3000);`,n=`import { Vexor, Type } from '@vexorjs/core';
import type { RouteMeta } from '@vexorjs/core/openapi';

// Route with full OpenAPI annotations
app.post('/users', {
  // Request schemas
  body: Type.Object({
    name: Type.String({ minLength: 1, maxLength: 200, description: 'Full name' }),
    email: Type.String({ format: 'email', description: 'Email address' }),
    role: Type.Optional(Type.Union([
      Type.Literal('admin'),
      Type.Literal('editor'),
      Type.Literal('viewer'),
    ], { description: 'User role', default: 'viewer' })),
  }),
  headers: Type.Object({
    'x-request-id': Type.Optional(Type.String({ description: 'Correlation ID for tracing' })),
  }),

  // Response schemas for each status code
  response: {
    201: Type.Object({
      id: Type.String({ description: 'User ID' }),
      name: Type.String(),
      email: Type.String(),
      role: Type.String(),
      createdAt: Type.String({ format: 'date-time' }),
    }),
    400: Type.Object({
      error: Type.String(),
      details: Type.Array(Type.Object({
        field: Type.String(),
        message: Type.String(),
      })),
    }),
    409: Type.Object({
      error: Type.Literal('Email already exists'),
    }),
  },

  // OpenAPI metadata
  meta: {
    summary: 'Create a user',
    description: 'Creates a new user account and sends a welcome email.',
    tags: ['Users'],
    operationId: 'createUser',
    deprecated: false,
    security: [{ bearerAuth: [] }],
  },
}, async (ctx) => {
  // handler...
});

// Route parameters with descriptions
app.get('/users/:id/posts/:postId', {
  params: Type.Object({
    id: Type.String({ description: 'User ID' }),
    postId: Type.String({ description: 'Post ID' }),
  }),
  query: Type.Object({
    includeComments: Type.Optional(Type.Boolean({ description: 'Include comment thread' })),
  }),
  response: {
    200: Type.Object({
      post: Type.Object({
        id: Type.String(),
        title: Type.String(),
        content: Type.String(),
        comments: Type.Optional(Type.Array(Type.Object({
          id: Type.String(),
          text: Type.String(),
          author: Type.String(),
        }))),
      }),
    }),
    404: Type.Object({ error: Type.String() }),
  },
  meta: {
    summary: 'Get a user post',
    tags: ['Users', 'Posts'],
    operationId: 'getUserPost',
  },
}, async (ctx) => {
  // handler...
});`,i=`import { createOpenAPIGenerator } from '@vexorjs/core/openapi';
import { Type } from '@vexorjs/core';

const openapi = createOpenAPIGenerator({
  info: { title: 'My API', version: '1.0.0' },
});

// Register reusable schemas as components
openapi.registerSchema('User', Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.String(),
  email: Type.String({ format: 'email' }),
  role: Type.Union([
    Type.Literal('admin'),
    Type.Literal('editor'),
    Type.Literal('viewer'),
  ]),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
}));

openapi.registerSchema('PaginatedResponse', Type.Object({
  data: Type.Array(Type.Unknown()),
  pagination: Type.Object({
    page: Type.Integer(),
    limit: Type.Integer(),
    total: Type.Integer(),
    totalPages: Type.Integer(),
  }),
}));

openapi.registerSchema('ErrorResponse', Type.Object({
  error: Type.String(),
  message: Type.String(),
  statusCode: Type.Integer(),
  details: Type.Optional(Type.Array(Type.Object({
    field: Type.String(),
    message: Type.String(),
  }))),
}));

// Reference registered schemas in route definitions
app.get('/users', {
  response: {
    200: Type.Ref('PaginatedResponse'),
    401: Type.Ref('ErrorResponse'),
  },
  meta: {
    summary: 'List users',
    tags: ['Users'],
  },
}, async (ctx) => {
  // handler...
});

// Add security scheme definitions
openapi.registerSchema('BearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
}, { isSecurityScheme: true });

// Generated spec includes $ref pointers:
// { "$ref": "#/components/schemas/User" }`,c=`import { Vexor } from '@vexorjs/core';
import { createOpenAPIGenerator, serveSwaggerUI } from '@vexorjs/core/openapi';

const app = new Vexor();

const openapi = createOpenAPIGenerator({
  info: {
    title: 'My API',
    version: '1.0.0',
    description: 'Interactive API documentation',
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    { url: 'https://api.example.com', description: 'Production' },
    { url: 'https://staging-api.example.com', description: 'Staging' },
    { url: 'http://localhost:3000', description: 'Local' },
  ],
  tags: [
    { name: 'Users', description: 'User management endpoints' },
    { name: 'Posts', description: 'Blog post endpoints' },
    { name: 'Auth', description: 'Authentication endpoints' },
  ],
});

// ... register routes ...
openapi.addRoutes(app);

// Serve the raw OpenAPI spec
app.get('/openapi.json', async (ctx) => {
  return ctx.json(openapi.generate());
});

// Serve Swagger UI at /docs
app.use(serveSwaggerUI('/docs', {
  specUrl: '/openapi.json',
  title: 'My API Documentation',
  // Optional customization
  theme: 'dark',
  defaultExpanded: true,
  tryItOut: true,
}));

// Now visit http://localhost:3000/docs to see interactive docs

app.listen(3000);
console.log('API docs available at http://localhost:3000/docs');`,d=`import { createOpenAPIGenerator } from '@vexorjs/core/openapi';

const openapi = createOpenAPIGenerator({
  info: { title: 'My API', version: '1.0.0' },
});

// ... register routes and schemas ...
openapi.addRoutes(app);

// Generate as JSON object
const spec = openapi.generate();

// Serialize to JSON string
const json = openapi.toJSON();
// {
//   "openapi": "3.1.0",
//   "info": { "title": "My API", "version": "1.0.0" },
//   "paths": { ... },
//   "components": { ... }
// }

// Serialize to YAML string
const yaml = openapi.toYAML();
// openapi: "3.1.0"
// info:
//   title: My API
//   version: "1.0.0"
// paths:
//   /users:
//     get:
//       summary: List users
//       ...

// Serve both formats
app.get('/openapi.json', async (ctx) => {
  return ctx.json(openapi.generate());
});

app.get('/openapi.yaml', async (ctx) => {
  return ctx.text(openapi.toYAML(), {
    headers: { 'Content-Type': 'text/yaml; charset=utf-8' },
  });
});

// Write spec to file for CI/CD or code generation
import { writeFileSync } from 'node:fs';
writeFileSync('./openapi.json', openapi.toJSON());
writeFileSync('./openapi.yaml', openapi.toYAML());

// Clear the generator (useful for testing)
openapi.clear();`;function p(){return e.jsxs("div",{className:"space-y-12",children:[e.jsxs("div",{children:[e.jsx("h1",{id:"openapi",className:"text-4xl font-bold text-slate-900 dark:text-white mb-4",children:"OpenAPI / Swagger"}),e.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400 mb-4",children:"The OpenAPI Specification (formerly known as Swagger) is a standard, language-agnostic format for describing HTTP APIs. An OpenAPI document is a structured JSON or YAML file that enumerates every endpoint in your API, the parameters each endpoint accepts, the shape of request and response bodies, authentication requirements, and human-readable descriptions. This single document serves as the contract between your backend and every consumer -- frontend teams, mobile developers, third-party integrators, and automated tools."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Vexor's OpenAPI module generates this specification automatically from the route schemas and metadata you already define for validation and type safety. Because the spec is derived from the same source of truth as your runtime validation, it is always accurate and up to date -- there is no risk of the documentation diverging from the actual API behavior. This eliminates the tedious and error-prone process of maintaining a separate OpenAPI file by hand, and ensures that every schema change, new endpoint, or deprecated field is immediately reflected in the generated documentation."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Beyond documentation, an accurate OpenAPI spec unlocks a powerful ecosystem of tooling. Code generators like OpenAPI Generator and openapi-typescript can produce type-safe client SDKs in any language directly from your spec. API gateways like Kong, Apigee, and AWS API Gateway can import the spec to configure routing, validation, and rate limiting. Testing tools can generate test cases from the spec to verify that your API conforms to its contract. Contract testing frameworks can compare spec versions to detect breaking changes before they reach production."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400",children:"This page explains the structure of an OpenAPI specification, how Vexor maps route definitions to spec paths and operations, how to register reusable schemas as components, and how to serve interactive Swagger UI documentation."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"how-it-works",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"How Auto-Generation Works"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["An OpenAPI 3.1 specification has a well-defined structure. At the top level, it contains metadata (",e.jsx("code",{className:"prose-code",children:"info"})," with title, version, description), server URLs, and a ",e.jsx("code",{className:"prose-code",children:"paths"})," object that maps URL patterns to their operations. Each path can have operations for different HTTP methods (GET, POST, PUT, DELETE), and each operation describes its parameters, request body, responses, security requirements, and documentation metadata."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["When you call ",e.jsx("code",{className:"prose-code",children:"openapi.addRoutes(app)"}),", Vexor iterates over all registered routes in your application. For each route, it examines the schema definitions you provided for ",e.jsx("code",{className:"prose-code",children:"params"}),","," ",e.jsx("code",{className:"prose-code",children:"query"}),", ",e.jsx("code",{className:"prose-code",children:"body"}),","," ",e.jsx("code",{className:"prose-code",children:"headers"}),", and ",e.jsx("code",{className:"prose-code",children:"response"}),". These TypeBox schemas are JSON Schema-compatible, so the generator can translate them directly into the OpenAPI spec's schema objects without any lossy conversion."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Route path parameters (like ",e.jsx("code",{className:"prose-code",children:":id"})," in"," ",e.jsx("code",{className:"prose-code",children:"/users/:id"}),") are converted to OpenAPI path parameters with the corresponding schema from your ",e.jsx("code",{className:"prose-code",children:"params"})," ","definition. Query string schemas become query parameters. Request body schemas become the"," ",e.jsx("code",{className:"prose-code",children:"requestBody"})," with a JSON content type. Response schemas are mapped to their respective status codes under the"," ",e.jsx("code",{className:"prose-code",children:"responses"})," object. The"," ",e.jsx("code",{className:"prose-code",children:"meta"})," property on routes provides OpenAPI-specific metadata like summaries, descriptions, tags, and operation IDs."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"The result is a complete, valid OpenAPI 3.1 document that can be served as JSON or YAML. Routes without schema definitions are still included with generic types, but adding schemas produces significantly more useful documentation. The more detailed your schemas are (with descriptions, formats, examples, and constraints), the more useful the generated spec becomes for consumers."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"when-to-use",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Why Auto-Generation Matters"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"The traditional approach to API documentation is to maintain an OpenAPI file separately from the implementation. A developer adds a new endpoint, then (hopefully) updates the OpenAPI spec to match. In practice, this manual synchronization breaks down quickly. The spec lags behind the implementation, parameters are misspelled, response shapes are outdated, and new endpoints are missing entirely. Consumers who rely on the spec encounter unexpected behavior, lose trust in the documentation, and resort to reading source code or trial-and-error testing."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Auto-generation from route schemas solves this problem by making the spec a derived artifact, not a manually maintained one. When you change a route's validation schema, the spec changes automatically. When you add a new route, it appears in the spec on the next generation. When you deprecate an endpoint, the deprecation flag in the"," ",e.jsx("code",{className:"prose-code",children:"meta"})," property is reflected immediately. The spec is always a faithful representation of the actual API surface, because it is generated from the same code that enforces the contract at runtime."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["This approach also encourages better schema design. Because your schemas serve double duty -- as runtime validators and as documentation source -- you are incentivized to add descriptions, format hints, examples, and constraints. A schema with"," ",e.jsxs("code",{className:"prose-code",children:["Type.String(",'{ format: "email", description: "Email address" }',")"]})," ","produces both a runtime email format check and a well-documented field in the spec."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"basic-usage",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Basic Usage"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The entry point is ",e.jsx("code",{className:"prose-code",children:"createOpenAPIGenerator"}),", which accepts your API's metadata: title, version, description, and server URLs. The"," ",e.jsx("code",{className:"prose-code",children:"servers"})," array tells consumers where your API is hosted, and is particularly useful when you have separate production, staging, and development environments that consumers might need to target."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["After defining your routes with schemas and metadata, call"," ",e.jsx("code",{className:"prose-code",children:"openapi.addRoutes(app)"})," to scan the Vexor application and populate the spec with all discovered routes. Then serve the spec at a conventional path like ",e.jsx("code",{className:"prose-code",children:"/openapi.json"}),". This endpoint should be accessible without authentication so that documentation tools, code generators, and API gateways can consume it."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"meta"})," property on each route is where you provide OpenAPI-specific documentation. The ",e.jsx("code",{className:"prose-code",children:"summary"})," is a short description (displayed as the endpoint title in Swagger UI), the"," ",e.jsx("code",{className:"prose-code",children:"description"})," is a longer explanation, and"," ",e.jsx("code",{className:"prose-code",children:"tags"})," group related endpoints in the documentation. While none of these are required, adding them significantly improves the usability of the generated documentation."]}),e.jsx(t,{code:o,filename:"src/app.ts"}),e.jsxs(s,{variant:"tip",children:["Routes without schema definitions are still included in the spec with generic request/response types. Add ",e.jsx("code",{className:"prose-code",children:"body"}),", ",e.jsx("code",{className:"prose-code",children:"query"}),","," ",e.jsx("code",{className:"prose-code",children:"params"}),", and ",e.jsx("code",{className:"prose-code",children:"response"})," ","schemas to generate accurate, detailed documentation."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"route-annotations",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Route Annotations"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Route annotations are the primary mechanism for enriching the generated OpenAPI spec with detailed documentation. The ",e.jsx("code",{className:"prose-code",children:"meta"})," property on route options maps directly to OpenAPI operation fields. The"," ",e.jsx("code",{className:"prose-code",children:"operationId"})," is particularly important for code generation: tools like openapi-typescript-codegen use it to name the generated client methods. An operation ID of ",e.jsx("code",{className:"prose-code",children:"createUser"})," produces a client method called ",e.jsx("code",{className:"prose-code",children:"createUser()"})," rather than a generic name based on the HTTP method and path."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Response schemas should document every status code your endpoint can return. A well-documented API specifies not just the success response, but also validation errors (400), authentication failures (401), authorization failures (403), not-found responses (404), and conflict responses (409). Each status code should have its own schema that describes the exact shape of the error response. This allows consumers to write exhaustive error handling without guesswork."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"security"})," property on the meta object specifies which authentication schemes are required for the endpoint. This integrates with security scheme definitions (registered via ",e.jsx("code",{className:"prose-code",children:"registerSchema"})," with the ",e.jsx("code",{className:"prose-code",children:"isSecurityScheme"}),' flag) to produce a complete authentication model in the spec. Swagger UI uses this information to display a lock icon on protected endpoints and to add authentication fields to the "Try it out" feature.']}),e.jsx(t,{code:n,filename:"src/routes/users.ts"}),e.jsxs(s,{variant:"info",children:["The ",e.jsx("code",{className:"prose-code",children:"operationId"})," field is used by code generators to create client method names. Use camelCase identifiers like"," ",e.jsx("code",{className:"prose-code",children:"createUser"})," or"," ",e.jsx("code",{className:"prose-code",children:"getUserPost"}),"."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"schema-registration",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Schema Registration and Reuse"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Real-world APIs often use the same data shapes across multiple endpoints. A User object might appear in the response of GET /users, GET /users/:id, POST /users, and PUT /users/:id. An ErrorResponse might be the 400 and 500 response for every endpoint. Without schema reuse, these shapes are duplicated throughout the spec, making it harder to maintain and inflating the spec's size."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"registerSchema"})," method registers a named schema in the OpenAPI spec's ",e.jsx("code",{className:"prose-code",children:"components/schemas"})," section. When you reference a registered schema in a route definition using"," ",e.jsx("code",{className:"prose-code",children:"Type.Ref('SchemaName')"}),", the generator produces a"," ",e.jsx("code",{className:"prose-code",children:"$ref"})," pointer instead of inlining the schema. This reduces duplication, improves spec readability, and makes code generators produce cleaner output (shared types instead of duplicated inline definitions)."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Security scheme definitions follow the same registration pattern but with the"," ",e.jsx("code",{className:"prose-code",children:"isSecurityScheme"})," flag. A registered security scheme appears in the ",e.jsx("code",{className:"prose-code",children:"components/securitySchemes"})," section and can be referenced in route meta's ",e.jsx("code",{className:"prose-code",children:"security"}),' property. Common security schemes include Bearer JWT authentication, API key authentication, and OAuth 2.0 flows. Swagger UI uses these definitions to render appropriate authentication inputs in its "Authorize" dialog.']}),e.jsx(t,{code:i,filename:"src/openapi.ts"})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"swagger-ui",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Serving Swagger UI"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Swagger UI transforms your OpenAPI spec into an interactive web application where developers can browse endpoints, read documentation, see request/response schemas, and execute live API calls directly from the browser. It is the single most effective tool for reducing the friction of API adoption: developers can explore your API without writing any code or reading separate documentation."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Vexor's ",e.jsx("code",{className:"prose-code",children:"serveSwaggerUI"})," middleware serves the Swagger UI static assets and configures them to load your spec from the provided URL. The"," ",e.jsx("code",{className:"prose-code",children:"tryItOut"})," option enables the interactive request feature, which lets developers fill in parameters and execute requests against your live API. The"," ",e.jsx("code",{className:"prose-code",children:"theme"})," option switches between light and dark visual themes. Tags defined in your spec are used to group endpoints into collapsible sections."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:'In production, you should consider restricting access to the Swagger UI. While the API spec itself may be public (especially for external APIs), exposing the "Try it out" feature without authentication allows anyone to execute requests against your production API. Common approaches include protecting the /docs path with authentication middleware, disabling the "Try it out" feature in production, or serving the docs only on internal networks.'}),e.jsx(t,{code:c,filename:"src/app.ts"}),e.jsx(s,{variant:"warning",children:"In production, consider restricting access to the Swagger UI endpoint with authentication middleware. Exposing your full API schema publicly can reveal implementation details."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"yaml-output",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Output Formats and CI/CD Integration"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The spec can be serialized in two formats: JSON (via ",e.jsx("code",{className:"prose-code",children:"toJSON()"}),") and YAML (via ",e.jsx("code",{className:"prose-code",children:"toYAML()"}),"). JSON is the standard format consumed by most programmatic tools (code generators, API gateways, testing frameworks). YAML is more human-readable and is preferred when developers need to review or diff the spec manually. Serving both formats at different endpoints gives consumers the flexibility to use whichever works best for their workflow."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Writing the spec to disk enables powerful CI/CD workflows. You can check the generated spec into version control and use diff tools to review API changes in pull requests. Automated tests can compare the current spec against the previous version to detect breaking changes (removed endpoints, narrowed types, removed fields). Code generation tools can produce type-safe client SDKs as part of your build pipeline, ensuring that frontend and mobile clients are always in sync with the backend."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"clear()"})," method resets the generator, removing all registered routes and schemas. This is primarily useful in test suites where you need to verify the spec output for specific route configurations in isolation, without interference from routes registered in other tests."]}),e.jsx(t,{code:d,filename:"src/scripts/generate-spec.ts"})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"best-practices",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Best Practices"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"A well-documented API accelerates adoption, reduces support burden, and catches integration errors early. These guidelines help you get the most out of auto-generated OpenAPI specs."}),e.jsxs("ul",{className:"list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-4",children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Add descriptions to all schema fields."}),' The description property on TypeBox schemas flows directly into the OpenAPI spec. Fields like "id" and "name" may seem obvious, but descriptions like "UUID assigned at creation, immutable" and "Display name, 1-200 characters" eliminate ambiguity.']}),e.jsxs("li",{children:[e.jsx("strong",{children:"Document all response status codes."})," Every endpoint should document its success response and all possible error responses. Consumers should not need to discover error formats through trial and error."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Use operationId consistently."})," Operation IDs become method names in generated client SDKs. Use descriptive camelCase names that read naturally as function calls: createUser, getUserPost, deleteComment."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Register shared schemas as components."})," Use registerSchema for types that appear in multiple endpoints. This produces $ref pointers that reduce spec size and improve code generator output quality."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Tag endpoints for organization."})," Tags group related endpoints in Swagger UI. Use them to reflect your domain model (Users, Posts, Orders) rather than implementation details (Database, Cache)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Include the spec in your CI pipeline."})," Generate the spec at build time, diff against the previous version, and fail the build on unintended breaking changes."]})]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"api-reference",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"API Reference"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Methods on the ",e.jsx("code",{className:"prose-code",children:"OpenAPIGenerator"})," instance. The generator accumulates route and schema information, then produces the complete spec on demand."]}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Method"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Returns"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Description"})]})}),e.jsxs("tbody",{className:"text-slate-600 dark:text-slate-400",children:[e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"addRoute(method, path, schema)"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"void"})}),e.jsx("td",{className:"py-3 px-4",children:"Adds a single route to the spec manually. Useful when you need to document routes that are not registered through the standard Vexor app.get/post/put/delete pattern, such as routes added by external middleware or dynamically generated endpoints."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"addRoutes(app)"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"void"})}),e.jsx("td",{className:"py-3 px-4",children:"Scans a Vexor application instance and adds all registered routes to the spec. Routes are discovered by iterating the app's internal route table. Each route's params, query, body, headers, response, and meta properties are translated into OpenAPI operation objects."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"registerSchema(name, schema)"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"void"})}),e.jsx("td",{className:"py-3 px-4",children:"Registers a named schema in the components/schemas section of the spec. Routes that reference this schema via Type.Ref(name) will produce $ref pointers instead of inline definitions. Pass the isSecurityScheme option to register the schema as a security scheme in components/securitySchemes."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"generate()"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"OpenAPISpec"})}),e.jsx("td",{className:"py-3 px-4",children:"Generates the complete OpenAPI 3.1 specification as a JavaScript object. The object includes all info metadata, server definitions, paths with their operations, and component schemas. This object can be serialized to JSON, passed to validation tools, or returned directly from an HTTP endpoint."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"toJSON()"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string"})}),e.jsx("td",{className:"py-3 px-4",children:"Serializes the complete spec to a formatted JSON string. Equivalent to JSON.stringify(generate(), null, 2). Use this for writing the spec to disk, serving it as a downloadable file, or feeding it to tools that accept JSON strings rather than objects."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"toYAML()"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string"})}),e.jsx("td",{className:"py-3 px-4",children:"Serializes the complete spec to a YAML string. YAML is more human-readable than JSON and is the preferred format for reviewing specs in pull requests or version control diffs. The output is compatible with all OpenAPI tools that accept YAML input."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"clear()"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"void"})}),e.jsx("td",{className:"py-3 px-4",children:"Removes all registered routes, schemas, and security schemes from the generator. The info, servers, and tags configuration from the constructor is preserved. Primarily useful in test suites to reset the generator between test cases and verify isolated spec generation."})]})]})]})})]}),e.jsxs("section",{className:"card bg-slate-50 dark:bg-slate-800/50",children:[e.jsx("h2",{id:"next",className:"text-xl font-bold text-slate-900 dark:text-white mb-4",children:"Next Steps"}),e.jsxs("div",{className:"flex flex-wrap gap-3",children:[e.jsxs(a,{to:"/orm",className:"btn-primary",children:["Vexor ORM ",e.jsx(r,{className:"w-4 h-4 ml-2"})]}),e.jsx(a,{to:"/observability/tracing",className:"btn-secondary",children:"Distributed Tracing"})]})]})]})}export{p as default};
