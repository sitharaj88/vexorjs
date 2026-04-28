/**
 * Test Command
 *
 * Runs the project's test suite. Detects the configured runner from
 * package.json (vitest, jest, node:test, mocha) and falls back to
 * `npm test` when nothing is recognized.
 */

import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';

export interface TestOptions {
  watch?: boolean;
  coverage?: boolean;
  ui?: boolean;
  pattern?: string;
}

type Runner = 'vitest' | 'jest' | 'node-test' | 'mocha' | 'npm-script';

interface RunnerPlan {
  runner: Runner;
  command: string;
  args: string[];
}

/**
 * Detect which test runner the project uses based on devDependencies
 * and package.json scripts.
 */
export async function detectRunner(cwd: string): Promise<Runner> {
  let pkg: Record<string, unknown> = {};
  try {
    pkg = JSON.parse(
      await readFile(resolve(cwd, 'package.json'), 'utf-8')
    ) as Record<string, unknown>;
  } catch {
    return 'npm-script';
  }

  const deps = {
    ...((pkg.devDependencies as Record<string, string>) ?? {}),
    ...((pkg.dependencies as Record<string, string>) ?? {}),
  };

  if ('vitest' in deps) return 'vitest';
  if ('jest' in deps) return 'jest';
  if ('mocha' in deps) return 'mocha';

  const scripts = (pkg.scripts as Record<string, string>) ?? {};
  if (scripts.test?.includes('vitest')) return 'vitest';
  if (scripts.test?.includes('jest')) return 'jest';
  if (scripts.test?.includes('mocha')) return 'mocha';
  if (scripts.test?.includes('node --test')) return 'node-test';
  if (scripts.test) return 'npm-script';

  // Last resort: invoke node's built-in test runner.
  return 'node-test';
}

/**
 * Build the spawn plan for a runner + options. Pure: no I/O.
 */
export function planRunner(runner: Runner, options: TestOptions): RunnerPlan {
  const args: string[] = [];

  switch (runner) {
    case 'vitest': {
      args.push(options.watch ? 'watch' : 'run');
      if (options.coverage) args.push('--coverage');
      if (options.ui) args.push('--ui');
      if (options.pattern) args.push(options.pattern);
      return { runner, command: 'npx', args: ['vitest', ...args] };
    }

    case 'jest': {
      if (options.watch) args.push('--watch');
      if (options.coverage) args.push('--coverage');
      if (options.pattern) args.push(options.pattern);
      return { runner, command: 'npx', args: ['jest', ...args] };
    }

    case 'mocha': {
      if (options.watch) args.push('--watch');
      if (options.pattern) args.push(options.pattern);
      return { runner, command: 'npx', args: ['mocha', ...args] };
    }

    case 'node-test': {
      args.push('--test');
      if (options.watch) args.push('--watch');
      if (options.pattern) args.push(options.pattern);
      else args.push('test/', 'tests/', 'src/');
      return { runner, command: 'node', args };
    }

    case 'npm-script':
    default:
      return { runner, command: 'npm', args: ['test'] };
  }
}

/**
 * Run the project's tests.
 */
export async function testCommand(options: TestOptions = {}): Promise<void> {
  const cwd = process.cwd();
  const runner = await detectRunner(cwd);
  const plan = planRunner(runner, options);

  console.log(`\n🧪 Running tests with ${runner}...\n`);

  await new Promise<void>((resolvePromise, rejectPromise) => {
    const child = spawn(plan.command, plan.args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    child.on('error', rejectPromise);
    child.on('exit', (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        rejectPromise(new Error(`Tests failed with exit code ${code}`));
      }
    });
  });
}
