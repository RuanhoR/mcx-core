import type { Rule } from 'eslint';
import { parser, type McxTemplateNode } from './parser';
import { rules } from './rules';

export { parser, rules };

export interface McxPlugin {
  meta: { name: string; version: string };
  rules: Record<string, Rule.RuleModule>;
}

const plugin: McxPlugin = {
  meta: { name: 'eslint-plugin-mcx', version: '0.0.1' },
  rules,
};

export const configs = {
  recommended: {
    name: 'mcx/recommended',
    files: ['**/*.mcx'],
    languageOptions: { parser },
    plugins: { mcx: plugin as never },
    rules: {
      'mcx/valid-event-binding': 'error',
      'mcx/no-duplicate-root-tag': 'error',
      'mcx/valid-prop-value': 'error',
      'mcx/require-script-lang': 'warn',
    },
  },
};

export type { McxTemplateNode };
export default plugin;
