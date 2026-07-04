/**
 * Plugin System Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PluginRegistry, definePlugin } from '../plugins/system.js';
import type { VexorPlugin, PluginMeta, } from '../plugins/system.js';
import type { Vexor } from '../core/app.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockApp(): Vexor {
  return {} as unknown as Vexor;
}

function createPlugin(
  name: string,
  register: (ctx: any) => void | Promise<void> = () => {},
  meta: Partial<PluginMeta> = {}
): VexorPlugin {
  return {
    meta: { name, ...meta },
    register,
  };
}

// ---------------------------------------------------------------------------
// PluginRegistry
// ---------------------------------------------------------------------------
describe('PluginRegistry', () => {
  let app: Vexor;
  let registry: PluginRegistry;

  beforeEach(() => {
    app = createMockApp();
    registry = new PluginRegistry(app);
  });

  describe('register', () => {
    it('should register a plugin', async () => {
      const register = vi.fn();
      const plugin = createPlugin('test-plugin', register);

      await registry.register(plugin);

      expect(registry.has('test-plugin')).toBe(true);
      expect(register).toHaveBeenCalledTimes(1);
    });

    it('should assign auto-name when meta.name is absent', async () => {
      const plugin: VexorPlugin = { register: vi.fn() };
      await registry.register(plugin);
      // Auto-named as plugin_0
      expect(registry.has('plugin_0')).toBe(true);
    });

    it('should throw on duplicate registration', async () => {
      const plugin = createPlugin('dup');
      await registry.register(plugin);

      await expect(registry.register(createPlugin('dup'))).rejects.toThrow(
        'Plugin "dup" is already registered'
      );
    });

    it('should skip duplicate when skipDuplicate is true', async () => {
      const register1 = vi.fn();
      const register2 = vi.fn();
      await registry.register(createPlugin('dup', register1));
      await registry.register(createPlugin('dup', register2), { skipDuplicate: true });

      expect(register1).toHaveBeenCalledTimes(1);
      expect(register2).not.toHaveBeenCalled();
    });
  });

  describe('dependency check', () => {
    it('should register when dependency is loaded', async () => {
      await registry.register(createPlugin('dep-a'));
      const plugin = createPlugin('dep-b', vi.fn(), { dependencies: ['dep-a'] });
      await registry.register(plugin);

      expect(registry.has('dep-b')).toBe(true);
    });

    it('should throw when dependency is missing', async () => {
      const plugin = createPlugin('needs-dep', vi.fn(), {
        dependencies: ['missing-dep'],
      });

      await expect(registry.register(plugin)).rejects.toThrow(
        'Plugin "needs-dep" requires "missing-dep" to be registered first'
      );
    });
  });

  describe('conflict check', () => {
    it('should throw when conflicting plugin is registered', async () => {
      await registry.register(createPlugin('plugin-a'));
      const plugin = createPlugin('plugin-b', vi.fn(), {
        conflicts: ['plugin-a'],
      });

      await expect(registry.register(plugin)).rejects.toThrow(
        'Plugin "plugin-b" conflicts with "plugin-a"'
      );
    });

    it('should register when no conflict exists', async () => {
      const plugin = createPlugin('no-conflict', vi.fn(), {
        conflicts: ['nonexistent'],
      });
      await registry.register(plugin);
      expect(registry.has('no-conflict')).toBe(true);
    });
  });

  describe('plugin state transitions', () => {
    it('should transition through pending -> loading -> loaded', async () => {
      let stateInsideRegister: string | undefined;
      const plugin = createPlugin('stateful', (_ctx) => {
        stateInsideRegister = registry.get('stateful')?.state;
      });

      await registry.register(plugin);

      expect(stateInsideRegister).toBe('loading');
      expect(registry.get('stateful')?.state).toBe('loaded');
    });

    it('should set state to error when register fails', async () => {
      const plugin = createPlugin('broken', () => {
        throw new Error('register failed');
      });

      await expect(registry.register(plugin)).rejects.toThrow('register failed');
      expect(registry.get('broken')?.state).toBe('error');
    });
  });

  describe('decorations', () => {
    it('should decorate the app instance', async () => {
      const plugin = createPlugin('decorator', (ctx) => {
        ctx.decorate('myUtil', () => 'hello');
      });

      await registry.register(plugin);
      expect((app as any).myUtil).toBeDefined();
      expect(registry.getDecoration('myUtil')).toBeDefined();
    });

    it('should throw on duplicate decoration', async () => {
      const plugin1 = createPlugin('dec1', (ctx) => {
        ctx.decorate('shared', 'a');
      });
      const plugin2 = createPlugin('dec2', (ctx) => {
        ctx.decorate('shared', 'b');
      });

      await registry.register(plugin1);
      await expect(registry.register(plugin2)).rejects.toThrow(
        'Decoration "shared" already exists'
      );
    });
  });

  describe('hooks', () => {
    it('should register and run hooks', async () => {
      const hookFn = vi.fn();
      const plugin = createPlugin('hooker', (ctx) => {
        ctx.addHook('onRequest', hookFn);
      });

      await registry.register(plugin);
      await registry.runHooks('onRequest', 'arg1', 'arg2');

      expect(hookFn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should run multiple hooks in order', async () => {
      const order: number[] = [];
      const plugin1 = createPlugin('h1', (ctx) => {
        ctx.addHook('onSend', () => { order.push(1); });
      });
      const plugin2 = createPlugin('h2', (ctx) => {
        ctx.addHook('onSend', () => { order.push(2); });
      });

      await registry.register(plugin1);
      await registry.register(plugin2);
      await registry.runHooks('onSend');

      expect(order).toEqual([1, 2]);
    });
  });

  describe('sub-plugin registration', () => {
    it('should register sub-plugins through context.register', async () => {
      const child = createPlugin('child', vi.fn());
      const parent = createPlugin('parent', async (ctx) => {
        await ctx.register(child);
      });

      await registry.register(parent);
      expect(registry.has('child')).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// definePlugin
// ---------------------------------------------------------------------------
describe('definePlugin', () => {
  it('should create plugin from meta + register function', () => {
    const register = vi.fn();
    const plugin = definePlugin({ name: 'my-plugin', version: '1.0' }, register);

    expect(plugin.meta).toEqual({ name: 'my-plugin', version: '1.0' });
    expect(plugin.register).toBe(register);
  });

  it('should pass through a VexorPlugin object unchanged', () => {
    const original: VexorPlugin = {
      meta: { name: 'pass-through' },
      register: vi.fn(),
    };
    const result = definePlugin(original);
    expect(result).toBe(original);
  });
});
