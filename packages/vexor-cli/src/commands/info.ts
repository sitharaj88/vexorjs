/**
 * Info and Doctor Commands
 *
 * Displays system information and diagnoses common issues.
 */

import { readFile, access, readdir } from 'fs/promises';
import { resolve, join } from 'path';
import { execSync } from 'child_process';
import { platform, arch, release, cpus, totalmem, freemem } from 'os';
import { logger } from '../utils/logger.js';

interface PackageJson {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

interface SystemInfo {
  os: string;
  arch: string;
  node: string;
  npm: string;
  packageManager: string | null;
  vexorCli: string;
  vexorCore: string | null;
  vexorOrm: string | null;
  cwd: string;
  cpus: number;
  memory: string;
}

/**
 * Get version of a command
 */
function getCommandVersion(cmd: string): string | null {
  try {
    return execSync(`${cmd} --version`, { encoding: 'utf-8' }).trim().split('\n')[0];
  } catch {
    return null;
  }
}

/**
 * Detect package manager
 */
async function detectPackageManager(): Promise<string | null> {
  const cwd = process.cwd();

  if (await fileExists(join(cwd, 'bun.lockb'))) return 'bun';
  if (await fileExists(join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
  if (await fileExists(join(cwd, 'yarn.lock'))) return 'yarn';
  if (await fileExists(join(cwd, 'package-lock.json'))) return 'npm';

  return null;
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
 * Read package.json
 */
async function readPackageJson(): Promise<PackageJson | null> {
  try {
    const content = await readFile(resolve(process.cwd(), 'package.json'), 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Get installed Vexor versions
 */
async function getVexorVersions(): Promise<{ core: string | null; orm: string | null }> {
  const pkg = await readPackageJson();
  const deps = { ...pkg?.dependencies, ...pkg?.devDependencies };

  return {
    core: deps?.['@vexorjs/core'] || deps?.['vexor'] || null,
    orm: deps?.['@vexorjs/orm'] || deps?.['vexor-orm'] || null,
  };
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(1)} GB`;
}

/**
 * Info command - shows system and project information
 */
export async function infoCommand(): Promise<void> {
  logger.banner('System Information');

  const versions = await getVexorVersions();
  const pm = await detectPackageManager();

  const info: SystemInfo = {
    os: `${platform()} ${release()}`,
    arch: arch(),
    node: process.version,
    npm: getCommandVersion('npm') || 'not found',
    packageManager: pm,
    vexorCli: '1.0.0', // Get from package.json in production
    vexorCore: versions.core,
    vexorOrm: versions.orm,
    cwd: process.cwd(),
    cpus: cpus().length,
    memory: `${formatBytes(freemem())} free / ${formatBytes(totalmem())} total`,
  };

  logger.blank();
  logger.keyValue('OS', info.os);
  logger.keyValue('Architecture', info.arch);
  logger.keyValue('Node.js', info.node);
  logger.keyValue('npm', info.npm);
  logger.keyValue('Package Manager', info.packageManager || 'not detected');
  logger.blank();
  logger.keyValue('Vexor CLI', info.vexorCli);
  logger.keyValue('Vexor Core', info.vexorCore || 'not installed');
  logger.keyValue('Vexor ORM', info.vexorOrm || 'not installed');
  logger.blank();
  logger.keyValue('CPUs', String(info.cpus));
  logger.keyValue('Memory', info.memory);
  logger.keyValue('Working Dir', info.cwd);
  logger.blank();
}

/**
 * Doctor command - diagnoses common issues
 */
export async function doctorCommand(): Promise<void> {
  logger.banner('Vexor Doctor');
  logger.blank();

  const checks: Array<{
    name: string;
    check: () => Promise<{ ok: boolean; message: string }>;
  }> = [
    {
      name: 'Node.js version',
      check: async () => {
        const version = parseInt(process.version.slice(1).split('.')[0]);
        return {
          ok: version >= 20,
          message: version >= 20
            ? `Node.js ${process.version} (>= 20.0.0)`
            : `Node.js ${process.version} - please upgrade to >= 20.0.0`,
        };
      },
    },
    {
      name: 'Package manager',
      check: async () => {
        const pm = await detectPackageManager();
        return {
          ok: pm !== null,
          message: pm ? `Using ${pm}` : 'No lockfile found - run npm/yarn/pnpm install',
        };
      },
    },
    {
      name: 'package.json',
      check: async () => {
        const pkg = await readPackageJson();
        return {
          ok: pkg !== null,
          message: pkg ? `Found: ${pkg.name}@${pkg.version}` : 'No package.json found',
        };
      },
    },
    {
      name: 'Vexor Core installed',
      check: async () => {
        const versions = await getVexorVersions();
        return {
          ok: versions.core !== null,
          message: versions.core
            ? `@vexorjs/core ${versions.core}`
            : 'Not installed - run: npm install @vexorjs/core',
        };
      },
    },
    {
      name: 'TypeScript installed',
      check: async () => {
        const pkg = await readPackageJson();
        const deps = { ...pkg?.dependencies, ...pkg?.devDependencies };
        const tsVersion = deps?.['typescript'];
        return {
          ok: tsVersion !== undefined,
          message: tsVersion
            ? `TypeScript ${tsVersion}`
            : 'Not installed - run: npm install -D typescript',
        };
      },
    },
    {
      name: 'tsconfig.json',
      check: async () => {
        const exists = await fileExists(resolve(process.cwd(), 'tsconfig.json'));
        return {
          ok: exists,
          message: exists ? 'Found' : 'Missing - run: npx tsc --init',
        };
      },
    },
    {
      name: 'Source directory',
      check: async () => {
        const srcExists = await fileExists(resolve(process.cwd(), 'src'));
        const indexExists = await fileExists(resolve(process.cwd(), 'src/index.ts'));
        return {
          ok: srcExists && indexExists,
          message: srcExists && indexExists
            ? 'src/index.ts found'
            : 'Missing src/index.ts - create your entry file',
        };
      },
    },
    {
      name: 'Environment file',
      check: async () => {
        const envExists = await fileExists(resolve(process.cwd(), '.env'));
        const exampleExists = await fileExists(resolve(process.cwd(), '.env.example'));
        return {
          ok: true,
          message: envExists
            ? '.env found'
            : exampleExists
              ? '.env.example found - copy to .env'
              : 'No .env file (optional)',
        };
      },
    },
    {
      name: 'Git repository',
      check: async () => {
        const gitExists = await fileExists(resolve(process.cwd(), '.git'));
        return {
          ok: true,
          message: gitExists ? 'Initialized' : 'Not a git repository (optional)',
        };
      },
    },
  ];

  let allPassed = true;

  for (const { name, check } of checks) {
    try {
      const result = await check();
      if (result.ok) {
        logger.success(`${name}: ${result.message}`);
      } else {
        logger.error(`${name}: ${result.message}`);
        allPassed = false;
      }
    } catch (error) {
      logger.error(`${name}: Check failed - ${(error as Error).message}`);
      allPassed = false;
    }
  }

  logger.blank();

  if (allPassed) {
    logger.box('All checks passed! Your Vexor project is properly configured.', {
      title: 'Status: Healthy',
    });
  } else {
    logger.box('Some checks failed. Please fix the issues above.', {
      title: 'Status: Issues Found',
    });
  }
}

export default { infoCommand, doctorCommand };
