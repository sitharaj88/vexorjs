/**
 * Vexor CLI
 *
 * Command-line tool for Vexor framework with project scaffolding,
 * code generation, configuration management, and development utilities.
 */

import { cac } from 'cac';
import { newCommand } from './commands/new.js';
import { generateCommand } from './commands/generate.js';
import { dbCommand } from './commands/db.js';
import { devCommand } from './commands/dev.js';
import { buildCommand } from './commands/build.js';
import { configCommand } from './commands/config.js';
import { infoCommand, doctorCommand } from './commands/info.js';
import {
  helpCommand,
  upgradeCommand,
  docsCommand,
  feedbackCommand,
  changelogCommand,
} from './commands/support.js';
import { addCommand, listIntegrationsCommand } from './commands/add.js';
import { openapiCommand, validateCommand } from './commands/openapi.js';
import {
  envListCommand,
  envGetCommand,
  envSetCommand,
  envRemoveCommand,
  envInitCommand,
  envDiffCommand,
  envValidateCommand,
} from './commands/env.js';
import { logger } from './utils/logger.js';

const cli = cac('vexor');

// Version
cli.version('1.0.0');

// ============================================
// Project Creation
// ============================================

cli
  .command('new [name]', 'Create a new Vexor project')
  .alias('create')
  .alias('init')
  .option('-t, --template <template>', 'Project template (api, minimal, microservice, websocket)')
  .option('-p, --package-manager <pm>', 'Package manager (npm, yarn, pnpm, bun)')
  .option('--no-git', 'Skip git initialization')
  .option('--no-install', 'Skip dependency installation')
  .option('-y, --yes', 'Use default options without prompting')
  .action(newCommand);

// ============================================
// Code Generation
// ============================================

cli
  .command('generate <type> <name>', 'Generate code (module, model, migration, route)')
  .alias('g')
  .option('-f, --fields <fields>', 'Model fields (name:type:options)')
  .option('-d, --directory <dir>', 'Target directory')
  .action(generateCommand);

// ============================================
// Add Integrations
// ============================================

cli
  .command('add [integration]', 'Add an integration to your project')
  .alias('install')
  .action(addCommand);

cli
  .command('add:list', 'List available integrations')
  .action(listIntegrationsCommand);

// ============================================
// Database Commands
// ============================================

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

// ============================================
// Configuration Commands
// ============================================

cli
  .command('config:list', 'List all configuration values')
  .option('-g, --global', 'Show global config only')
  .action((options) => configCommand('list', undefined, undefined, options));

cli
  .command('config:get <key>', 'Get a configuration value')
  .action((key) => configCommand('get', key));

cli
  .command('config:set <key> <value>', 'Set a configuration value')
  .option('-g, --global', 'Set in global config')
  .action((key, value, options) => configCommand('set', key, value, options));

cli
  .command('config:reset [key]', 'Reset configuration to defaults')
  .option('-g, --global', 'Reset global config')
  .action((key, options) => configCommand('reset', key, undefined, options));

cli
  .command('config:edit', 'Open config file in editor')
  .option('-g, --global', 'Edit global config')
  .action((options) => configCommand('edit', undefined, undefined, options));

cli
  .command('config:init', 'Create a new config file')
  .option('-g, --global', 'Create global config')
  .action((options) => configCommand('init', undefined, undefined, options));

cli
  .command('config:path', 'Show config file path')
  .option('-g, --global', 'Show global config path')
  .action((options) => configCommand('path', undefined, undefined, options));

// ============================================
// Environment Commands
// ============================================

cli
  .command('env:list', 'List all environment variables')
  .option('-f, --file <file>', 'Env file to use', { default: '.env' })
  .action((options) => envListCommand(options.file));

cli
  .command('env:get <key>', 'Get an environment variable')
  .option('-f, --file <file>', 'Env file to use', { default: '.env' })
  .action((key, options) => envGetCommand(key, options.file));

cli
  .command('env:set <key> <value>', 'Set an environment variable')
  .option('-f, --file <file>', 'Env file to use', { default: '.env' })
  .action((key, value, options) => envSetCommand(key, value, options.file));

cli
  .command('env:remove <key>', 'Remove an environment variable')
  .alias('env:unset')
  .option('-f, --file <file>', 'Env file to use', { default: '.env' })
  .action((key, options) => envRemoveCommand(key, options.file));

cli
  .command('env:init', 'Initialize .env from .env.example')
  .action(envInitCommand);

cli
  .command('env:diff', 'Compare .env with .env.example')
  .action(envDiffCommand);

cli
  .command('env:validate', 'Validate environment variables')
  .option('-f, --file <file>', 'Env file to use', { default: '.env' })
  .action((options) => envValidateCommand(options.file));

// ============================================
// OpenAPI Commands
// ============================================

cli
  .command('openapi', 'Generate OpenAPI/Swagger spec from routes')
  .alias('openapi:generate')
  .option('-o, --output <file>', 'Output file', { default: 'openapi.json' })
  .option('-f, --format <format>', 'Output format (json, yaml)', { default: 'json' })
  .option('--title <title>', 'API title')
  .option('--version <version>', 'API version')
  .option('--server <url>', 'Server URL')
  .action(openapiCommand);

cli
  .command('openapi:validate [file]', 'Validate an OpenAPI spec')
  .action(validateCommand);

// ============================================
// Development Commands
// ============================================

cli
  .command('dev', 'Start development server with hot reload')
  .option('-p, --port <port>', 'Server port', { default: 3000 })
  .option('-H, --host <host>', 'Server host', { default: 'localhost' })
  .option('-e, --entry <entry>', 'Entry file', { default: 'src/index.ts' })
  .action(devCommand);

cli
  .command('build', 'Build for production')
  .option('-o, --output <dir>', 'Output directory', { default: 'dist' })
  .option('--target <target>', 'Build target (node, bun, edge)', { default: 'node' })
  .option('--minify', 'Minify output')
  .action(buildCommand);

// ============================================
// Info and Diagnostics
// ============================================

cli
  .command('info', 'Show system and project information')
  .action(infoCommand);

cli
  .command('doctor', 'Check for common issues')
  .action(doctorCommand);

// ============================================
// Support Commands
// ============================================

cli
  .command('help [topic]', 'Get detailed help on a topic')
  .action(helpCommand);

cli
  .command('upgrade', 'Check for and install CLI updates')
  .option('-c, --check', 'Only check for updates, do not install')
  .action(upgradeCommand);

cli
  .command('docs [topic]', 'Open documentation in browser')
  .action(docsCommand);

cli
  .command('feedback', 'Report issues or give feedback')
  .option('-b, --bug', 'Report a bug')
  .action(feedbackCommand);

cli
  .command('changelog', 'Show recent changes')
  .alias('whatsnew')
  .action(changelogCommand);

// ============================================
// Help
// ============================================

cli.help((sections) => {
  // Add custom sections to help
  sections.push({
    title: 'Examples',
    body: `
  $ vexor new my-app                    Create a new project
  $ vexor new my-app -t microservice    Create with microservice template
  $ vexor generate module users         Generate a users module
  $ vexor add prisma                    Add Prisma ORM integration
  $ vexor env:init                      Initialize .env file
  $ vexor doctor                        Check for common issues
`,
  });

  return sections;
});

// Handle unknown commands
cli.on('command:*', () => {
  logger.error(`Unknown command: ${cli.args.join(' ')}`);
  logger.info('Run "vexor --help" for a list of available commands');
  process.exit(1);
});

// Parse arguments
try {
  cli.parse();
} catch (error) {
  if (error instanceof Error) {
    logger.error(error.message);
  }
  process.exit(1);
}

// Show help if no command provided
if (!cli.matchedCommand && !cli.options.help && !cli.options.version) {
  cli.outputHelp();
}
