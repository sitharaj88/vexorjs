/**
 * Development Server Command
 *
 * Starts a development server with hot reload.
 */

import { spawn } from 'child_process';
import { resolve } from 'path';
import { access } from 'fs/promises';

interface DevOptions {
  port: number;
  host: string;
  entry: string;
}

/**
 * Dev command handler
 */
export async function devCommand(options: DevOptions): Promise<void> {
  const { port, host, entry } = options;
  const entryPath = resolve(process.cwd(), entry);

  console.log(`\n🚀 Starting development server...\n`);

  // Check if entry file exists
  try {
    await access(entryPath);
  } catch {
    console.error(`❌ Entry file not found: ${entry}`);
    console.log(`\n   Make sure ${entry} exists or specify a different entry with --entry\n`);
    process.exit(1);
  }

  // Set environment variables
  const env = {
    ...process.env,
    NODE_ENV: 'development',
    PORT: String(port),
    HOST: host,
  };

  // Check for tsx or ts-node
  const runner = await findRunner();

  if (!runner) {
    console.error('❌ No TypeScript runner found');
    console.log('\n   Install tsx: npm install -D tsx');
    console.log('   Or ts-node: npm install -D ts-node\n');
    process.exit(1);
  }

  console.log(`   Runner: ${runner.name}`);
  console.log(`   Entry: ${entry}`);
  console.log(`   URL: http://${host}:${port}\n`);

  // Start the dev server with watch mode
  const args = runner.name === 'tsx'
    ? ['watch', entryPath]
    : ['--watch', entryPath];

  const child = spawn(runner.path, args, {
    cwd: process.cwd(),
    env,
    stdio: 'inherit',
    shell: true,
  });

  // Handle termination
  const cleanup = () => {
    child.kill('SIGTERM');
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  child.on('error', (error) => {
    console.error(`\n❌ Failed to start dev server: ${error.message}\n`);
    process.exit(1);
  });

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.log(`\n⚠ Dev server exited with code ${code}\n`);
    }
    process.exit(code ?? 0);
  });
}

/**
 * Find available TypeScript runner
 */
async function findRunner(): Promise<{ name: string; path: string } | null> {
  const runners = [
    { name: 'tsx', path: 'npx tsx' },
    { name: 'ts-node', path: 'npx ts-node' },
    { name: 'bun', path: 'bun' },
  ];

  // Check for locally installed runners
  const nodeModulesPath = resolve(process.cwd(), 'node_modules');

  for (const runner of runners) {
    try {
      if (runner.name === 'bun') {
        // Check if bun is available globally
        const { execSync } = await import('child_process');
        execSync('bun --version', { stdio: 'ignore' });
        return { name: 'bun', path: 'bun run' };
      } else {
        await access(resolve(nodeModulesPath, '.bin', runner.name));
        return runner;
      }
    } catch {
      continue;
    }
  }

  return null;
}
