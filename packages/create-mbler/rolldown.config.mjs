import { defineConfig } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';
import path from 'node:path';

export default defineConfig({
  input: path.resolve('src/main.ts'),
  output: {
    dir: './dist',
    entryFileNames: 'main.mjs',
    format: 'esm',
  },
  external: ['inquirer', 'commander'],
  platform: 'node',
  plugins: [
    dts(),
  ],
});
