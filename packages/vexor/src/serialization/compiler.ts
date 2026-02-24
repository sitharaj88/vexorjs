/**
 * JIT Serialization Compiler
 *
 * Generates optimized JSON serialization functions from schema definitions.
 * Similar to fast-json-stringify but integrated with Vexor schemas.
 */

import type {
  TSchema,
  TArray,
  TObject,
} from '../schema/types.js';

import { OptionalKind, AnyKind, UnknownKind } from '../schema/types.js';

/**
 * Compiled serializer function type
 */
export type SerializerFn<T> = (data: T) => string;

/**
 * Serialization options
 */
export interface SerializerOptions {
  /** Pretty print with indentation */
  pretty?: boolean;
  /** Indentation string (default: 2 spaces) */
  indent?: string;
  /** Include undefined values as null */
  includeUndefined?: boolean;
}

/**
 * Code generation context
 */
interface CodeGenContext {
  code: string[];
  indent: number;
  varCounter: number;
}


/**
 * Get unique variable name
 */
function getVar(ctx: CodeGenContext, prefix = 'v'): string {
  return `${prefix}${ctx.varCounter++}`;
}

/**
 * Generate serializer code for a schema
 */
function generateCode(
  schema: TSchema,
  dataExpr: string,
  ctx: CodeGenContext
): string {
  // Handle any/unknown - use JSON.stringify
  if (AnyKind in schema || UnknownKind in schema) {
    return `JSON.stringify(${dataExpr})`;
  }

  // Handle optional
  if (OptionalKind in schema) {
    const wrapped = (schema as unknown as { wrapped: TSchema }).wrapped;
    const wrappedCode = generateCode(wrapped, dataExpr, ctx);
    return `${dataExpr} === undefined ? 'null' : ${wrappedCode}`;
  }

  // Handle by type
  const type = schema.type;

  if ('const' in schema) {
    return JSON.stringify(JSON.stringify(schema.const));
  }

  if ('anyOf' in schema) {
    // For unions, fall back to JSON.stringify
    return `JSON.stringify(${dataExpr})`;
  }

  if ('enum' in schema && !('type' in schema)) {
    return `JSON.stringify(${dataExpr})`;
  }

  switch (type) {
    case 'string':
      return generateStringSerializer(dataExpr);
    case 'number':
    case 'integer':
      return generateNumberSerializer(dataExpr);
    case 'boolean':
      return generateBooleanSerializer(dataExpr);
    case 'null':
      return `'null'`;
    case 'array':
      return generateArraySerializer(schema as TArray, dataExpr, ctx);
    case 'object':
      return generateObjectSerializer(schema as TObject, dataExpr, ctx);
    default:
      return `JSON.stringify(${dataExpr})`;
  }
}

/**
 * Generate string serializer (with proper escaping)
 */
function generateStringSerializer(dataExpr: string): string {
  return `JSON.stringify(${dataExpr})`;
}

/**
 * Generate number serializer
 */
function generateNumberSerializer(dataExpr: string): string {
  return `String(${dataExpr})`;
}

/**
 * Generate boolean serializer
 */
function generateBooleanSerializer(dataExpr: string): string {
  // Wrap in parentheses to ensure correct operator precedence when concatenated
  return `(${dataExpr} ? 'true' : 'false')`;
}

/**
 * Generate array serializer
 */
function generateArraySerializer(
  schema: TArray,
  dataExpr: string,
  ctx: CodeGenContext
): string {
  const itemVar = getVar(ctx, 'item');
  const resultVar = getVar(ctx, 'arr');
  const itemSerializer = generateCode(schema.items, itemVar, ctx);

  return `(() => {
    const ${resultVar} = [];
    for (const ${itemVar} of ${dataExpr}) {
      ${resultVar}.push(${itemSerializer});
    }
    return '[' + ${resultVar}.join(',') + ']';
  })()`;
}

/**
 * Generate object serializer
 */
function generateObjectSerializer(
  schema: TObject,
  dataExpr: string,
  ctx: CodeGenContext
): string {
  const parts: string[] = [];
  const properties = schema.properties;

  for (const [key, propSchema] of Object.entries(properties)) {
    const propExpr = `${dataExpr}[${JSON.stringify(key)}]`;
    const isOptional = OptionalKind in propSchema;
    const serializer = generateCode(propSchema, propExpr, ctx);
    const keyJson = JSON.stringify(key);

    if (isOptional) {
      parts.push(`(${propExpr} !== undefined ? ${JSON.stringify(keyJson + ':')} + ${serializer} : '')`);
    } else {
      parts.push(`${JSON.stringify(keyJson + ':')} + ${serializer}`);
    }
  }

  if (parts.length === 0) {
    return `'{}'`;
  }

  // Build object string, filtering out empty parts for optional properties
  return `'{' + [${parts.join(', ')}].filter(Boolean).join(',') + '}'`;
}

/**
 * Compile a schema into a serializer function
 */
export function compileSerializer<T>(
  schema: TSchema,
  _options: SerializerOptions = {}
): SerializerFn<T> {
  const ctx: CodeGenContext = {
    code: [],
    indent: 0,
    varCounter: 0,
  };

  const serializerCode = generateCode(schema, 'data', ctx);

  // Create function from generated code
  const fnCode = `return ${serializerCode};`;

  try {
    // Use Function constructor for JIT compilation
    const fn = new Function('data', fnCode) as SerializerFn<T>;
    return fn;
  } catch {
    // Fallback to JSON.stringify if code generation fails
    return (data: T) => JSON.stringify(data);
  }
}

/**
 * Create a serializer with additional methods
 */
export interface Serializer<T> {
  /** Serialize data to JSON string */
  stringify(data: T): string;
  /** The underlying schema */
  schema: TSchema;
}

/**
 * Create a serializer from a schema
 */
export function createSerializer<T>(
  schema: TSchema,
  options: SerializerOptions = {}
): Serializer<T> {
  const stringify = compileSerializer<T>(schema, options);

  return {
    stringify,
    schema,
  };
}

/**
 * Serialize data to JSON string (shorthand)
 */
export function stringify<T>(schema: TSchema, data: T): string {
  const serializer = compileSerializer<T>(schema);
  return serializer(data);
}

/**
 * Fast JSON serializer for common types
 */
export const FastJSON = {
  /**
   * Serialize string with proper escaping
   */
  stringifyString(value: string): string {
    return JSON.stringify(value);
  },

  /**
   * Serialize number
   */
  stringifyNumber(value: number): string {
    if (Number.isFinite(value)) {
      return String(value);
    }
    return 'null';
  },

  /**
   * Serialize boolean
   */
  stringifyBoolean(value: boolean): string {
    return value ? 'true' : 'false';
  },

  /**
   * Serialize null
   */
  stringifyNull(): string {
    return 'null';
  },

  /**
   * Serialize array of primitives
   */
  stringifyPrimitiveArray(
    value: (string | number | boolean | null)[],
    type: 'string' | 'number' | 'boolean' | 'null'
  ): string {
    const parts = value.map((item) => {
      switch (type) {
        case 'string':
          return JSON.stringify(item);
        case 'number':
          return String(item);
        case 'boolean':
          return item ? 'true' : 'false';
        case 'null':
          return 'null';
      }
    });
    return '[' + parts.join(',') + ']';
  },
};
