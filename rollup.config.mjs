import resolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import ts from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import dts from "rollup-plugin-dts";
import { rm } from "fs/promises";
import path from "path";
// 基础配置
const main = {
  input: "src/index.ts", // 入口文件
  output: [
    {
      file: "dist/index.js", // CommonJS
      format: "cjs",
      sourcemap: true,
    },
  ],
  plugins: [resolve(), json(), commonjs(), ts()],
  external: [
    "@babel/generator",
    "@babel/parser",
    "@babel/types",
    "@rollup/plugin-commonjs",
    "@rollup/plugin-json",
    "@rollup/plugin-node-resolve",
    "@rollup/plugin-typescript",
    "rollup",
    "magic-string",
    "typescript",
  ],
};
const Dts = {
  input: "src/index.ts",
  output: {
    file: "dist/index.d.ts",
    format: "es",
  },
  external: [
    "@babel/generator",
    "@babel/parser",
    "@babel/types",
    "@rollup/plugin-commonjs",
    "@rollup/plugin-json",
    "@rollup/plugin-node-resolve",
    "@rollup/plugin-typescript",
    "rollup",
    "magic-string",
    "typescript",
  ],
  plugins: [
    dts(),
    {
      name: "remove-d-ts",
      async buildEnd() {
        await rm(path.join(import.meta.dirname, "dist/types"), {
          force: true,
          recursive: true,
        });
      },
    },
  ],
};
export default [main, Dts];
