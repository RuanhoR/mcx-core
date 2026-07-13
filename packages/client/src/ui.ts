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
import { Ref, Computation } from './ref';

type SetupRecord = Record<string, unknown>;
type LayoutFn = (ctx: unknown[]) => unknown;

function toObs(val: unknown): ObservableString | ObservableBoolean | ObservableNumber | undefined {
  if (val instanceof Ref) return val.__obs;
  if (val instanceof Computation) {
    const v = val.value;
    if (typeof v === 'string') return new ObservableString(v);
    if (typeof v === 'boolean') return new ObservableBoolean(v);
    if (typeof v === 'number') return new ObservableNumber(v);
    return undefined;
  }
  if (val instanceof ObservableString || val instanceof ObservableBoolean || val instanceof ObservableNumber) return val;
  return undefined;
}

function refToObsOrWarn(
  val: unknown,
  expectedType: 'string' | 'boolean' | 'number',
  paramName: string,
): ObservableString | ObservableBoolean | ObservableNumber | undefined {
  if (val instanceof Computation) {
    const v = val.value;
    if (typeof v !== expectedType) {
      console.warn(`[mcx ui]: computation "${paramName}" is ${typeof v}, expected ${expectedType} — converting`);
    }
    if (expectedType === 'string') return new ObservableString(String(v));
    if (expectedType === 'boolean') return new ObservableBoolean(Boolean(v));
    return new ObservableNumber(Number(v));
  }
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

function conditionToObs(val: unknown): ObservableBoolean {
  if (val instanceof Computation) {
    const obs = new ObservableBoolean(Boolean(val.value));
    val.subscribeAll([], () => obs.setData(Boolean(val.value)));
    return obs;
  }
  if (val instanceof Ref) return val.__obs instanceof ObservableBoolean ? val.__obs : new ObservableBoolean(Boolean(val.value));
  return new ObservableBoolean(Boolean(val));
}

function buildOpts(item: LayoutItem & { _loopSetup?: SetupRecord }, ctx: unknown[]): Record<string, unknown> {
  const opts: Record<string, unknown> = {};
  const p = item.params;
  if (p.tip) opts.tooltip = String(p.tip(ctx));
  if (p.disabled) {
    const v = p.disabled(ctx);
    opts.disabled = v instanceof Computation ? Boolean(v.value) : Boolean(v);
  }
  if (p.visible) {
    const v = p.visible(ctx);
    opts.visible = v instanceof Computation ? Boolean(v.value) : Boolean(v);
  }
  if (p.description) opts.description = String(p.description(ctx));
  return opts;
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
    const computations: Computation[] = [];
    const items = this._resolveItems(setup, true);

    for (const item of items) {
      const type = item.type;
      const s = item._loopSetup || setup;
      const ctx = [s];

      // === Resolve content (reactive) ===
      const rawContent = item.content(ctx);
      let label: string;
      if (rawContent instanceof Computation) {
        label = String(rawContent.value ?? '');
        rawContent.subscribeAll(ctx, () => {
          // Computation re-evaluates on ref change
        });
        computations.push(rawContent);
      } else if (rawContent instanceof Ref) {
        label = String(rawContent.value);
      } else {
        label = String(rawContent ?? '');
      }

      if (type === 'title') continue;

      // === Resolve if condition (reactive) ===
      const ifObs = item.if ? conditionToObs(setup[item.if.useSetup]) : undefined;

      // === Resolve :value binding ===
      const rawVal = item.params.value ? item.params.value(ctx) : undefined;

      // === Resolve for-loop (reactive pre-allocate) ===
      if (item.for && !item._loopSetup) {
        const source = setup[item.for.useSetup];
        if (Array.isArray(source)) {
          const varName = item.for.variable;
          for (let i = 0; i < source.length; i++) {
            const loopSetup = { ...setup, [varName]: source[i] };
            const loopCtx = [loopSetup];
            const loopContent = item.content(loopCtx);
            let loopLabel: string;
            if (loopContent instanceof Computation) {
              loopLabel = String(loopContent.value ?? '');
              loopContent.subscribeAll(loopCtx, () => {});
              computations.push(loopContent);
            } else if (loopContent instanceof Ref) {
              loopLabel = String(loopContent.value);
            } else {
              loopLabel = String(loopContent ?? '');
            }
            const slotObs = refToObsOrWarn(
              item.params.value ? item.params.value(loopCtx) : undefined,
              'string',
              `${varName}[${i}]`,
            );
            const slotOpts: Record<string, unknown> = {};
            slotOpts.visible = new ObservableBoolean(true);
            form.textField(loopLabel, slotObs, slotOpts);
          }
        }
        continue;
      }

      // === Add element ===
      const opts = buildOpts(item, ctx);
      if (ifObs) opts.visible = ifObs;

      if (type === 'input' || type === 'textField') {
        const obs = refToObsOrWarn(rawVal, 'string', 'input value');
        const ph = item.params.placeholderText ? String(item.params.placeholderText(ctx)) : '';
        if (ph) opts.placeholder = ph;
        form.textField(label, obs, Object.keys(opts).length ? opts : undefined);
      } else if (type === 'toggle') {
        const obs = refToObsOrWarn(rawVal, 'boolean', 'toggle value');
        form.toggle(label, obs, Object.keys(opts).length ? opts : undefined);
      } else if (type === 'dropdown') {
        const obs = refToObsOrWarn(rawVal, 'number', 'dropdown value');
        const raw = item.params.option ? item.params.option(ctx) : [];
        const items = Array.isArray(raw)
          ? raw
          : String(raw).split(',').map((v: string, i: number) => ({ label: v.trim(), value: i }));
        form.dropdown(label, obs, items, Object.keys(opts).length ? opts : undefined);
      } else if (type === 'slider') {
        const obs = refToObsOrWarn(rawVal, 'number', 'slider value');
        const min = Number(item.params.min ? item.params.min(ctx) : 0);
        const max = Number(item.params.max ? item.params.max(ctx) : 100);
        form.slider(label, obs, min, max, Object.keys(opts).length ? opts : undefined);
      } else if (type === 'button') {
        const handler = item.params.click ? item.params.click(ctx) : undefined;
        const onClick = typeof handler === 'function' ? handler : () => {};
        form.button(label, onClick, Object.keys(opts).length ? opts : undefined);
      } else if (type === 'label' || type === 'body') {
        form.label(label, Object.keys(opts).length ? opts : undefined);
      } else if (type === 'header') {
        form.header(label, Object.keys(opts).length ? opts : undefined);
      } else if (type === 'divider') {
        form.divider(Object.keys(opts).length ? opts : undefined);
      } else if (type === 'spacer') {
        form.spacer(Object.keys(opts).length ? opts : undefined);
      } else if (type === 'close-button') {
        form.closeButton();
      }
    }

    // Cleanup all computations on form close
    try {
      await form.show();
    } finally {
      for (const c of computations) c.__cleanup();
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
    reactive = false,
  ): (LayoutItem & { _loopSetup?: SetupRecord })[] {
    const resolved: (LayoutItem & { _loopSetup?: SetupRecord })[] = [];

    for (const item of this._layout) {
      if (item.for) {
        if (reactive) {
          // In reactive mode, keep for-binding for runtime expansion
          resolved.push({ ...item, _loopSetup: setup });
        } else {
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
        }
      } else {
        if (item.if && !reactive) {
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
