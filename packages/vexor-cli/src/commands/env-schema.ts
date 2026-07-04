/**
 * Schema-based env validation
 *
 * Validates `.env` values against a declarative schema (e.g.
 * `env.schema.json` at the project root). Schema format:
 *
 *   {
 *     "DATABASE_URL":   { "type": "url",     "required": true },
 *     "PORT":           { "type": "integer", "required": true, "min": 1, "max": 65535 },
 *     "NODE_ENV":       { "type": "enum", "values": ["development","production","test"], "default": "development" },
 *     "ENABLE_FEATURE": { "type": "boolean", "default": false }
 *   }
 *
 * Errors are reported with the offending env var name and the reason.
 */

import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';

export type EnvFieldType =
  | 'string'
  | 'integer'
  | 'number'
  | 'boolean'
  | 'url'
  | 'email'
  | 'enum';

export interface EnvFieldSchema {
  type: EnvFieldType;
  required?: boolean;
  default?: string | number | boolean;
  /** For numeric types */
  min?: number;
  max?: number;
  /** For string types */
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  /** For enum */
  values?: string[];
  /** Free-text description, used in error messages */
  description?: string;
}

export type EnvSchema = Record<string, EnvFieldSchema>;

export interface EnvValidationIssue {
  key: string;
  message: string;
}

export interface EnvValidationResult {
  ok: boolean;
  issues: EnvValidationIssue[];
  /** Coerced values (after type conversion + defaults applied). */
  values: Record<string, string | number | boolean>;
}

/**
 * Validate a flat `Record<string, string>` of env values against a schema.
 * Pure: no I/O.
 */
export function validateEnv(
  env: Record<string, string | undefined>,
  schema: EnvSchema
): EnvValidationResult {
  const issues: EnvValidationIssue[] = [];
  const values: Record<string, string | number | boolean> = {};

  for (const [key, field] of Object.entries(schema)) {
    const raw = env[key];

    if (raw === undefined || raw === '') {
      if (field.required && field.default === undefined) {
        issues.push({ key, message: `${key} is required` });
        continue;
      }
      if (field.default !== undefined) {
        values[key] = field.default;
      }
      continue;
    }

    const coerced = coerce(key, raw, field, issues);
    if (coerced !== undefined) values[key] = coerced;
  }

  return { ok: issues.length === 0, issues, values };
}

function coerce(
  key: string,
  raw: string,
  field: EnvFieldSchema,
  issues: EnvValidationIssue[]
): string | number | boolean | undefined {
  switch (field.type) {
    case 'string':
      return validateString(key, raw, field, issues);

    case 'integer': {
      if (!/^-?\d+$/.test(raw)) {
        issues.push({ key, message: `${key} must be an integer (got "${raw}")` });
        return undefined;
      }
      const n = Number(raw);
      return validateNumberRange(key, n, field, issues);
    }

    case 'number': {
      const n = Number(raw);
      if (Number.isNaN(n)) {
        issues.push({ key, message: `${key} must be a number (got "${raw}")` });
        return undefined;
      }
      return validateNumberRange(key, n, field, issues);
    }

    case 'boolean': {
      const v = raw.toLowerCase();
      if (['1', 'true', 'yes', 'on'].includes(v)) return true;
      if (['0', 'false', 'no', 'off'].includes(v)) return false;
      issues.push({
        key,
        message: `${key} must be a boolean (got "${raw}")`,
      });
      return undefined;
    }

    case 'url':
      try {
        new URL(raw);
        return raw;
      } catch {
        issues.push({ key, message: `${key} must be a valid URL (got "${raw}")` });
        return undefined;
      }

    case 'email':
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
        issues.push({ key, message: `${key} must be a valid email` });
        return undefined;
      }
      return raw;

    case 'enum': {
      if (!field.values || field.values.length === 0) {
        issues.push({ key, message: `${key} schema is missing "values" for enum` });
        return undefined;
      }
      if (!field.values.includes(raw)) {
        issues.push({
          key,
          message: `${key} must be one of [${field.values.join(', ')}] (got "${raw}")`,
        });
        return undefined;
      }
      return raw;
    }
  }
}

function validateString(
  key: string,
  raw: string,
  field: EnvFieldSchema,
  issues: EnvValidationIssue[]
): string | undefined {
  if (field.minLength !== undefined && raw.length < field.minLength) {
    issues.push({
      key,
      message: `${key} must be at least ${field.minLength} characters`,
    });
    return undefined;
  }
  if (field.maxLength !== undefined && raw.length > field.maxLength) {
    issues.push({
      key,
      message: `${key} must be at most ${field.maxLength} characters`,
    });
    return undefined;
  }
  if (field.pattern && !new RegExp(field.pattern).test(raw)) {
    issues.push({
      key,
      message: `${key} does not match pattern ${field.pattern}`,
    });
    return undefined;
  }
  return raw;
}

function validateNumberRange(
  key: string,
  value: number,
  field: EnvFieldSchema,
  issues: EnvValidationIssue[]
): number | undefined {
  if (field.min !== undefined && value < field.min) {
    issues.push({ key, message: `${key} must be >= ${field.min}` });
    return undefined;
  }
  if (field.max !== undefined && value > field.max) {
    issues.push({ key, message: `${key} must be <= ${field.max}` });
    return undefined;
  }
  return value;
}

/**
 * Parse a key=value text body into a flat record. Keeps comments and
 * blank lines out, strips wrapping quotes.
 */
export function parseDotEnv(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const m = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    const value = m[2].trim().replace(/^["']|["']$/g, '');
    result[m[1]] = value;
  }
  return result;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * `vexor env:check` — load schema + .env file, run validation, exit non-zero
 * on failure. Exposed as a command handler for the CLI.
 */
export async function envCheckCommand(
  options: { file?: string; schema?: string } = {}
): Promise<void> {
  const cwd = process.cwd();
  const envPath = resolve(cwd, options.file ?? '.env');
  const schemaPath = resolve(cwd, options.schema ?? 'env.schema.json');

  if (!(await fileExists(schemaPath))) {
    console.error(`✖ env schema not found at ${schemaPath}`);
    console.error(`   Tip: create env.schema.json or pass --schema <path>`);
    process.exit(1);
  }

  const [envRaw, schemaRaw] = await Promise.all([
    fileExists(envPath).then((exists) =>
      exists ? readFile(envPath, 'utf-8') : ''
    ),
    readFile(schemaPath, 'utf-8'),
  ]);

  let schema: EnvSchema;
  try {
    schema = JSON.parse(schemaRaw) as EnvSchema;
  } catch (_e) {
    console.error(`✖ env schema at ${schemaPath} is not valid JSON`);
    process.exit(1);
    return;
  }

  const env = parseDotEnv(envRaw);
  const result = validateEnv(env, schema);

  if (result.ok) {
    console.log('✓ env validation passed');
    return;
  }

  console.error(`✖ env validation failed (${result.issues.length} issue(s)):`);
  for (const issue of result.issues) {
    console.error(`   - ${issue.message}`);
  }
  process.exit(1);
}
