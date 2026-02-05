import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import ts from "@rollup/plugin-typescript"
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';
// 基础配置
const main = {
  input: 'src/index.ts', // 入口文件
  output: [
    {
      file: 'dist/index.cjs.js', // CommonJS
      format: 'cjs',
      sourcemap: false
    }
  ],
  plugins: [
    resolve(),
    json(),
    commonjs(),
    ts()
  ],
  external: [
    'node:fs/promises',
    'node:path',
    'node:os',
    '@babel/types',
    'acorn',
    'acorn-walk',
    'estree-walker',
    'magic-string',
    'source-map',
    'typescript',
    '@babel/parser'
  ]
};
export default [main,
{
  input: 'dist/types/index.d.ts',
  output: [{ file: 'dist/index.d.ts', format: 'es' }],
  plugins: [dts()],
}
];