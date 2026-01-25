/**
 * Configuration Loader
 *
 * Multi-source configuration with validation, type safety,
 * and environment-aware loading.
 */

import type { TSchema, Static } from '../schema/index.js';

/**
 * Configuration source types
 */
export type ConfigSource = 'env' | 'file' | 'object' | 'default';

/**
 * Configuration value with metadata
 */
export interface ConfigValue<T = unknown> {
  value: T;
  source: ConfigSource;
  key: string;
}

/**
 * Environment variable options
 */
export interface EnvOptions {
  /** Prefix for environment variables */
  prefix?: string;
  /** Separator for nested keys (default: '__') */
  separator?: string;
  /** Transform key names (default: SCREAMING_SNAKE_CASE) */
  transform?: 'upper' | 'lower' | 'none';
}

/**
 * Config loader options
 */
export interface ConfigLoaderOptions {
  /** Environment (development, production, test) */
  env?: string;
  /** Environment variable options */
  envOptions?: EnvOptions;
  /** Config files to load */
  files?: string[];
  /** Schema for validation */
  schema?: TSchema;
  /** Default values */
  defaults?: Record<string, unknown>;
  /** Override values */
  overrides?: Record<string, unknown>;
}

/**
 * Deep merge two objects
 */
function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...target };

  for (const [key, value] of Object.entries(source)) {
    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      target[key] !== null &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key] as Record<string, unknown>, value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Convert string to key path
 */
function toKeyPath(key: string, separator: string): string[] {
  return key.split(separator);
}

/**
 * Set nested value
 */
function setNested(obj: Record<string, unknown>, path: string[], value: unknown): void {
  let current = obj;

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i].toLowerCase();
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  const finalKey = path[path.length - 1].toLowerCase();
  current[finalKey] = value;
}

/**
 * Get nested value
 */
function getNested(obj: Record<string, unknown>, path: string[]): unknown {
  let current: unknown = obj;

  for (const key of path) {
    if (current === null || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key.toLowerCase()];
  }

  return current;
}

/**
 * Parse value from string (for environment variables)
 */
function parseValue(value: string): unknown {
  // Boolean
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;

  // Null
  if (value.toLowerCase() === 'null') return null;

  // Number
  const num = Number(value);
  if (!isNaN(num) && value.trim() !== '') return num;

  // JSON (arrays, objects)
  if ((value.startsWith('{') && value.endsWith('}')) ||
      (value.startsWith('[') && value.endsWith(']'))) {
    try {
      return JSON.parse(value);
    } catch {
      // Not valid JSON, return as string
    }
  }

  // String
  return value;
}

/**
 * Configuration class
 */
export class Config<T extends Record<string, unknown> = Record<string, unknown>> {
  private data: T;
  private sources: Map<string, ConfigSource> = new Map();
  private options: ConfigLoaderOptions;

  constructor(data: T, sources: Map<string, ConfigSource>, options: ConfigLoaderOptions) {
    this.data = data;
    this.sources = sources;
    this.options = options;
  }

  /**
   * Get configuration value
   */
  get<K extends keyof T>(key: K): T[K];
  get<V = unknown>(key: string): V | undefined;
  get(key: string): unknown {
    if (key.includes('.')) {
      return getNested(this.data as Record<string, unknown>, key.split('.'));
    }
    return this.data[key];
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Get value with default
   */
  getOrDefault<V>(key: string, defaultValue: V): V {
    const value = this.get<V>(key);
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Get required value (throws if not found)
   */
  getRequired<V>(key: string): V {
    const value = this.get<V>(key);
    if (value === undefined) {
      throw new Error(`Required configuration key "${key}" is not set`);
    }
    return value;
  }

  /**
   * Get source of a configuration value
   */
  getSource(key: string): ConfigSource | undefined {
    return this.sources.get(key);
  }

  /**
   * Get all configuration data
   */
  all(): T {
    return { ...this.data };
  }

  /**
   * Get current environment
   */
  get env(): string {
    return this.options.env ?? 'development';
  }

  /**
   * Check if production
   */
  get isProduction(): boolean {
    return this.env === 'production';
  }

  /**
   * Check if development
   */
  get isDevelopment(): boolean {
    return this.env === 'development';
  }

  /**
   * Check if test
   */
  get isTest(): boolean {
    return this.env === 'test';
  }
}

/**
 * Configuration loader
 */
export class ConfigLoader<S extends TSchema = TSchema> {
  private options: ConfigLoaderOptions;

  constructor(options: ConfigLoaderOptions = {}) {
    this.options = {
      env: options.env ?? process.env.NODE_ENV ?? 'development',
      envOptions: {
        prefix: '',
        separator: '__',
        transform: 'upper',
        ...options.envOptions,
      },
      files: options.files ?? [],
      schema: options.schema,
      defaults: options.defaults ?? {},
      overrides: options.overrides ?? {},
    };
  }

  /**
   * Load configuration from all sources
   */
  async load(): Promise<Config<S extends TSchema ? Static<S> : Record<string, unknown>>> {
    const sources = new Map<string, ConfigSource>();
    let config: Record<string, unknown> = {};

    // 1. Apply defaults
    if (this.options.defaults) {
      config = deepMerge(config, this.options.defaults);
      this.markSources(sources, this.options.defaults, 'default');
    }

    // 2. Load from files
    for (const file of this.options.files ?? []) {
      const fileConfig = await this.loadFile(file);
      if (fileConfig) {
        config = deepMerge(config, fileConfig);
        this.markSources(sources, fileConfig, 'file');
      }
    }

    // 3. Load from environment variables
    const envConfig = this.loadEnv();
    config = deepMerge(config, envConfig);
    this.markSources(sources, envConfig, 'env');

    // 4. Apply overrides
    if (this.options.overrides) {
      config = deepMerge(config, this.options.overrides);
      this.markSources(sources, this.options.overrides, 'object');
    }

    // 5. Validate against schema
    if (this.options.schema) {
      this.validate(config);
    }

    return new Config(
      config as S extends TSchema ? Static<S> : Record<string, unknown>,
      sources,
      this.options
    );
  }

  /**
   * Load configuration file
   */
  private async loadFile(filePath: string): Promise<Record<string, unknown> | null> {
    try {
      // Dynamic import for JSON files
      if (filePath.endsWith('.json')) {
        const fs = await this.getFs();
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content);
      }

      // Dynamic import for JS/TS files
      if (filePath.endsWith('.js') || filePath.endsWith('.ts') || filePath.endsWith('.mjs')) {
        const module = await import(filePath);
        return module.default ?? module;
      }

      // ENV file
      if (filePath.endsWith('.env') || filePath.includes('.env.')) {
        const fs = await this.getFs();
        const content = await fs.readFile(filePath, 'utf-8');
        return this.parseEnvFile(content);
      }

      return null;
    } catch (error) {
      // File not found or import error - ignore
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get filesystem module
   */
  private async getFs(): Promise<{ readFile: (path: string, encoding: string) => Promise<string> }> {
    // Use dynamic import to avoid issues in non-Node environments
    const fs = await Function('return import("fs/promises")')();
    return fs;
  }

  /**
   * Parse .env file content
   */
  private parseEnvFile(content: string): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const line of content.split('\n')) {
      const trimmed = line.trim();

      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith('#')) continue;

      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;

      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();

      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // Convert key to nested structure
      const { separator } = this.options.envOptions!;
      if (key.includes(separator!)) {
        const path = toKeyPath(key, separator!);
        setNested(result, path, parseValue(value));
      } else {
        result[key.toLowerCase()] = parseValue(value);
      }
    }

    return result;
  }

  /**
   * Load from environment variables
   */
  private loadEnv(): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    const { prefix, separator, transform } = this.options.envOptions!;

    for (const [key, value] of Object.entries(process.env)) {
      if (value === undefined) continue;

      // Check prefix
      if (prefix && !key.startsWith(prefix)) continue;

      // Remove prefix
      let cleanKey = prefix ? key.slice(prefix.length) : key;
      if (cleanKey.startsWith('_')) cleanKey = cleanKey.slice(1);

      // Transform key
      if (transform === 'lower') {
        cleanKey = cleanKey.toLowerCase();
      } else if (transform === 'none') {
        // Keep as-is
      }

      // Convert to nested structure
      if (cleanKey.includes(separator!)) {
        const path = toKeyPath(cleanKey, separator!);
        setNested(result, path, parseValue(value));
      } else {
        result[cleanKey.toLowerCase()] = parseValue(value);
      }
    }

    return result;
  }

  /**
   * Mark sources for keys
   */
  private markSources(
    sources: Map<string, ConfigSource>,
    obj: Record<string, unknown>,
    source: ConfigSource,
    prefix = ''
  ): void {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      sources.set(fullKey, source);

      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        this.markSources(sources, value as Record<string, unknown>, source, fullKey);
      }
    }
  }

  /**
   * Validate configuration against schema
   */
  private validate(config: Record<string, unknown>): void {
    if (!this.options.schema) return;

    // Simple validation - in real implementation would use schema validation
    const schema = this.options.schema as { properties?: Record<string, { required?: boolean }> };

    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        if (prop.required && !(key in config)) {
          throw new Error(`Required configuration key "${key}" is missing`);
        }
      }
    }
  }
}

/**
 * Create a typed configuration loader
 */
export function defineConfig<S extends TSchema>(options: ConfigLoaderOptions & { schema: S }): ConfigLoader<S>;
export function defineConfig(options?: ConfigLoaderOptions): ConfigLoader;
export function defineConfig(options: ConfigLoaderOptions = {}): ConfigLoader {
  return new ConfigLoader(options);
}

/**
 * Load configuration with defaults
 */
export async function loadConfig<T extends Record<string, unknown> = Record<string, unknown>>(
  options?: ConfigLoaderOptions
): Promise<Config<T>> {
  const loader = new ConfigLoader<TSchema>(options);
  return loader.load() as Promise<Config<T>>;
}

/**
 * Environment helpers
 */
export const env = {
  /**
   * Get environment variable
   */
  get(key: string): string | undefined {
    return process.env[key];
  },

  /**
   * Get environment variable or throw
   */
  getRequired(key: string): string {
    const value = process.env[key];
    if (value === undefined) {
      throw new Error(`Required environment variable "${key}" is not set`);
    }
    return value;
  },

  /**
   * Get environment variable with default
   */
  getOrDefault(key: string, defaultValue: string): string {
    return process.env[key] ?? defaultValue;
  },

  /**
   * Get environment variable as number
   */
  getNumber(key: string): number | undefined {
    const value = process.env[key];
    if (value === undefined) return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  },

  /**
   * Get environment variable as boolean
   */
  getBoolean(key: string): boolean | undefined {
    const value = process.env[key];
    if (value === undefined) return undefined;
    return value.toLowerCase() === 'true' || value === '1';
  },

  /**
   * Check if environment variable is set
   */
  has(key: string): boolean {
    return key in process.env && process.env[key] !== undefined;
  },

  /**
   * Get current NODE_ENV
   */
  get mode(): string {
    return process.env.NODE_ENV ?? 'development';
  },

  /**
   * Check if production
   */
  get isProduction(): boolean {
    return this.mode === 'production';
  },

  /**
   * Check if development
   */
  get isDevelopment(): boolean {
    return this.mode === 'development';
  },

  /**
   * Check if test
   */
  get isTest(): boolean {
    return this.mode === 'test';
  },
};
