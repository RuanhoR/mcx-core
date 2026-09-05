import type { Rule } from 'eslint';
import { walkTags } from '../utils';
import type { Tag } from '../utils';

interface Options {
  allow?: string[];
}

const DEFAULT_ALLOW = ['ts'];

export const requireScriptLang: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'require <script> blocks to declare their language',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          allow: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingLang:
        "<script> is missing a lang attribute (expected one of: {{allow}})",
      unknownLang:
        "<script> lang '{{lang}}' is not supported (expected one of: {{allow}})",
    },
  },
  create(context) {
    const tags = (
      context.sourceCode.ast as unknown as { mcxTemplate?: Tag[] }
    ).mcxTemplate;
    if (!tags) return {};
    const opts = context.options[0] as Options | undefined;
    const allow = opts?.allow ?? DEFAULT_ALLOW;

    walkTags(tags, tag => {
      if (tag.name !== 'script') return;
      const lang = tag.arr['lang'];
      if (lang === undefined || lang === 'true') {
        context.report({
          loc: tag.loc,
          messageId: 'missingLang',
          data: { allow: allow.join(', ') },
        });
      } else if (typeof lang !== 'string' || !allow.includes(lang)) {
        context.report({
          loc: tag.loc,
          messageId: 'unknownLang',
          data: { lang: String(lang), allow: allow.join(', ') },
        });
      }
    });
    return {};
  },
};
