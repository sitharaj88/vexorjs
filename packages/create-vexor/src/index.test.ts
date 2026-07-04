import { describe, it, expect } from 'vitest';
import { buildCliArgs, resolveCliEntry } from './index.js';

describe('create-vexor', () => {
  it('prepends the new command and forwards all arguments', () => {
    expect(buildCliArgs(['my-app'])).toEqual(['new', 'my-app']);
    expect(buildCliArgs(['my-app', '--template', 'minimal', '--yes'])).toEqual([
      'new',
      'my-app',
      '--template',
      'minimal',
      '--yes',
    ]);
    expect(buildCliArgs([])).toEqual(['new']);
  });

  it('resolves the Vexor CLI entry point', () => {
    const entry = resolveCliEntry();
    expect(entry).toMatch(/vexor-cli|@vexorjs[\\/]cli/);
  });
});
