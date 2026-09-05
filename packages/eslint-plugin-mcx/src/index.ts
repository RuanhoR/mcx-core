import type { Rule } from 'eslint';
import { parser, type McxTemplateNode } from './parser';
import { rules } from './rules';

export { parser, rules };

export interface McxPlugin {
  meta: { name: string; version: string };
  rules: Record<string, Rule.RuleModule>;
}

// `configs` and the plugin object reference each other (the recommended
// preset registers this plugin), so the circular link is filled in below
export const configs = {
  recommended: {
    name: 'mcx/recommended',
    files: ['**/*.mcx'],
    languageOptions: { parser },
    plugins: {} as { mcx: PluginWithConfigs },
    rules: {
      'mcx/valid-event-binding': 'error',
      'mcx/no-duplicate-root-tag': 'error',
      'mcx/valid-prop-value': 'error',
      'mcx/require-script-lang': 'warn',
    },
  },
};

interface PluginWithConfigs extends McxPlugin {
  configs: typeof configs;
}

const plugin: PluginWithConfigs = {
  meta: { name: 'eslint-plugin-mcx', version: '0.0.1' },
  rules,
  configs,
};
configs.recommended.plugins.mcx = plugin;

export type { McxTemplateNode };
export default plugin;
