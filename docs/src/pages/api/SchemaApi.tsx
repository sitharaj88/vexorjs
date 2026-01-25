import CodeBlock from '../../components/CodeBlock';

const schemaCode = `import { Type, Static } from 'vexor';

// Primitive types
Type.String(options?)     // string
Type.Number(options?)     // number
Type.Integer(options?)    // integer
Type.Boolean()            // boolean
Type.Null()               // null

// Complex types
Type.Object(properties, options?)  // { ... }
Type.Array(items, options?)        // T[]
Type.Tuple(items)                  // [T, U, ...]
Type.Record(keys, values)          // { [key]: value }

// Union & Intersection
Type.Union(schemas)        // T | U
Type.Intersect(schemas)    // T & U
Type.Literal(value)        // exact value

// Modifiers
Type.Optional(schema)      // T | undefined
Type.Nullable(schema)      // T | null

// Any/Unknown
Type.Any()                 // any
Type.Unknown()             // unknown

// Type inference
type MyType = Static<typeof MySchema>;`;

const stringOptionsCode = `Type.String({
  minLength: 1,           // Minimum length
  maxLength: 255,         // Maximum length
  pattern: '^[a-z]+$',    // Regex pattern
  format: 'email',        // Built-in format

  // Built-in formats:
  // 'email', 'uri', 'uuid', 'date', 'date-time', 'time',
  // 'ipv4', 'ipv6', 'hostname', 'json-pointer'
});`;

const numberOptionsCode = `Type.Number({
  minimum: 0,             // Minimum value (inclusive)
  maximum: 100,           // Maximum value (inclusive)
  exclusiveMinimum: 0,    // Minimum value (exclusive)
  exclusiveMaximum: 100,  // Maximum value (exclusive)
  multipleOf: 0.01,       // Must be multiple of
});

Type.Integer({
  minimum: 1,
  maximum: 1000,
});`;

const arrayOptionsCode = `Type.Array(Type.String(), {
  minItems: 1,            // Minimum items
  maxItems: 10,           // Maximum items
  uniqueItems: true,      // All items must be unique
});`;

const objectOptionsCode = `Type.Object({
  name: Type.String(),
  email: Type.String(),
}, {
  additionalProperties: false,  // Reject unknown properties
});`;

export default function SchemaApi() {
  return (
    <div className="space-y-12">
      <div>
        <h1 id="schema-api" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Schema API
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          TypeBox-compatible schema definitions for validation and type inference.
        </p>
      </div>

      <section>
        <h2 id="types" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Type Builders
        </h2>
        <CodeBlock code={schemaCode} />
      </section>

      <section>
        <h2 id="string-options" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          String Options
        </h2>
        <CodeBlock code={stringOptionsCode} />
      </section>

      <section>
        <h2 id="number-options" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Number Options
        </h2>
        <CodeBlock code={numberOptionsCode} />
      </section>

      <section>
        <h2 id="array-options" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Array Options
        </h2>
        <CodeBlock code={arrayOptionsCode} />
      </section>

      <section>
        <h2 id="object-options" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Object Options
        </h2>
        <CodeBlock code={objectOptionsCode} />
      </section>
    </div>
  );
}
