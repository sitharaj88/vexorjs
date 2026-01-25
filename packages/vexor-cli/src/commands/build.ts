/**
 * Build Command
 *
 * Builds the application for production deployment.
 */

import { spawn } from 'child_process';
import { resolve } from 'path';
import { access, mkdir, writeFile, readFile } from 'fs/promises';

interface BuildOptions {
  output: string;
  target: 'node' | 'bun' | 'edge';
  minify?: boolean;
}

/**
 * Build command handler
 */
export async function buildCommand(options: BuildOptions): Promise<void> {
  const { output, target, minify } = options;
  const outputPath = resolve(process.cwd(), output);

  console.log(`\n🔨 Building for ${target}...\n`);

  // Detect package manager and build tool
  const buildTool = await detectBuildTool();

  if (!buildTool) {
    // Fall back to tsup if nothing found
    console.log('   Using tsup for build...');
    await buildWithTsup(outputPath, target, minify);
    return;
  }

  console.log(`   Build tool: ${buildTool.name}`);
  console.log(`   Output: ${output}`);
  console.log(`   Target: ${target}`);
  if (minify) console.log(`   Minify: enabled`);
  console.log('');

  // Run the build
  await runBuild(buildTool, outputPath, target, minify);

  console.log(`\n✅ Build completed successfully!`);
  console.log(`\n   Output: ${output}/`);
  console.log(`   Start: node ${output}/index.js\n`);
}

/**
 * Detect available build tool
 */
async function detectBuildTool(): Promise<{ name: string; config?: string } | null> {
  const cwd = process.cwd();

  // Check for existing build configuration
  const configs = [
    { name: 'tsup', config: 'tsup.config.ts' },
    { name: 'tsup', config: 'tsup.config.js' },
    { name: 'esbuild', config: 'esbuild.config.js' },
    { name: 'rollup', config: 'rollup.config.js' },
  ];

  for (const cfg of configs) {
    try {
      await access(resolve(cwd, cfg.config));
      return cfg;
    } catch {
      continue;
    }
  }

  // Check for tsup in dependencies
  try {
    const pkg = JSON.parse(await readFile(resolve(cwd, 'package.json'), 'utf-8'));
    if (pkg.devDependencies?.tsup || pkg.dependencies?.tsup) {
      return { name: 'tsup' };
    }
  } catch {
    // No package.json
  }

  return null;
}

/**
 * Run build with detected tool
 */
async function runBuild(
  buildTool: { name: string; config?: string },
  outputPath: string,
  target: string,
  minify?: boolean
): Promise<void> {
  return new Promise((resolve, reject) => {
    let args: string[];

    switch (buildTool.name) {
      case 'tsup':
        args = ['tsup'];
        if (!buildTool.config) {
          args.push('src/index.ts', '--format', 'esm', '--dts');
        }
        args.push('--outDir', outputPath);
        if (target === 'edge') {
          args.push('--target', 'es2022');
        } else {
          args.push('--target', 'node20');
        }
        if (minify) {
          args.push('--minify');
        }
        break;

      case 'esbuild':
        args = [
          'esbuild',
          'src/index.ts',
          '--bundle',
          '--platform=' + (target === 'edge' ? 'browser' : 'node'),
          '--outdir=' + outputPath,
          '--format=esm',
        ];
        if (minify) {
          args.push('--minify');
        }
        break;

      default:
        args = ['npm', 'run', 'build'];
    }

    const child = spawn('npx', args, {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: true,
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Build failed with code ${code}`));
      }
    });
  });
}

/**
 * Build with tsup (fallback)
 */
async function buildWithTsup(
  outputPath: string,
  target: string,
  minify?: boolean
): Promise<void> {
  // Create a temporary tsup config
  const tsupConfig = `import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  target: '${target === 'edge' ? 'es2022' : 'node20'}',
  outDir: '${outputPath}',
  ${minify ? 'minify: true,' : ''}
  ${target === 'edge' ? `
  esbuildOptions(options) {
    options.platform = 'browser';
    options.conditions = ['worker', 'browser'];
  },` : ''}
});
`;

  const configPath = resolve(process.cwd(), 'tsup.config.temp.ts');
  await writeFile(configPath, tsupConfig);

  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['tsup', '--config', configPath], {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: true,
    });

    child.on('error', reject);
    child.on('exit', async (code) => {
      // Clean up temp config
      try {
        const { unlink } = await import('fs/promises');
        await unlink(configPath);
      } catch {}

      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Build failed with code ${code}`));
      }
    });
  });
}
