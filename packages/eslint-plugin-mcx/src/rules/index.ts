import type { Rule } from 'eslint';
import { validEventBinding } from './valid-event-binding';
import { noDuplicateRootTag } from './no-duplicate-root-tag';
import { validPropValue } from './valid-prop-value';
import { requireScriptLang } from './require-script-lang';

export const rules: Record<string, Rule.RuleModule> = {
  'valid-event-binding': validEventBinding,
  'no-duplicate-root-tag': noDuplicateRootTag,
  'valid-prop-value': validPropValue,
  'require-script-lang': requireScriptLang,
};
