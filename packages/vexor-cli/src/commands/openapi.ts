/**
 * OpenAPI Command
 *
 * Generates OpenAPI/Swagger documentation from Vexor routes.
 */

import { readFile, writeFile, readdir } from 'fs/promises';
import { resolve, join, basename, extname } from 'path';
import ora from 'ora';
import { logger } from '../utils/logger.js';

interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: Array<{ url: string; description?: string }>;
  paths: Record<string, Record<string, unknown>>;
  components?: {
    schemas?: Record<string, unknown>;
    securitySchemes?: Record<string, unknown>;
  };
  tags?: Array<{ name: string; description?: string }>;
}

interface GenerateOptions {
  output?: string;
  format?: 'json' | 'yaml';
  title?: string;
  version?: string;
  server?: string;
}

/**
 * Parse route files to extract OpenAPI information
 */
async function parseRouteFiles(srcDir: string): Promise<OpenAPISpec['paths']> {
  const paths: OpenAPISpec['paths'] = {};

  try {
    const routesDir = join(srcDir, 'routes');
    const files = await readdir(routesDir, { recursive: true });

    for (const file of files) {
      if (typeof file !== 'string') continue;
      if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;

      const filePath = join(routesDir, file);
      const content = await readFile(filePath, 'utf-8');

      // Extract route definitions using regex
      // This is a simplified parser - in production would use AST parsing
      const routePatterns = [
        /\.get\s*\(\s*['"`]([^'"`]+)['"`]/g,
        /\.post\s*\(\s*['"`]([^'"`]+)['"`]/g,
        /\.put\s*\(\s*['"`]([^'"`]+)['"`]/g,
        /\.patch\s*\(\s*['"`]([^'"`]+)['"`]/g,
        /\.delete\s*\(\s*['"`]([^'"`]+)['"`]/g,
      ];

      const methods = ['get', 'post', 'put', 'patch', 'delete'];

      methods.forEach((method, index) => {
        const pattern = routePatterns[index];
        let match;

        while ((match = pattern.exec(content)) !== null) {
          const path = match[1];
          const normalizedPath = normalizePath(path);

          if (!paths[normalizedPath]) {
            paths[normalizedPath] = {};
          }

          paths[normalizedPath][method] = {
            summary: `${method.toUpperCase()} ${path}`,
            operationId: generateOperationId(method, path),
            tags: [getTagFromFile(file)],
            responses: {
              '200': {
                description: 'Successful response',
              },
            },
          };
        }
      });
    }
  } catch {
    // Routes directory might not exist
  }

  return paths;
}

/**
 * Normalize route path to OpenAPI format
 */
function normalizePath(path: string): string {
  // Convert Express-style params to OpenAPI format
  return path.replace(/:([^/]+)/g, '{$1}');
}

/**
 * Generate operation ID from method and path
 */
function generateOperationId(method: string, path: string): string {
  const parts = path
    .split('/')
    .filter(Boolean)
    .map((p) => {
      if (p.startsWith(':')) {
        return 'By' + capitalize(p.slice(1));
      }
      return capitalize(p);
    });

  return method + parts.join('');
}

/**
 * Get tag name from file path
 */
function getTagFromFile(file: string): string {
  const name = basename(file, extname(file));
  return capitalize(name);
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert spec to YAML format
 */
function toYaml(obj: unknown, indent = 0): string {
  const spaces = '  '.repeat(indent);

  if (obj === null || obj === undefined) {
    return 'null';
  }

  if (typeof obj === 'string') {
    if (obj.includes('\n') || obj.includes(':') || obj.includes('#')) {
      return `"${obj.replace(/"/g, '\\"')}"`;
    }
    return obj;
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return String(obj);
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return obj.map((item) => `${spaces}- ${toYaml(item, indent + 1).trim()}`).join('\n');
  }

  if (typeof obj === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return '{}';

    return entries
      .map(([key, value]) => {
        const valueStr = toYaml(value, indent + 1);
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          return `${spaces}${key}:\n${valueStr}`;
        }
        if (Array.isArray(value)) {
          return `${spaces}${key}:\n${valueStr}`;
        }
        return `${spaces}${key}: ${valueStr}`;
      })
      .join('\n');
  }

  return String(obj);
}

/**
 * OpenAPI generate command
 */
export async function openapiCommand(options: GenerateOptions = {}): Promise<void> {
  logger.title('OpenAPI Generator');
  logger.blank();

  const srcDir = resolve(process.cwd(), 'src');
  const outputFormat = options.format || 'json';
  const outputFile =
    options.output || `openapi.${outputFormat === 'yaml' ? 'yaml' : 'json'}`;

  const spinner = ora('Scanning route files...').start();

  try {
    // Parse routes
    const paths = await parseRouteFiles(srcDir);
    const pathCount = Object.keys(paths).length;

    spinner.text = `Found ${pathCount} routes`;

    // Build OpenAPI spec
    const spec: OpenAPISpec = {
      openapi: '3.0.3',
      info: {
        title: options.title || 'Vexor API',
        version: options.version || '1.0.0',
        description: 'API documentation generated by Vexor CLI',
      },
      servers: options.server
        ? [{ url: options.server, description: 'API Server' }]
        : [
            { url: 'http://localhost:3000', description: 'Development' },
            { url: 'https://api.example.com', description: 'Production' },
          ],
      paths,
      components: {
        schemas: {},
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      tags: extractTags(paths),
    };

    // Write output
    const outputPath = resolve(process.cwd(), outputFile);
    const content =
      outputFormat === 'yaml'
        ? toYaml(spec)
        : JSON.stringify(spec, null, 2);

    await writeFile(outputPath, content + '\n');

    spinner.succeed(`OpenAPI spec generated: ${outputFile}`);

    logger.blank();
    logger.keyValue('Paths', String(pathCount));
    logger.keyValue('Format', outputFormat.toUpperCase());
    logger.keyValue('Output', outputPath);

    if (pathCount === 0) {
      logger.blank();
      logger.warn('No routes found. Make sure you have route files in src/routes/');
      logger.info('The generator looks for .get(), .post(), etc. patterns in your code');
    }

    logger.blank();
    logger.info('Tip: For more detailed specs, add JSDoc comments to your routes');
    logger.info('     or use the Type schema definitions in route handlers');
  } catch (error) {
    spinner.fail('Failed to generate OpenAPI spec');
    throw error;
  }
}

/**
 * Extract unique tags from paths
 */
function extractTags(
  paths: Record<string, Record<string, unknown>>
): Array<{ name: string; description?: string }> {
  const tagSet = new Set<string>();

  for (const pathMethods of Object.values(paths)) {
    for (const operation of Object.values(pathMethods) as Array<{ tags?: string[] }>) {
      if (operation.tags) {
        operation.tags.forEach((tag) => tagSet.add(tag));
      }
    }
  }

  return Array.from(tagSet).map((name) => ({ name }));
}

/**
 * Validate an existing OpenAPI spec
 */
export async function validateCommand(file?: string): Promise<void> {
  const specFile = file || 'openapi.json';
  const specPath = resolve(process.cwd(), specFile);

  logger.title('OpenAPI Validator');
  logger.blank();

  const spinner = ora(`Validating ${specFile}...`).start();

  try {
    const content = await readFile(specPath, 'utf-8');
    const spec = JSON.parse(content) as OpenAPISpec;

    const issues: string[] = [];

    // Basic validation
    if (!spec.openapi) {
      issues.push('Missing openapi version field');
    } else if (!spec.openapi.startsWith('3.')) {
      issues.push(`OpenAPI version ${spec.openapi} may not be fully supported`);
    }

    if (!spec.info?.title) {
      issues.push('Missing info.title');
    }

    if (!spec.info?.version) {
      issues.push('Missing info.version');
    }

    if (!spec.paths || Object.keys(spec.paths).length === 0) {
      issues.push('No paths defined');
    }

    // Check paths
    for (const [path, methods] of Object.entries(spec.paths)) {
      for (const [method, operation] of Object.entries(
        methods as Record<string, { responses?: unknown }>
      )) {
        if (!operation.responses) {
          issues.push(`${method.toUpperCase()} ${path}: Missing responses`);
        }
      }
    }

    if (issues.length === 0) {
      spinner.succeed('OpenAPI spec is valid');
      logger.blank();
      logger.keyValue('Version', spec.openapi);
      logger.keyValue('Title', spec.info.title);
      logger.keyValue('Paths', String(Object.keys(spec.paths).length));
    } else {
      spinner.warn(`Found ${issues.length} issue(s)`);
      logger.blank();
      issues.forEach((issue) => logger.warn(issue));
    }
  } catch (error) {
    spinner.fail(`Failed to validate: ${(error as Error).message}`);
    process.exit(1);
  }
}

export default { openapiCommand, validateCommand };
