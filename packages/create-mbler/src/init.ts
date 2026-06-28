import path from 'node:path';
import { spawn } from 'node:child_process';
import { InputResult } from './types';
import { stat, mkdir, cp, writeFile } from 'node:fs/promises';

function spawnCmd(cmd: string, args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: 'inherit', shell: true });
    child.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code}`));
    });
    child.on('error', reject);
  });
}

export async function fileExists(f: string) {
  try {
    await stat(path.resolve(f));
    return true;
  } catch {
    return false;
  }
}

async function findTemplate(language: InputResult['Language']) {
  const d = path.join('template', language);
  if (await fileExists(path.join(import.meta.dirname, '../', d))) {
    return path.join(import.meta.dirname, '../', d);
  }
  if (await fileExists(path.join(import.meta.dirname, '../../', d))) {
    return path.join(import.meta.dirname, '../../', d);
  }
  throw new Error("Can't find template");
}

function mcVersionToGameTest(mcVersion: string): string {
  const map: Record<string, string> = {
    '1.21.100': '2.0.0',
    '1.21.120': '2.0.0',
  };
  return map[mcVersion] || '2.0.0';
}
/**
 * 从npm registry获取指定包的最新版本
 * @param pkgName - 包名称
 * @param registry - npm registry地址，默认为官方源
 * @returns 返回最新版本号
 * @throws 当请求失败或包不存在时抛出错误
 */
async function getLatestPackageVersion(
  pkgName: string,
  registry: string = 'https://registry.npmjs.com',
): Promise<string> {
  try {
    const url = `${registry}/${pkgName}`;
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Package "${pkgName}" not found`);
      }
      throw new Error(`Failed to fetch package info: ${response.statusText}`);
    }
    const data = (await response.json()) as {
      'dist-tags': { latest?: string };
    };
    const latestVersion = data['dist-tags']?.latest;
    if (!latestVersion) {
      throw new Error(`No version information found for package "${pkgName}"`);
    }
    return latestVersion;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to get latest version for "${pkgName}": ${error.message}`,
      );
    }
    throw error;
  }
}
export async function initProject(inputOpt: InputResult) {
  const dir = path.resolve(inputOpt.createAt);
  const isMcx = inputOpt.Language === 'mcx';
  await mkdir(dir, { recursive: true });
  const templatePath = await findTemplate(inputOpt.Language);
  await cp(templatePath, dir, { recursive: true, force: true });
  const packageJson: {
    name: string;
    description: string;
    version: string;
    packageManager: string;
    engines: Record<string, string>;
    scripts: Record<string, string>;
    type: string;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  } = {
    name: inputOpt.Name,
    description: inputOpt.Description,
    version: '0.0.1',
    packageManager: inputOpt.PackageManager,
    engines: { node: '>=18.0.0' },
    scripts: {
      dev: 'mbler watch',
      build: 'mcx-tsc && cross-env BUILD_MODULE=release mbler build',
      'dev-build': 'mbler build',
    },
    type: 'module',
    dependencies: {
      '@minecraft/server': mcVersionToGameTest(inputOpt.McVersion),
    },
    devDependencies: {
      'cross-env': '^7.0.3',
      mbler: '^' + (await getLatestPackageVersion('mbler')),
      '@mbler/mcx-types':
        '^' + (await getLatestPackageVersion('@mbler/mcx-types')),
    },
  };
  if (isMcx) {
    packageJson.dependencies['@mbler/mcx'] =
      await getLatestPackageVersion('@mbler/mcx');
    packageJson.dependencies['@mbler/mcx-component'] =
      await getLatestPackageVersion('@mbler/mcx-component');
    packageJson.devDependencies['@mbler/mcx-core'] =
      await getLatestPackageVersion('@mbler/mcx-core');
  }
  await writeFile(
    path.join(dir, 'package.json'),
    JSON.stringify(packageJson, null, 2) + '\n',
  );
  const ui = inputOpt.OtherModule.includes('ui');
  const beta = inputOpt.OtherModule.includes('beta-api');
  const mblerConfig = `// @ts-check
import { defineConfig } from "mbler"
export default defineConfig({
  description: '${inputOpt.Description}',
  mcVersion: '${inputOpt.McVersion}',
  minify: 'oxc',
  script: {
    main: 'index.ts',
    ui: ${ui},
    lang: '${inputOpt.Language}',
    UseBeta: ${beta}
  },
  build: {
    bundle: true,
    cache: "file"
  },
  outdir: {
    resources: './dist/res',
    behavior: './dist/dep',
    dist: './dist.mcaddon'
  }
});\n`;
  await writeFile(path.join(dir, 'mbler.config.js'), mblerConfig);
  if (inputOpt.Language !== 'js') {
    const tsconfig = {
      compilerOptions: {
        module: 'esnext',
        noEmit: true,
        target: 'esnext',
        sourceMap: true,
        declaration: false,
        strict: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        isolatedModules: true,
        moduleDetection: 'force',
        skipLibCheck: true,
        types: ['mbler/client'],
      },
      include: ['./behavior/scripts/**/*'],
    };
    await writeFile(
      path.join(dir, 'tsconfig.json'),
      JSON.stringify(tsconfig, null, 2) + '\n',
    );
  }
  await writeFile(
    path.join(dir, '.gitignore'),
    'node_modules\ndist\ndist.mcaddon\n.mbler\ncache\n',
  );
  if (inputOpt.OtherModule.includes('init git')) {
    try {
      await spawnCmd('git', ['init'], dir);
    } catch (err) {
      console.log(
        'Failed to initialize git, you can try to run it manually later. ERR: ',
        err,
      );
    }
  }
  if (inputOpt.OtherModule.includes('init dep')) {
    try {
      await spawnCmd(inputOpt.PackageManager, ['install'], dir);
    } catch (err) {
      console.log(
        'Failed to install dependencies, you can try to run it manually later. ERR: ',
        err,
      );
    }
  }
}
