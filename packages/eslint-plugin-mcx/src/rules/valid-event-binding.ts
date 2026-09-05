import type { Rule } from 'eslint';
import { KNOWN_WORLD_EVENTS, isMcxDirectiveKey } from '../events';
import { exportedNames, parsePropLines, walkTags } from '../utils';
import type { Tag } from '../utils';

interface Options {
  allowUnknown?: boolean;
  extraEvents?: string[];
  ignoreKeys?: string[];
}

const defaultOptions: Options = {};

export const validEventBinding: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'require Event bindings to use known world events and handlers exported from <script>',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowUnknown: { type: 'boolean' },
          extraEvents: { type: 'array', items: { type: 'string' } },
          ignoreKeys: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unknownEvent: "unknown world event '{{key}}' in <Event>",
      missingExport:
        "<Event> binds '{{value}}' but no exported function with that name exists in <script>",
    },
  },
  create(context) {
    const tags = (
      context.sourceCode.ast as unknown as { mcxTemplate?: Tag[] }
    ).mcxTemplate;
    if (!tags) return {};
    const opts = (context.options[0] as Options | undefined) ?? defaultOptions;
    const known = new Set([...KNOWN_WORLD_EVENTS, ...(opts.extraEvents ?? [])]);
    const exported = exportedNames(context.sourceCode.ast);

    walkTags(tags, tag => {
      if (tag.name !== 'Event') return;
      for (const line of parsePropLines(tag.content)) {
        if (isMcxDirectiveKey(line.key) || opts.ignoreKeys?.includes(line.key)) {
          continue;
        }
        if (!opts.allowUnknown && !known.has(line.key)) {
          context.report({
            loc: tag.loc,
            messageId: 'unknownEvent',
            data: { key: line.key },
          });
        }
        const handler = line.value.replace(/\(\)$/, '');
        if (!exported.has(handler)) {
          context.report({
            loc: tag.loc,
            messageId: 'missingExport',
            data: { value: line.value },
          });
        }
      }
    });
    return {};
  },
};
