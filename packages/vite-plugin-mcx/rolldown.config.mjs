import { rmSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';

const external = [
  '@mbler/mcx-core',
  '@mbler/mcx-types',
  'vite',
  'rollup',
  'typescript',
  /node:/,
];

rmSync(path.resolve('dist'), { recursive: true, force: true });

export default defineConfig({
  input: 'src/index.ts',
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
