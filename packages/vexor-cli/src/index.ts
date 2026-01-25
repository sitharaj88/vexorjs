/**
 * Vexor CLI
 *
 * Command-line tool for Vexor framework with project scaffolding,
 * code generation, and development utilities.
 */

import { cac } from 'cac';
import { newCommand } from './commands/new.js';
import { generateCommand } from './commands/generate.js';
import { dbCommand } from './commands/db.js';
import { devCommand } from './commands/dev.js';
import { buildCommand } from './commands/build.js';

const cli = cac('vexor');

// Version
cli.version('0.0.1');

// New project command
cli
  .command('new <name>', 'Create a new Vexor project')
  .option('-t, --template <template>', 'Project template (api, fullstack, minimal)', { default: 'api' })
  .option('-p, --package-manager <pm>', 'Package manager (npm, yarn, pnpm, bun)', { default: 'npm' })
  .option('--no-git', 'Skip git initialization')
  .option('--no-install', 'Skip dependency installation')
  .action(newCommand);

// Generate command
cli
  .command('generate <type> <name>', 'Generate code (module, model, migration)')
  .alias('g')
  .option('-f, --fields <fields>', 'Model fields (name:type:options)')
  .option('-d, --directory <dir>', 'Target directory')
  .action(generateCommand);

// Database commands
cli
  .command('db:migrate', 'Run pending migrations')
  .action(() => dbCommand('migrate'));

cli
  .command('db:rollback', 'Rollback the last migration')
  .option('-s, --steps <steps>', 'Number of migrations to rollback', { default: 1 })
  .action((options) => dbCommand('rollback', options));

cli
  .command('db:status', 'Show migration status')
  .action(() => dbCommand('status'));

cli
  .command('db:seed', 'Run database seeders')
  .action(() => dbCommand('seed'));

cli
  .command('db:reset', 'Reset database (rollback all, migrate, seed)')
  .action(() => dbCommand('reset'));

// Development server
cli
  .command('dev', 'Start development server with hot reload')
  .option('-p, --port <port>', 'Server port', { default: 3000 })
  .option('-H, --host <host>', 'Server host', { default: 'localhost' })
  .option('-e, --entry <entry>', 'Entry file', { default: 'src/index.ts' })
  .action(devCommand);

// Build for production
cli
  .command('build', 'Build for production')
  .option('-o, --output <dir>', 'Output directory', { default: 'dist' })
  .option('--target <target>', 'Build target (node, bun, edge)', { default: 'node' })
  .option('--minify', 'Minify output')
  .action(buildCommand);

// Help
cli.help();

// Parse arguments
cli.parse();
