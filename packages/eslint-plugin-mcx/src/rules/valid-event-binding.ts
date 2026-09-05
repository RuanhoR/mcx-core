import type { Rule } from 'eslint';
import { isMcxDirectiveKey } from '../events';
import { loadEventLists } from '../event-source';
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
        'require Event bindings to use known world events (per @after/@before scope, from the project\'s @minecraft/server) and handlers exported from <script>',
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
      unknownEventInScope:
        "unknown world event '{{key}}' in <Event @{{scope}}> (not part of world.{{scope}}Events)",
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
    const cwd = context.cwd ?? process.cwd();
    const lists = loadEventLists(cwd);
    const after = new Set([...lists.after, ...(opts.extraEvents ?? [])]);
    const before = new Set([...lists.before, ...(opts.extraEvents ?? [])]);
    const exported = exportedNames(context.sourceCode.ast);

    walkTags(tags, tag => {
      if (tag.name !== 'Event') return;
      const scope = tag.arr['@after'] !== undefined
        ? 'after'
        : tag.arr['@before'] !== undefined
          ? 'before'
          : undefined;
      for (const line of parsePropLines(tag.content)) {
        if (isMcxDirectiveKey(line.key) || opts.ignoreKeys?.includes(line.key)) {
          continue;
        }
        if (!opts.allowUnknown) {
          if (scope === 'after' && !after.has(line.key)) {
            context.report({
              loc: tag.loc,
              messageId: 'unknownEventInScope',
              data: { key: line.key, scope },
            });
            continue;
          }
          if (scope === 'before' && !before.has(line.key)) {
            context.report({
              loc: tag.loc,
              messageId: 'unknownEventInScope',
              data: { key: line.key, scope },
            });
            continue;
          }
          // no scope attribute: accept an event from either list
          if (!scope && !after.has(line.key) && !before.has(line.key)) {
            context.report({
              loc: tag.loc,
              messageId: 'unknownEvent',
              data: { key: line.key },
            });
          }
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
