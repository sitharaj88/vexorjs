import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';

const basicSchemaCode = `import { Type } from 'vexor';

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
  name: Type.String(),
  email: Type.String({ format: 'email' }),
  age: Type.Optional(Type.Number()),
});`;

const typeInferenceCode = `import { Type, type Static } from 'vexor';

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

// Use in routes - ctx.body is automatically typed as User
app.post('/users', {
  body: UserSchema,
}, async (ctx) => {
  const user: User = ctx.body;  // Fully typed!
  return ctx.json(user);
});`;

const routeValidationCode = `app.post('/users', {
  // Validate URL parameters
  params: Type.Object({
    orgId: Type.String(),
  }),

  // Validate query string
  query: Type.Object({
    notify: Type.Optional(Type.Boolean()),
    redirect: Type.Optional(Type.String()),
  }),

  // Validate request body
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
    400: Type.Object({
      error: Type.String(),
      details: Type.Array(Type.Object({
        field: Type.String(),
        message: Type.String(),
      })),
    }),
  },
}, async (ctx) => {
  // All inputs are validated and typed
  const { orgId } = ctx.params;
  const { notify } = ctx.query;
  const { name, email, password } = ctx.body;

  const user = await createUser({ name, email, password, orgId });

  if (notify) {
    await sendWelcomeEmail(user);
  }

  return ctx.status(201).json(user);
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
  errorMessage: 'Invalid phone number format',
});

// Custom refinement (using transform)
app.post('/users', {
  body: Type.Object({
    email: Type.String({ format: 'email' }),
    confirmEmail: Type.String({ format: 'email' }),
  }),
  preValidation: async (ctx) => {
    const body = await ctx.readJson();
    if (body.email !== body.confirmEmail) {
      return ctx.status(400).json({
        error: 'Validation failed',
        details: [{ field: 'confirmEmail', message: 'Emails must match' }],
      });
    }
    ctx.set('validatedBody', body);
  },
}, async (ctx) => {
  // Handle the request
});

// Reusable validators
const createValidator = (schema) => {
  const compiled = compile(schema);
  return (data: unknown) => {
    const result = compiled(data);
    if (!result.valid) {
      throw new ValidationError(result.errors);
    }
    return result.value;
  };
};`;

const validationErrorsCode = `// Validation errors return 400 with details
// Response format:
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "must be a valid email",
      "value": "not-an-email"
    },
    {
      "field": "password",
      "message": "must be at least 8 characters",
      "value": "short"
    }
  ]
}

// Customize error handling
app.addHook('onError', async (ctx, error) => {
  if (error instanceof ValidationError) {
    return ctx.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      errors: error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }
  throw error;
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
        <div className="grid sm:grid-cols-3 gap-4">
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
          When validation fails, Vexor returns a 400 error with details about the failures.
        </p>
        <CodeBlock code={validationErrorsCode} language="json" />
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
