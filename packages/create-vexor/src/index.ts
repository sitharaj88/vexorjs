/**
 * create-vexor — `npm create vexor@latest my-app`
 *
 * Thin wrapper that delegates to `vexor new` from @vexorjs/cli, so project
 * templates live in exactly one place. Everything after the package name is
 * forwarded (e.g. --template, --package-manager, --yes).
 */

import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

/**
 * Build the argv passed to the Vexor CLI.
 * `npm create vexor foo -- --template minimal` reaches us as
 * ['foo', '--template', 'minimal'] — we prepend the `new` command.
 */
export function buildCliArgs(argv: string[]): string[] {
  return ['new', ...argv];
}

/** Resolve the @vexorjs/cli bin entry from our own dependency tree */
export function resolveCliEntry(): string {
  const require = createRequire(import.meta.url);
  return require.resolve('@vexorjs/cli');
}

export function run(argv: string[] = process.argv.slice(2)): void {
  let cliEntry: string;
  try {
    cliEntry = resolveCliEntry();
  } catch {
    console.error('create-vexor: could not resolve @vexorjs/cli. Reinstall create-vexor.');
    process.exit(1);
    return;
  }

  const child = spawn(process.execPath, [cliEntry, ...buildCliArgs(argv)], {
    stdio: 'inherit',
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });

  child.on('error', (error) => {
    console.error(`create-vexor: failed to launch the Vexor CLI: ${error.message}`);
    process.exit(1);
  });
}

// Only run when executed as a bin, not when imported (e.g. in tests)
const isDirectRun =
  typeof process !== 'undefined' &&
  process.argv[1] !== undefined &&
  import.meta.url.endsWith(process.argv[1].split(/[\\/]/).pop() ?? '');

if (isDirectRun) {
  run();
}
