/**
 * Environment Command Tests
 *
 * Tests for env commands (list, get, set, remove, init, diff, validate).
 * Private helpers (parseEnv, serializeEnv) are tested indirectly through
 * the exported command functions.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFile, writeFile, access, copyFile } from 'fs/promises';
import { resolve } from 'path';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  access: vi.fn(),
  copyFile: vi.fn(),
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

vi.mock('prompts', () => ({
  default: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports under test (must come after mocks)
// ---------------------------------------------------------------------------

import {
  envListCommand,
  envGetCommand,
  envSetCommand,
  envRemoveCommand,
  envInitCommand,
  envDiffCommand,
  envValidateCommand,
} from '../commands/env.js';

import { logger } from '../utils/logger.js';
import prompts from 'prompts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TEST_CWD = '/tmp/test-project';

const mockedReadFile = vi.mocked(readFile);
const mockedWriteFile = vi.mocked(writeFile);
const mockedAccess = vi.mocked(access);
const mockedCopyFile = vi.mocked(copyFile);
const mockedPrompts = vi.mocked(prompts);

function mockFileContent(path: string | RegExp, content: string) {
  mockedAccess.mockImplementation(async (p) => {
    if (typeof path === 'string' && String(p) === path) return undefined;
    if (path instanceof RegExp && path.test(String(p))) return undefined;
    throw new Error('ENOENT');
  });
  mockedReadFile.mockImplementation(async (p) => {
    if (typeof path === 'string' && String(p) === path) return content;
    if (path instanceof RegExp && path.test(String(p))) return content;
    throw new Error('ENOENT');
  });
}

/**
 * Helper: make access resolve for specific paths, reject for the rest.
 */
function mockAccessForPaths(existingPaths: string[]) {
  mockedAccess.mockImplementation(async (p) => {
    if (existingPaths.includes(String(p))) return undefined;
    throw new Error('ENOENT');
  });
}

/**
 * Helper: make readFile return different content depending on path substring.
 */
function mockMultipleFiles(files: Record<string, string>) {
  const paths = Object.keys(files);
  mockedAccess.mockImplementation(async (p) => {
    for (const fp of paths) {
      if (String(p).endsWith(fp)) return undefined;
    }
    throw new Error('ENOENT');
  });
  mockedReadFile.mockImplementation(async (p) => {
    for (const fp of paths) {
      if (String(p).endsWith(fp)) return files[fp];
    }
    throw new Error('ENOENT');
  });
}

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------

let exitSpy: ReturnType<typeof vi.spyOn>;
let cwdSpy: ReturnType<typeof vi.spyOn>;
let consoleLogSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(TEST_CWD);
  exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
    throw new Error('process.exit');
  }) as never);
  consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  mockedWriteFile.mockResolvedValue(undefined);
});

afterEach(() => {
  cwdSpy.mockRestore();
  exitSpy.mockRestore();
  consoleLogSpy.mockRestore();
});

// ===========================================================================
// envListCommand
// ===========================================================================

describe('envListCommand', () => {
  it('should display "no variables" message when file does not exist', async () => {
    mockedAccess.mockRejectedValue(new Error('ENOENT'));

    await envListCommand();

    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('No environment variables'));
  });

  it('should display "no variables" message for an empty file', async () => {
    mockFileContent(resolve(TEST_CWD, '.env'), '');

    await envListCommand();

    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('No environment variables'));
    expect(logger.subtitle).toHaveBeenCalledWith(expect.stringContaining('vexor env init'));
  });

  it('should display variables from a populated .env file', async () => {
    const content = 'NODE_ENV=development\nPORT=3000\n';
    mockFileContent(resolve(TEST_CWD, '.env'), content);

    await envListCommand();

    expect(logger.title).toHaveBeenCalledWith(expect.stringContaining('.env'));
    expect(logger.table).toHaveBeenCalledWith(
      ['Key', 'Value', 'Description'],
      expect.arrayContaining([
        expect.arrayContaining(['NODE_ENV', 'development', '']),
        expect.arrayContaining(['PORT', '3000', '']),
      ]),
    );
  });

  it('should use a custom file when provided', async () => {
    const content = 'APP_KEY=secret\n';
    mockFileContent(resolve(TEST_CWD, '.env.staging'), content);

    await envListCommand('.env.staging');

    expect(logger.title).toHaveBeenCalledWith(expect.stringContaining('.env.staging'));
  });

  it('should truncate long values to 30 characters', async () => {
    const longValue = 'a'.repeat(50);
    const content = `LONG_VAR=${longValue}\n`;
    mockFileContent(resolve(TEST_CWD, '.env'), content);

    await envListCommand();

    expect(logger.table).toHaveBeenCalledWith(
      expect.any(Array),
      expect.arrayContaining([
        expect.arrayContaining([
          'LONG_VAR',
          expect.stringContaining('...'),
          '',
        ]),
      ]),
    );
  });

  it('should display comment descriptions alongside variables', async () => {
    const content = '# Server port\nPORT=3000\n';
    mockFileContent(resolve(TEST_CWD, '.env'), content);

    await envListCommand();

    expect(logger.table).toHaveBeenCalledWith(
      expect.any(Array),
      expect.arrayContaining([
        expect.arrayContaining(['PORT', '3000', 'Server port']),
      ]),
    );
  });
});

// ===========================================================================
// envGetCommand
// ===========================================================================

describe('envGetCommand', () => {
  it('should print the value of an existing variable', async () => {
    const content = 'NODE_ENV=production\nPORT=8080\n';
    mockFileContent(resolve(TEST_CWD, '.env'), content);

    await envGetCommand('PORT');

    expect(consoleLogSpy).toHaveBeenCalledWith('8080');
  });

  it('should call process.exit(1) when variable is not found', async () => {
    const content = 'NODE_ENV=production\n';
    mockFileContent(resolve(TEST_CWD, '.env'), content);

    await expect(envGetCommand('MISSING_KEY')).rejects.toThrow('process.exit');

    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("'MISSING_KEY'"));
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('should read from a custom file when provided', async () => {
    const content = 'SECRET=mysecret\n';
    mockFileContent(resolve(TEST_CWD, '.env.local'), content);

    await envGetCommand('SECRET', '.env.local');

    expect(consoleLogSpy).toHaveBeenCalledWith('mysecret');
  });

  it('should strip quotes from values (parseEnv indirectly)', async () => {
    const content = 'DB_NAME="my_database"\nAPP_KEY=\'app_key_value\'\n';
    mockFileContent(resolve(TEST_CWD, '.env'), content);

    await envGetCommand('DB_NAME');
    expect(consoleLogSpy).toHaveBeenCalledWith('my_database');
  });
});

// ===========================================================================
// envSetCommand
// ===========================================================================

describe('envSetCommand', () => {
  it('should update an existing variable', async () => {
    const content = 'PORT=3000\n';
    mockFileContent(resolve(TEST_CWD, '.env'), content);

    await envSetCommand('PORT', '8080');

    expect(logger.success).toHaveBeenCalledWith(expect.stringContaining('Updated PORT'));
    expect(mockedWriteFile).toHaveBeenCalledWith(
      resolve(TEST_CWD, '.env'),
      expect.stringContaining('PORT=8080'),
    );
  });

  it('should add a new variable when it does not exist', async () => {
    const content = 'PORT=3000\n';
    mockFileContent(resolve(TEST_CWD, '.env'), content);

    await envSetCommand('HOST', 'localhost');

    expect(logger.success).toHaveBeenCalledWith(expect.stringContaining('Added HOST'));
    expect(mockedWriteFile).toHaveBeenCalledWith(
      resolve(TEST_CWD, '.env'),
      expect.stringContaining('HOST=localhost'),
    );
  });

  it('should create a new file when it does not exist', async () => {
    mockedAccess.mockRejectedValue(new Error('ENOENT'));

    await envSetCommand('NEW_KEY', 'new_value');

    expect(logger.success).toHaveBeenCalledWith(expect.stringContaining('Added NEW_KEY'));
    expect(mockedWriteFile).toHaveBeenCalledWith(
      resolve(TEST_CWD, '.env'),
      expect.stringContaining('NEW_KEY=new_value'),
    );
  });

  it('should quote values containing spaces (serializeEnv indirectly)', async () => {
    mockedAccess.mockRejectedValue(new Error('ENOENT'));

    await envSetCommand('GREETING', 'hello world');

    expect(mockedWriteFile).toHaveBeenCalledWith(
      resolve(TEST_CWD, '.env'),
      expect.stringContaining('GREETING="hello world"'),
    );
  });

  it('should escape double quotes in values (serializeEnv indirectly)', async () => {
    mockedAccess.mockRejectedValue(new Error('ENOENT'));

    await envSetCommand('MSG', 'say "hi"');

    const writtenContent = mockedWriteFile.mock.calls[0][1] as string;
    expect(writtenContent).toContain('MSG="say \\"hi\\""');
  });

  it('should preserve existing variables when adding a new one', async () => {
    const content = 'PORT=3000\nHOST=0.0.0.0\n';
    mockFileContent(resolve(TEST_CWD, '.env'), content);

    await envSetCommand('DB_URL', 'postgres://localhost');

    const writtenContent = mockedWriteFile.mock.calls[0][1] as string;
    expect(writtenContent).toContain('PORT=3000');
    expect(writtenContent).toContain('HOST=0.0.0.0');
    expect(writtenContent).toContain('DB_URL=postgres://localhost');
  });
});

// ===========================================================================
// envRemoveCommand
// ===========================================================================

describe('envRemoveCommand', () => {
  it('should remove an existing variable and write back', async () => {
    const content = 'PORT=3000\nHOST=localhost\n';
    mockFileContent(resolve(TEST_CWD, '.env'), content);

    await envRemoveCommand('PORT');

    expect(logger.success).toHaveBeenCalledWith(expect.stringContaining('Removed PORT'));
    const writtenContent = mockedWriteFile.mock.calls[0][1] as string;
    expect(writtenContent).not.toContain('PORT');
    expect(writtenContent).toContain('HOST=localhost');
  });

  it('should call process.exit(1) when variable is not found', async () => {
    const content = 'PORT=3000\n';
    mockFileContent(resolve(TEST_CWD, '.env'), content);

    await expect(envRemoveCommand('NONEXISTENT')).rejects.toThrow('process.exit');

    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("'NONEXISTENT'"));
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('should use a custom file when provided', async () => {
    const content = 'SECRET=abc\nOTHER=123\n';
    mockFileContent(resolve(TEST_CWD, '.env.local'), content);

    await envRemoveCommand('SECRET', '.env.local');

    expect(mockedWriteFile).toHaveBeenCalledWith(
      resolve(TEST_CWD, '.env.local'),
      expect.not.stringContaining('SECRET'),
    );
  });
});

// ===========================================================================
// envInitCommand
// ===========================================================================

describe('envInitCommand', () => {
  it('should copy .env.example to .env when example exists and .env does not', async () => {
    const envPath = resolve(TEST_CWD, '.env');
    const examplePath = resolve(TEST_CWD, '.env.example');

    mockedAccess.mockImplementation(async (p) => {
      if (String(p) === examplePath) return undefined;
      throw new Error('ENOENT');
    });

    await envInitCommand();

    expect(mockedCopyFile).toHaveBeenCalledWith(examplePath, envPath);
    expect(logger.success).toHaveBeenCalledWith(expect.stringContaining('.env.example'));
  });

  it('should create a default .env when no .env.example exists', async () => {
    mockedAccess.mockRejectedValue(new Error('ENOENT'));

    await envInitCommand();

    expect(mockedWriteFile).toHaveBeenCalled();
    const writtenContent = mockedWriteFile.mock.calls[0][1] as string;
    expect(writtenContent).toContain('NODE_ENV=development');
    expect(writtenContent).toContain('PORT=3000');
    expect(writtenContent).toContain('DATABASE_URL=');
    expect(writtenContent).toContain('JWT_SECRET=');
    expect(logger.success).toHaveBeenCalledWith(expect.stringContaining('default variables'));
  });

  it('should warn and prompt when .env already exists', async () => {
    const envPath = resolve(TEST_CWD, '.env');

    mockedAccess.mockImplementation(async (p) => {
      if (String(p) === envPath) return undefined;
      throw new Error('ENOENT');
    });
    mockedPrompts.mockResolvedValue({ overwrite: false });

    await envInitCommand();

    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('already exists'));
    expect(logger.info).toHaveBeenCalledWith('Cancelled');
  });

  it('should always remind to add .env to .gitignore', async () => {
    mockedAccess.mockRejectedValue(new Error('ENOENT'));

    await envInitCommand();

    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('.gitignore'));
  });
});

// ===========================================================================
// envDiffCommand
// ===========================================================================

describe('envDiffCommand', () => {
  it('should report missing vars from .env that are in .env.example', async () => {
    mockMultipleFiles({
      '.env': 'PORT=3000\n',
      '.env.example': 'PORT=3000\nDATABASE_URL=\nJWT_SECRET=\n',
    });

    await envDiffCommand();

    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Missing'));
    expect(logger.list).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.stringContaining('DATABASE_URL'),
        expect.stringContaining('JWT_SECRET'),
      ]),
    );
  });

  it('should report extra vars in .env not present in .env.example', async () => {
    mockMultipleFiles({
      '.env': 'PORT=3000\nEXTRA_VAR=hello\n',
      '.env.example': 'PORT=3000\n',
    });

    await envDiffCommand();

    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Extra'));
    expect(logger.list).toHaveBeenCalledWith(
      expect.arrayContaining([expect.stringContaining('EXTRA_VAR')]),
    );
  });

  it('should report success when .env is in sync with .env.example', async () => {
    mockMultipleFiles({
      '.env': 'PORT=3000\nNODE_ENV=dev\n',
      '.env.example': 'PORT=\nNODE_ENV=\n',
    });

    await envDiffCommand();

    expect(logger.success).toHaveBeenCalledWith(expect.stringContaining('in sync'));
  });

  it('should report "no .env.example" when example file does not exist', async () => {
    mockMultipleFiles({
      '.env': 'PORT=3000\n',
    });
    // Override access so .env.example is not found
    mockedAccess.mockImplementation(async (p) => {
      if (String(p).endsWith('.env.example')) throw new Error('ENOENT');
      return undefined;
    });
    mockedReadFile.mockImplementation(async (p) => {
      if (String(p).endsWith('.env')) return 'PORT=3000\n';
      throw new Error('ENOENT');
    });

    await envDiffCommand();

    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('No .env.example'));
  });
});

// ===========================================================================
// envValidateCommand
// ===========================================================================

describe('envValidateCommand', () => {
  it('should pass validation when all required vars are present and valid', async () => {
    const content = [
      'NODE_ENV=production',
      'PORT=3000',
      'JWT_SECRET=' + 'a'.repeat(32),
      'DATABASE_URL=postgres://localhost/db',
    ].join('\n') + '\n';
    mockFileContent(resolve(TEST_CWD, '.env'), content);

    await envValidateCommand();

    expect(logger.success).toHaveBeenCalledWith(expect.stringContaining('valid'));
  });

  it('should report missing required variable NODE_ENV', async () => {
    const content = 'PORT=3000\n';
    mockFileContent(resolve(TEST_CWD, '.env'), content);

    await expect(envValidateCommand()).rejects.toThrow('process.exit');

    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Missing required variable: NODE_ENV'));
  });

  it('should report missing required variable PORT', async () => {
    const content = 'NODE_ENV=development\n';
    mockFileContent(resolve(TEST_CWD, '.env'), content);

    await expect(envValidateCommand()).rejects.toThrow('process.exit');

    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Missing required variable: PORT'));
  });

  it('should report empty required variables', async () => {
    const content = 'NODE_ENV=\nPORT=3000\n';
    mockFileContent(resolve(TEST_CWD, '.env'), content);

    await expect(envValidateCommand()).rejects.toThrow('process.exit');

    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Empty required variable: NODE_ENV'));
  });

  it('should warn when JWT_SECRET is shorter than 32 characters', async () => {
    const content = 'NODE_ENV=dev\nPORT=3000\nJWT_SECRET=short\n';
    mockFileContent(resolve(TEST_CWD, '.env'), content);

    await expect(envValidateCommand()).rejects.toThrow('process.exit');

    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('JWT_SECRET should be at least 32 characters'),
    );
  });

  it('should warn when DATABASE_URL has invalid format', async () => {
    const content = 'NODE_ENV=dev\nPORT=3000\nDATABASE_URL=invalid://wrong\n';
    mockFileContent(resolve(TEST_CWD, '.env'), content);

    await expect(envValidateCommand()).rejects.toThrow('process.exit');

    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('DATABASE_URL has an invalid format'),
    );
  });

  it('should accept DATABASE_URL with postgres:// prefix', async () => {
    const content = 'NODE_ENV=dev\nPORT=3000\nDATABASE_URL=postgres://localhost/db\n';
    mockFileContent(resolve(TEST_CWD, '.env'), content);

    await envValidateCommand();

    expect(logger.success).toHaveBeenCalled();
  });

  it('should accept DATABASE_URL with mysql:// prefix', async () => {
    const content = 'NODE_ENV=dev\nPORT=3000\nDATABASE_URL=mysql://localhost/db\n';
    mockFileContent(resolve(TEST_CWD, '.env'), content);

    await envValidateCommand();

    expect(logger.success).toHaveBeenCalled();
  });

  it('should accept DATABASE_URL with sqlite:// prefix', async () => {
    const content = 'NODE_ENV=dev\nPORT=3000\nDATABASE_URL=sqlite://./local.db\n';
    mockFileContent(resolve(TEST_CWD, '.env'), content);

    await envValidateCommand();

    expect(logger.success).toHaveBeenCalled();
  });

  it('should report the number of issues found', async () => {
    // Missing NODE_ENV, missing PORT, empty file
    const content = '';
    mockFileContent(resolve(TEST_CWD, '.env'), content);

    await expect(envValidateCommand()).rejects.toThrow('process.exit');

    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('issue(s)'));
  });

  it('should use a custom file when provided', async () => {
    const content = 'NODE_ENV=dev\nPORT=8080\n';
    mockFileContent(resolve(TEST_CWD, '.env.production'), content);

    await envValidateCommand('.env.production');

    expect(logger.success).toHaveBeenCalledWith(expect.stringContaining('valid'));
  });
});

// ===========================================================================
// parseEnv indirectly tested through multiple commands
// ===========================================================================

describe('parseEnv (indirect)', () => {
  it('should handle comments attached to the next variable', async () => {
    const content = '# Server config\nPORT=3000\n# DB config\nDB_URL=postgres://x\n';
    mockFileContent(resolve(TEST_CWD, '.env'), content);

    await envListCommand();

    expect(logger.table).toHaveBeenCalledWith(
      expect.any(Array),
      expect.arrayContaining([
        expect.arrayContaining(['PORT', '3000', 'Server config']),
        expect.arrayContaining(['DB_URL', 'postgres://x', 'DB config']),
      ]),
    );
  });

  it('should reset comment tracking after empty lines', async () => {
    const content = '# Comment for nothing\n\nPORT=3000\n';
    mockFileContent(resolve(TEST_CWD, '.env'), content);

    await envListCommand();

    expect(logger.table).toHaveBeenCalledWith(
      expect.any(Array),
      expect.arrayContaining([
        expect.arrayContaining(['PORT', '3000', '']),
      ]),
    );
  });

  it('should handle values with equals signs', async () => {
    const content = 'CONNECTION=host=localhost;port=5432\n';
    mockFileContent(resolve(TEST_CWD, '.env'), content);

    await envGetCommand('CONNECTION');

    expect(consoleLogSpy).toHaveBeenCalledWith('host=localhost;port=5432');
  });

  it('should strip single quotes from values', async () => {
    const content = "API_KEY='my-api-key'\n";
    mockFileContent(resolve(TEST_CWD, '.env'), content);

    await envGetCommand('API_KEY');

    expect(consoleLogSpy).toHaveBeenCalledWith('my-api-key');
  });
});
