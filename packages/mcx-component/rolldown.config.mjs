import { defineConfig } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';
import path from "node:path"
export default defineConfig({
  input: 'src/index.ts',
  output: {
    dir: './dist',
    entryFileNames: '[name].js',
    format: 'esm',
    sourcemap: false,
    manualChunks(mid) {
      if (mid.includes("node_modules")) {
        return "vendor"
      };
      if (mid.includes("components")) {
        const fileName = mid.split(path.sep).pop()
        if (fileName.endsWith(".ts")) return fileName.slice(0, fileName.length - 3)
      }
    }
  },
  external: ['@mbler/mcx-types'],
  platform: 'node',
  plugins: [
    dts(),
  ],
});
