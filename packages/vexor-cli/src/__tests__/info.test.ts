import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFile, access, readdir } from 'fs/promises';
import { execSync } from 'child_process';

vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  access: vi.fn(),
  readdir: vi.fn(),
}));

vi.mock('child_process', () => ({
  execSync: vi.fn(),
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

const mockReadFile = vi.mocked(readFile);
const mockAccess = vi.mocked(access);
const mockExecSync = vi.mocked(execSync);

let infoCommand: typeof import('../commands/info.js').infoCommand;
let doctorCommand: typeof import('../commands/info.js').doctorCommand;
let logger: typeof import('../utils/logger.js').logger;

describe('info and doctor commands', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Default: no files exist, commands fail
    mockAccess.mockRejectedValue(new Error('ENOENT'));
    mockReadFile.mockRejectedValue(new Error('ENOENT'));
    mockExecSync.mockImplementation(() => {
      throw new Error('Command not found');
    });

    const infoModule = await import('../commands/info.js');
    infoCommand = infoModule.infoCommand;
    doctorCommand = infoModule.doctorCommand;
    const loggerModule = await import('../utils/logger.js');
    logger = loggerModule.logger;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // infoCommand
  // -------------------------------------------------------------------------

  describe('infoCommand', () => {
    it('should display system information', async () => {
      await infoCommand();

      expect(logger.banner).toHaveBeenCalledWith('System Information');
      expect(logger.keyValue).toHaveBeenCalledWith('OS', expect.any(String));
      expect(logger.keyValue).toHaveBeenCalledWith('Architecture', expect.any(String));
      expect(logger.keyValue).toHaveBeenCalledWith('Node.js', process.version);
    });

    it('should display npm version from execSync', async () => {
      mockExecSync.mockImplementation((cmd: any) => {
        if (String(cmd).includes('npm --version')) {
          return '10.2.0\n';
        }
        throw new Error('not found');
      });

      await infoCommand();

      expect(logger.keyValue).toHaveBeenCalledWith('npm', '10.2.0');
    });

    it('should show "not found" when npm command fails', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Command not found');
      });

      await infoCommand();

      expect(logger.keyValue).toHaveBeenCalledWith('npm', 'not found');
    });

    it('should show Vexor versions from package.json dependencies', async () => {
      mockReadFile.mockImplementation(async (path: any) => {
        if (String(path).includes('package.json')) {
          return JSON.stringify({
            name: 'test-project',
            version: '1.0.0',
            dependencies: {
              '@vexorjs/core': '^1.0.0',
              '@vexorjs/orm': '^1.0.0',
            },
          });
        }
        throw new Error('ENOENT');
      });

      await infoCommand();

      expect(logger.keyValue).toHaveBeenCalledWith('Vexor Core', '^1.0.0');
      expect(logger.keyValue).toHaveBeenCalledWith('Vexor ORM', '^1.0.0');
    });

    it('should show "not installed" when Vexor packages are not in deps', async () => {
      mockReadFile.mockImplementation(async (path: any) => {
        if (String(path).includes('package.json')) {
          return JSON.stringify({
            name: 'test-project',
            version: '1.0.0',
            dependencies: { express: '^4.0.0' },
          });
        }
        throw new Error('ENOENT');
      });

      await infoCommand();

      expect(logger.keyValue).toHaveBeenCalledWith('Vexor Core', 'not installed');
      expect(logger.keyValue).toHaveBeenCalledWith('Vexor ORM', 'not installed');
    });

    it('should detect package manager from bun.lockb', async () => {
      mockAccess.mockImplementation(async (path: any) => {
        if (String(path).includes('bun.lockb')) return undefined;
        throw new Error('ENOENT');
      });

      await infoCommand();

      expect(logger.keyValue).toHaveBeenCalledWith('Package Manager', 'bun');
    });

    it('should detect package manager from pnpm-lock.yaml', async () => {
      mockAccess.mockImplementation(async (path: any) => {
        if (String(path).includes('pnpm-lock.yaml')) return undefined;
        throw new Error('ENOENT');
      });

      await infoCommand();

      expect(logger.keyValue).toHaveBeenCalledWith('Package Manager', 'pnpm');
    });

    it('should detect package manager from yarn.lock', async () => {
      mockAccess.mockImplementation(async (path: any) => {
        if (String(path).includes('yarn.lock')) return undefined;
        throw new Error('ENOENT');
      });

      await infoCommand();

      expect(logger.keyValue).toHaveBeenCalledWith('Package Manager', 'yarn');
    });

    it('should detect package manager from package-lock.json', async () => {
      mockAccess.mockImplementation(async (path: any) => {
        if (String(path).includes('package-lock.json')) return undefined;
        throw new Error('ENOENT');
      });

      await infoCommand();

      expect(logger.keyValue).toHaveBeenCalledWith('Package Manager', 'npm');
    });

    it('should show "not detected" when no lock file exists', async () => {
      mockAccess.mockRejectedValue(new Error('ENOENT'));

      await infoCommand();

      expect(logger.keyValue).toHaveBeenCalledWith('Package Manager', 'not detected');
    });

    it('should display memory info in GB format', async () => {
      await infoCommand();

      const memoryCalls = vi.mocked(logger.keyValue).mock.calls.filter(
        (call) => call[0] === 'Memory'
      );
      expect(memoryCalls.length).toBe(1);
      const memoryValue = memoryCalls[0][1];
      // Should match pattern like "X.X GB free / Y.Y GB total"
      expect(memoryValue).toMatch(/\d+\.\d+ GB free \/ \d+\.\d+ GB total/);
    });

    it('should display CPU count', async () => {
      await infoCommand();

      const cpuCalls = vi.mocked(logger.keyValue).mock.calls.filter(
        (call) => call[0] === 'CPUs'
      );
      expect(cpuCalls.length).toBe(1);
      // CPU count should be a number string
      expect(Number(cpuCalls[0][1])).toBeGreaterThan(0);
    });

    it('should display working directory', async () => {
      await infoCommand();

      expect(logger.keyValue).toHaveBeenCalledWith('Working Dir', process.cwd());
    });

    it('should detect vexor package from devDependencies', async () => {
      mockReadFile.mockImplementation(async (path: any) => {
        if (String(path).includes('package.json')) {
          return JSON.stringify({
            name: 'test-project',
            version: '1.0.0',
            devDependencies: {
              '@vexorjs/core': '^2.0.0',
            },
          });
        }
        throw new Error('ENOENT');
      });

      await infoCommand();

      expect(logger.keyValue).toHaveBeenCalledWith('Vexor Core', '^2.0.0');
    });
  });

  // -------------------------------------------------------------------------
  // doctorCommand
  // -------------------------------------------------------------------------

  describe('doctorCommand', () => {
    it('should show banner and run all checks', async () => {
      await doctorCommand();

      expect(logger.banner).toHaveBeenCalledWith('Vexor Doctor');
      // At minimum, some checks should have been run
      const successCalls = vi.mocked(logger.success).mock.calls;
      const errorCalls = vi.mocked(logger.error).mock.calls;
      expect(successCalls.length + errorCalls.length).toBeGreaterThan(0);
    });

    it('should pass Node.js version check for current version', async () => {
      // Current Node must be >= 20 for this project
      await doctorCommand();

      const successCalls = vi.mocked(logger.success).mock.calls;
      const nodeCheck = successCalls.find((call) =>
        String(call[0]).includes('Node.js version')
      );
      // If running on Node >= 20, this should pass
      const nodeVersion = parseInt(process.version.slice(1).split('.')[0]);
      if (nodeVersion >= 20) {
        expect(nodeCheck).toBeDefined();
        expect(String(nodeCheck![0])).toContain(process.version);
      }
    });

    it('should report all checks passed when everything is configured', async () => {
      // Mock all file checks to pass
      mockAccess.mockResolvedValue(undefined);

      // Mock package.json with all deps
      mockReadFile.mockImplementation(async (path: any) => {
        if (String(path).includes('package.json')) {
          return JSON.stringify({
            name: 'my-app',
            version: '1.0.0',
            dependencies: {
              '@vexorjs/core': '^1.0.0',
            },
            devDependencies: {
              typescript: '^5.8.0',
            },
          });
        }
        throw new Error('ENOENT');
      });

      await doctorCommand();

      expect(logger.box).toHaveBeenCalledWith(
        'All checks passed! Your Vexor project is properly configured.',
        expect.objectContaining({ title: 'Status: Healthy' })
      );
    });

    it('should report issues when package manager is not detected', async () => {
      // All file access fails = no lock files found
      mockAccess.mockRejectedValue(new Error('ENOENT'));
      mockReadFile.mockRejectedValue(new Error('ENOENT'));

      await doctorCommand();

      const errorCalls = vi.mocked(logger.error).mock.calls;
      const pmCheck = errorCalls.find((call) =>
        String(call[0]).includes('Package manager')
      );
      expect(pmCheck).toBeDefined();
      expect(String(pmCheck![0])).toContain('No lockfile found');
    });

    it('should report missing package.json', async () => {
      mockAccess.mockRejectedValue(new Error('ENOENT'));
      mockReadFile.mockRejectedValue(new Error('ENOENT'));

      await doctorCommand();

      const errorCalls = vi.mocked(logger.error).mock.calls;
      const pkgCheck = errorCalls.find((call) =>
        String(call[0]).includes('package.json')
      );
      expect(pkgCheck).toBeDefined();
      expect(String(pkgCheck![0])).toContain('No package.json found');
    });

    it('should report missing TypeScript when not in deps', async () => {
      mockAccess.mockRejectedValue(new Error('ENOENT'));
      mockReadFile.mockImplementation(async (path: any) => {
        if (String(path).includes('package.json')) {
          return JSON.stringify({
            name: 'my-app',
            version: '1.0.0',
            dependencies: { '@vexorjs/core': '^1.0.0' },
          });
        }
        throw new Error('ENOENT');
      });

      await doctorCommand();

      const errorCalls = vi.mocked(logger.error).mock.calls;
      const tsCheck = errorCalls.find((call) =>
        String(call[0]).includes('TypeScript installed')
      );
      expect(tsCheck).toBeDefined();
      expect(String(tsCheck![0])).toContain('Not installed');
    });

    it('should report missing tsconfig.json', async () => {
      mockAccess.mockImplementation(async (path: any) => {
        if (String(path).includes('tsconfig.json')) {
          throw new Error('ENOENT');
        }
        // Let other access calls pass
        throw new Error('ENOENT');
      });
      mockReadFile.mockRejectedValue(new Error('ENOENT'));

      await doctorCommand();

      const errorCalls = vi.mocked(logger.error).mock.calls;
      const tsconfigCheck = errorCalls.find((call) =>
        String(call[0]).includes('tsconfig.json')
      );
      expect(tsconfigCheck).toBeDefined();
      expect(String(tsconfigCheck![0])).toContain('Missing');
    });

    it('should report missing src directory', async () => {
      mockAccess.mockRejectedValue(new Error('ENOENT'));
      mockReadFile.mockRejectedValue(new Error('ENOENT'));

      await doctorCommand();

      const errorCalls = vi.mocked(logger.error).mock.calls;
      const srcCheck = errorCalls.find((call) =>
        String(call[0]).includes('Source directory')
      );
      expect(srcCheck).toBeDefined();
      expect(String(srcCheck![0])).toContain('Missing src/index.ts');
    });

    it('should report issues found when some checks fail', async () => {
      mockAccess.mockRejectedValue(new Error('ENOENT'));
      mockReadFile.mockRejectedValue(new Error('ENOENT'));

      await doctorCommand();

      expect(logger.box).toHaveBeenCalledWith(
        'Some checks failed. Please fix the issues above.',
        expect.objectContaining({ title: 'Status: Issues Found' })
      );
    });

    it('should report Vexor Core as not installed when missing from deps', async () => {
      mockAccess.mockRejectedValue(new Error('ENOENT'));
      mockReadFile.mockImplementation(async (path: any) => {
        if (String(path).includes('package.json')) {
          return JSON.stringify({
            name: 'my-app',
            version: '1.0.0',
            dependencies: { express: '^4.0.0' },
          });
        }
        throw new Error('ENOENT');
      });

      await doctorCommand();

      const errorCalls = vi.mocked(logger.error).mock.calls;
      const coreCheck = errorCalls.find((call) =>
        String(call[0]).includes('Vexor Core installed')
      );
      expect(coreCheck).toBeDefined();
      expect(String(coreCheck![0])).toContain('Not installed');
    });

    it('should pass environment file check even when no .env exists', async () => {
      mockAccess.mockRejectedValue(new Error('ENOENT'));
      mockReadFile.mockRejectedValue(new Error('ENOENT'));

      await doctorCommand();

      // Environment file check always returns ok: true
      const successCalls = vi.mocked(logger.success).mock.calls;
      const envCheck = successCalls.find((call) =>
        String(call[0]).includes('Environment file')
      );
      expect(envCheck).toBeDefined();
      expect(String(envCheck![0])).toContain('No .env file (optional)');
    });

    it('should pass git check even when not a git repo', async () => {
      mockAccess.mockRejectedValue(new Error('ENOENT'));
      mockReadFile.mockRejectedValue(new Error('ENOENT'));

      await doctorCommand();

      const successCalls = vi.mocked(logger.success).mock.calls;
      const gitCheck = successCalls.find((call) =>
        String(call[0]).includes('Git repository')
      );
      expect(gitCheck).toBeDefined();
      expect(String(gitCheck![0])).toContain('Not a git repository (optional)');
    });

    it('should prioritize bun.lockb over other lock files', async () => {
      // All lock files exist
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockImplementation(async (path: any) => {
        if (String(path).includes('package.json')) {
          return JSON.stringify({
            name: 'my-app',
            version: '1.0.0',
            dependencies: { '@vexorjs/core': '^1.0.0' },
            devDependencies: { typescript: '^5.0.0' },
          });
        }
        throw new Error('ENOENT');
      });

      await doctorCommand();

      const successCalls = vi.mocked(logger.success).mock.calls;
      const pmCheck = successCalls.find((call) =>
        String(call[0]).includes('Package manager')
      );
      expect(pmCheck).toBeDefined();
      expect(String(pmCheck![0])).toContain('Using bun');
    });
  });

  // -------------------------------------------------------------------------
  // default export
  // -------------------------------------------------------------------------

  describe('default export', () => {
    it('should export both infoCommand and doctorCommand', async () => {
      const mod = await import('../commands/info.js');
      expect(mod.default).toEqual({
        infoCommand: expect.any(Function),
        doctorCommand: expect.any(Function),
      });
    });
  });
});
