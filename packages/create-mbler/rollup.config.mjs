import path from "node:path"
import ts from "@rollup/plugin-typescript"
import resolve from "@rollup/plugin-node-resolve"
import commjs from "@rollup/plugin-commonjs"
import json from "@rollup/plugin-json"
import dts from "rollup-plugin-dts"
export default [
  {
    input: path.resolve("src/main.ts"),
    plugins: [
      ts(),
      resolve(),
      commjs(),
      json(),
      // terser()
    ],
    external: [
      "inquirer",
      "commander"
    ],
    output: [
      {
        file: "./dist/main.mjs",
        format: "esm"
      }
    ]
  },
  {
    input: path.resolve("src/main.ts"),
    plugins: [
      dts()
    ],
    output: [
      {
        file: "./dist/main.d.ts"
      }
    ]
  }
]