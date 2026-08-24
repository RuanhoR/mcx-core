import { defineConfig } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';
import { rm } from 'node:fs/promises';

export default defineConfig({
  input: 'src/index.ts',
  output: {
    dir: './dist',
    entryFileNames: '[name].js',
    format: 'esm',
    sourcemap: true,
  },
  external: ['@minecraft/server', '@minecraft/server-ui', '@mbler/mcx-types'],
  platform: 'node',
  plugins: [
    {
      name: 'clean-dist',
      async buildStart() {
        await rm('./dist', { recursive: true, force: true });
      },
    },
    dts({ respectExternal: true }),
  ],
});
