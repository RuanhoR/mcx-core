import { rmSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';

const external = ['@mbler/mcx-core', '@mbler/mcx-types', /node:/];

rmSync(path.resolve('dist'), { recursive: true, force: true });

export default defineConfig({
  input: {
    index: 'src/index.ts',
    component: 'src/component.ts',
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
});
