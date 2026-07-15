import { describe, it, expect } from 'vitest';
import { initProject, fileExists } from '../src/init';
import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('fileExists', () => {
  it('should return true for existing file', async () => {
    const result = await fileExists(process.cwd());
    expect(result).toBe(true);
  });

  it('should return false for non-existing file', async () => {
    const result = await fileExists('/nonexistent/path/foo.txt');
    expect(result).toBe(false);
  });
});

describe('initProject', () => {
  it('should create project with js template', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'mbler-test-js-'));
    await initProject({
      createAt: dir,
      Name: 'test-project',
      Description: 'A test project',
      McVersion: '1.21.100',
      Language: 'js',
      PackageManager: 'npm',
      OtherModule: [],
    });
    const pkg = JSON.parse(await readFile(join(dir, 'package.json'), 'utf-8'));
    expect(pkg.name).toBe('test-project');
    expect(pkg.description).toBe('A test project');
    expect(pkg.packageManager).toBe('npm');
    expect(pkg.scripts.build).toContain('mbler build');
    const mblerConfig = await readFile(join(dir, 'mbler.config.js'), 'utf-8');
    expect(mblerConfig).toContain('1.21.100');
    expect(mblerConfig).toContain("lang: 'js'");
  });

  it('should create project with mcx template', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'mbler-test-mcx-'));
    await initProject({
      createAt: dir,
      Name: 'mcx-project',
      Description: 'MCX test',
      McVersion: '1.21.120',
      Language: 'mcx',
      PackageManager: 'pnpm',
      OtherModule: ['ui', 'beta-api'],
    });
    const pkg = JSON.parse(await readFile(join(dir, 'package.json'), 'utf-8'));
    expect(pkg.name).toBe('mcx-project');
    expect(pkg.dependencies['@mbler/mcx']).toBeDefined();
    expect(pkg.devDependencies['@mbler/mcx-core']).toBeDefined();
    const mblerConfig = await readFile(join(dir, 'mbler.config.js'), 'utf-8');
    expect(mblerConfig).toContain('UseBeta: true');
    expect(mblerConfig).toContain('ui: true');
  });

  it('should create project with ts template and tsconfig', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'mbler-test-ts-'));
    await initProject({
      createAt: dir,
      Name: 'ts-project',
      Description: 'TS test',
      McVersion: '1.21.100',
      Language: 'ts',
      PackageManager: 'pnpm',
      OtherModule: ['init git'],
    });
    const tsconfig = JSON.parse(await readFile(join(dir, 'tsconfig.json'), 'utf-8'));
    expect(tsconfig.compilerOptions.strict).toBe(true);
    expect(tsconfig.compilerOptions.module).toBe('esnext');
    const gitignore = await readFile(join(dir, '.gitignore'), 'utf-8');
    expect(gitignore).toContain('node_modules');
  });

  it('should map mc version to game test version', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'mbler-test-mc-'));
    await initProject({
      createAt: dir,
      Name: 'mc-test',
      Description: 'MC test',
      McVersion: '1.21.100',
      Language: 'js',
      PackageManager: 'npm',
      OtherModule: [],
    });
    const pkg = JSON.parse(await readFile(join(dir, 'package.json'), 'utf-8'));
    expect(pkg.dependencies['@minecraft/server']).toBe('2.2.0-beta.1.21.100-stable');
  });
});
