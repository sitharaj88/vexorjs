/**
 * JIT Validation Compiler
 *
 * Generates a specialized validator function per schema with `new Function`,
 * eliminating the interpreter's dispatch, path bookkeeping, and repeated
 * schema reads on the hot path. Behavior (including issue messages and
 * paths) exactly mirrors the tree-walking interpreter in compiler.ts.
 *
 * Runtimes that forbid runtime code generation (e.g. Cloudflare Workers)
 * make `new Function` throw — `tryCompileJit` then returns null and the
 * caller falls back to the interpreter.
 */

import type { TSchema, TString, TNumber, TObject, TArray, TUnion, TEnum, TLiteral } from '../schema/types.js';
import { OptionalKind, AnyKind, UnknownKind } from '../schema/types.js';
import { createIssue, type StandardSchemaResult } from '../schema/standard.js';

type ValidatorFn<T> = (data: unknown) => StandardSchemaResult<T>;

/** Runtime helpers and constants closed over by the generated function */
interface Refs {
  values: unknown[];
  add(value: unknown): string;
}

function createRefs(): Refs {
  const values: unknown[] = [];
  return {
    values,
    add(value: unknown): string {
      values.push(value);
      return `R[${values.length - 1}]`;
    },
  };
}

/** Track generated variable names */
let varCounter = 0;
function nextVar(): string {
  return `v${++varCounter}`;
}

/**
 * A compile-time path: static segments known at codegen time, plus an
 * optional dynamic prefix expression (used inside array loops).
 */
interface PathInfo {
  /** JS expression evaluating to the path array, or null for root */
  expr: string | null;
}

function childPath(refs: Refs, parent: PathInfo, segment: string | number | { dynamic: string }): PathInfo {
  if (typeof segment === 'object') {
    // Dynamic segment (array index variable)
    const base = parent.expr ?? refs.add([]);
    return { expr: `${base}.concat(${segment.dynamic})` };
  }
  if (parent.expr === null) {
    return { expr: refs.add(Object.freeze([segment])) };
  }
  // Parent may itself be a frozen constant or a dynamic concat; both support concat
  return { expr: `${parent.expr}.concat(${JSON.stringify(segment)})` };
}

function issueStmt(_refs: Refs, path: PathInfo, messageExpr: string): string {
  // Root issues carry an empty path array, matching the interpreter
  const pathArg = path.expr === null ? ', []' : `, ${path.expr}`;
  return `issues.push(CI(${messageExpr}${pathArg}));`;
}

const S = JSON.stringify;

/**
 * Emit validation statements for `schema` applied to the value in
 * variable `v`, appending issues to `issues`.
 */
function emit(refs: Refs, schema: TSchema, v: string, path: PathInfo, lines: string[]): void {
  // any / unknown always pass
  if (AnyKind in schema || UnknownKind in schema) return;

  // Optional wrapper: skip checks when undefined
  if (OptionalKind in schema) {
    const wrapped = (schema as unknown as { wrapped?: TSchema }).wrapped;
    if (!wrapped) return;
    lines.push(`if (${v} !== undefined) {`);
    emit(refs, wrapped, v, path, lines);
    lines.push('}');
    return;
  }

  if ('const' in schema) {
    const literal = (schema as TLiteral<string | number | boolean>).const;
    lines.push(
      `if (${v} !== ${S(literal)}) { ${issueStmt(refs, path, `'Expected ' + ${S(S(literal))} + ', got ' + JSON.stringify(${v})`)} }`
    );
    return;
  }

  if ('anyOf' in schema) {
    emitUnion(refs, schema as TUnion, v, path, lines);
    return;
  }

  if ('enum' in schema && !('type' in schema)) {
    const values = (schema as TEnum).enum;
    const setRef = refs.add(new Set(values));
    const message = `Value must be one of: ${values.join(', ')}`;
    lines.push(`if (!${setRef}.has(${v})) { ${issueStmt(refs, path, S(message))} }`);
    return;
  }

  switch (schema.type) {
    case 'string':
      emitString(refs, schema as TString, v, path, lines);
      return;
    case 'number':
      emitNumber(refs, schema as TNumber, v, path, lines, false);
      return;
    case 'integer':
      emitNumber(refs, schema as unknown as TNumber, v, path, lines, true);
      return;
    case 'boolean':
      lines.push(
        `if (typeof ${v} !== 'boolean') { ${issueStmt(refs, path, `'Expected boolean, got ' + typeof ${v}`)} }`
      );
      return;
    case 'null':
      lines.push(
        `if (${v} !== null) { ${issueStmt(refs, path, `'Expected null, got ' + typeof ${v}`)} }`
      );
      return;
    case 'array':
      emitArray(refs, schema as TArray, v, path, lines);
      return;
    case 'object':
      emitObject(refs, schema as TObject, v, path, lines);
      return;
    default:
      // Unknown types pass (mirrors the interpreter)
      return;
  }
}

function emitString(refs: Refs, schema: TString, v: string, path: PathInfo, lines: string[]): void {
  lines.push(`if (typeof ${v} !== 'string') { ${issueStmt(refs, path, `'Expected string, got ' + typeof ${v}`)} } else {`);

  const checks: string[] = [];
  if (schema.minLength !== undefined) {
    checks.push(
      `if (${v}.length < ${schema.minLength}) { ${issueStmt(refs, path, S(`String must be at least ${schema.minLength} characters`))} } else`
    );
  }
  if (schema.maxLength !== undefined) {
    checks.push(
      `if (${v}.length > ${schema.maxLength}) { ${issueStmt(refs, path, S(`String must be at most ${schema.maxLength} characters`))} } else`
    );
  }
  if (schema.pattern !== undefined) {
    const regexRef = refs.add(new RegExp(schema.pattern));
    checks.push(
      `if (!${regexRef}.test(${v})) { ${issueStmt(refs, path, S(`String does not match pattern: ${schema.pattern}`))} } else`
    );
  }
  if (schema.format !== undefined) {
    checks.push(
      `if (!VF(${v}, ${S(schema.format)})) { ${issueStmt(refs, path, S(`Invalid format: expected ${schema.format}`))} } else`
    );
  }
  if (schema.enum !== undefined) {
    const setRef = refs.add(new Set(schema.enum));
    checks.push(
      `if (!${setRef}.has(${v})) { ${issueStmt(refs, path, S(`Value must be one of: ${schema.enum.join(', ')}`))} } else`
    );
  }

  if (checks.length > 0) {
    // The interpreter short-circuits after the first failed constraint;
    // chained else-if reproduces that
    lines.push(`${checks.join(' ')} {}`);
  }

  lines.push('}');
}

function emitNumber(
  refs: Refs,
  schema: TNumber,
  v: string,
  path: PathInfo,
  lines: string[],
  integer: boolean
): void {
  lines.push(
    `if (typeof ${v} !== 'number' || Number.isNaN(${v})) { ${issueStmt(refs, path, `'Expected number, got ' + typeof ${v}`)} } else {`
  );

  const checks: string[] = [];
  if (schema.minimum !== undefined) {
    checks.push(`if (${v} < ${schema.minimum}) { ${issueStmt(refs, path, S(`Number must be >= ${schema.minimum}`))} } else`);
  }
  if (schema.maximum !== undefined) {
    checks.push(`if (${v} > ${schema.maximum}) { ${issueStmt(refs, path, S(`Number must be <= ${schema.maximum}`))} } else`);
  }
  if (schema.exclusiveMinimum !== undefined) {
    checks.push(
      `if (${v} <= ${schema.exclusiveMinimum}) { ${issueStmt(refs, path, S(`Number must be > ${schema.exclusiveMinimum}`))} } else`
    );
  }
  if (schema.exclusiveMaximum !== undefined) {
    checks.push(
      `if (${v} >= ${schema.exclusiveMaximum}) { ${issueStmt(refs, path, S(`Number must be < ${schema.exclusiveMaximum}`))} } else`
    );
  }
  if (schema.multipleOf !== undefined) {
    checks.push(
      `if (${v} % ${schema.multipleOf} !== 0) { ${issueStmt(refs, path, S(`Number must be a multiple of ${schema.multipleOf}`))} } else`
    );
  }
  if (integer) {
    checks.push(`if (!Number.isInteger(${v})) { ${issueStmt(refs, path, S('Expected integer'))} } else`);
  }

  if (checks.length > 0) {
    lines.push(`${checks.join(' ')} {}`);
  }

  lines.push('}');
}

function emitArray(refs: Refs, schema: TArray, v: string, path: PathInfo, lines: string[]): void {
  lines.push(
    `if (!Array.isArray(${v})) { ${issueStmt(refs, path, `'Expected array, got ' + typeof ${v}`)} } else {`
  );

  const guards: string[] = [];
  if (schema.minItems !== undefined) {
    guards.push(
      `if (${v}.length < ${schema.minItems}) { ${issueStmt(refs, path, S(`Array must have at least ${schema.minItems} items`))} } else`
    );
  }
  if (schema.maxItems !== undefined) {
    guards.push(
      `if (${v}.length > ${schema.maxItems}) { ${issueStmt(refs, path, S(`Array must have at most ${schema.maxItems} items`))} } else`
    );
  }
  if (schema.uniqueItems) {
    guards.push(
      `if (new Set(${v}.map(function (x) { return JSON.stringify(x); })).size !== ${v}.length) { ${issueStmt(refs, path, S('Array items must be unique'))} } else`
    );
  }

  const body: string[] = [];
  // Tuples (items as array) pass item validation, mirroring the interpreter
  if (schema.items && !Array.isArray(schema.items)) {
    const i = nextVar();
    const item = nextVar();
    body.push(`for (let ${i} = 0; ${i} < ${v}.length; ${i}++) {`);
    body.push(`const ${item} = ${v}[${i}];`);
    emit(refs, schema.items, item, childPath(refs, path, { dynamic: i }), body);
    body.push('}');
  }

  if (guards.length > 0) {
    lines.push(`${guards.join(' ')} {`);
    lines.push(...body);
    lines.push('}');
  } else {
    lines.push(...body);
  }

  lines.push('}');
}

function emitObject(refs: Refs, schema: TObject, v: string, path: PathInfo, lines: string[]): void {
  lines.push(
    `if (typeof ${v} !== 'object' || ${v} === null || Array.isArray(${v})) { ` +
      issueStmt(refs, path, `'Expected object, got ' + (Array.isArray(${v}) ? 'array' : typeof ${v})`) +
      ' } else {'
  );

  const required = new Set(schema.required ?? []);

  for (const key of required) {
    lines.push(
      `if (!(${S(key)} in ${v})) { ${issueStmt(refs, childPath(refs, path, key), S('Required property missing'))} }`
    );
  }

  for (const [key, propSchema] of Object.entries(schema.properties ?? {})) {
    const propVar = nextVar();
    lines.push(`const ${propVar} = ${v}[${S(key)}];`);
    lines.push(`if (${propVar} !== undefined) {`);
    emit(refs, propSchema, propVar, childPath(refs, path, key), lines);
    lines.push('}');
  }

  if (schema.additionalProperties === false) {
    const allowedRef = refs.add(new Set(Object.keys(schema.properties ?? {})));
    const keyVar = nextVar();
    const base = path.expr ?? refs.add([]);
    lines.push(`for (const ${keyVar} of Object.keys(${v})) {`);
    lines.push(
      `if (!${allowedRef}.has(${keyVar})) { issues.push(CI('Additional property not allowed', ${base}.concat(${keyVar}))); }`
    );
    lines.push('}');
  }

  lines.push('}');
}

function emitUnion(refs: Refs, schema: TUnion, v: string, path: PathInfo, lines: string[]): void {
  // Compile each branch as an independent boolean validator; union passes
  // when any branch produces no issues (mirrors the interpreter)
  const branchFns = schema.anyOf.map((branch) => {
    const fn = compileJitInner(branch);
    return refs.add((value: unknown) => fn(value).issues === undefined);
  });

  const condition = branchFns.map((ref) => `!${ref}(${v})`).join(' && ');
  lines.push(
    `if (${condition}) { ${issueStmt(refs, path, S('Value does not match any schema in union'))} }`
  );
}

/** Compile without the try/catch (used recursively for union branches) */
function compileJitInner<T>(schema: TSchema): ValidatorFn<T> {
  const refs = createRefs();
  const lines: string[] = [];
  emit(refs, schema, 'data', { expr: null }, lines);

  const source = [
    "'use strict';",
    'return function validate(data) {',
    'const issues = [];',
    ...lines,
    'if (issues.length > 0) return { value: data, issues: issues };',
    'return { value: data };',
    '};',
  ].join('\n');

  const factory = new Function('R', 'CI', 'VF', source) as (
    R: unknown[],
    CI: typeof createIssue,
    VF: (value: string, format: string) => boolean
  ) => ValidatorFn<T>;

  return factory(refs.values, createIssue, formatValidatorRef);
}

// Injected by compiler.ts to avoid a circular import
let formatValidatorRef: (value: string, format: string) => boolean = () => true;

export function setFormatValidator(fn: (value: string, format: string) => boolean): void {
  formatValidatorRef = fn;
}

/** Cached result of the runtime capability probe */
let jitSupported: boolean | undefined;

/**
 * Compile a schema to a specialized validator, or return null when the
 * runtime forbids code generation (the caller falls back to the interpreter).
 */
export function tryCompileJit<T>(schema: TSchema): ValidatorFn<T> | null {
  if (jitSupported === false) return null;

  try {
    const fn = compileJitInner<T>(schema);
    jitSupported = true;
    return fn;
  } catch {
    // EvalError on CSP-restricted runtimes — remember and stop trying
    if (jitSupported === undefined) jitSupported = false;
    return null;
  }
}
