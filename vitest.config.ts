import { defineConfig } from 'vitest/config'
import ts from 'typescript'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import { mcxPlugin } from './packages/vite-plugin-mcx/src/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fixtureDir = `${__dirname}/packages/vite-plugin-mcx/__test__/fixture`
const tmpOut = `${fixtureDir}/.out`

export default defineConfig({
  test: {
    testTimeout: 30000,
    root: __dirname,
    projects: [
      {
        test: {
          name: 'unit',
          include: ['packages/*/__test__/**/*.spec.ts'],
          exclude: [
            '**/node_modules/**',
            'packages/vite-plugin-mcx/__test__/**/*.integration.spec.ts',
          ],
          // ESLint's RuleTester registers its cases through the global
          // describe/it, which several ecosystem tools expect
          globals: true,
        },
      },
      {
        plugins: [
          mcxPlugin(
            {
              moduleDir: `${fixtureDir}/modules`,
              tsconfigPath: `${fixtureDir}/tsconfig.json`,
              sourcemap: false,
              ts,
            },
            { dist: tmpOut, behavior: tmpOut, resources: tmpOut },
          ),
        ],
        test: {
          name: 'mcx-integration',
          include: [
            'packages/vite-plugin-mcx/__test__/**/*.integration.spec.ts',
          ],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary'],
      include: ['packages/*/src/**/*.ts'],
      exclude: ['packages/*/src/**/*.spec.ts', 'packages/*/src/**/*.d.ts'],
    },
  },
})
