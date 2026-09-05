import { rmSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'rolldown';
import { dts } from "rolldown-plugin-dts"
const external = [
  '@babel/generator',
  '@babel/parser',
  '@babel/types',
  '@mbler/mcx-component',
  '@mbler/mcx-types',
  '@volar/language-core',
  'magic-string',
  'rollup',
  'rolldown',
  'vite',
  'typescript',
  /@vue\/*/
];
rmSync(path.resolve('dist'), { recursive: true, force: true })
export default defineConfig({
  input: 'src/index.ts',
  output: {
    dir: "./dist",
    entryFileNames: "[name].js",
    format: "esm",
    sourcemap: false,
    minify: process.env.BUILD_MODEL == "release"
  },
  external,
  platform: "node",
  plugins: [
    dts()
  ]
});
