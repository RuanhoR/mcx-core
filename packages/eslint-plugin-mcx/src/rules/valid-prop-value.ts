import type { Rule } from 'eslint';
import { parsePropLines, walkTags } from '../utils';
import type { Tag } from '../utils';

export const validPropValue: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'require prop values that look like JSON objects/arrays to parse as JSON',
      recommended: true,
    },
    schema: [],
    messages: {
      invalidJson: "prop '{{key}}' is not valid JSON: {{reason}}",
    },
  },
  create(context) {
    const tags = (
      context.sourceCode.ast as unknown as { mcxTemplate?: Tag[] }
    ).mcxTemplate;
    if (!tags) return {};

    walkTags(tags, tag => {
      for (const line of parsePropLines(tag.content)) {
        if (!line.value.startsWith('{') && !line.value.startsWith('[')) continue;
        try {
          JSON.parse(line.value);
        } catch (err) {
          context.report({
            loc: tag.loc,
            messageId: 'invalidJson',
            data: {
              key: line.key,
              reason: err instanceof Error ? err.message : String(err),
            },
          });
        }
      }
    });
    return {};
  },
};
