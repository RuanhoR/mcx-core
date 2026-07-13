import type { MCXCtx } from '@mbler/mcx-types';
import type { MCXUIOpt } from './types';
import type { Player } from '@minecraft/server';
import * as typesPkg from '@mbler/mcx-types';
import type {
  ActionFormResponse,
  MessageFormData,
  MessageFormResponse,
  ModalFormResponse,
} from '@minecraft/server-ui';

type SetupRecord = Record<string, unknown>;
type LayoutFn = (ctx: unknown[]) => unknown;

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
    const form = new (this._mcUI as any).CustomForm(player, '');

    let MsgFormUse = 0;
    const clickHandlers: Map<number, Function> = new Map();

    const items = this._resolveItems(setup);

    for (const item of items) {
      const type = item.type;
      const s = item._loopSetup || setup;
      const ctx = [s];
      const content = item.content(ctx);
      const label = String(content ?? '');

      if (type === 'title') {
        continue;
      }

      if (type === 'input' || type === 'textField') {
        const valueObs = item.params.value ? item.params.value(ctx) : undefined;
        const placeholder = item.params.placeholderText
          ? String(item.params.placeholderText(ctx))
          : '';
        const opts: any = {};
        if (placeholder) opts.placeholder = placeholder;
        if (item.params.tip) opts.tooltip = String(item.params.tip(ctx));
        if (item.params.disabled) opts.disabled = Boolean(item.params.disabled(ctx));
        if (item.params.visible) opts.visible = Boolean(item.params.visible(ctx));
        if (item.params.description) opts.description = String(item.params.description(ctx));
        if (valueObs !== undefined) {
          form.textField(label, valueObs, Object.keys(opts).length ? opts : undefined);
        } else {
          form.textField(label, valueObs, Object.keys(opts).length ? opts : undefined);
        }
      } else if (type === 'toggle') {
        const valueObs = item.params.value ? item.params.value(ctx) : undefined;
        const opts: any = {};
        if (item.params.tip) opts.tooltip = String(item.params.tip(ctx));
        if (item.params.disabled) opts.disabled = Boolean(item.params.disabled(ctx));
        if (item.params.visible) opts.visible = Boolean(item.params.visible(ctx));
        if (item.params.description) opts.description = String(item.params.description(ctx));
        form.toggle(label, valueObs, Object.keys(opts).length ? opts : undefined);
      } else if (type === 'dropdown') {
        const valueObs = item.params.value ? item.params.value(ctx) : undefined;
        const optionsRaw = item.params.option ? item.params.option(ctx) : [];
        const items = Array.isArray(optionsRaw)
          ? optionsRaw
          : String(optionsRaw).split(',').map((v: string, i: number) => ({
              label: v.trim(),
              value: i,
            }));
        const opts: any = {};
        if (item.params.tip) opts.tooltip = String(item.params.tip(ctx));
        if (item.params.disabled) opts.disabled = Boolean(item.params.disabled(ctx));
        if (item.params.visible) opts.visible = Boolean(item.params.visible(ctx));
        if (item.params.description) opts.description = String(item.params.description(ctx));
        form.dropdown(label, valueObs, items, Object.keys(opts).length ? opts : undefined);
      } else if (type === 'slider') {
        const valueObs = item.params.value ? item.params.value(ctx) : undefined;
        const min = Number(item.params.min ? item.params.min(ctx) : 0);
        const max = Number(item.params.max ? item.params.max(ctx) : 100);
        const opts: any = {};
        if (item.params.tip) opts.tooltip = String(item.params.tip(ctx));
        if (item.params.step) opts.step = Number(item.params.step(ctx));
        if (item.params.disabled) opts.disabled = Boolean(item.params.disabled(ctx));
        if (item.params.visible) opts.visible = Boolean(item.params.visible(ctx));
        if (item.params.description) opts.description = String(item.params.description(ctx));
        form.slider(label, valueObs, min, max, Object.keys(opts).length ? opts : undefined);
      } else if (type === 'button') {
        const handler = item.params.click ? item.params.click(ctx) : undefined;
        const onClick = typeof handler === 'function' ? handler : () => {};
        const opts: any = {};
        if (item.params.disabled) opts.disabled = Boolean(item.params.disabled(ctx));
        if (item.params.visible) opts.visible = Boolean(item.params.visible(ctx));
        if (item.params.tip) opts.tooltip = String(item.params.tip(ctx));
        form.button(label, onClick, Object.keys(opts).length ? opts : undefined);
      } else if (type === 'label' || type === 'body') {
        const opts: any = {};
        if (item.params.visible) opts.visible = Boolean(item.params.visible(ctx));
        form.label(label, Object.keys(opts).length ? opts : undefined);
      } else if (type === 'header') {
        const opts: any = {};
        if (item.params.visible) opts.visible = Boolean(item.params.visible(ctx));
        form.header(label, Object.keys(opts).length ? opts : undefined);
      } else if (type === 'divider') {
        const opts: any = {};
        if (item.params.visible) opts.visible = Boolean(item.params.visible(ctx));
        form.divider(Object.keys(opts).length ? opts : undefined);
      } else if (type === 'spacer') {
        const opts: any = {};
        if (item.params.visible) opts.visible = Boolean(item.params.visible(ctx));
        form.spacer(Object.keys(opts).length ? opts : undefined);
      } else if (type === 'close-button') {
        form.closeButton();
      }
    }

    await form.show();
  }

  // ---- Form mode (legacy FormData) ----
  private async _showForm(player: Player, setup: SetupRecord) {
    const items = this._resolveItems(setup);

    // Build click handler map
    const clickHandlers: Map<number, Function> = new Map();

    const ui = new this._UI();
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
          f.textField(label, ph, { defaultValue: def, tooltip: tip });
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
