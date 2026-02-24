import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { mkdir, writeFile, readdir, access } from 'fs/promises';
import { execSync } from 'child_process';

vi.mock('fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
  readdir: vi.fn(),
  access: vi.fn(),
}));

vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    warn: vi.fn().mockReturnThis(),
    text: '',
  })),
}));

vi.mock('prompts', () => ({
  default: vi.fn(),
}));

vi.mock('../utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    title: vi.fn(),
    subtitle: vi.fn(),
    blank: vi.fn(),
    table: vi.fn(),
    box: vi.fn(),
    list: vi.fn(),
    keyValue: vi.fn(),
    command: vi.fn(),
    banner: vi.fn(),
    step: vi.fn(),
  },
}));

vi.mock('../utils/templates.js', () => ({
  templates: {
    api: {
      name: 'REST API',
      description: 'API template',
      dependencies: { '@vexorjs/core': 'latest' },
      devDependencies: { typescript: '^5.0.0', tsx: '^4.0.0', '@types/node': '^20.0.0' },
      scripts: { dev: 'tsx watch src/index.ts', build: 'tsup', start: 'node dist/index.js' },
      files: {
        'src/index.ts': 'import { Vexor } from "@vexorjs/core";\n',
        '.gitignore': 'node_modules\n',
        'tsconfig.json': '{}',
      },
    },
    minimal: {
      name: 'Minimal',
      description: 'Minimal template',
      dependencies: { '@vexorjs/core': 'latest' },
      devDependencies: { typescript: '^5.0.0' },
      scripts: { dev: 'tsx watch src/index.ts', build: 'tsup', start: 'node dist/index.js' },
      files: {
        'src/index.ts': 'hello {{name}}',
        '.gitignore': 'node_modules\n',
        'tsconfig.json': '{}',
        'README.md': '# {{name}} - Copyright {{year}}',
      },
    },
  },
  getTemplateChoices: vi.fn(() => [
    { title: 'REST API', description: 'API template', value: 'api' },
    { title: 'Minimal', description: 'Minimal template', value: 'minimal' },
  ]),
}));

const mockMkdir = vi.mocked(mkdir);
const mockWriteFile = vi.mocked(writeFile);
const mockReaddir = vi.mocked(readdir);
const mockExecSync = vi.mocked(execSync);

let newCommand: typeof import('../commands/new.js').newCommand;
let logger: typeof import('../utils/logger.js').logger;
let prompts: typeof import('prompts').default;

describe('newCommand', () => {
  let exitSpy: MockInstance;

  beforeEach(async () => {
    vi.clearAllMocks();

    exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit called');
    }) as never);

    // Default: directory does not exist (isDirEmpty returns true)
    mockReaddir.mockRejectedValue(new Error('ENOENT'));
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);
    mockExecSync.mockReturnValue(Buffer.from(''));

    const newModule = await import('../commands/new.js');
    newCommand = newModule.newCommand;
    const loggerModule = await import('../utils/logger.js');
    logger = loggerModule.logger;
    const promptsModule = await import('prompts');
    prompts = promptsModule.default;
  });

  afterEach(() => {
    exitSpy.mockRestore();
  });

  // -------------------------------------------------------------------------
  // Project creation with --yes flag
  // -------------------------------------------------------------------------

  describe('project creation with --yes flag', () => {
    it('should create project directory', async () => {
      await newCommand('my-app', { yes: true });

      expect(mockMkdir).toHaveBeenCalledWith(
        expect.stringContaining('my-app'),
        { recursive: true }
      );
    });

    it('should create package.json with correct name and template deps', async () => {
      await newCommand('my-app', { yes: true });

      const packageJsonWrite = mockWriteFile.mock.calls.find((call) =>
        String(call[0]).endsWith('package.json')
      );
      expect(packageJsonWrite).toBeDefined();

      const pkg = JSON.parse(packageJsonWrite![1] as string);
      expect(pkg.name).toBe('my-app');
      expect(pkg.version).toBe('0.0.1');
      expect(pkg.type).toBe('module');
      expect(pkg.dependencies['@vexorjs/core']).toBe('latest');
      expect(pkg.devDependencies.typescript).toBe('^5.0.0');
    });

    it('should write template files to correct paths', async () => {
      await newCommand('my-app', { yes: true });

      const writtenPaths = mockWriteFile.mock.calls.map((call) => String(call[0]));
      expect(writtenPaths.some((p) => p.includes('src/index.ts'))).toBe(true);
      expect(writtenPaths.some((p) => p.includes('.gitignore'))).toBe(true);
      expect(writtenPaths.some((p) => p.includes('tsconfig.json'))).toBe(true);
    });

    it('should replace {{name}} template variable', async () => {
      await newCommand('my-app', { yes: true, template: 'minimal' });

      const indexWrite = mockWriteFile.mock.calls.find((call) =>
        String(call[0]).includes('src/index.ts')
      );
      expect(indexWrite).toBeDefined();
      expect(indexWrite![1]).toBe('hello my-app');
    });

    it('should replace {{year}} template variable', async () => {
      await newCommand('my-app', { yes: true, template: 'minimal' });

      const readmeWrite = mockWriteFile.mock.calls.find((call) =>
        String(call[0]).includes('README.md')
      );
      expect(readmeWrite).toBeDefined();
      const currentYear = new Date().getFullYear().toString();
      expect(readmeWrite![1]).toContain(currentYear);
    });

    it('should use api template as default when --yes without --template', async () => {
      await newCommand('my-app', { yes: true });

      expect(logger.subtitle).toHaveBeenCalledWith('Template: REST API');
    });

    it('should display success message after creation', async () => {
      await newCommand('my-app', { yes: true });

      expect(logger.success).toHaveBeenCalledWith('Project created successfully!');
    });

    it('should display the correct scripts from the template', async () => {
      await newCommand('my-app', { yes: true });

      const packageJsonWrite = mockWriteFile.mock.calls.find((call) =>
        String(call[0]).endsWith('package.json')
      );
      const pkg = JSON.parse(packageJsonWrite![1] as string);
      expect(pkg.scripts.dev).toBe('tsx watch src/index.ts');
      expect(pkg.scripts.build).toBe('tsup');
      expect(pkg.scripts.start).toBe('node dist/index.js');
    });
  });

  // -------------------------------------------------------------------------
  // Template selection
  // -------------------------------------------------------------------------

  describe('template selection', () => {
    it('should use specified template with --template flag', async () => {
      await newCommand('my-app', { yes: true, template: 'minimal' });

      expect(logger.subtitle).toHaveBeenCalledWith('Template: Minimal');
    });

    it('should exit with error for unknown template', async () => {
      await expect(
        newCommand('my-app', { yes: true, template: 'nonexistent' })
      ).rejects.toThrow('process.exit called');

      expect(logger.error).toHaveBeenCalledWith('Unknown template: nonexistent');
      expect(exitSpy).toHaveBeenCalledWith(1);
    });
  });

  // -------------------------------------------------------------------------
  // Directory validation
  // -------------------------------------------------------------------------

  describe('directory validation', () => {
    it('should exit with error when directory is not empty', async () => {
      mockReaddir.mockResolvedValue(['file.txt'] as any);

      await expect(
        newCommand('my-app', { yes: true })
      ).rejects.toThrow('process.exit called');

      expect(logger.error).toHaveBeenCalledWith(
        'Directory "my-app" already exists and is not empty'
      );
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('should proceed when directory exists but is empty', async () => {
      mockReaddir.mockResolvedValue([] as any);

      await newCommand('my-app', { yes: true });

      expect(logger.success).toHaveBeenCalledWith('Project created successfully!');
    });

    it('should proceed when directory does not exist', async () => {
      mockReaddir.mockRejectedValue(new Error('ENOENT'));

      await newCommand('my-app', { yes: true });

      expect(logger.success).toHaveBeenCalledWith('Project created successfully!');
    });
  });

  // -------------------------------------------------------------------------
  // Git initialization
  // -------------------------------------------------------------------------

  describe('git initialization', () => {
    it('should initialize git by default', async () => {
      await newCommand('my-app', { yes: true });

      const gitCalls = mockExecSync.mock.calls.filter((call) =>
        String(call[0]).includes('git')
      );
      expect(gitCalls.length).toBeGreaterThanOrEqual(1);
      expect(gitCalls.some((call) => String(call[0]).includes('git init'))).toBe(true);
      expect(gitCalls.some((call) => String(call[0]).includes('git add -A'))).toBe(true);
    });

    it('should skip git with --no-git (git: false)', async () => {
      await newCommand('my-app', { yes: true, git: false });

      const gitCalls = mockExecSync.mock.calls.filter((call) =>
        String(call[0]).includes('git')
      );
      expect(gitCalls.length).toBe(0);
    });

    it('should handle git init failure gracefully', async () => {
      mockExecSync.mockImplementation((cmd: any) => {
        if (String(cmd).includes('git')) {
          throw new Error('git not found');
        }
        return Buffer.from('');
      });

      // Should not throw
      await newCommand('my-app', { yes: true, install: false });

      expect(logger.success).toHaveBeenCalledWith('Project created successfully!');
    });
  });

  // -------------------------------------------------------------------------
  // Dependency installation
  // -------------------------------------------------------------------------

  describe('dependency installation', () => {
    it('should install deps by default', async () => {
      await newCommand('my-app', { yes: true });

      const installCalls = mockExecSync.mock.calls.filter(
        (call) =>
          String(call[0]).includes('install') ||
          (String(call[0]) === 'yarn' && !String(call[0]).includes('--version'))
      );
      expect(installCalls.length).toBeGreaterThanOrEqual(1);
    });

    it('should skip install with --no-install (install: false)', async () => {
      await newCommand('my-app', { yes: true, install: false });

      const installCalls = mockExecSync.mock.calls.filter(
        (call) =>
          String(call[0]).includes('npm install') ||
          String(call[0]).includes('pnpm install') ||
          String(call[0]).includes('bun install') ||
          String(call[0]) === 'yarn'
      );
      expect(installCalls.length).toBe(0);
    });

    it('should use specified package manager', async () => {
      await newCommand('my-app', { yes: true, packageManager: 'pnpm' });

      const installCalls = mockExecSync.mock.calls.filter((call) =>
        String(call[0]).includes('pnpm install')
      );
      expect(installCalls.length).toBe(1);
    });

    it('should handle install failure gracefully', async () => {
      mockExecSync.mockImplementation((cmd: any) => {
        if (String(cmd).includes('install') || String(cmd) === 'yarn') {
          throw new Error('Install failed');
        }
        // Allow git commands and version detection to pass
        if (String(cmd).includes('--version')) {
          throw new Error('not found');
        }
        return Buffer.from('');
      });

      // Should not throw
      await newCommand('my-app', { yes: true, git: false });

      expect(logger.success).toHaveBeenCalledWith('Project created successfully!');
    });

    it('should show install command in next steps when install is skipped', async () => {
      await newCommand('my-app', { yes: true, install: false });

      expect(logger.box).toHaveBeenCalledWith(
        expect.stringContaining('install'),
        expect.any(Object)
      );
    });
  });

  // -------------------------------------------------------------------------
  // Package manager detection
  // -------------------------------------------------------------------------

  describe('package manager detection', () => {
    it('should detect bun as package manager when available', async () => {
      mockExecSync.mockImplementation((cmd: any) => {
        if (String(cmd).includes('bun --version')) return Buffer.from('1.0.0\n');
        return Buffer.from('');
      });

      await newCommand('my-app', { yes: true });

      expect(logger.info).toHaveBeenCalledWith('Package Manager: bun');
    });

    it('should detect pnpm when bun is not available', async () => {
      mockExecSync.mockImplementation((cmd: any) => {
        if (String(cmd).includes('bun --version')) throw new Error('not found');
        if (String(cmd).includes('pnpm --version')) return Buffer.from('8.0.0\n');
        return Buffer.from('');
      });

      await newCommand('my-app', { yes: true });

      expect(logger.info).toHaveBeenCalledWith('Package Manager: pnpm');
    });

    it('should fall back to npm when nothing else is found', async () => {
      mockExecSync.mockImplementation((cmd: any) => {
        if (String(cmd).includes('--version')) throw new Error('not found');
        return Buffer.from('');
      });

      await newCommand('my-app', { yes: true });

      expect(logger.info).toHaveBeenCalledWith('Package Manager: npm');
    });
  });

  // -------------------------------------------------------------------------
  // Interactive mode (prompts)
  // -------------------------------------------------------------------------

  describe('interactive mode', () => {
    it('should prompt for project name when not provided', async () => {
      const mockPrompts = vi.mocked(prompts);
      mockPrompts.mockResolvedValue({
        projectName: 'prompted-app',
        template: 'api',
        packageManager: 'npm',
        initGit: true,
        installDeps: true,
      });

      await newCommand();

      expect(mockPrompts).toHaveBeenCalled();
      expect(logger.title).toHaveBeenCalledWith('Creating prompted-app');
    });

    it('should cancel when prompt returns no project name', async () => {
      const mockPrompts = vi.mocked(prompts);
      mockPrompts.mockResolvedValue({});

      await newCommand();

      expect(logger.info).toHaveBeenCalledWith('Project creation cancelled');
      expect(mockMkdir).not.toHaveBeenCalled();
    });

    it('should skip git when user declines in prompt', async () => {
      const mockPrompts = vi.mocked(prompts);
      mockPrompts.mockResolvedValue({
        projectName: 'test-app',
        template: 'api',
        packageManager: 'npm',
        initGit: false,
        installDeps: true,
      });

      await newCommand();

      const gitCalls = mockExecSync.mock.calls.filter((call) =>
        String(call[0]).includes('git init')
      );
      expect(gitCalls.length).toBe(0);
    });

    it('should skip install when user declines in prompt', async () => {
      const mockPrompts = vi.mocked(prompts);
      mockPrompts.mockResolvedValue({
        projectName: 'test-app',
        template: 'api',
        packageManager: 'npm',
        initGit: false,
        installDeps: false,
      });

      await newCommand();

      const installCalls = mockExecSync.mock.calls.filter(
        (call) =>
          String(call[0]).includes('npm install') ||
          String(call[0]).includes('pnpm install') ||
          String(call[0]).includes('bun install')
      );
      expect(installCalls.length).toBe(0);
    });

    it('should use prompted template choice', async () => {
      const mockPrompts = vi.mocked(prompts);
      mockPrompts.mockResolvedValue({
        projectName: 'test-app',
        template: 'minimal',
        packageManager: 'npm',
        initGit: false,
        installDeps: false,
      });

      await newCommand();

      expect(logger.subtitle).toHaveBeenCalledWith('Template: Minimal');
    });
  });

  // -------------------------------------------------------------------------
  // Project name validation (indirectly tested)
  // -------------------------------------------------------------------------

  describe('project name validation', () => {
    it('should accept valid project names with hyphens and underscores', async () => {
      await newCommand('my-cool_app', { yes: true });

      expect(logger.success).toHaveBeenCalledWith('Project created successfully!');
    });

    it('should accept project names with numbers', async () => {
      await newCommand('app123', { yes: true });

      expect(logger.success).toHaveBeenCalledWith('Project created successfully!');
    });

    it('should accept uppercase project names', async () => {
      await newCommand('MyApp', { yes: true });

      expect(logger.success).toHaveBeenCalledWith('Project created successfully!');
    });
  });

  // -------------------------------------------------------------------------
  // Next steps display
  // -------------------------------------------------------------------------

  describe('next steps display', () => {
    it('should display next steps box with cd command', async () => {
      await newCommand('my-app', { yes: true, install: false });

      expect(logger.box).toHaveBeenCalledWith(
        expect.stringContaining('cd my-app'),
        expect.objectContaining({ title: 'Next Steps' })
      );
    });

    it('should show "npm run" for npm package manager', async () => {
      mockExecSync.mockImplementation((cmd: any) => {
        if (String(cmd).includes('--version')) throw new Error('not found');
        return Buffer.from('');
      });

      await newCommand('my-app', { yes: true, install: false, packageManager: 'npm' });

      expect(logger.box).toHaveBeenCalledWith(
        expect.stringContaining('npm run dev'),
        expect.any(Object)
      );
    });

    it('should show package manager name directly for non-npm managers', async () => {
      await newCommand('my-app', {
        yes: true,
        install: false,
        packageManager: 'pnpm',
      });

      expect(logger.box).toHaveBeenCalledWith(
        expect.stringContaining('pnpm dev'),
        expect.any(Object)
      );
    });
  });

  // -------------------------------------------------------------------------
  // Default export
  // -------------------------------------------------------------------------

  describe('default export', () => {
    it('should export newCommand as default', async () => {
      const mod = await import('../commands/new.js');
      expect(mod.default).toBe(mod.newCommand);
    });
  });
});
