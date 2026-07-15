import { defineConfig } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';
import path from 'node:path';

export default defineConfig({
  input: path.resolve('src/main.ts'),
  output: {
    dir: './dist',
    entryFileNames: '[name].mjs',
    format: 'esm',
    minify: true
  },
  external: ['inquirer', 'commander'],
  platform: 'node',
  plugins: [
    dts(),
  ],
});
