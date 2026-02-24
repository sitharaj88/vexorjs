import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFile, writeFile, access } from 'fs/promises';
import { execSync } from 'child_process';

vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  access: vi.fn(),
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
const mockWriteFile = vi.mocked(writeFile);
const mockAccess = vi.mocked(access);
const mockExecSync = vi.mocked(execSync);

let configCommand: typeof import('../commands/config.js').configCommand;
let logger: typeof import('../utils/logger.js').logger;

describe('configCommand', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let exitSpy: ReturnType<typeof vi.spyOn>;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    vi.clearAllMocks();

    originalEnv = { ...process.env };
    process.env.HOME = '/home/testuser';

    exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit called');
    }) as never);

    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Default: access rejects (file does not exist)
    mockAccess.mockRejectedValue(new Error('ENOENT'));
    mockWriteFile.mockResolvedValue(undefined);
    mockReadFile.mockRejectedValue(new Error('ENOENT'));

    const configModule = await import('../commands/config.js');
    configCommand = configModule.configCommand;
    const loggerModule = await import('../utils/logger.js');
    logger = loggerModule.logger;
  });

  afterEach(() => {
    process.env = originalEnv;
    exitSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  // -------------------------------------------------------------------------
  // config:list
  // -------------------------------------------------------------------------

  describe('action: list', () => {
    it('should display merged config when config files have data', async () => {
      // Global config
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockImplementation(async (path: any) => {
        if (String(path).includes('.vexorrc') && !String(path).includes('.vexorrc.json')) {
          return JSON.stringify({ telemetry: true, editor: 'vim' });
        }
        if (String(path).includes('.vexorrc.json')) {
          return JSON.stringify({ telemetry: false, defaultTemplate: 'api' });
        }
        throw new Error('ENOENT');
      });

      await configCommand('list');

      expect(logger.title).toHaveBeenCalledWith('Vexor Configuration');
      expect(logger.subtitle).toHaveBeenCalledWith('Merged config (global + local)');
      expect(logger.table).toHaveBeenCalled();

      // Verify merged data - local overrides global
      const tableCall = vi.mocked(logger.table).mock.calls[0];
      const rows = tableCall[1] as string[][];
      const telemetryRow = rows.find(r => r[0] === 'telemetry');
      expect(telemetryRow).toBeDefined();
      expect(telemetryRow![1]).toBe('false'); // local overrides global
    });

    it('should display info message when config is empty', async () => {
      // Both global and local return {}
      mockAccess.mockRejectedValue(new Error('ENOENT'));
      mockReadFile.mockRejectedValue(new Error('ENOENT'));

      await configCommand('list');

      expect(logger.info).toHaveBeenCalledWith('No configuration found');
      expect(logger.subtitle).toHaveBeenCalledWith(
        "Run 'vexor config init' to create a config file"
      );
    });

    it('should show only global config when global flag is set', async () => {
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockImplementation(async (path: any) => {
        if (String(path).includes('.vexorrc') && !String(path).includes('.vexorrc.json')) {
          return JSON.stringify({ editor: 'code' });
        }
        if (String(path).includes('.vexorrc.json')) {
          return JSON.stringify({ defaultTemplate: 'minimal' });
        }
        throw new Error('ENOENT');
      });

      await configCommand('list', undefined, undefined, { global: true });

      expect(logger.subtitle).toHaveBeenCalledWith('Global config');
      const tableCall = vi.mocked(logger.table).mock.calls[0];
      const rows = tableCall[1] as string[][];
      // Should only have global keys
      expect(rows.some(r => r[0] === 'editor')).toBe(true);
      expect(rows.some(r => r[0] === 'defaultTemplate')).toBe(false);
    });

    it('should show info message when global config is empty with global flag', async () => {
      mockAccess.mockRejectedValue(new Error('ENOENT'));
      mockReadFile.mockRejectedValue(new Error('ENOENT'));

      await configCommand('list', undefined, undefined, { global: true });

      expect(logger.info).toHaveBeenCalledWith('No configuration found');
    });
  });

  // -------------------------------------------------------------------------
  // config:get
  // -------------------------------------------------------------------------

  describe('action: get', () => {
    it('should output the value of a specific key', async () => {
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue(JSON.stringify({ defaultTemplate: 'api' }));

      await configCommand('get', 'defaultTemplate');

      expect(consoleSpy).toHaveBeenCalledWith('api');
    });

    it('should exit with error when no key is provided', async () => {
      await expect(configCommand('get')).rejects.toThrow('process.exit called');

      expect(logger.error).toHaveBeenCalledWith(
        'Please specify a key: vexor config get <key>'
      );
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('should warn and exit when key does not exist in config', async () => {
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue(JSON.stringify({ telemetry: true }));

      await expect(configCommand('get', 'nonexistent')).rejects.toThrow(
        'process.exit called'
      );

      expect(logger.warn).toHaveBeenCalledWith("Key 'nonexistent' is not set");
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('should output boolean values as strings', async () => {
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue(JSON.stringify({ telemetry: true }));

      await configCommand('get', 'telemetry');

      expect(consoleSpy).toHaveBeenCalledWith('true');
    });
  });

  // -------------------------------------------------------------------------
  // config:set
  // -------------------------------------------------------------------------

  describe('action: set', () => {
    it('should save a string value to config', async () => {
      mockAccess.mockRejectedValue(new Error('ENOENT'));

      await configCommand('set', 'editor', 'vim');

      expect(mockWriteFile).toHaveBeenCalled();
      const writtenContent = JSON.parse(
        mockWriteFile.mock.calls[0][1] as string
      );
      expect(writtenContent.editor).toBe('vim');
      expect(logger.success).toHaveBeenCalledWith('Set editor = vim');
    });

    it('should parse "true" string to boolean true', async () => {
      mockAccess.mockRejectedValue(new Error('ENOENT'));

      await configCommand('set', 'telemetry', 'true');

      const writtenContent = JSON.parse(
        mockWriteFile.mock.calls[0][1] as string
      );
      expect(writtenContent.telemetry).toBe(true);
      expect(typeof writtenContent.telemetry).toBe('boolean');
    });

    it('should parse "false" string to boolean false', async () => {
      mockAccess.mockRejectedValue(new Error('ENOENT'));

      await configCommand('set', 'telemetry', 'false');

      const writtenContent = JSON.parse(
        mockWriteFile.mock.calls[0][1] as string
      );
      expect(writtenContent.telemetry).toBe(false);
      expect(typeof writtenContent.telemetry).toBe('boolean');
    });

    it('should parse numeric strings to numbers', async () => {
      mockAccess.mockRejectedValue(new Error('ENOENT'));

      await configCommand('set', 'timeout', '5000');

      const writtenContent = JSON.parse(
        mockWriteFile.mock.calls[0][1] as string
      );
      expect(writtenContent.timeout).toBe(5000);
      expect(typeof writtenContent.timeout).toBe('number');
    });

    it('should keep non-numeric strings as strings', async () => {
      mockAccess.mockRejectedValue(new Error('ENOENT'));

      await configCommand('set', 'editor', 'vscode');

      const writtenContent = JSON.parse(
        mockWriteFile.mock.calls[0][1] as string
      );
      expect(writtenContent.editor).toBe('vscode');
      expect(typeof writtenContent.editor).toBe('string');
    });

    it('should save to global path when --global flag is set', async () => {
      mockAccess.mockRejectedValue(new Error('ENOENT'));

      await configCommand('set', 'editor', 'nano', { global: true });

      const writePath = mockWriteFile.mock.calls[0][0] as string;
      expect(writePath).toContain('/home/testuser/.vexorrc');
      expect(writePath).not.toContain('.vexorrc.json');
    });

    it('should save to local path by default', async () => {
      mockAccess.mockRejectedValue(new Error('ENOENT'));

      await configCommand('set', 'editor', 'nano');

      const writePath = mockWriteFile.mock.calls[0][0] as string;
      expect(writePath).toContain('.vexorrc.json');
    });

    it('should exit with error when key or value is missing', async () => {
      await expect(configCommand('set', 'key')).rejects.toThrow(
        'process.exit called'
      );

      expect(logger.error).toHaveBeenCalledWith(
        'Usage: vexor config set <key> <value>'
      );
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('should merge with existing config', async () => {
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue(
        JSON.stringify({ existing: 'value' })
      );

      await configCommand('set', 'newKey', 'newValue');

      const writtenContent = JSON.parse(
        mockWriteFile.mock.calls[0][1] as string
      );
      expect(writtenContent.existing).toBe('value');
      expect(writtenContent.newKey).toBe('newValue');
    });
  });

  // -------------------------------------------------------------------------
  // config:reset
  // -------------------------------------------------------------------------

  describe('action: reset', () => {
    it('should remove a specific key from config', async () => {
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue(
        JSON.stringify({ telemetry: true, editor: 'vim' })
      );

      await configCommand('reset', 'telemetry');

      const writtenContent = JSON.parse(
        mockWriteFile.mock.calls[0][1] as string
      );
      expect(writtenContent.telemetry).toBeUndefined();
      expect(writtenContent.editor).toBe('vim');
      expect(logger.success).toHaveBeenCalledWith(
        "Removed 'telemetry' from config"
      );
    });

    it('should reset entire config to empty object when no key is provided', async () => {
      await configCommand('reset');

      const writtenContent = JSON.parse(
        mockWriteFile.mock.calls[0][1] as string
      );
      expect(writtenContent).toEqual({});
      expect(logger.success).toHaveBeenCalledWith(
        expect.stringContaining('Reset config file:')
      );
    });
  });

  // -------------------------------------------------------------------------
  // config:init
  // -------------------------------------------------------------------------

  describe('action: init', () => {
    it('should create default config when file does not exist', async () => {
      mockAccess.mockRejectedValue(new Error('ENOENT'));

      await configCommand('init');

      expect(mockWriteFile).toHaveBeenCalled();
      const writtenContent = JSON.parse(
        mockWriteFile.mock.calls[0][1] as string
      );
      expect(writtenContent.defaultTemplate).toBe('api');
      expect(writtenContent.defaultPackageManager).toBe('npm');
      expect(writtenContent.telemetry).toBe(true);
      expect(writtenContent.updateCheck).toBe(true);
      expect(writtenContent.colors).toBe(true);
      expect(logger.success).toHaveBeenCalledWith(
        expect.stringContaining('Created config file:')
      );
      expect(logger.box).toHaveBeenCalled();
    });

    it('should warn and return if config file already exists', async () => {
      mockAccess.mockResolvedValue(undefined);

      await configCommand('init');

      expect(mockWriteFile).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Config file already exists:')
      );
    });
  });

  // -------------------------------------------------------------------------
  // config:path
  // -------------------------------------------------------------------------

  describe('action: path', () => {
    it('should output the local config path', async () => {
      await configCommand('path');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('.vexorrc.json')
      );
    });

    it('should output the global config path when --global is set', async () => {
      await configCommand('path', undefined, undefined, { global: true });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('/home/testuser/.vexorrc')
      );
    });

    it('should use HOME env variable for global path', async () => {
      process.env.HOME = '/custom/home';

      await configCommand('path', undefined, undefined, { global: true });

      expect(consoleSpy).toHaveBeenCalledWith('/custom/home/.vexorrc');
    });

    it('should fall back to USERPROFILE when HOME is not set', async () => {
      delete process.env.HOME;
      process.env.USERPROFILE = 'C:\\Users\\test';

      await configCommand('path', undefined, undefined, { global: true });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('C:\\Users\\test')
      );
    });
  });

  // -------------------------------------------------------------------------
  // config:edit
  // -------------------------------------------------------------------------

  describe('action: edit', () => {
    it('should open editor with config path', async () => {
      process.env.EDITOR = 'nano';
      mockAccess.mockResolvedValue(undefined);

      await configCommand('edit');

      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('nano'),
        expect.objectContaining({ stdio: 'inherit' })
      );
      expect(logger.success).toHaveBeenCalledWith(
        expect.stringContaining('Config file edited:')
      );
    });

    it('should create config file if it does not exist before editing', async () => {
      process.env.EDITOR = 'nano';
      // First access (existence check) fails, then succeeds after creation
      mockAccess.mockRejectedValueOnce(new Error('ENOENT'));

      await configCommand('edit');

      // Should write empty config first
      expect(mockWriteFile).toHaveBeenCalled();
      expect(mockExecSync).toHaveBeenCalled();
    });

    it('should show error when editor fails', async () => {
      process.env.EDITOR = 'nonexistent-editor';
      mockAccess.mockResolvedValue(undefined);
      mockExecSync.mockImplementation(() => {
        throw new Error('Command failed');
      });

      await configCommand('edit');

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to open editor:')
      );
    });

    it('should default to vi when no EDITOR env var is set', async () => {
      delete process.env.EDITOR;
      delete process.env.VISUAL;
      mockAccess.mockResolvedValue(undefined);

      await configCommand('edit');

      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('vi'),
        expect.any(Object)
      );
    });
  });

  // -------------------------------------------------------------------------
  // default export
  // -------------------------------------------------------------------------

  describe('default export', () => {
    it('should export configCommand as default', async () => {
      const mod = await import('../commands/config.js');
      expect(mod.default).toBe(mod.configCommand);
    });
  });
});
