import type { McxCompletionContribution } from '@mbler/mcx-types';

/** Attributes shared by `<JsonUi>` and `<Ui type="jsonui">`. */
const JSONUI_ROOT_ATTRIBUTES = [
  {
    name: 'target',
    detail: 'Target screen / control name (defaults to the file name)',
  },
  {
    name: 'availability',
    detail: 'How the document is mounted',
    values: ['file', 'server_form', 'hud', 'vanilla', 'none'],
  },
  { name: 'avail', detail: 'Alias of availability' },
  { name: 'use', detail: 'Alias of availability' },
  {
    name: 'namespace',
    detail: 'JSON UI namespace (defaults to the file name)',
  },
  { name: 'ns', detail: 'Alias of namespace' },
  { name: 'id', detail: 'Root control id' },
  { name: 'element-type', detail: 'Root control type (default: screen)' },
  { name: 'control-type', detail: 'Alias of element-type' },
  { name: 'file', detail: 'Also dump the raw JSON document to this path' },
  { name: 'save', detail: 'Alias of file' },
];

/**
 * `/document/attr/*` properties that matter for most controls. Templates may
 * use anything the client understands; these are the ones worth completing.
 */
const JSONUI_CONTROL_ATTRIBUTES = [
  { name: 'size', detail: 'Control size: [w, h] or "100%"/"default"' },
  { name: 'offset', detail: 'Offset from the anchor: [x, y]' },
  { name: 'anchor_from', detail: 'Source anchor, e.g. top_left / center' },
  { name: 'anchor_to', detail: 'Destination anchor' },
  { name: 'layer', detail: 'Draw order inside the parent' },
  { name: 'visible', detail: 'Visibility flag' },
  { name: 'enabled', detail: 'Whether the control reacts to input' },
  {
    name: 'clips_children',
    detail: 'Clip child controls to this control bounds',
  },
  { name: 'alpha', detail: 'Opacity multiplier' },
  { name: 'propagate_alpha', detail: 'Apply alpha to children' },
  { name: 'max_size', detail: 'Upper bound for inherited size' },
  { name: 'min_size', detail: 'Lower bound for inherited size' },
  {
    name: 'bindings',
    detail:
      'Binding list — build these with Molang.bind from @mbler/mcx-component',
  },
  { name: 'controls', detail: 'Child controls (inline array)' },
  { name: 'variables', detail: 'Local $variables for this control' },
];

/** Text-bearing controls add these on top of the control properties. */
const JSONUI_TEXT_ATTRIBUTES = [
  { name: 'text', detail: 'Displayed text, or a #binding / $variable' },
  { name: 'color', detail: 'Text color, e.g. [1, 1, 1]' },
  {
    name: 'font_type',
    detail: 'Font: default / smooth / runes / MinecraftTen',
  },
  { name: 'font_scale_factor', detail: 'Text scale multiplier' },
  { name: 'shadow', detail: 'Draw a drop shadow' },
  { name: 'localize', detail: 'Treat text as a translation key' },
  { name: 'text_alignment', detail: 'left / center / right' },
  { name: 'line_padding', detail: 'Extra spacing between wrapped lines' },
];

const TEXT_CONTROLS = ['label', 'button', 'toggle'];

/** Controls whose names are unique to JSON UI, so contributing attributes is safe. */
const JSONUI_ONLY_CONTROLS = [
  'image',
  'panel',
  'stack_panel',
  'grid',
  'edit_box',
  'scroll_view',
  'collection',
  'custom',
  'factory',
  'screen',
];

/** Containers that accept child controls. */
const CONTAINER_CONTROLS = [
  'panel',
  'stack_panel',
  'grid',
  'scroll_view',
  'collection',
  'custom',
  'factory',
  'screen',
];

/**
 * Controls offered inside `<JsonUi>`; anything else can still be typed.
 *
 * Names that also exist as classic `<Ui>` leaves (`label`, `button`, `input`,
 * `toggle`, `slider`, `dropdown`) are listed here for tag completion but do
 * not contribute attributes: the language server merges contributions by tag
 * name, and adding `bindings` / `size` to `button` would pollute the classic
 * CustomForm completion.
 */
const JSONUI_CONTROLS = [
  'label',
  'image',
  'panel',
  'stack_panel',
  'grid',
  'button',
  'toggle',
  'slider',
  'dropdown',
  'input',
  'edit_box',
  'scroll_view',
  'collection',
  'custom',
  'factory',
  'screen',
];

const JSONUI_ATTRIBUTE_SETS: Record<
  string,
  { name: string; detail?: string }[]
> = {
  'jsonui-root': JSONUI_ROOT_ATTRIBUTES,
  'jsonui-control': JSONUI_CONTROL_ATTRIBUTES,
  'jsonui-text': JSONUI_TEXT_ATTRIBUTES,
};

/**
 * Completion data contributed to the MCX language server: `<JsonUi>` as a root
 * tag, `type="jsonui"` plus the JSON UI attributes on `<Ui>`, and the control
 * tags a JSON UI document is made of.
 */
export const jsonuiCompletion: McxCompletionContribution = {
  name: '@mbler/mcx-plugin-jsonui',
  rootTags: ['JsonUi'],
  attributeSets: JSONUI_ATTRIBUTE_SETS,
  tags: [
    {
      name: 'JsonUi',
      detail: 'JSON UI document',
      container: true,
      extends: ['jsonui-root', 'jsonui-control'],
      children: JSONUI_CONTROLS,
      documentation:
        'Compiles to a JSON UI resource file. Availability decides where the document is mounted (file / server_form / hud / vanilla / none).',
    },
    {
      name: 'Ui',
      attributes: [
        {
          name: 'type',
          detail: 'Ui kind — `jsonui` compiles to JSON UI resources',
          values: ['jsonui'],
        },
        ...JSONUI_ROOT_ATTRIBUTES,
      ],
    },
    ...JSONUI_ONLY_CONTROLS.map(name => ({
      name,
      detail: CONTAINER_CONTROLS.includes(name)
        ? 'JSON UI container'
        : 'JSON UI control',
      ...(CONTAINER_CONTROLS.includes(name)
        ? { container: true, children: JSONUI_CONTROLS }
        : {}),
      extends: TEXT_CONTROLS.includes(name)
        ? ['jsonui-control', 'jsonui-text']
        : ['jsonui-control'],
    })),
  ],
};
