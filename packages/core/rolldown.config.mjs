import { defineConfig } from 'rolldown';
import { dts } from "rolldown-plugin-dts"
const external = [
  '@babel/generator',
  '@babel/parser',
  '@babel/types',
  '@mbler/mcx-types',
  '@volar/language-core',
  'magic-string',
  'rollup',
  'rolldown',
  'typescript',
];

export default defineConfig({
  input: 'src/index.ts',
  output: {
    dir: "./dist",
    entryFileNames: "[name].js",
    format: "esm",
    sourcemap: true
  },
  external,
  platform: "node",
  plugins: [
    dts()
  ]
});
