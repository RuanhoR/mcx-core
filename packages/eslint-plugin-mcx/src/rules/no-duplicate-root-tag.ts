import type { Rule } from 'eslint';
import type { Tag } from '../utils';

interface Options {
  unique?: string[];
}

const DEFAULT_UNIQUE = ['App', 'Event', 'Ui', 'Form', 'script'];

export const noDuplicateRootTag: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow repeating tags that may only appear once per file',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          unique: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      duplicate: "tag '<{{name}}>' may only appear once per file",
    },
  },
  create(context) {
    const tags = (
      context.sourceCode.ast as unknown as { mcxTemplate?: Tag[] }
    ).mcxTemplate;
    if (!tags) return {};
    const opts = context.options[0] as Options | undefined;
    const unique = new Set(opts?.unique ?? DEFAULT_UNIQUE);
    const seen = new Map<string, Tag>();
    for (const tag of tags) {
      if (!unique.has(tag.name)) continue;
      const first = seen.get(tag.name);
      if (first) {
        context.report({
          loc: tag.loc,
          messageId: 'duplicate',
          data: { name: tag.name },
        });
      } else {
        seen.set(tag.name, tag);
      }
    }
    return {};
  },
};
