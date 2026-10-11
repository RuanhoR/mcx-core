/**
 * Stateless validation for JSON UI definitions.
 *
 * Reference: https://mcbeui.netlify.app/
 */

import type {
  UIBinding,
  UIElement,
  UINamedElement,
  UIVec2,
} from './types';

const ANCHORS = new Set([
  'undefined',
  'left',
  'right',
  'top',
  'bottom',
  'center',
  'middle',
]);

const assertString = (value: unknown, path: string): void => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`[compile component]: ui: ${path} must be a non-empty string`);
  }
};

const assertBoolean = (value: unknown, path: string): void => {
  if (typeof value !== 'boolean') {
    throw new Error(`[compile component]: ui: ${path} must be a boolean`);
  }
};

const assertNumber = (value: unknown, path: string): void => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`[compile component]: ui: ${path} must be a number`);
  }
};

const assertAlpha = (value: unknown, path: string): void => {
  assertNumber(value, path);
  const alpha = value as number;
  if (alpha < 0 || alpha > 1) {
    throw new Error(
      `[compile component]: ui: ${path} must be between 0.0 and 1.0, got ${alpha}`,
    );
  }
};

const assertVec2 = (value: unknown, path: string): void => {
  if (
    !Array.isArray(value) ||
    value.length !== 2 ||
    !value.every(
      entry => typeof entry === 'number' || typeof entry === 'string',
    )
  ) {
    throw new Error(
      `[compile component]: ui: ${path} must be [x, y] of numbers or percentage strings`,
    );
  }
};

const assertVec3 = (value: unknown, path: string): void => {
  if (
    !Array.isArray(value) ||
    value.length !== 3 ||
    !value.every(entry => typeof entry === 'number' || typeof entry === 'string')
  ) {
    throw new Error(
      `[compile component]: ui: ${path} must be [r, g, b] of numbers or percentage strings`,
    );
  }
};

const assertBinding = (binding: UIBinding, path: string): void => {
  if (typeof binding !== 'object' || binding === null || Array.isArray(binding)) {
    throw new Error(`[compile component]: ui: ${path} must be an object`);
  }
  if (
    binding.binding_name !== undefined &&
    binding.source_control_name !== undefined
  ) {
    throw new Error(
      `[compile component]: ui: ${path} cannot set both binding_name and source_control_name`,
    );
  }
};

const LAYOUT_KEYS = [
  'anchor_from',
  'anchor_to',
  'offset',
  'size',
  'min_size',
  'max_size',
  'clip_offset',
  'grid_position',
] as const;

const BOOLEAN_KEYS = [
  'allow_clipping',
  'always_handle_pointer',
  'bilinear',
  'clip_pixelperfect',
  'clips_children',
  'consume_event',
  'default_focus_precedence',
  'disable_anim_fast_forward',
  'enabled',
  'enable_scissor_test',
  'focus_enabled',
  'font_scale_factor',
  'grayscale',
  'ignored',
  'jump_to_bottom_on_update',
  'keep_ratio',
  'locked_control',
  'modal',
  'preprocess',
  'prevent_touch_input',
  'propagate_alpha',
  'reset_property_bag',
  'scrollbar_touch_button',
  'selected',
  'shadow',
  'sound_defs_override',
  'tiled',
  'tts_ignore_count',
  'tts_skip_message',
  'virtual_keyboard_buffer_control',
  'visible',
] as const;

const NUMBER_KEYS = [
  'layer',
  'max_length',
  'nine_slice_buttom',
  'nine_slice_left',
  'nine_slice_right',
  'nine_slice_top',
  'slider_range',
  'slider_steps',
  'grid_item_template',
] as const;

const STRING_KEYS = [
  'animation_reset_name',
  'clip_state_change_event',
  'collection_index',
  'collection_name',
  'factory',
  'fill',
  'focus_change_down',
  'focus_change_left',
  'focus_change_right',
  'focus_change_up',
  'font_size',
  'font_type',
  'grid_dimension_binding',
  'grid_rescaling_type',
  'orientation',
  'place_holder_text',
  'renderer',
  'scroll_box_and_track_panel',
  'scroll_content',
  'scroll_speed',
  'scroll_view_port',
  'scrollbar_box',
  'scrollbar_track',
  'text',
  'text_alignment',
  'text_box_name',
  'texture',
  'tts_control_type_order_priority',
] as const;

/** Validates one element's documented property types, recursing into `controls`. */
export const assertUIElement = (
  element: UINamedElement,
  path: string,
): void => {
  if (typeof element !== 'object' || element === null || Array.isArray(element)) {
    throw new Error(`[compile component]: ui: ${path} must be an object`);
  }
  if (element.type !== undefined) {
    assertString(element.type, `${path}.type`);
  }
  for (const key of LAYOUT_KEYS) {
    if (key === 'anchor_from' || key === 'anchor_to') {
      const anchor = element[key];
      if (anchor !== undefined) {
        assertString(anchor, `${path}.${key}`);
        if (!ANCHORS.has(anchor)) {
          throw new Error(
            `[compile component]: ui: ${path}.${key} must be one of ${[...ANCHORS].join(', ')}`,
          );
        }
      }
      continue;
    }
    if (element[key] !== undefined) {
      assertVec2(element[key], `${path}.${key}`);
    }
  }
  if (element.alpha !== undefined) {
    assertAlpha(element.alpha, `${path}.alpha`);
  }
  if (element.color !== undefined) {
    assertVec3(element.color, `${path}.color`);
  }
  for (const key of BOOLEAN_KEYS) {
    if (element[key] !== undefined) {
      assertBoolean(element[key], `${path}.${key}`);
    }
  }
  for (const key of NUMBER_KEYS) {
    if (element[key] !== undefined) {
      assertNumber(element[key], `${path}.${key}`);
    }
  }
  for (const key of STRING_KEYS) {
    if (element[key] !== undefined) {
      assertString(element[key], `${path}.${key}`);
    }
  }
  if (element.anims !== undefined && !Array.isArray(element.anims)) {
    throw new Error(`[compile component]: ui: ${path}.anims must be an array`);
  }
  if (element.factory !== undefined) {
    if (typeof element.factory !== 'object' || element.factory === null) {
      throw new Error(`[compile component]: ui: ${path}.factory must be an object`);
    }
  }
  if (element.variables !== undefined) {
    const vars = element.variables;
    const isObject =
      typeof vars === 'object' && vars !== null && !Array.isArray(vars);
    if (!isObject && !Array.isArray(vars)) {
      throw new Error(
        `[compile component]: ui: ${path}.variables must be an object or array`,
      );
    }
  }
  if (element.bindings !== undefined) {
    if (!Array.isArray(element.bindings)) {
      throw new Error(`[compile component]: ui: ${path}.bindings must be an array`);
    }
    element.bindings.forEach((binding, index) =>
      assertBinding(binding, `${path}.bindings[${index}]`),
    );
  }
  if (element.button_mappings !== undefined) {
    if (!Array.isArray(element.button_mappings)) {
      throw new Error(
        `[compile component]: ui: ${path}.button_mappings must be an array`,
      );
    }
  }
  if (element.controls !== undefined) {
    if (!Array.isArray(element.controls)) {
      throw new Error(`[compile component]: ui: ${path}.controls must be an array`);
    }
    element.controls.forEach((child: UIElement, index: number) =>
      assertUIElement(child as UINamedElement, `${path}.controls[${index}]`),
    );
  }
};

/** The document root of a UI screen is `{ namespace, ...elements }`. */
export const assertUIScreen = (
  screen: Record<string, unknown>,
): void => {
  if (typeof screen !== 'object' || screen === null || Array.isArray(screen)) {
    throw new Error('[compile component]: ui: screen must be an object');
  }
  const namespace = screen.namespace;
  if (namespace === undefined) {
    throw new Error('[compile component]: ui: screen requires a namespace');
  }
  assertString(namespace, 'namespace');
  for (const [name, element] of Object.entries(screen)) {
    if (name === 'namespace') continue;
    assertUIElement(element as UINamedElement, name);
  }
};

/** `_global_variables.json` keys must be `$`-prefixed. */
export const assertUIGlobalVariables = (
  variables: Record<string, unknown>,
): void => {
  if (typeof variables !== 'object' || variables === null || Array.isArray(variables)) {
    throw new Error(
      '[compile component]: ui: global variables must be an object',
    );
  }
  for (const [name, value] of Object.entries(variables)) {
    if (!name.startsWith('$')) {
      throw new Error(
        `[compile component]: ui: global variable "${name}" must start with $`,
      );
    }
    const isColor =
      Array.isArray(value) &&
      (value.length === 3 || value.length === 4) &&
      value.every(entry => typeof entry === 'number');
    if (isColor) {
      value.forEach((entry, index) => {
        const component = entry as number;
        if (component < 0 || component > 1) {
          throw new Error(
            `[compile component]: ui: ${name}[${index}] must be between 0.0 and 1.0`,
          );
        }
      });
    }
  }
};

export type { UIVec2 };
