import { defineConfig } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';

export default defineConfig({
  input: 'src/index.ts',
  output: {
    dir: './dist',
    entryFileNames: '[name].js',
    format: 'esm',
    sourcemap: true,
  },
  external: ['@mbler/mcx-types'],
  platform: 'node',
  plugins: [
    dts(),
  ],
});
