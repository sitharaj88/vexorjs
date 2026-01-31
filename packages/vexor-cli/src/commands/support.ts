/**
 * Support Commands
 *
 * Help, upgrade, docs, and feedback commands for CLI support.
 */

import { execSync } from 'child_process';
import { platform } from 'os';
import ora from 'ora';
import { logger } from '../utils/logger.js';

const DOCS_URL = 'https://vexorjs.dev/docs';
const GITHUB_URL = 'https://github.com/sitharaj88/vexorjs';
const ISSUES_URL = 'https://github.com/sitharaj88/vexorjs/issues';
const NPM_PACKAGE = '@vexorjs/cli';

/**
 * Open a URL in the default browser
 */
function openUrl(url: string): boolean {
  try {
    const cmd = platform() === 'darwin'
      ? `open "${url}"`
      : platform() === 'win32'
        ? `start "" "${url}"`
        : `xdg-open "${url}"`;

    execSync(cmd, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the latest version from npm
 */
async function getLatestVersion(): Promise<string | null> {
  try {
    const result = execSync(`npm view ${NPM_PACKAGE} version`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return result.trim();
  } catch {
    return null;
  }
}

/**
 * Get the current installed version
 */
function getCurrentVersion(): string {
  return '1.0.0'; // This should be read from package.json in production
}

/**
 * Help command - shows detailed help information
 */
export async function helpCommand(topic?: string): Promise<void> {
  if (topic) {
    // Show topic-specific help
    const topics: Record<string, () => void> = {
      new: () => {
        logger.title('vexor new');
        logger.subtitle('Create a new Vexor project');
        logger.blank();
        logger.info('Usage:');
        logger.command('vexor new [name]');
        logger.blank();
        logger.info('Options:');
        logger.list([
          '-t, --template <template>  Project template (api, minimal, microservice, websocket)',
          '-p, --package-manager <pm> Package manager (npm, yarn, pnpm, bun)',
          '--no-git                   Skip git initialization',
          '--no-install               Skip dependency installation',
          '-y, --yes                  Use defaults without prompting',
        ]);
        logger.blank();
        logger.info('Examples:');
        logger.command('vexor new my-app');
        logger.command('vexor new my-api -t api');
        logger.command('vexor new my-service -t microservice -p pnpm');
        logger.command('vexor new quick-app -y');
      },

      generate: () => {
        logger.title('vexor generate');
        logger.subtitle('Generate code scaffolding');
        logger.blank();
        logger.info('Usage:');
        logger.command('vexor generate <type> <name>');
        logger.command('vexor g <type> <name>');
        logger.blank();
        logger.info('Types:');
        logger.list([
          'module  - Generate a complete module (routes, service, schema)',
          'model   - Generate a database model with migration',
          'route   - Generate a route handler',
          'migration - Generate a database migration',
        ]);
        logger.blank();
        logger.info('Examples:');
        logger.command('vexor g module users');
        logger.command('vexor g model Post title:string content:text');
        logger.command('vexor g route products');
      },

      add: () => {
        logger.title('vexor add');
        logger.subtitle('Add integrations to your project');
        logger.blank();
        logger.info('Usage:');
        logger.command('vexor add [integration]');
        logger.command('vexor add:list');
        logger.blank();
        logger.info('Available Integrations:');
        logger.list([
          'prisma  - Prisma ORM for database access',
          'redis   - Redis for caching and pub/sub',
          'vitest  - Vitest for unit testing',
          'docker  - Docker and docker-compose setup',
          'eslint  - ESLint + Prettier configuration',
          'github  - GitHub Actions CI/CD workflows',
          'swagger - Swagger/OpenAPI documentation',
          'sentry  - Sentry error tracking',
        ]);
        logger.blank();
        logger.info('Examples:');
        logger.command('vexor add prisma');
        logger.command('vexor add vitest');
        logger.command('vexor add');
      },

      config: () => {
        logger.title('vexor config');
        logger.subtitle('Manage CLI configuration');
        logger.blank();
        logger.info('Commands:');
        logger.list([
          'config:list   - List all configuration values',
          'config:get    - Get a specific value',
          'config:set    - Set a value',
          'config:reset  - Reset to defaults',
          'config:edit   - Open in editor',
          'config:init   - Create config file',
          'config:path   - Show config file path',
        ]);
        logger.blank();
        logger.info('Examples:');
        logger.command('vexor config:list');
        logger.command('vexor config:set defaultTemplate microservice');
        logger.command('vexor config:get defaultPackageManager');
      },

      env: () => {
        logger.title('vexor env');
        logger.subtitle('Manage environment variables');
        logger.blank();
        logger.info('Commands:');
        logger.list([
          'env:list     - List all variables',
          'env:get      - Get a variable value',
          'env:set      - Set a variable',
          'env:remove   - Remove a variable',
          'env:init     - Create .env from .env.example',
          'env:diff     - Compare .env with .env.example',
          'env:validate - Validate required variables',
        ]);
        logger.blank();
        logger.info('Examples:');
        logger.command('vexor env:list');
        logger.command('vexor env:set DATABASE_URL postgres://...');
        logger.command('vexor env:init');
      },

      db: () => {
        logger.title('vexor db');
        logger.subtitle('Database management commands');
        logger.blank();
        logger.info('Commands:');
        logger.list([
          'db:migrate  - Run pending migrations',
          'db:rollback - Rollback the last migration',
          'db:status   - Show migration status',
          'db:seed     - Run database seeders',
          'db:reset    - Reset database completely',
        ]);
        logger.blank();
        logger.info('Examples:');
        logger.command('vexor db:migrate');
        logger.command('vexor db:rollback -s 2');
        logger.command('vexor db:status');
      },
    };

    const handler = topics[topic.toLowerCase()];
    if (handler) {
      handler();
    } else {
      logger.error(`Unknown topic: ${topic}`);
      logger.info('Available topics: new, generate, add, config, env, db');
    }
    return;
  }

  // Show general help
  logger.banner('Vexor CLI Help');
  logger.blank();

  logger.box(
    [
      'Vexor is a batteries-included Node.js backend framework.',
      'This CLI helps you create, develop, and manage Vexor projects.',
    ].join('\n'),
    { title: 'About' }
  );

  logger.blank();
  logger.title('Quick Start');
  logger.command('vexor new my-app        # Create a new project');
  logger.command('cd my-app');
  logger.command('vexor dev               # Start development server');

  logger.blank();
  logger.title('Common Commands');
  logger.blank();

  const commands = [
    ['new', 'Create a new Vexor project'],
    ['generate', 'Generate code (module, model, route)'],
    ['add', 'Add integrations (prisma, redis, vitest...)'],
    ['dev', 'Start development server'],
    ['build', 'Build for production'],
    ['doctor', 'Check for common issues'],
  ];

  logger.table(['Command', 'Description'], commands);

  logger.blank();
  logger.info('For detailed help on a topic:');
  logger.command('vexor help <topic>');
  logger.blank();
  logger.info('Topics: new, generate, add, config, env, db');
  logger.blank();
  logger.info('For command-specific help:');
  logger.command('vexor <command> --help');
  logger.blank();
}

/**
 * Upgrade command - check for and install updates
 */
export async function upgradeCommand(options?: { check?: boolean }): Promise<void> {
  logger.title('Vexor CLI Upgrade');
  logger.blank();

  const currentVersion = getCurrentVersion();
  logger.keyValue('Current version', currentVersion);

  const spinner = ora('Checking for updates...').start();

  const latestVersion = await getLatestVersion();

  if (!latestVersion) {
    spinner.fail('Could not check for updates');
    logger.subtitle('Check your internet connection or try again later');
    return;
  }

  spinner.succeed(`Latest version: ${latestVersion}`);

  if (currentVersion === latestVersion) {
    logger.blank();
    logger.success('You are already on the latest version!');
    return;
  }

  logger.blank();
  logger.info(`New version available: ${currentVersion} → ${latestVersion}`);

  if (options?.check) {
    logger.blank();
    logger.info('Run without --check to upgrade:');
    logger.command('vexor upgrade');
    return;
  }

  logger.blank();
  const upgradeSpinner = ora('Upgrading Vexor CLI...').start();

  try {
    execSync(`npm install -g ${NPM_PACKAGE}@latest`, {
      stdio: 'pipe',
    });
    upgradeSpinner.succeed('Upgraded successfully!');
    logger.blank();
    logger.info('Changelog: https://github.com/sitharaj88/vexorjs/releases');
  } catch {
    upgradeSpinner.fail('Upgrade failed');
    logger.blank();
    logger.info('Try running manually:');
    logger.command(`npm install -g ${NPM_PACKAGE}@latest`);
  }
}

/**
 * Docs command - open documentation in browser
 */
export async function docsCommand(topic?: string): Promise<void> {
  const url = topic ? `${DOCS_URL}/${topic}` : DOCS_URL;

  logger.info(`Opening documentation: ${url}`);

  if (openUrl(url)) {
    logger.success('Opened in your default browser');
  } else {
    logger.warn('Could not open browser automatically');
    logger.blank();
    logger.info('Visit the documentation at:');
    logger.command(url);
  }
}

/**
 * Feedback command - open issue tracker or provide feedback info
 */
export async function feedbackCommand(options?: { bug?: boolean }): Promise<void> {
  logger.title('Vexor Feedback');
  logger.blank();

  if (options?.bug) {
    logger.info('Opening bug report page...');
    const bugUrl = `${ISSUES_URL}/new?template=bug_report.md`;

    if (openUrl(bugUrl)) {
      logger.success('Opened in your default browser');
    } else {
      logger.info('Report bugs at:');
      logger.command(bugUrl);
    }
    return;
  }

  logger.box(
    [
      'We appreciate your feedback!',
      '',
      'Here are ways to get help and contribute:',
    ].join('\n'),
    { title: 'Thank you!' }
  );

  logger.blank();
  logger.keyValue('Report bugs', ISSUES_URL);
  logger.keyValue('GitHub repo', GITHUB_URL);
  logger.keyValue('Documentation', DOCS_URL);

  logger.blank();
  logger.info('Quick links:');
  logger.command('vexor feedback --bug     # Report a bug');
  logger.command('vexor docs               # Open documentation');

  logger.blank();
  logger.info('Or open the GitHub issues page:');

  if (openUrl(ISSUES_URL)) {
    logger.success('Opened in your default browser');
  } else {
    logger.command(ISSUES_URL);
  }
}

/**
 * Changelog command - show recent changes
 */
export async function changelogCommand(): Promise<void> {
  logger.title('Vexor CLI Changelog');
  logger.blank();

  // In production, this would fetch from GitHub releases
  const changes = [
    {
      version: '1.0.0',
      date: '2024-01-31',
      changes: [
        'Initial release',
        'Interactive project creation with 4 templates',
        'Integration installer (Prisma, Redis, Vitest, Docker, etc.)',
        'Configuration management (config:list, config:set, etc.)',
        'Environment management (env:init, env:diff, etc.)',
        'OpenAPI generation from routes',
        'System diagnostics with doctor command',
        'Beautiful CLI output with colors and spinners',
      ],
    },
  ];

  for (const release of changes) {
    logger.subtitle(`v${release.version} (${release.date})`);
    logger.blank();
    logger.list(release.changes);
    logger.blank();
  }

  logger.info('Full changelog:');
  logger.command('https://github.com/sitharaj88/vexorjs/releases');
}

export default {
  helpCommand,
  upgradeCommand,
  docsCommand,
  feedbackCommand,
  changelogCommand,
};
