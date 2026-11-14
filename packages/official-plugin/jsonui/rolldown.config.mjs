import { rmSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';

const external = ['@mbler/mcx-core', '@mbler/mcx-types', /node:/];

rmSync(path.resolve('dist'), { recursive: true, force: true });

export default defineConfig([
  {
    input: {
      index: 'src/index.ts',
      component: 'src/component.ts',
      cli: 'src/cli.ts',
      preview: 'src/preview/index.ts',
    },
    output: {
      dir: './dist',
      entryFileNames: '[name].js',
      format: 'esm',
      sourcemap: false,
      minify: process.env.BUILD_MODEL == 'release',
    },
    external,
    platform: 'node',
    plugins: [dts()],
  },
  {
    // Browser bundle served by the preview server at /client.js. It shares the
    // layout engine with the screenshot API, so preview and screenshots match.
    input: {
      client: 'src/preview/client.ts',
    },
    output: {
      dir: './dist',
      entryFileNames: 'client.js',
      format: 'esm',
      sourcemap: false,
    },
    platform: 'browser',
  },
]);
