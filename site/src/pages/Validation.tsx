import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import InfoBlock from '../components/InfoBlock';

const basicSchemaCode = `import { Type } from '@vexorjs/core';

// String types
const name = Type.String();
const email = Type.String({ format: 'email' });
const password = Type.String({ minLength: 8, maxLength: 100 });
const slug = Type.String({ pattern: '^[a-z0-9-]+$' });

// Number types
const age = Type.Number({ minimum: 0, maximum: 150 });
const price = Type.Number({ minimum: 0 });
const quantity = Type.Integer({ minimum: 1 });

// Boolean
const active = Type.Boolean();

// Arrays
const tags = Type.Array(Type.String());
const scores = Type.Array(Type.Number(), { minItems: 1, maxItems: 10 });

// Objects
const user = Type.Object({
  name: Type.String(),                       // required
  email: Type.String({ format: 'email' }),   // required
  age: Type.Optional(Type.Number()),         // optional
});`;

const requiredByDefaultCode = `import { Type } from '@vexorjs/core';

// Properties in Type.Object are REQUIRED by default.
// This matches the type that Static<T> infers.
const CreateUserSchema = Type.Object({
  name: Type.String(),                 // required
  email: Type.String(),                // required
  bio: Type.Optional(Type.String()),   // optional
});

// POST body {}                          -> 400 (name and email missing)
// POST body { name: 'Ada' }             -> 400 (email missing)
// POST body { name: 'Ada', email: '.' } -> 200 (bio may be omitted)

// An explicit \`required\` option overrides the default:
const PatchUserSchema = Type.Object({
  name: Type.String(),
  email: Type.String(),
}, { required: ['name'] });  // only name is required now

// Related helpers:
Type.Partial({ name: Type.String() });  // all properties optional
Type.Strict({ name: Type.String() });   // all required + additionalProperties: false`;

const endToEndInferenceCode = `import { Vexor, Type } from '@vexorjs/core';

const app = new Vexor();

// The body schema flows into the handler: no code generation,
// no manual type annotations.
app.post('/users', {
  schema: {
    body: Type.Object({ name: Type.String() }),
  },
}, async (ctx) => {
  const body = await ctx.body();  // typed { name: string }
  return ctx.json({ created: body.name });
});

// The bare shorthand (no \`schema\` wrapper) infers exactly the same:
app.post('/teams', {
  body: Type.Object({ name: Type.String() }),
}, async (ctx) => {
  const body = await ctx.body();  // { name: string }
  return ctx.status(201).json(body);
});

// ctx.query is typed from the query schema
app.get('/search', {
  schema: {
    query: Type.Object({
      q: Type.String(),
      sort: Type.Optional(Type.String()),
    }),
  },
}, async (ctx) => {
  ctx.query.q;     // string
  ctx.query.sort;  // string | undefined
  return ctx.json({ q: ctx.query.q });
});

// ctx.params is inferred from the path literal -- no schema needed
app.get('/users/:id/posts/:postId', async (ctx) => {
  ctx.params.id;      // string
  ctx.params.postId;  // string
  return ctx.json(ctx.params);
});`;

const typeInferenceCode = `import { Type, type Static } from '@vexorjs/core';

// Define schema
const UserSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  email: Type.String({ format: 'email' }),
  role: Type.Union([
    Type.Literal('admin'),
    Type.Literal('user'),
  ]),
  createdAt: Type.String({ format: 'date-time' }),
});

// Infer TypeScript type from schema
type User = Static<typeof UserSchema>;

// User type is equivalent to:
// {
//   id: string;
//   name: string;
//   email: string;
//   role: 'admin' | 'user';
//   createdAt: string;
// }

// Use in routes - ctx.body() resolves to the User type
app.post('/users', {
  body: UserSchema,
}, async (ctx) => {
  const user: User = await ctx.body();  // Fully typed!
  return ctx.json(user);
});`;

const routeValidationCode = `app.post('/orgs/:orgId/users', {
  schema: {
    // Validate URL parameters
    params: Type.Object({
      orgId: Type.String(),
    }),

    // Validate query string
    query: Type.Object({
      notify: Type.Optional(Type.String()),
      redirect: Type.Optional(Type.String()),
    }),

    // Validate request body (properties required unless Optional)
    body: Type.Object({
      name: Type.String({ minLength: 1 }),
      email: Type.String({ format: 'email' }),
      password: Type.String({ minLength: 8 }),
    }),

    // Document response types (for OpenAPI)
    response: {
      201: Type.Object({
        id: Type.String(),
        name: Type.String(),
        email: Type.String(),
      }),
    },
  },
}, async (ctx) => {
  // All inputs are validated and typed
  const { orgId } = ctx.params;      // string
  const { notify } = ctx.query;      // string | undefined
  const { name, email, password } = await ctx.body();

  const user = await createUser({ name, email, password, orgId });

  if (notify) {
    await sendWelcomeEmail(user);
  }

  return ctx.status(201).json(user);
});

// The bare shorthand (schemas directly in the options object)
// validates and infers exactly the same:
app.post('/teams', {
  body: Type.Object({ name: Type.String() }),
}, async (ctx) => {
  const body = await ctx.body();  // { name: string }
  return ctx.status(201).json(body);
});`;

const optionalFieldsCode = `const UserSchema = Type.Object({
  // Required fields
  name: Type.String(),
  email: Type.String(),

  // Optional fields
  bio: Type.Optional(Type.String()),
  website: Type.Optional(Type.String({ format: 'uri' })),

  // Nullable fields (can be null)
  deletedAt: Type.Union([Type.String(), Type.Null()]),

  // Default values (applied if missing)
  role: Type.String({ default: 'user' }),
  active: Type.Boolean({ default: true }),
});`;

const complexTypesCode = `// Union types (one of)
const Status = Type.Union([
  Type.Literal('pending'),
  Type.Literal('active'),
  Type.Literal('suspended'),
]);

// Enum alternative
const Role = Type.Enum(['admin', 'moderator', 'user']);

// Nested objects
const Address = Type.Object({
  street: Type.String(),
  city: Type.String(),
  country: Type.String(),
  zip: Type.String(),
});

const Company = Type.Object({
  name: Type.String(),
  address: Address,
  employees: Type.Array(Type.Object({
    name: Type.String(),
    role: Type.String(),
  })),
});

// Record type (dynamic keys)
const Metadata = Type.Record(Type.String(), Type.Unknown());

// Tuple type
const Coordinates = Type.Tuple([Type.Number(), Type.Number()]);

// Any/Unknown
const flexible = Type.Unknown();
const anything = Type.Any();`;

const customValidationCode = `// Custom format validation
const PhoneSchema = Type.String({
  pattern: '^\\\\+?[1-9]\\\\d{1,14}$',
});

// Cross-field validation via a preValidation route hook
app.post('/users', {
  schema: {
    body: Type.Object({
      email: Type.String({ format: 'email' }),
      confirmEmail: Type.String({ format: 'email' }),
    }),
  },
  hooks: {
    preValidation: [
      async (ctx) => {
        const body = await ctx.readJson<{ email: string; confirmEmail: string }>();
        if (body.email !== body.confirmEmail) {
          return ctx.json({
            error: 'Validation failed',
            issues: [{ path: ['body', 'confirmEmail'], message: 'Emails must match' }],
          }, 400);
        }
      },
    ],
  },
}, async (ctx) => {
  const body = await ctx.body();
  // Handle the request
  return ctx.status(201).json(body);
});`;

const validationErrorsCode = `// Validation failures return HTTP 400 with a structured body:
{
  "error": "Body validation failed",
  "code": "VALIDATION_ERROR",
  "issues": [
    {
      "path": ["body", "email"],
      "message": "Invalid email format"
    },
    {
      "path": ["body", "name"],
      "message": "Required property missing"
    }
  ]
}`;

const customErrorHandlingCode = `// Customize the response with a global error handler
app.setErrorHandler((error, ctx) => {
  if (error.name === 'ValidationError') {
    const issues = (error as Error & { issues: Array<{ path?: (string | number)[]; message: string }> }).issues;
    return ctx.json({
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      errors: issues.map((issue) => ({
        path: (issue.path ?? []).join('.'),
        message: issue.message,
      })),
    }, 400);
  }
  return ctx.internalError();
});`;

export default function Validation() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 id="validation" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Validation
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Vexor uses a TypeBox-compatible schema system for validation. Schemas provide
          runtime validation, TypeScript type inference, and OpenAPI documentation.
        </p>
      </div>

      {/* Why Schema Validation */}
      <section className="card bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border-primary-200 dark:border-primary-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Why Schema Validation?
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-medium text-slate-900 dark:text-white">Type Safety</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Infer TypeScript types from schemas automatically
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-medium text-slate-900 dark:text-white">Runtime Validation</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                JIT-compiled validators for maximum performance
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-medium text-slate-900 dark:text-white">Documentation</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Auto-generate OpenAPI specs from schemas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Basic Schemas */}
      <section>
        <h2 id="basic-schemas" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Basic Schemas
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use the <code className="prose-code">Type</code> object to define schemas for your data.
        </p>
        <CodeBlock code={basicSchemaCode} showLineNumbers />
      </section>

      {/* Required by Default */}
      <section>
        <h2 id="required-by-default" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Required by Default
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Properties declared in <code className="prose-code">Type.Object({'{...}'})</code> are{' '}
          <strong>required by default</strong>. To make a property optional, wrap it in{' '}
          <code className="prose-code">Type.Optional(...)</code>. This matches TypeBox semantics and,
          crucially, the type that <code className="prose-code">Static&lt;T&gt;</code> infers: if the
          inferred type says a property is present, the validator guarantees it at runtime. What you
          see in your editor is what the validator enforces.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          If you need full control over the required list -- for example, a PATCH endpoint that reuses
          a schema but only demands a subset of fields -- pass an explicit{' '}
          <code className="prose-code">required: [...]</code> option to{' '}
          <code className="prose-code">Type.Object</code>. An explicit list always overrides the
          derived default.
        </p>
        <CodeBlock code={requiredByDefaultCode} showLineNumbers />
        <InfoBlock variant="info" title="Schema and Type Stay in Sync">
          A property is required at runtime exactly when it is non-optional in the inferred{' '}
          <code className="prose-code">Static&lt;T&gt;</code> type. If a request omits a required
          property, validation fails with a 400 before your handler runs.
        </InfoBlock>
      </section>

      {/* Type Inference */}
      <section>
        <h2 id="type-inference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Type Inference
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use <code className="prose-code">Static&lt;typeof Schema&gt;</code> to extract
          TypeScript types from schemas.
        </p>
        <CodeBlock code={typeInferenceCode} showLineNumbers />
      </section>

      {/* End-to-End Type Inference */}
      <section>
        <h2 id="end-to-end-inference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          End-to-End Type Inference
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Route schemas do more than validate at runtime -- they flow directly into the handler's
          context type, with no code generation step. When you attach a{' '}
          <code className="prose-code">body</code> schema to a route,{' '}
          <code className="prose-code">await ctx.body()</code> returns the inferred type. A{' '}
          <code className="prose-code">query</code> schema types <code className="prose-code">ctx.query</code>,
          and <code className="prose-code">ctx.params</code> is inferred from the path string literal
          itself: <code className="prose-code">'/users/:id'</code> gives you{' '}
          <code className="prose-code">{'{ id: string }'}</code> with zero configuration.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Both option forms participate in inference equally. You can pass schemas under the{' '}
          <code className="prose-code">schema</code> key (<code className="prose-code">{'{ schema: { body } }'}</code>)
          or use the bare shorthand (<code className="prose-code">{'{ body }'}</code>) -- the handler's
          context is narrowed identically either way.
        </p>
        <CodeBlock code={endToEndInferenceCode} showLineNumbers />
        <InfoBlock variant="tip" title="No Code Generation">
          Inference happens entirely in the TypeScript type system, driven by the path literal and the
          schema you pass. There is no build step, no generated client, and nothing to keep in sync --
          rename a path parameter or change a schema and the handler's types update immediately.
        </InfoBlock>
      </section>

      {/* Route Validation */}
      <section>
        <h2 id="route-validation" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Route Validation
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Define schemas for params, query, body, and response in route options.
        </p>
        <CodeBlock code={routeValidationCode} showLineNumbers />
      </section>

      {/* Optional & Default */}
      <section>
        <h2 id="optional-fields" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Optional Fields & Defaults
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Handle optional fields, nullable values, and default values.
        </p>
        <CodeBlock code={optionalFieldsCode} />
      </section>

      {/* Complex Types */}
      <section>
        <h2 id="complex-types" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Complex Types
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Create unions, enums, nested objects, and more.
        </p>
        <CodeBlock code={complexTypesCode} showLineNumbers />
      </section>

      {/* Custom Validation */}
      <section>
        <h2 id="custom-validation" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Custom Validation
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Add custom patterns and cross-field validation logic.
        </p>
        <CodeBlock code={customValidationCode} />
      </section>

      {/* Error Handling */}
      <section>
        <h2 id="error-handling" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Validation Errors
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When validation fails, Vexor responds with HTTP 400 and a JSON body containing an{' '}
          <code className="prose-code">error</code> message, the machine-readable code{' '}
          <code className="prose-code">VALIDATION_ERROR</code>, and an{' '}
          <code className="prose-code">issues</code> array. Each issue has a{' '}
          <code className="prose-code">path</code> (prefixed with the section that failed --{' '}
          <code className="prose-code">params</code>, <code className="prose-code">query</code>,{' '}
          <code className="prose-code">body</code>, or <code className="prose-code">headers</code>)
          and a human-readable <code className="prose-code">message</code>. The handler never runs.
        </p>
        <CodeBlock code={validationErrorsCode} language="json" />
        <p className="text-slate-600 dark:text-slate-400 mt-6 mb-4">
          To customize the shape of validation error responses, register a global error handler with{' '}
          <code className="prose-code">app.setErrorHandler()</code> and check for{' '}
          <code className="prose-code">ValidationError</code>.
        </p>
        <CodeBlock code={customErrorHandlingCode} />
      </section>

      {/* Schema Types Reference */}
      <section>
        <h2 id="reference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Schema Types Reference
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Options</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">Type.String()</code></td>
                <td className="py-3 px-4">String value</td>
                <td className="py-3 px-4">minLength, maxLength, pattern, format</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">Type.Number()</code></td>
                <td className="py-3 px-4">Number (float)</td>
                <td className="py-3 px-4">minimum, maximum, multipleOf</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">Type.Integer()</code></td>
                <td className="py-3 px-4">Integer</td>
                <td className="py-3 px-4">minimum, maximum</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">Type.Boolean()</code></td>
                <td className="py-3 px-4">Boolean</td>
                <td className="py-3 px-4">-</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">Type.Array()</code></td>
                <td className="py-3 px-4">Array of items</td>
                <td className="py-3 px-4">minItems, maxItems, uniqueItems</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">Type.Object()</code></td>
                <td className="py-3 px-4">Object with properties</td>
                <td className="py-3 px-4">additionalProperties</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">Type.Optional()</code></td>
                <td className="py-3 px-4">Make field optional</td>
                <td className="py-3 px-4">-</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">Type.Union()</code></td>
                <td className="py-3 px-4">One of multiple types</td>
                <td className="py-3 px-4">-</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">Type.Literal()</code></td>
                <td className="py-3 px-4">Exact value</td>
                <td className="py-3 px-4">-</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">Type.Record()</code></td>
                <td className="py-3 px-4">Dynamic keys</td>
                <td className="py-3 px-4">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Next Steps */}
      <section className="card bg-slate-50 dark:bg-slate-800/50">
        <h2 id="next" className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Next Steps
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/api" className="btn-primary">
            API Reference <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/api/schema" className="btn-secondary">
            Schema API Reference
          </Link>
        </div>
      </section>
    </div>
  );
}
