/**
 * Config Command
 *
 * Manages Vexor CLI and project configuration.
 */

import { readFile, writeFile, access } from 'fs/promises';
import { resolve, join } from 'path';
import { execSync } from 'child_process';
import { logger } from '../utils/logger.js';

interface VexorConfig {
  defaultTemplate?: string;
  defaultPackageManager?: string;
  telemetry?: boolean;
  updateCheck?: boolean;
  editor?: string;
  colors?: boolean;
  [key: string]: unknown;
}

const CONFIG_FILE = '.vexorrc.json';
const GLOBAL_CONFIG_FILE = '.vexorrc';

/**
 * Get the global config path
 */
function getGlobalConfigPath(): string {
  const home = process.env.HOME || process.env.USERPROFILE || '';
  return join(home, GLOBAL_CONFIG_FILE);
}

/**
 * Get the local config path
 */
function getLocalConfigPath(): string {
  return resolve(process.cwd(), CONFIG_FILE);
}

/**
 * Load config from a path
 */
async function loadConfig(configPath: string): Promise<VexorConfig> {
  try {
    await access(configPath);
    const content = await readFile(configPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

/**
 * Save config to a path
 */
async function saveConfig(configPath: string, config: VexorConfig): Promise<void> {
  await writeFile(configPath, JSON.stringify(config, null, 2) + '\n');
}

/**
 * Get merged config (global + local)
 */
async function getMergedConfig(): Promise<VexorConfig> {
  const globalConfig = await loadConfig(getGlobalConfigPath());
  const localConfig = await loadConfig(getLocalConfigPath());
  return { ...globalConfig, ...localConfig };
}

/**
 * Config command handlers
 */
export async function configCommand(
  action: 'list' | 'get' | 'set' | 'reset' | 'edit' | 'init' | 'path',
  key?: string,
  value?: string,
  options?: { global?: boolean }
): Promise<void> {
  const isGlobal = options?.global ?? false;
  const configPath = isGlobal ? getGlobalConfigPath() : getLocalConfigPath();

  switch (action) {
    case 'list': {
      const config = isGlobal
        ? await loadConfig(getGlobalConfigPath())
        : await getMergedConfig();

      if (Object.keys(config).length === 0) {
        logger.info('No configuration found');
        logger.subtitle(`Run 'vexor config init' to create a config file`);
        return;
      }

      logger.title('Vexor Configuration');
      logger.subtitle(isGlobal ? 'Global config' : 'Merged config (global + local)');
      logger.blank();

      const rows: string[][] = [];
      for (const [k, v] of Object.entries(config)) {
        rows.push([k, String(v)]);
      }
      logger.table(['Key', 'Value'], rows);
      break;
    }

    case 'get': {
      if (!key) {
        logger.error('Please specify a key: vexor config get <key>');
        process.exit(1);
      }

      const config = await getMergedConfig();
      const val = config[key];

      if (val === undefined) {
        logger.warn(`Key '${key}' is not set`);
        process.exit(1);
      }

      console.log(String(val));
      break;
    }

    case 'set': {
      if (!key || value === undefined) {
        logger.error('Usage: vexor config set <key> <value>');
        process.exit(1);
      }

      const config = await loadConfig(configPath);

      // Parse value type
      let parsedValue: unknown = value;
      if (value === 'true') parsedValue = true;
      else if (value === 'false') parsedValue = false;
      else if (!isNaN(Number(value))) parsedValue = Number(value);

      config[key] = parsedValue;
      await saveConfig(configPath, config);

      logger.success(`Set ${key} = ${value}`);
      logger.subtitle(`Saved to ${configPath}`);
      break;
    }

    case 'reset': {
      if (key) {
        const config = await loadConfig(configPath);
        delete config[key];
        await saveConfig(configPath, config);
        logger.success(`Removed '${key}' from config`);
      } else {
        await saveConfig(configPath, {});
        logger.success(`Reset config file: ${configPath}`);
      }
      break;
    }

    case 'edit': {
      const editor = process.env.EDITOR || process.env.VISUAL || 'vi';

      try {
        await access(configPath);
      } catch {
        await saveConfig(configPath, {});
      }

      try {
        execSync(`${editor} ${configPath}`, { stdio: 'inherit' });
        logger.success(`Config file edited: ${configPath}`);
      } catch {
        logger.error(`Failed to open editor: ${editor}`);
        logger.subtitle(`Set EDITOR environment variable or use 'vexor config set'`);
      }
      break;
    }

    case 'init': {
      try {
        await access(configPath);
        logger.warn(`Config file already exists: ${configPath}`);
        return;
      } catch {
        // File doesn't exist, create it
      }

      const defaultConfig: VexorConfig = {
        defaultTemplate: 'api',
        defaultPackageManager: 'npm',
        telemetry: true,
        updateCheck: true,
        colors: true,
      };

      await saveConfig(configPath, defaultConfig);
      logger.success(`Created config file: ${configPath}`);
      logger.blank();
      logger.box(
        [
          'Available settings:',
          '',
          '  defaultTemplate      - Default project template',
          '  defaultPackageManager - Package manager to use',
          '  telemetry            - Enable anonymous telemetry',
          '  updateCheck          - Check for CLI updates',
          '  editor               - Preferred code editor',
          '  colors               - Enable colored output',
        ].join('\n'),
        { title: 'Configuration' }
      );
      break;
    }

    case 'path': {
      console.log(configPath);
      break;
    }
  }
}

export default configCommand;
