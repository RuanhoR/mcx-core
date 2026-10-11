/**
 * JSON UI element definitions.
 *
 * References:
 * - https://learn.microsoft.com/en-us/minecraft/creator/reference/content/jsonuireference
 * - https://mcbeui.netlify.app/  (community reference, the enum values the
 *   generated MS tables leave blank)
 */

/** `type` — the control kinds Bedrock's UI system knows how to render. */
export type UIElementType =
  | 'screen'
  | 'panel'
  | 'stack_panel'
  | 'input_panel'
  | 'collection_panel'
  | 'label'
  | 'image'
  | 'button'
  | 'toggle'
  | 'dropdown'
  | 'slider'
  | 'slider_box'
  | 'edit_box'
  | 'scroll_view'
  | 'scroll_panel'
  | 'scroll_track'
  | 'scrollbar_box'
  | 'selection_wheel'
  | 'image_cycler'
  | 'text_cycler'
  | 'grid'
  | 'grid_page_indicator'
  | 'factory'
  | 'custom'
  | (string & {});

/** `anchor_from` / `anchor_to` */
export type UIAnchor =
  | 'undefined'
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'center'
  | 'middle'
  | (string & {});

/** `orientation` — layout direction for stack panels. */
export type UIOrientation =
  | 'horizontal'
  | 'vertical'
  | 'default'
  | (string & {});

/** `text_alignment` */
export type UITextAlignment = 'left' | 'center' | 'right' | (string & {});

/** `font_size` */
export type UIFontSize = 'huge' | 'large' | 'medium' | 'small' | 'tiny' | (string & {});

/** `font_type` */
export type UIFontType = 'minecraft' | 'mojanglazer' | (string & {});

/** `grid_rescaling_type` */
export type UIGridRescalingType =
  | 'none'
  | 'scale_to_fit'
  | 'scale_to_fit_with_centering'
  | (string & {});

/** `fill` — how an image fills its container. */
export type UIFill = 'scale' | 'crop' | 'repeat' | 'fit' | 'stretch' | (string & {});

/** `scroll_speed` */
export type UIScrollSpeed = 'slow' | 'normal' | 'fast' | (string & {});

/** `binding_type` */
export type UIBindingType = 'view' | 'property' | 'collection' | (string & {});

/** `binding_condition` */
export type UIBindingCondition =
  | 'always'
  | 'visible'
  | 'hidden'
  | 'not'
  | 'and'
  | 'or'
  | (string & {});

/** A `[x, y]` pair; each entry may also be a percentage string. */
export type UIVec2 = Array<number | string>;

/** `/document/attr/bindings` */
export interface UIBinding {
  binding_name?: string;
  binding_collection_name?: string;
  binding_name_override?: string;
  binding_type?: UIBindingType;
  binding_condition?: UIBindingCondition;
  source_control_name?: string;
  source_property_name?: string;
  target_property_name?: string;
  [key: string]: unknown;
}

/** `/document/attr/input` */
export interface UIInputRule {
  /** e.g. `"a"`, `"space"`, `"backspace"` */
  set?: string;
  add?: string;
  set_tooltip?: string;
  add_tooltip?: string;
  remove?: string;
  [key: string]: unknown;
}

/** `/document/attr/focus` */
export interface UIFocusRule {
  target?: string;
  clear?: boolean;
  [key: string]: unknown;
}

/** `/document/attr/sound` */
export interface UISoundRule {
  /** e.g. `"ui.button.click.press"`, or a `create_sound` block */
  sound?: string;
  create_sound?: Record<string, unknown>;
  volume?: number;
  pitch?: number;
  [key: string]: unknown;
}

/** `/document/attr/tts` */
export interface UITTSSettings {
  tts_control_type_order_priority?: string;
  tts_ignore_count?: boolean;
  tts_skip_message?: boolean;
  [key: string]: unknown;
}

/** `factory` — `/document/factory` */
export interface UIFactory {
  name?: string;
  control_name?: string;
  control_ids?: Record<string, string>;
  max_children_size?: number;
  factory_variables?: string[];
  [key: string]: unknown;
}

/** `variables` — `/document/var` */
export interface UIVariable {
  [key: string]: unknown;
}

/** `button_mappings` */
export interface UIButtonMapping {
  buttons?: string | string[];
  modifiers?: string | string[];
  set?: string | string[];
  add?: string | string[];
  remove?: string | string[];
  [key: string]: unknown;
}

/**
 * A JSON UI element. The MS reference documents ~90 properties; unknown keys
 * are preserved so control-specific attributes (`input_rules`, `focus_rules`,
 * `sound_defs`, `modifications`, `property_bag`, …) stay expressible.
 */
export interface UIElement {
  type?: UIElementType;
  controls?: UIElement[];
  /** child elements, keyed by name — the alternative to `controls` */
  [key: string]: unknown;
}

/** A named element, plus the layout / interaction / binding properties. */
export interface UINamedElement extends UIElement {
  allow_clipping?: boolean;
  alpha?: number;
  always_handle_pointer?: boolean;
  anchor_from?: UIAnchor;
  anchor_to?: UIAnchor;
  animation_reset_name?: string;
  anims?: string[];
  bilinear?: boolean;
  bindings?: UIBinding[];
  button_mappings?: UIButtonMapping[];
  clip_offset?: [number, number];
  clip_pixelperfect?: boolean;
  clip_state_change_event?: string;
  clips_children?: boolean;
  collection_index?: number;
  collection_name?: string;
  color?: Array<number | string>;
  consume_event?: boolean;
  default_focus_precedence?: boolean;
  disable_anim_fast_forward?: boolean;
  enabled?: boolean;
  enable_scissor_test?: boolean;
  factory?: UIFactory;
  fill?: UIFill;
  focus_change_down?: string;
  focus_change_left?: string;
  focus_change_right?: string;
  focus_change_up?: string;
  focus_change_toward_vertical?: string;
  focus_enabled?: boolean;
  focus_rules?: UIFocusRule;
  font_scale_factor?: boolean;
  font_size?: UIFontSize;
  font_type?: UIFontType;
  grayscale?: boolean;
  grid_dimension_binding?: string;
  grid_item_template?: number;
  grid_position?: [number, number];
  grid_rescaling_type?: UIGridRescalingType;
  ignored?: boolean;
  input_rules?: UIInputRule;
  jump_to_bottom_on_update?: boolean;
  keep_ratio?: boolean;
  layer?: number;
  locked_control?: boolean;
  max_length?: number;
  max_size?: UIVec2;
  min_size?: UIVec2;
  modifications?: Array<Record<string, unknown>>;
  modal?: boolean;
  nine_slice_buttom?: number;
  nine_slice_left?: number;
  nine_slice_right?: number;
  nine_slice_top?: number;
  offset?: UIVec2;
  orientation?: UIOrientation;
  place_holder_text?: string;
  preprocess?: boolean;
  prevent_touch_input?: boolean;
  property_bag?: Record<string, unknown>;
  propagate_alpha?: boolean;
  renderer?: string;
  reset_property_bag?: boolean;
  scroll_box_and_track_panel?: string;
  scroll_content?: string;
  scroll_speed?: UIScrollSpeed;
  scroll_view_port?: string;
  scrollbar_box?: string;
  scrollbar_touch_button?: boolean;
  scrollbar_track?: string;
  selected?: boolean;
  shadow?: boolean;
  size?: UIVec2;
  slider_range?: number;
  slider_select_on_hover?: string;
  slider_steps?: number;
  sound_defs?: UISoundRule;
  sound_defs_override?: boolean;
  text?: string;
  text_alignment?: UITextAlignment;
  text_box_name?: string;
  texture?: string;
  texture_id?: string;
  tiled?: boolean;
  tts_control_type_order_priority?: string;
  tts_ignore_count?: boolean;
  tts_skip_message?: boolean;
  variables?: UIVariable | Array<{ scope?: string; [k: string]: unknown }>;
  virtual_keyboard_buffer_control?: boolean;
  visible?: boolean;
}
