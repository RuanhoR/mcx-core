import { defineConfig } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';
import path from 'node:path';

export default defineConfig({
  input: {
    index: 'src/index.ts',
    item: 'src/components/item.ts',
    block: 'src/components/block.ts',
    entity: 'src/components/entity.ts',
    recipe: 'src/components/recipe.ts',
  },
  output: {
    dir: './dist',
    entryFileNames: '[name].js',
    format: 'esm',
    sourcemap: false,
    manualChunks(mid) {
      if (mid.includes('node_modules')) {
        return 'vendor';
      }
    },
  },
  external: ['@mbler/mcx-types'],
  platform: 'node',
  plugins: [
    dts(),
  ],
});
