/**
 * Environment Command
 *
 * Manages environment variables and .env files.
 */

import { readFile, writeFile, access, copyFile } from 'fs/promises';
import { resolve } from 'path';
import prompts from 'prompts';
import { logger } from '../utils/logger.js';

interface EnvVar {
  key: string;
  value: string;
  comment?: string;
}

/**
 * Check if file exists
 */
async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Parse .env file content
 */
function parseEnv(content: string): EnvVar[] {
  const lines = content.split('\n');
  const vars: EnvVar[] = [];
  let currentComment = '';

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('#')) {
      currentComment = trimmed.slice(1).trim();
      continue;
    }

    if (trimmed === '') {
      currentComment = '';
      continue;
    }

    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      vars.push({
        key: match[1].trim(),
        value: match[2].trim().replace(/^["']|["']$/g, ''),
        comment: currentComment || undefined,
      });
      currentComment = '';
    }
  }

  return vars;
}

/**
 * Serialize env vars to .env format
 */
function serializeEnv(vars: EnvVar[]): string {
  const lines: string[] = [];
  let lastComment = '';

  for (const { key, value, comment } of vars) {
    if (comment && comment !== lastComment) {
      lines.push('');
      lines.push(`# ${comment}`);
      lastComment = comment;
    }

    const needsQuotes = value.includes(' ') || value.includes('"') || value.includes("'");
    const formattedValue = needsQuotes ? `"${value.replace(/"/g, '\\"')}"` : value;
    lines.push(`${key}=${formattedValue}`);
  }

  return lines.join('\n') + '\n';
}

/**
 * Load env file
 */
async function loadEnvFile(file: string): Promise<EnvVar[]> {
  const path = resolve(process.cwd(), file);
  if (!(await fileExists(path))) {
    return [];
  }
  const content = await readFile(path, 'utf-8');
  return parseEnv(content);
}

/**
 * Save env file
 */
async function saveEnvFile(file: string, vars: EnvVar[]): Promise<void> {
  const path = resolve(process.cwd(), file);
  await writeFile(path, serializeEnv(vars));
}

/**
 * Env list command - lists all environment variables
 */
export async function envListCommand(file?: string): Promise<void> {
  const envFile = file || '.env';
  const vars = await loadEnvFile(envFile);

  if (vars.length === 0) {
    logger.info(`No environment variables found in ${envFile}`);
    logger.subtitle(`Create one with: vexor env init`);
    return;
  }

  logger.title(`Environment Variables (${envFile})`);
  logger.blank();

  const rows = vars.map(({ key, value, comment }) => [
    key,
    value.length > 30 ? value.slice(0, 27) + '...' : value,
    comment || '',
  ]);

  logger.table(['Key', 'Value', 'Description'], rows);
}

/**
 * Env get command - gets a specific variable
 */
export async function envGetCommand(key: string, file?: string): Promise<void> {
  const envFile = file || '.env';
  const vars = await loadEnvFile(envFile);

  const found = vars.find((v) => v.key === key);
  if (found) {
    console.log(found.value);
  } else {
    logger.error(`Variable '${key}' not found in ${envFile}`);
    process.exit(1);
  }
}

/**
 * Env set command - sets a variable
 */
export async function envSetCommand(
  key: string,
  value: string,
  file?: string
): Promise<void> {
  const envFile = file || '.env';
  const vars = await loadEnvFile(envFile);

  const existing = vars.find((v) => v.key === key);
  if (existing) {
    existing.value = value;
    logger.success(`Updated ${key} in ${envFile}`);
  } else {
    vars.push({ key, value });
    logger.success(`Added ${key} to ${envFile}`);
  }

  await saveEnvFile(envFile, vars);
}

/**
 * Env remove command - removes a variable
 */
export async function envRemoveCommand(key: string, file?: string): Promise<void> {
  const envFile = file || '.env';
  const vars = await loadEnvFile(envFile);

  const index = vars.findIndex((v) => v.key === key);
  if (index === -1) {
    logger.error(`Variable '${key}' not found in ${envFile}`);
    process.exit(1);
  }

  vars.splice(index, 1);
  await saveEnvFile(envFile, vars);
  logger.success(`Removed ${key} from ${envFile}`);
}

/**
 * Env init command - creates .env from .env.example
 */
export async function envInitCommand(): Promise<void> {
  const envPath = resolve(process.cwd(), '.env');
  const examplePath = resolve(process.cwd(), '.env.example');

  if (await fileExists(envPath)) {
    logger.warn('.env file already exists');

    const response = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: 'Do you want to overwrite it?',
      initial: false,
    });

    if (!response.overwrite) {
      logger.info('Cancelled');
      return;
    }
  }

  if (await fileExists(examplePath)) {
    await copyFile(examplePath, envPath);
    logger.success('Created .env from .env.example');
    logger.subtitle('Update the values in .env for your environment');
  } else {
    // Create a default .env
    const defaultEnv: EnvVar[] = [
      { key: 'NODE_ENV', value: 'development', comment: 'Environment' },
      { key: 'PORT', value: '3000', comment: 'Server' },
      { key: 'DATABASE_URL', value: '', comment: 'Database' },
      { key: 'JWT_SECRET', value: '', comment: 'Authentication' },
    ];

    await saveEnvFile('.env', defaultEnv);
    logger.success('Created .env with default variables');
    logger.subtitle('Update the values for your environment');
  }

  logger.blank();
  logger.warn('Remember to add .env to .gitignore!');
}

/**
 * Env diff command - compares .env with .env.example
 */
export async function envDiffCommand(): Promise<void> {
  const envVars = await loadEnvFile('.env');
  const exampleVars = await loadEnvFile('.env.example');

  if (exampleVars.length === 0) {
    logger.info('No .env.example file found');
    return;
  }

  logger.title('Environment Diff');
  logger.blank();

  const envKeys = new Set(envVars.map((v) => v.key));
  const exampleKeys = new Set(exampleVars.map((v) => v.key));

  const missing = exampleVars.filter((v) => !envKeys.has(v.key));
  const extra = envVars.filter((v) => !exampleKeys.has(v.key));

  if (missing.length > 0) {
    logger.warn('Missing from .env (defined in .env.example):');
    logger.list(missing.map((v) => `${v.key}${v.comment ? ` - ${v.comment}` : ''}`));
    logger.blank();
  }

  if (extra.length > 0) {
    logger.info('Extra in .env (not in .env.example):');
    logger.list(extra.map((v) => v.key));
    logger.blank();
  }

  if (missing.length === 0 && extra.length === 0) {
    logger.success('.env is in sync with .env.example');
  }
}

/**
 * Env validate command - validates required variables
 */
export async function envValidateCommand(file?: string): Promise<void> {
  const envFile = file || '.env';
  const vars = await loadEnvFile(envFile);

  logger.title('Environment Validation');
  logger.blank();

  const issues: string[] = [];

  // Check required variables
  const required = ['NODE_ENV', 'PORT'];
  for (const key of required) {
    const found = vars.find((v) => v.key === key);
    if (!found) {
      issues.push(`Missing required variable: ${key}`);
    } else if (!found.value) {
      issues.push(`Empty required variable: ${key}`);
    }
  }

  // Check for empty values
  const empty = vars.filter((v) => !v.value);
  if (empty.length > 0) {
    issues.push(`Empty variables: ${empty.map((v) => v.key).join(', ')}`);
  }

  // Check for sensitive values in common patterns
  const sensitivePatterns = [
    { key: 'JWT_SECRET', minLength: 32 },
    { key: 'DATABASE_URL', pattern: /^(postgres|mysql|sqlite):/ },
  ];

  for (const { key, minLength, pattern } of sensitivePatterns) {
    const found = vars.find((v) => v.key === key);
    if (found?.value) {
      if (minLength && found.value.length < minLength) {
        issues.push(`${key} should be at least ${minLength} characters`);
      }
      if (pattern && !pattern.test(found.value)) {
        issues.push(`${key} has an invalid format`);
      }
    }
  }

  if (issues.length === 0) {
    logger.success('All environment variables are valid');
  } else {
    for (const issue of issues) {
      logger.warn(issue);
    }
    logger.blank();
    logger.error(`Found ${issues.length} issue(s)`);
    process.exit(1);
  }
}

export default {
  envListCommand,
  envGetCommand,
  envSetCommand,
  envRemoveCommand,
  envInitCommand,
  envDiffCommand,
  envValidateCommand,
};
