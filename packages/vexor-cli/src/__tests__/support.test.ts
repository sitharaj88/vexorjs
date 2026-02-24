/**
 * Support Commands Tests
 *
 * Tests for help, upgrade, docs, feedback, and changelog commands.
 * Private functions (openUrl, getLatestVersion, getCurrentVersion) are tested
 * indirectly through the exported command functions by mocking dependencies.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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

import { execSync } from 'child_process';
import ora from 'ora';
import { logger } from '../utils/logger.js';
import {
  helpCommand,
  upgradeCommand,
  docsCommand,
  feedbackCommand,
  changelogCommand,
} from '../commands/support.js';

const mockedExecSync = vi.mocked(execSync);
const mockedOra = vi.mocked(ora);

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// helpCommand
// ---------------------------------------------------------------------------

describe('helpCommand', () => {
  it('should show general help when no topic is provided', async () => {
    await helpCommand();

    expect(logger.banner).toHaveBeenCalledWith('Vexor CLI Help');
    expect(logger.box).toHaveBeenCalled();
    expect(logger.table).toHaveBeenCalledWith(
      ['Command', 'Description'],
      expect.arrayContaining([
        expect.arrayContaining(['new', expect.any(String)]),
      ])
    );
  });

  it('should show new command help when topic is "new"', async () => {
    await helpCommand('new');

    expect(logger.title).toHaveBeenCalledWith('vexor new');
    expect(logger.subtitle).toHaveBeenCalledWith('Create a new Vexor project');
    expect(logger.command).toHaveBeenCalledWith('vexor new my-app');
  });

  it('should show generate command help when topic is "generate"', async () => {
    await helpCommand('generate');

    expect(logger.title).toHaveBeenCalledWith('vexor generate');
    expect(logger.subtitle).toHaveBeenCalledWith('Generate code scaffolding');
    expect(logger.list).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.stringContaining('module'),
      ])
    );
  });

  it('should show add command help when topic is "add"', async () => {
    await helpCommand('add');

    expect(logger.title).toHaveBeenCalledWith('vexor add');
    expect(logger.subtitle).toHaveBeenCalledWith('Add integrations to your project');
    expect(logger.list).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.stringContaining('prisma'),
      ])
    );
  });

  it('should show config command help when topic is "config"', async () => {
    await helpCommand('config');

    expect(logger.title).toHaveBeenCalledWith('vexor config');
    expect(logger.subtitle).toHaveBeenCalledWith('Manage CLI configuration');
    expect(logger.list).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.stringContaining('config:list'),
      ])
    );
  });

  it('should show env command help when topic is "env"', async () => {
    await helpCommand('env');

    expect(logger.title).toHaveBeenCalledWith('vexor env');
    expect(logger.subtitle).toHaveBeenCalledWith('Manage environment variables');
    expect(logger.list).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.stringContaining('env:list'),
      ])
    );
  });

  it('should show db command help when topic is "db"', async () => {
    await helpCommand('db');

    expect(logger.title).toHaveBeenCalledWith('vexor db');
    expect(logger.subtitle).toHaveBeenCalledWith('Database management commands');
    expect(logger.list).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.stringContaining('db:migrate'),
      ])
    );
  });

  it('should show error for unknown topic', async () => {
    await helpCommand('unknown');

    expect(logger.error).toHaveBeenCalledWith('Unknown topic: unknown');
    expect(logger.info).toHaveBeenCalledWith(
      'Available topics: new, generate, add, config, env, db'
    );
  });

  it('should be case-insensitive for topic lookup', async () => {
    await helpCommand('NEW');

    expect(logger.title).toHaveBeenCalledWith('vexor new');
  });
});

// ---------------------------------------------------------------------------
// upgradeCommand
// ---------------------------------------------------------------------------

describe('upgradeCommand', () => {
  it('should display current version and check for updates', async () => {
    mockedExecSync.mockReturnValueOnce('2.0.0\n' as any);

    await upgradeCommand({ check: true });

    expect(logger.keyValue).toHaveBeenCalledWith('Current version', '1.0.0');
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('New version available')
    );
  });

  it('should show check-only message with --check flag when new version is available', async () => {
    mockedExecSync.mockReturnValueOnce('2.0.0\n' as any);

    await upgradeCommand({ check: true });

    expect(logger.info).toHaveBeenCalledWith('Run without --check to upgrade:');
    expect(logger.command).toHaveBeenCalledWith('vexor upgrade');
  });

  it('should show "already on latest" when current equals latest', async () => {
    mockedExecSync.mockReturnValueOnce('1.0.0\n' as any);

    await upgradeCommand();

    expect(logger.success).toHaveBeenCalledWith(
      'You are already on the latest version!'
    );
  });

  it('should handle npm check failure gracefully', async () => {
    mockedExecSync.mockImplementationOnce(() => {
      throw new Error('npm not found');
    });

    await upgradeCommand();

    const spinner = mockedOra.mock.results[0].value;
    expect(spinner.fail).toHaveBeenCalledWith('Could not check for updates');
    expect(logger.subtitle).toHaveBeenCalledWith(
      'Check your internet connection or try again later'
    );
  });

  it('should attempt upgrade when no --check flag and new version available', async () => {
    // First call: getLatestVersion
    mockedExecSync.mockReturnValueOnce('2.0.0\n' as any);
    // Second call: npm install -g
    mockedExecSync.mockReturnValueOnce('' as any);

    await upgradeCommand();

    expect(mockedExecSync).toHaveBeenCalledWith(
      'npm install -g @vexorjs/cli@latest',
      expect.any(Object)
    );
  });

  it('should handle upgrade install failure gracefully', async () => {
    // First call: getLatestVersion
    mockedExecSync.mockReturnValueOnce('2.0.0\n' as any);
    // Second call: npm install -g fails
    mockedExecSync.mockImplementationOnce(() => {
      throw new Error('permission denied');
    });

    await upgradeCommand();

    expect(logger.info).toHaveBeenCalledWith('Try running manually:');
    expect(logger.command).toHaveBeenCalledWith(
      'npm install -g @vexorjs/cli@latest'
    );
  });
});

// ---------------------------------------------------------------------------
// docsCommand
// ---------------------------------------------------------------------------

describe('docsCommand', () => {
  it('should open the base docs URL when no topic is provided', async () => {
    mockedExecSync.mockReturnValueOnce('' as any);

    await docsCommand();

    expect(logger.info).toHaveBeenCalledWith(
      'Opening documentation: https://vexorjs.dev/docs'
    );
    expect(logger.success).toHaveBeenCalledWith(
      'Opened in your default browser'
    );
  });

  it('should open topic-specific docs URL when topic is provided', async () => {
    mockedExecSync.mockReturnValueOnce('' as any);

    await docsCommand('routing');

    expect(logger.info).toHaveBeenCalledWith(
      'Opening documentation: https://vexorjs.dev/docs/routing'
    );
  });

  it('should show fallback message when browser cannot be opened', async () => {
    mockedExecSync.mockImplementationOnce(() => {
      throw new Error('xdg-open not found');
    });

    await docsCommand();

    expect(logger.warn).toHaveBeenCalledWith(
      'Could not open browser automatically'
    );
    expect(logger.command).toHaveBeenCalledWith('https://vexorjs.dev/docs');
  });
});

// ---------------------------------------------------------------------------
// feedbackCommand
// ---------------------------------------------------------------------------

describe('feedbackCommand', () => {
  it('should show feedback information and open issues URL', async () => {
    mockedExecSync.mockReturnValueOnce('' as any);

    await feedbackCommand();

    expect(logger.title).toHaveBeenCalledWith('Vexor Feedback');
    expect(logger.box).toHaveBeenCalled();
    expect(logger.keyValue).toHaveBeenCalledWith(
      'Report bugs',
      'https://github.com/sitharaj88/vexorjs/issues'
    );
    expect(logger.success).toHaveBeenCalledWith(
      'Opened in your default browser'
    );
  });

  it('should open bug report URL when --bug flag is set', async () => {
    mockedExecSync.mockReturnValueOnce('' as any);

    await feedbackCommand({ bug: true });

    expect(logger.info).toHaveBeenCalledWith('Opening bug report page...');
    expect(logger.success).toHaveBeenCalledWith(
      'Opened in your default browser'
    );
  });

  it('should show fallback for bug report when browser cannot be opened', async () => {
    mockedExecSync.mockImplementationOnce(() => {
      throw new Error('browser error');
    });

    await feedbackCommand({ bug: true });

    expect(logger.info).toHaveBeenCalledWith('Report bugs at:');
    expect(logger.command).toHaveBeenCalledWith(
      'https://github.com/sitharaj88/vexorjs/issues/new?template=bug_report.md'
    );
  });
});

// ---------------------------------------------------------------------------
// changelogCommand
// ---------------------------------------------------------------------------

describe('changelogCommand', () => {
  it('should display release notes with version and date', async () => {
    await changelogCommand();

    expect(logger.title).toHaveBeenCalledWith('Vexor CLI Changelog');
    expect(logger.subtitle).toHaveBeenCalledWith(
      expect.stringContaining('v1.0.0')
    );
  });

  it('should list the changelog items', async () => {
    await changelogCommand();

    expect(logger.list).toHaveBeenCalledWith(
      expect.arrayContaining([
        'Initial release',
        expect.stringContaining('Interactive project creation'),
      ])
    );
  });

  it('should show link to full changelog', async () => {
    await changelogCommand();

    expect(logger.info).toHaveBeenCalledWith('Full changelog:');
    expect(logger.command).toHaveBeenCalledWith(
      'https://github.com/sitharaj88/vexorjs/releases'
    );
  });
});
