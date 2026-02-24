/**
 * CLI Commands Tests
 *
 * Tests for pure-logic portions of CLI commands including
 * template generation, logger utility, and generate command helpers.
 */

import { describe, it, expect, vi, beforeEach, type MockInstance } from 'vitest';
import { templates, getTemplateChoices } from '../utils/templates.js';
import { logger } from '../utils/logger.js';

// ---------------------------------------------------------------------------
// Templates (utils/templates.ts)
// ---------------------------------------------------------------------------

describe('templates', () => {
  it('should export api, minimal, microservice, and websocket templates', () => {
    expect(templates).toHaveProperty('api');
    expect(templates).toHaveProperty('minimal');
    expect(templates).toHaveProperty('microservice');
    expect(templates).toHaveProperty('websocket');
  });

  describe('api template', () => {
    const api = templates.api;

    it('should have a name and description', () => {
      expect(api.name).toBe('REST API');
      expect(api.description).toBeTruthy();
    });

    it('should declare @vexorjs/core and @vexorjs/orm as dependencies', () => {
      expect(api.dependencies).toHaveProperty('@vexorjs/core');
      expect(api.dependencies).toHaveProperty('@vexorjs/orm');
    });

    it('should declare dev dependencies', () => {
      expect(api.devDependencies).toHaveProperty('@types/node');
      expect(api.devDependencies).toHaveProperty('typescript');
      expect(api.devDependencies).toHaveProperty('tsx');
    });

    it('should include dev, build, and start scripts', () => {
      expect(api.scripts).toHaveProperty('dev');
      expect(api.scripts).toHaveProperty('build');
      expect(api.scripts).toHaveProperty('start');
    });

    it('should include essential files', () => {
      expect(api.files).toHaveProperty('src/index.ts');
      expect(api.files).toHaveProperty('src/routes/users.ts');
      expect(api.files).toHaveProperty('src/routes/auth.ts');
      expect(api.files).toHaveProperty('src/db/index.ts');
      expect(api.files).toHaveProperty('src/db/schema.ts');
      expect(api.files).toHaveProperty('.env.example');
      expect(api.files).toHaveProperty('.gitignore');
      expect(api.files).toHaveProperty('tsconfig.json');
    });

    it('should have valid JSON in tsconfig template', () => {
      const tsconfig = api.files['tsconfig.json'];
      expect(() => JSON.parse(tsconfig)).not.toThrow();
    });

    it('should reference Vexor in the main entry file', () => {
      const indexTs = api.files['src/index.ts'];
      expect(indexTs).toContain("@vexorjs/core");
      expect(indexTs).toContain('Vexor');
    });
  });

  describe('minimal template', () => {
    const minimal = templates.minimal;

    it('should have a name and description', () => {
      expect(minimal.name).toBe('Minimal');
      expect(minimal.description).toBeTruthy();
    });

    it('should only depend on @vexorjs/core', () => {
      expect(Object.keys(minimal.dependencies)).toEqual(['@vexorjs/core']);
    });

    it('should have fewer files than the api template', () => {
      const minFiles = Object.keys(minimal.files).length;
      const apiFiles = Object.keys(templates.api.files).length;
      expect(minFiles).toBeLessThan(apiFiles);
    });

    it('should include a src/index.ts entry point', () => {
      expect(minimal.files).toHaveProperty('src/index.ts');
      expect(minimal.files['src/index.ts']).toContain('Vexor');
    });
  });

  describe('microservice template', () => {
    const ms = templates.microservice;

    it('should have a name and description', () => {
      expect(ms.name).toBe('Microservice');
      expect(ms.description).toBeTruthy();
    });

    it('should include a Dockerfile', () => {
      expect(ms.files).toHaveProperty('Dockerfile');
      expect(ms.files['Dockerfile']).toContain('FROM node');
    });

    it('should include health check, tracing, and circuit breaker imports', () => {
      const indexTs = ms.files['src/index.ts'];
      expect(indexTs).toContain('healthCheck');
      expect(indexTs).toContain('createTracer');
      expect(indexTs).toContain('createCircuitBreaker');
    });
  });

  describe('websocket template', () => {
    const ws = templates.websocket;

    it('should have a name and description', () => {
      expect(ws.name).toBe('WebSocket');
      expect(ws.description).toBeTruthy();
    });

    it('should include WebSocket handler in index.ts', () => {
      const indexTs = ws.files['src/index.ts'];
      expect(indexTs).toContain('app.ws');
    });

    it('should include a public/index.html chat client', () => {
      expect(ws.files).toHaveProperty('public/index.html');
      expect(ws.files['public/index.html']).toContain('WebSocket');
    });
  });
});

describe('getTemplateChoices', () => {
  it('should return an array of choices for each template', () => {
    const choices = getTemplateChoices();

    expect(choices).toBeInstanceOf(Array);
    expect(choices.length).toBe(Object.keys(templates).length);
  });

  it('should include title, description, and value for each choice', () => {
    const choices = getTemplateChoices();

    for (const choice of choices) {
      expect(choice).toHaveProperty('title');
      expect(choice).toHaveProperty('description');
      expect(choice).toHaveProperty('value');
      expect(typeof choice.title).toBe('string');
      expect(typeof choice.description).toBe('string');
      expect(typeof choice.value).toBe('string');
    }
  });

  it('should map template keys as values', () => {
    const choices = getTemplateChoices();
    const values = choices.map((c) => c.value);

    expect(values).toContain('api');
    expect(values).toContain('minimal');
    expect(values).toContain('microservice');
    expect(values).toContain('websocket');
  });

  it('should use template name as title', () => {
    const choices = getTemplateChoices();
    const apiChoice = choices.find((c) => c.value === 'api');

    expect(apiChoice).toBeDefined();
    expect(apiChoice!.title).toBe('REST API');
  });
});

// ---------------------------------------------------------------------------
// Logger (utils/logger.ts)
// ---------------------------------------------------------------------------

describe('logger', () => {
  let consoleSpy: MockInstance;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('should export all expected methods', () => {
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.success).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.title).toBe('function');
    expect(typeof logger.subtitle).toBe('function');
    expect(typeof logger.step).toBe('function');
    expect(typeof logger.blank).toBe('function');
    expect(typeof logger.box).toBe('function');
    expect(typeof logger.table).toBe('function');
    expect(typeof logger.command).toBe('function');
    expect(typeof logger.keyValue).toBe('function');
    expect(typeof logger.list).toBe('function');
    expect(typeof logger.banner).toBe('function');
  });

  describe('info', () => {
    it('should call console.log with the message', () => {
      logger.info('test message');
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const output = consoleSpy.mock.calls[0][0] as string;
      expect(output).toContain('test message');
    });
  });

  describe('success', () => {
    it('should call console.log with the message', () => {
      logger.success('all good');
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const output = consoleSpy.mock.calls[0][0] as string;
      expect(output).toContain('all good');
    });
  });

  describe('warn', () => {
    it('should call console.log with the message', () => {
      logger.warn('be careful');
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const output = consoleSpy.mock.calls[0][0] as string;
      expect(output).toContain('be careful');
    });
  });

  describe('error', () => {
    it('should call console.log with the message', () => {
      logger.error('something broke');
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const output = consoleSpy.mock.calls[0][0] as string;
      expect(output).toContain('something broke');
    });
  });

  describe('step', () => {
    it('should display step number and total', () => {
      logger.step(1, 3, 'Installing deps');
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const output = consoleSpy.mock.calls[0][0] as string;
      expect(output).toContain('1/3');
      expect(output).toContain('Installing deps');
    });
  });

  describe('blank', () => {
    it('should output an empty line', () => {
      logger.blank();
      expect(consoleSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('box', () => {
    it('should output a box with the message', () => {
      logger.box('Hello world');
      expect(consoleSpy).toHaveBeenCalled();

      // Should contain border characters
      const allOutput = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
      expect(allOutput).toContain('Hello world');
    });

    it('should include a title when provided', () => {
      logger.box('Content here', { title: 'My Title' });
      const allOutput = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
      expect(allOutput).toContain('My Title');
    });
  });

  describe('table', () => {
    it('should output headers and rows', () => {
      logger.table(
        ['Name', 'Age'],
        [
          ['Alice', '30'],
          ['Bob', '25'],
        ]
      );

      const allOutput = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
      expect(allOutput).toContain('Name');
      expect(allOutput).toContain('Age');
      expect(allOutput).toContain('Alice');
      expect(allOutput).toContain('Bob');
    });
  });

  describe('command', () => {
    it('should display a command string', () => {
      logger.command('npm install');
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const output = consoleSpy.mock.calls[0][0] as string;
      expect(output).toContain('npm install');
    });
  });

  describe('keyValue', () => {
    it('should display key and value', () => {
      logger.keyValue('Version', '1.0.0');
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const output = consoleSpy.mock.calls[0][0] as string;
      expect(output).toContain('Version');
      expect(output).toContain('1.0.0');
    });
  });

  describe('list', () => {
    it('should display each item on a separate line', () => {
      logger.list(['item 1', 'item 2', 'item 3']);
      expect(consoleSpy).toHaveBeenCalledTimes(3);

      const outputs = consoleSpy.mock.calls.map((c) => c[0] as string);
      expect(outputs[0]).toContain('item 1');
      expect(outputs[1]).toContain('item 2');
      expect(outputs[2]).toContain('item 3');
    });
  });

  describe('banner', () => {
    it('should output the vexor ASCII banner with text', () => {
      logger.banner('v1.0.0');
      expect(consoleSpy).toHaveBeenCalled();

      const allOutput = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
      expect(allOutput).toContain('v1.0.0');
    });
  });
});

// ---------------------------------------------------------------------------
// Generate command - exported helper functions
// ---------------------------------------------------------------------------

describe('generateCommand', () => {
  it('should be importable as a function', async () => {
    const mod = await import('../commands/generate.js');
    expect(typeof mod.generateCommand).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// Config command - exported function
// ---------------------------------------------------------------------------

describe('configCommand', () => {
  it('should be importable as a function', async () => {
    const mod = await import('../commands/config.js');
    expect(typeof mod.configCommand).toBe('function');
    expect(typeof mod.default).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// Info & Doctor commands - exported functions
// ---------------------------------------------------------------------------

describe('info and doctor commands', () => {
  it('should export infoCommand function', async () => {
    const mod = await import('../commands/info.js');
    expect(typeof mod.infoCommand).toBe('function');
  });

  it('should export doctorCommand function', async () => {
    const mod = await import('../commands/info.js');
    expect(typeof mod.doctorCommand).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// Template content integrity
// ---------------------------------------------------------------------------

describe('template content integrity', () => {
  it('all templates should have non-empty files', () => {
    for (const [key, template] of Object.entries(templates)) {
      const fileKeys = Object.keys(template.files);
      expect(fileKeys.length).toBeGreaterThan(0);

      for (const [filename, content] of Object.entries(template.files)) {
        expect(content.length).toBeGreaterThan(0);
      }
    }
  });

  it('all templates should have at least one dependency', () => {
    for (const [key, template] of Object.entries(templates)) {
      expect(Object.keys(template.dependencies).length).toBeGreaterThan(0);
    }
  });

  it('all templates should have a src/index.ts entry point', () => {
    for (const [key, template] of Object.entries(templates)) {
      expect(template.files).toHaveProperty('src/index.ts');
    }
  });

  it('all templates should have a .gitignore', () => {
    for (const [key, template] of Object.entries(templates)) {
      expect(template.files).toHaveProperty('.gitignore');
      expect(template.files['.gitignore']).toContain('node_modules');
    }
  });

  it('all templates should have tsconfig.json with valid JSON', () => {
    for (const [key, template] of Object.entries(templates)) {
      expect(template.files).toHaveProperty('tsconfig.json');
      expect(() => JSON.parse(template.files['tsconfig.json'])).not.toThrow();
    }
  });

  it('all templates should have dev, build, and start scripts', () => {
    for (const [key, template] of Object.entries(templates)) {
      expect(template.scripts).toHaveProperty('dev');
      expect(template.scripts).toHaveProperty('build');
      expect(template.scripts).toHaveProperty('start');
    }
  });
});
