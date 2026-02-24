/**
 * Environment-based Configuration
 *
 * Loads configuration from environment variables with validation and defaults.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Load .env file if exists
function loadEnvFile(): void {
  const envPath = resolve(process.cwd(), '.env');
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        if (key && !process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

loadEnvFile();

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Missing required environment variable: ${key}`);
  }
  const num = parseInt(value, 10);
  if (isNaN(num)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }
  return num;
}

function getEnvBoolean(key: string, defaultValue?: boolean): boolean {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value.toLowerCase() === 'true' || value === '1';
}

export const config = {
  // Server
  nodeEnv: getEnv('NODE_ENV', 'development'),
  port: getEnvNumber('PORT', 3000),
  host: getEnv('HOST', '0.0.0.0'),

  // Database
  databaseUrl: getEnv('DATABASE_URL', './data/enterprise.db'),

  // JWT
  jwtSecret: getEnv('JWT_SECRET', 'dev-secret-key-change-in-production-32ch'),
  jwtExpiresIn: getEnv('JWT_EXPIRES_IN', '1h'),
  jwtRefreshExpiresIn: getEnv('JWT_REFRESH_EXPIRES_IN', '7d'),

  // Security
  corsOrigin: getEnv('CORS_ORIGIN', '*'),
  rateLimitWindowMs: getEnvNumber('RATE_LIMIT_WINDOW_MS', 60000),
  rateLimitMaxRequests: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),

  // Logging
  logLevel: getEnv('LOG_LEVEL', 'info') as 'debug' | 'info' | 'warn' | 'error',
  logFormat: getEnv('LOG_FORMAT', 'json') as 'json' | 'pretty',

  // Derived
  isDevelopment: getEnv('NODE_ENV', 'development') === 'development',
  isProduction: getEnv('NODE_ENV', 'development') === 'production',
  isTest: getEnv('NODE_ENV', 'development') === 'test',
} as const;

export type Config = typeof config;
