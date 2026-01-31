/**
 * New Project Command
 *
 * Scaffolds a new Vexor project with configurable templates.
 * Supports interactive mode with prompts.
 */

import { mkdir, writeFile, readdir, access } from 'fs/promises';
import { join, resolve } from 'path';
import { execSync } from 'child_process';
import prompts from 'prompts';
import ora from 'ora';
import { logger } from '../utils/logger.js';
import { templates, getTemplateChoices } from '../utils/templates.js';

interface NewCommandOptions {
  template?: string;
  packageManager?: 'npm' | 'yarn' | 'pnpm' | 'bun';
  git?: boolean;
  install?: boolean;
  yes?: boolean;
}

/**
 * Detect available package manager
 */
function detectPackageManager(): 'npm' | 'yarn' | 'pnpm' | 'bun' {
  try {
    execSync('bun --version', { stdio: 'ignore' });
    return 'bun';
  } catch {
    try {
      execSync('pnpm --version', { stdio: 'ignore' });
      return 'pnpm';
    } catch {
      try {
        execSync('yarn --version', { stdio: 'ignore' });
        return 'yarn';
      } catch {
        return 'npm';
      }
    }
  }
}

/**
 * Validate project name
 */
function validateProjectName(name: string): boolean | string {
  if (!name) return 'Project name is required';
  if (!/^[a-z0-9-_]+$/i.test(name)) {
    return 'Project name can only contain letters, numbers, hyphens, and underscores';
  }
  if (name.length > 214) return 'Project name is too long';
  return true;
}

/**
 * Check if directory exists and is empty
 */
async function isDirEmpty(path: string): Promise<boolean> {
  try {
    const files = await readdir(path);
    return files.length === 0;
  } catch {
    return true; // Directory doesn't exist
  }
}

/**
 * New project command handler
 */
export async function newCommand(name?: string, options: NewCommandOptions = {}): Promise<void> {
  logger.banner('Create Vexor Project');

  let projectName = name;
  let templateKey = options.template;
  let packageManager = options.packageManager;
  const skipGit = options.git === false;
  const skipInstall = options.install === false;
  const useDefaults = options.yes === true;

  // Interactive mode if no project name provided or not using defaults
  if (!projectName || (!useDefaults && !templateKey)) {
    const templateChoices = getTemplateChoices();

    const response = await prompts([
      {
        type: projectName ? null : 'text',
        name: 'projectName',
        message: 'What is your project name?',
        initial: 'my-vexor-app',
        validate: validateProjectName,
      },
      {
        type: templateKey ? null : 'select',
        name: 'template',
        message: 'Which template would you like to use?',
        choices: templateChoices,
        initial: 0,
      },
      {
        type: packageManager ? null : 'select',
        name: 'packageManager',
        message: 'Which package manager do you prefer?',
        choices: [
          { title: 'npm', value: 'npm' },
          { title: 'yarn', value: 'yarn' },
          { title: 'pnpm', value: 'pnpm' },
          { title: 'bun', value: 'bun' },
        ],
        initial: 0,
      },
      {
        type: 'confirm',
        name: 'initGit',
        message: 'Initialize a git repository?',
        initial: true,
      },
      {
        type: 'confirm',
        name: 'installDeps',
        message: 'Install dependencies now?',
        initial: true,
      },
    ]);

    if (!response.projectName && !projectName) {
      logger.info('Project creation cancelled');
      return;
    }

    projectName = projectName || response.projectName;
    templateKey = templateKey || response.template;
    packageManager = packageManager || response.packageManager;

    if (response.initGit === false) {
      options.git = false;
    }
    if (response.installDeps === false) {
      options.install = false;
    }
  }

  // Use defaults if --yes flag
  if (useDefaults) {
    templateKey = templateKey || 'api';
    packageManager = packageManager || detectPackageManager();
  }

  const projectPath = resolve(process.cwd(), projectName!);
  const template = templates[templateKey || 'api'];

  if (!template) {
    logger.error(`Unknown template: ${templateKey}`);
    logger.info('Available templates: ' + Object.keys(templates).join(', '));
    process.exit(1);
  }

  // Check if directory exists and is not empty
  if (!(await isDirEmpty(projectPath))) {
    logger.error(`Directory "${projectName}" already exists and is not empty`);
    process.exit(1);
  }

  logger.blank();
  logger.title(`Creating ${projectName}`);
  logger.subtitle(`Template: ${template.name}`);
  logger.blank();

  // Create project directory
  await mkdir(projectPath, { recursive: true });

  // Generate package.json
  const packageJson = {
    name: projectName,
    version: '0.0.1',
    type: 'module',
    scripts: template.scripts,
    dependencies: template.dependencies,
    devDependencies: template.devDependencies,
  };

  // Create files
  const spinner = ora('Creating project files...').start();

  try {
    // Write package.json
    await writeFile(
      join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2) + '\n'
    );

    // Write template files
    for (const [filePath, content] of Object.entries(template.files)) {
      const fullPath = join(projectPath, filePath);
      const dir = join(fullPath, '..');
      await mkdir(dir, { recursive: true });

      // Replace template variables
      const processedContent = content
        .replace(/\{\{name\}\}/g, projectName!)
        .replace(/\{\{year\}\}/g, new Date().getFullYear().toString());

      await writeFile(fullPath, processedContent);
    }

    spinner.succeed('Project files created');
  } catch (error) {
    spinner.fail('Failed to create project files');
    throw error;
  }

  // Initialize git
  if (!skipGit && options.git !== false) {
    const gitSpinner = ora('Initializing git repository...').start();
    try {
      execSync('git init', { cwd: projectPath, stdio: 'ignore' });
      execSync('git add -A', { cwd: projectPath, stdio: 'ignore' });
      gitSpinner.succeed('Git repository initialized');
    } catch {
      gitSpinner.warn('Git initialization failed (git may not be installed)');
    }
  }

  // Install dependencies
  if (!skipInstall && options.install !== false) {
    const pm = packageManager || 'npm';
    const installCmd = {
      npm: 'npm install',
      yarn: 'yarn',
      pnpm: 'pnpm install',
      bun: 'bun install',
    }[pm];

    const installSpinner = ora(`Installing dependencies with ${pm}...`).start();

    try {
      execSync(installCmd, { cwd: projectPath, stdio: 'pipe' });
      installSpinner.succeed('Dependencies installed');
    } catch {
      installSpinner.warn(`Failed to install dependencies. Run "${installCmd}" manually.`);
    }
  }

  // Success message
  logger.blank();
  logger.success('Project created successfully!');
  logger.blank();

  const pm = packageManager || 'npm';
  const runCmd = pm === 'npm' ? 'npm run' : pm;

  logger.box(
    [
      `cd ${projectName}`,
      skipInstall || options.install === false ? `${pm} install` : '',
      `${runCmd} dev`,
    ]
      .filter(Boolean)
      .join('\n'),
    { title: 'Next Steps' }
  );

  logger.blank();
  logger.info(`Template: ${template.name}`);
  logger.info(`Package Manager: ${pm}`);
  logger.blank();
}

export default newCommand;
