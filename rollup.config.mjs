import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import ts from "@rollup/plugin-typescript"
// 基础配置
export default {
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
    ts()
  ],
  external: []
};
