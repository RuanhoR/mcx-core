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
  CustomForm,
} from '@minecraft/server-ui';
import { Ref, Computation, unwrapValue } from './ref';

type SetupRecord = Record<string, unknown>;
type LayoutFn = (ctx: unknown[]) => unknown;

type ObsKind = 'string' | 'boolean' | 'number';

function obsKindOf(val: unknown): ObsKind | undefined {
  if (val instanceof ObservableString) return 'string';
  if (val instanceof ObservableBoolean) return 'boolean';
  if (val instanceof ObservableNumber) return 'number';
  return undefined;
}

function convertToObs(
  value: unknown,
  kind: ObsKind,
): ObservableString | ObservableBoolean | ObservableNumber {
  if (kind === 'string') return new ObservableString(String(value ?? ''));
  if (kind === 'boolean') return new ObservableBoolean(Boolean(value));
  return new ObservableNumber(Number(value));
}

interface ObsMap {
  string: ObservableString;
  boolean: ObservableBoolean;
  number: ObservableNumber;
}

function refToObsOrWarn<_T, T extends keyof ObsMap>(
  val: unknown,
  expectedType: T,
  paramName: string,
): ObsMap[T] | undefined {
  if (val instanceof Computation) {
    const v = val.value;
    if (typeof v !== expectedType) {
      console.warn(
        `[mcx ui]: computation "${paramName}" is ${typeof v}, expected ${expectedType} — converting`,
      );
    }
    return convertToObs(v, expectedType as ObsKind) as ObsMap[T];
  }
  // Raw observables (e.g. defineProp compile output) bind directly when the type matches
  const direct = obsKindOf(val);
  if (direct && direct === expectedType) return val as ObsMap[T];
  if (direct) {
    console.warn(
      `[mcx ui]: observable "${paramName}" is ${direct}, expected ${expectedType} — converting`,
    );
    return convertToObs(unwrapValue(val), expectedType as ObsKind) as ObsMap[T];
  }
  if (!(val instanceof Ref)) return val as undefined;
  const obs = val.__obs;
  const actual = typeof val.value;
  if (actual !== expectedType) {
    console.warn(
      `[mcx ui]: ref "${paramName}" is ${actual}, expected ${expectedType} — converting`,
    );
  }
  if (obsKindOf(obs) === expectedType) return obs as unknown as ObsMap[T];
  return convertToObs(unwrapValue(val), expectedType as ObsKind) as ObsMap[T];
}

function conditionToObs(val: unknown): ObservableBoolean {
  if (val instanceof Computation) {
    const obs = new ObservableBoolean(Boolean(val.value));
    val.subscribeAll([], () => obs.setData(Boolean(val.value)));
    return obs;
  }
  // Keep live links whenever possible instead of snapshotting once
  if (val instanceof ObservableBoolean) return val;
  if (val instanceof Ref && val.__obs instanceof ObservableBoolean)
    return val.__obs;
  const obs = new ObservableBoolean(Boolean(unwrapValue(val)));
  const mirror = () => obs.setData(Boolean(unwrapValue(val)));
  if (val instanceof Ref) {
    val.subscribe(mirror);
  } else if (
    val instanceof ObservableString ||
    val instanceof ObservableBoolean ||
    val instanceof ObservableNumber
  ) {
    val.subscribe(mirror);
  }
  return obs;
}

function callLayoutFn(fn: unknown, ctx: unknown[]): unknown {
  return typeof fn === 'function' ? (fn as LayoutFn)(ctx) : fn;
}

function buildOpts(
  item: LayoutItem & { _loopSetup?: SetupRecord },
  ctx: unknown[],
): Record<string, unknown> {
  const opts: Record<string, unknown> = {};
  const p = item.params;
  if (p.tip) opts.tooltip = String(unwrapValue(callLayoutFn(p.tip, ctx)) ?? '');
  if (p.disabled) {
    const v = callLayoutFn(p.disabled, ctx);
    opts.disabled =
      v instanceof Computation ? Boolean(v.value) : Boolean(unwrapValue(v));
  }
  if (p.visible) {
    const v = callLayoutFn(p.visible, ctx);
    opts.visible =
      v instanceof Computation ? Boolean(v.value) : Boolean(unwrapValue(v));
  }
  if (p.description)
    opts.description = String(
      unwrapValue(callLayoutFn(p.description, ctx)) ?? '',
    );
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
  private static _activeForms = new WeakMap<Player, CustomForm | null>();

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

  async show(player: Player, prop?: Record<string, unknown>): Promise<void> {
    // Close any existing form for this player first
    const existing = ui._activeForms.get(player);
    if (existing) {
      try {
        existing.close();
      } catch {
        /* ignore */
      }
      ui._activeForms.set(player, null);
      // Wait for the old form's show() promise to fully resolve
      // (its finally block also runs here via microtask queue)
      await Promise.resolve();
    }

    const rawSetup = this._mcxSrcFn({ $prop: prop || {} });
    const setup = { ...prop, ...rawSetup } as SetupRecord;

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
    const form = new CFCtor(player, '');
    ui._activeForms.set(player, form);
    const computations: Computation[] = [];
    const items = this._resolveItems(setup, true);

    for (const item of items) {
      const type = item.type;
      const s = item._loopSetup || setup;
      const ctx = [s];

      // === Resolve content ===
      const rawContent = callLayoutFn(item.content, ctx);
      let label: string;
      if (rawContent instanceof Computation) {
        label = String(unwrapValue(rawContent.value) ?? '');
        rawContent.subscribeAll(ctx, () => {});
        computations.push(rawContent);
      } else {
        label = String(unwrapValue(rawContent) ?? '');
      }

      if (type === 'title') {
        (form as unknown as { title: string }).title = label;
        continue;
      }

      // === Resolve for-loop (reactive pre-allocate) ===
      if (item.for && !item._loopSetup) {
        const source = setup[item.for.useSetup];
        if (Array.isArray(source)) {
          const varName = item.for.variable;
          for (let i = 0; i < source.length; i++) {
            const loopSetup = { ...setup, [varName]: source[i] };
            const loopCtx = [loopSetup];
            const loopContent = callLayoutFn(item.content, loopCtx);
            let loopLabel: string;
            if (loopContent instanceof Computation) {
              loopLabel = String(unwrapValue(loopContent.value) ?? '');
              loopContent.subscribeAll(loopCtx, () => {});
              computations.push(loopContent);
            } else {
              loopLabel = String(unwrapValue(loopContent) ?? '');
            }
            const loopRawVal = item.params.value
              ? callLayoutFn(item.params.value, loopCtx)
              : undefined;
            const loopOpts = buildOpts(item, loopCtx);
            if (item.if) {
              loopOpts.visible = conditionToObs(loopSetup[item.if.useSetup]);
            }
            this._addFormElement(
              form,
              type,
              loopLabel,
              loopRawVal,
              item,
              loopCtx,
              loopOpts,
              player,
            );
          }
        }
        continue;
      }

      // === Resolve if condition (reactive) ===
      const ifObs = item.if
        ? conditionToObs(setup[item.if.useSetup])
        : undefined;

      // === Resolve :value binding ===
      const rawVal = callLayoutFn(item.params.value, ctx);

      // === Add element ===
      const opts = buildOpts(item, ctx);
      if (ifObs) opts.visible = ifObs;

      this._addFormElement(form, type, label, rawVal, item, ctx, opts, player);
    }

    // Cleanup all computations on form close
    try {
      await form.show();
    } finally {
      ui._activeForms.set(player, null);
      for (const c of computations) c.__cleanup();
    }
  }

  private _addFormElement(
    form: CustomForm,
    type: string,
    label: string,
    rawVal: unknown,
    item: LayoutItem & { _loopSetup?: SetupRecord },
    ctx: unknown[],
    opts: Record<string, unknown>,
    player: Player,
  ): void {
    if (type === 'input' || type === 'textField') {
      const obs = refToObsOrWarn(
        rawVal,
        'string',
        'input value',
      ) as ObservableString;
      const ph = String(
        unwrapValue(callLayoutFn(item.params.placeholderText, ctx)) ?? '',
      );
      if (ph) opts.placeholder = ph;
      form.textField(label, obs, Object.keys(opts).length ? opts : undefined);
    } else if (type === 'toggle') {
      const obs = refToObsOrWarn(
        rawVal,
        'boolean',
        'toggle value',
      ) as ObservableBoolean;
      form.toggle(label, obs, Object.keys(opts).length ? opts : undefined);
    } else if (type === 'dropdown') {
      const obs = refToObsOrWarn(
        rawVal,
        'number',
        'dropdown value',
      ) as ObservableNumber;
      const raw = unwrapValue(callLayoutFn(item.params.option, ctx));
      const items = Array.isArray(raw)
        ? raw
        : String(raw ?? '')
            .split(',')
            .map((v: string, i: number) => ({ label: v.trim(), value: i }));
      form.dropdown(
        label,
        obs,
        items,
        Object.keys(opts).length ? opts : undefined,
      );
    } else if (type === 'slider') {
      const obs = refToObsOrWarn(
        rawVal,
        'number',
        'slider value',
      ) as ObservableNumber;
      const min = Number(unwrapValue(callLayoutFn(item.params.min, ctx)) ?? 0);
      const max = Number(
        unwrapValue(callLayoutFn(item.params.max, ctx)) ?? 100,
      );
      form.slider(
        label,
        obs,
        min,
        max,
        Object.keys(opts).length ? opts : undefined,
      );
    } else if (type === 'button') {
      const handler = unwrapValue(callLayoutFn(item.params.click, ctx));
      const fn = typeof handler === 'function' ? handler : () => {};
      const onClick = () => fn(undefined, player);
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

  // ---- Form mode (legacy FormData) ----
  private async _showForm(player: Player, setup: SetupRecord) {
    const items = this._resolveItems(setup);

    // Build click handler map
    const clickHandlers: Map<number, Function> = new Map();

    const ui = new (this._UI as new (
      ...args: never[]
    ) => InstanceType<NonNullable<typeof this._UI>>)();
    if (!this._uiType) {
      if (ui instanceof this._mcUI.ModalFormData) this._uiType = 'modal';
      else if (ui instanceof this._mcUI.ActionFormData) this._uiType = 'action';
      else if (ui instanceof this._mcUI.MessageFormData)
        this._uiType = 'message';
      else throw new Error('[mcx runtime]: Invalid form type');
    }

    let MsgFormUse = 0;
    let ActionBtnUse = 0;

    for (const item of items) {
      const s = item._loopSetup || setup;
      const ctx = [s];
      const label = String(callLayoutFn(item.content, ctx) ?? '');

      if (this._uiType === 'modal') {
        const f = ui as InstanceType<typeof this._mcUI.ModalFormData>;
        if (item.type === 'input') {
          const def = String(callLayoutFn(item.params.default, ctx) ?? '');
          const ph = String(
            callLayoutFn(item.params.placeholderText, ctx) ?? '',
          );
          const tip = callLayoutFn(item.params.tip, ctx);
          f.textField(label, ph, {
            defaultValue: def,
            ...(tip != null ? { tooltip: String(tip) } : {}),
          });
        } else if (item.type === 'slider') {
          const min = Number(callLayoutFn(item.params.min, ctx) ?? 0);
          const max = Number(callLayoutFn(item.params.max, ctx) ?? 10);
          const tip = callLayoutFn(item.params.tip, ctx);
          f.slider(label, min, max, {
            ...(tip != null ? { tooltip: { text: String(tip) } } : {}),
          });
        } else if (item.type === 'toggle') {
          const def = Boolean(callLayoutFn(item.params.default, ctx) ?? false);
          f.toggle(label, { defaultValue: def });
        } else if (item.type === 'dropdown') {
          const opt = String(callLayoutFn(item.params.option, ctx) ?? '');
          f.dropdown(label, opt.split(','));
        } else if (item.type === 'submit') {
          f.submitButton(label);
          if (item.params.click) {
            const handler = callLayoutFn(item.params.click, ctx);
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
          const img = String(callLayoutFn(item.params.img, ctx) ?? '');
          f.button(label, img || void 0);
          if (item.params.click) {
            const handler = callLayoutFn(item.params.click, ctx);
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
          else
            throw new Error(
              '[mcx runtime]: MessageFormData only supports two buttons',
            );
          if (item.params.click) {
            const handler = callLayoutFn(item.params.click, ctx);
            if (typeof handler === 'function')
              clickHandlers.set(MsgFormUse, handler);
          }
          MsgFormUse++;
        }
      }

      if (item.type === 'title') {
        (
          ui as InstanceType<
            | typeof this._mcUI.ModalFormData
            | typeof this._mcUI.ActionFormData
            | typeof this._mcUI.MessageFormData
          >
        ).title(label);
      }
    }

    const formResponse = (await ui.show(player)) as
      | ActionFormResponse
      | ModalFormResponse
      | MessageFormResponse;
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
          // (_loopSetup stays unset so _showCustomForm expands the loop)
          resolved.push({ ...item });
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
