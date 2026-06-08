import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  // Base JavaScript configuration
  js.configs.recommended,

  // Configuration files (JavaScript)
  {
    files: ['**/*.js', '**/*.mjs', 'packages/**/rollup.config.*', 'eslint.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    rules: {
      'no-undef': 'off',
      'no-console': 'off'
    }
  },

  // Simple TypeScript configuration for production code
  {
    files: ['packages/**/src/**/*.ts', 'packages/**/tests/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      // Basic TypeScript rules - all disabled to avoid noise
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unnecessary-type-constraint': 'off',

      // Code quality rules
      'prefer-const': 'error',
      'no-var': 'off',
      'no-undef': 'off',

      // Disabled rules to avoid noise
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-empty': 'off',
      'no-useless-escape': 'off',
      'no-case-declarations': 'off'
    }
  },

  // Ignore patterns for compiled files
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/*.d.ts',
      'packages/types/**',
      'packages/create-mbler/template/**'
    ]
  }
];