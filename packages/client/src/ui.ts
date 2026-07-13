import type { MCXCtx } from '@mbler/mcx-types';
import type { MCXUIOpt } from './types';
import type { Player } from '@minecraft/server';
import * as typesPkg from '@mbler/mcx-types';
import {
  ObservableString,
  ObservableBoolean,
  ObservableNumber,
  type ActionFormResponse,
  type MessageFormData,
  type MessageFormResponse,
  type ModalFormResponse,
} from '@minecraft/server-ui';
import { Ref } from './ref';

type SetupRecord = Record<string, unknown>;
type LayoutFn = (ctx: unknown[]) => unknown;

function toObs(val: unknown): ObservableString | ObservableBoolean | ObservableNumber | undefined {
  if (val instanceof Ref) return val.__obs;
  if (val instanceof ObservableString || val instanceof ObservableBoolean || val instanceof ObservableNumber) return val;
  return undefined;
}

function refToObsOrWarn(
  val: unknown,
  expectedType: 'string' | 'boolean' | 'number',
  paramName: string,
): ObservableString | ObservableBoolean | ObservableNumber | undefined {
  if (!(val instanceof Ref)) return val as undefined;
  const obs = val.__obs;
  const actual = typeof val.value;
  if (actual !== expectedType) {
    console.warn(`[mcx ui]: ref "${paramName}" is ${actual}, expected ${expectedType} — converting`);
  }
  if (expectedType === 'string') return obs instanceof ObservableString ? obs : new ObservableString(String(val.value));
  if (expectedType === 'boolean') return obs instanceof ObservableBoolean ? obs : new ObservableBoolean(Boolean(val.value));
  return obs instanceof ObservableNumber ? obs : new ObservableNumber(Number(val.value));
}

function buildOpts(item: LayoutItem & { _loopSetup?: SetupRecord }, ctx: unknown[]): Record<string, unknown> {
  const opts: Record<string, unknown> = {};
  const p = item.params;
  if (p.tip) opts.tooltip = String(p.tip(ctx));
  if (p.disabled) opts.disabled = Boolean(p.disabled(ctx));
  if (p.visible) opts.visible = Boolean(p.visible(ctx));
  if (p.description) opts.description = String(p.description(ctx));
  return opts;
}

function buildOptsMaybe(item: LayoutItem & { _loopSetup?: SetupRecord }, ctx: unknown[]): Record<string, unknown> | undefined {
  const opts = buildOpts(item, ctx);
  return Object.keys(opts).length ? opts : undefined;
}

interface LayoutItem {
  type: string;
  params: Record<string, LayoutFn>;
  content: LayoutFn;
  for?: { variable: string; useSetup: string };
  if?: { useSetup: string };
}

export class ui implements typesPkg.ui {
  private _mcUI: typeof import('@minecraft/server-ui');
  private _mcxSrcFn: (
    ctx: MCXCtx & { $prop?: Record<string, unknown> },
  ) => SetupRecord;
  private _mode: 'form' | 'ui';
  private _UI: MCXUIOpt['use'];
  private _layout: LayoutItem[];
  private _uiType!: 'modal' | 'action' | 'message';
  private _startupDone = false;

  constructor(
    UIConfig: MCXUIOpt,
    mcxSrcFn: (
      ctx: MCXCtx & { $prop?: Record<string, unknown> },
    ) => SetupRecord,
  ) {
    this._mcxSrcFn = mcxSrcFn;
    this._mcUI = UIConfig.UI;
    this._mode = UIConfig.mode || 'form';
    this._UI = UIConfig.use!;
    this._layout = (UIConfig.layout || []) as unknown as LayoutItem[];
    if (!UIConfig.UI) {
      throw new Error('[mcx runtime]: UI module is required');
    }
  }

  async show(
    player: Player,
    prop?: Record<string, unknown>,
  ): Promise<void> {
    const setup = this._mcxSrcFn({ $prop: prop || {} });

    // onStartup — once
    if (!this._startupDone) {
      const startupFn = setup.__mcx_startup as (() => void) | undefined;
      if (typeof startupFn === 'function') startupFn();
      this._startupDone = true;
    }

    // onMounted — every show
    const mountedFn = setup.__mcx_mounted as (() => void) | undefined;
    if (typeof mountedFn === 'function') mountedFn();

    if (this._mode === 'ui') {
      await this._showCustomForm(player, setup);
    } else {
      await this._showForm(player, setup);
    }
  }

  // ---- CustomForm mode (Ui) ----
  private async _showCustomForm(player: Player, setup: SetupRecord) {
    const CFCtor = this._mcUI.CustomForm;
    if (typeof CFCtor !== 'function') {
      throw new Error('[mcx runtime]: CustomForm not available');
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form: any = new CFCtor(player, '');
    const items = this._resolveItems(setup);
    const refs: Ref[] = [];

    for (const item of items) {
      const type = item.type;
      const s = item._loopSetup || setup;
      const ctx = [s];
      const content = item.content(ctx);

      // Resolve label: Ref → read .value, otherwise string
      let label: string;
      if (content instanceof Ref) {
        label = String(content.value);
        refs.push(content);
      } else {
        label = String(content ?? '');
      }

      if (type === 'title') continue;

      // Resolve :value binding with type conversion
      const rawVal = item.params.value ? item.params.value(ctx) : undefined;

      if (type === 'input' || type === 'textField') {
        const obs = refToObsOrWarn(rawVal, 'string', 'input value');
        const ph = item.params.placeholderText ? String(item.params.placeholderText(ctx)) : '';
        const opts = buildOpts(item, ctx);
        if (ph) opts.placeholder = ph;
        form.textField(label, obs, Object.keys(opts).length ? opts : undefined);
      } else if (type === 'toggle') {
        const obs = refToObsOrWarn(rawVal, 'boolean', 'toggle value');
        form.toggle(label, obs, buildOptsMaybe(item, ctx));
      } else if (type === 'dropdown') {
        const obs = refToObsOrWarn(rawVal, 'number', 'dropdown value');
        const raw = item.params.option ? item.params.option(ctx) : [];
        const items = Array.isArray(raw)
          ? raw
          : String(raw).split(',').map((v: string, i: number) => ({ label: v.trim(), value: i }));
        form.dropdown(label, obs, items, buildOptsMaybe(item, ctx));
      } else if (type === 'slider') {
        const obs = refToObsOrWarn(rawVal, 'number', 'slider value');
        const min = Number(item.params.min ? item.params.min(ctx) : 0);
        const max = Number(item.params.max ? item.params.max(ctx) : 100);
        form.slider(label, obs, min, max, buildOptsMaybe(item, ctx));
      } else if (type === 'button') {
        const handler = item.params.click ? item.params.click(ctx) : undefined;
        const onClick = typeof handler === 'function' ? handler : () => {};
        form.button(label, onClick, buildOptsMaybe(item, ctx));
      } else if (type === 'label' || type === 'body') {
        form.label(label, buildOptsMaybe(item, ctx));
      } else if (type === 'header') {
        form.header(label, buildOptsMaybe(item, ctx));
      } else if (type === 'divider') {
        form.divider(buildOptsMaybe(item, ctx));
      } else if (type === 'spacer') {
        form.spacer(buildOptsMaybe(item, ctx));
      } else if (type === 'close-button') {
        form.closeButton();
      }
    }

    // Collect all ref watchers for cleanup
    const cleanup = () => {
      for (const r of refs) r.__cleanup();
    };

    try {
      await form.show();
    } finally {
      cleanup();
    }
  }

  // ---- Form mode (legacy FormData) ----
  private async _showForm(player: Player, setup: SetupRecord) {
    const items = this._resolveItems(setup);

    // Build click handler map
    const clickHandlers: Map<number, Function> = new Map();

    const ui = new this._UI!();
    if (!this._uiType) {
      if (ui instanceof this._mcUI.ModalFormData) this._uiType = 'modal';
      else if (ui instanceof this._mcUI.ActionFormData) this._uiType = 'action';
      else if (ui instanceof this._mcUI.MessageFormData) this._uiType = 'message';
      else throw new Error('[mcx runtime]: Invalid form type');
    }

    let MsgFormUse = 0;
    let ActionBtnUse = 0;

    for (const item of items) {
      const s = item._loopSetup || setup;
      const ctx = [s];
      const label = String(item.content(ctx) ?? '');

      if (this._uiType === 'modal') {
        const f = ui as InstanceType<typeof this._mcUI.ModalFormData>;
        if (item.type === 'input') {
          const def = item.params.default ? String(item.params.default(ctx)) : '';
          const ph = item.params.placeholderText ? String(item.params.placeholderText(ctx)) : '';
          const tip = item.params.tip ? String(item.params.tip(ctx)) : undefined;
          f.textField(label, ph, { defaultValue: def, tooltip: tip! });
        } else if (item.type === 'slider') {
          const min = Number(item.params.min ? item.params.min(ctx) : 0);
          const max = Number(item.params.max ? item.params.max(ctx) : 10);
          const tip = item.params.tip ? String(item.params.tip(ctx)) : undefined;
          f.slider(label, min, max, { tooltip: { text: tip || '' } });
        } else if (item.type === 'toggle') {
          const def = item.params.default ? Boolean(item.params.default(ctx)) : false;
          f.toggle(label, { defaultValue: def });
        } else if (item.type === 'dropdown') {
          const opt = item.params.option ? String(item.params.option(ctx)) : '';
          f.dropdown(label, opt.split(','));
        } else if (item.type === 'submit') {
          f.submitButton(label);
          if (item.params.click) {
            const handler = item.params.click(ctx);
            if (typeof handler === 'function') clickHandlers.set(0, handler);
          }
        } else if (item.type === 'body') {
          f.label(label);
        } else if (item.type === 'divider') {
          f.divider();
        }
      } else if (this._uiType === 'action') {
        const f = ui as InstanceType<typeof this._mcUI.ActionFormData>;
        if (item.type === 'button') {
          const img = item.params.img ? String(item.params.img(ctx)) : undefined;
          f.button(label, img || void 0);
          if (item.params.click) {
            const handler = item.params.click(ctx);
            if (typeof handler === 'function') {
              clickHandlers.set(ActionBtnUse, handler);
            }
          }
          ActionBtnUse++;
        } else if (item.type === 'body') {
          f.label(label);
        } else if (item.type === 'divider') {
          f.divider();
        }
      } else if (this._uiType === 'message') {
        const f = ui as InstanceType<typeof this._mcUI.MessageFormData>;
        if (item.type === 'button-m') {
          if (MsgFormUse === 0) f.button1(label);
          else if (MsgFormUse === 1) f.button2(label);
          else throw new Error('[mcx runtime]: MessageFormData only supports two buttons');
          if (item.params.click) {
            const handler = item.params.click(ctx);
            if (typeof handler === 'function') clickHandlers.set(MsgFormUse, handler);
          }
          MsgFormUse++;
        }
      }

      if (item.type === 'title') {
        ui.title(label);
      }
    }

    const formResponse = await ui.show(player);
    if (formResponse.canceled) return;

    if (this._uiType === 'action') {
      const idx = (formResponse as ActionFormResponse).selection;
      if (idx !== undefined) {
        const handler = clickHandlers.get(idx);
        if (handler) handler(formResponse, player);
      }
    } else if (this._uiType === 'message') {
      const idx = (formResponse as MessageFormResponse).selection;
      if (idx !== undefined) {
        const handler = clickHandlers.get(idx);
        if (handler) handler(formResponse, player);
      }
    } else if (this._uiType === 'modal') {
      const handler = clickHandlers.get(0);
      if (handler) handler(formResponse, player);
    }
  }

  // ---- Shared: expand for/if, return items with loop setup baked in ----
  private _resolveItems(
    setup: SetupRecord,
  ): (LayoutItem & { _loopSetup?: SetupRecord })[] {
    const resolved: (LayoutItem & { _loopSetup?: SetupRecord })[] = [];

    for (const item of this._layout) {
      if (item.for) {
        const arr = setup[item.for.useSetup];
        if (!Array.isArray(arr)) continue;
        const varName = item.for.variable;
        for (const element of arr) {
          const loopSetup = { ...setup, [varName]: element };
          if (item.if) {
            const cond = item.if.useSetup;
            const condVal = cond === varName ? element : loopSetup[cond];
            if (!condVal) continue;
          }
          resolved.push({ ...item, _loopSetup: loopSetup });
        }
      } else {
        if (item.if) {
          const val = setup[item.if.useSetup];
          if (!val) continue;
        }
        resolved.push({ ...item, _loopSetup: setup });
      }
    }
    return resolved;
  }
}

export function showForm(
  formMcx: typesPkg.MCXFile<'ui'>,
  player: Player,
  prop?: Record<string, unknown>,
) {
  return formMcx.app.ui.show(player, prop);
}
