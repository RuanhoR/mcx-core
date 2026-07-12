import type { MCXCtx } from '@mbler/mcx-types';
import type { MCXUIOpt } from './types';
import type { Player } from '@minecraft/server';
import * as typesPkg from '@mbler/mcx-types';
import type {
  ActionFormResponse,
  MessageFormData,
  MessageFormResponse,
  ModalFormResponse,
  CustomForm,
  DataDrivenScreenClosedReason,
} from '@minecraft/server-ui';

// ---- Old FormData types (unchanged) ----
type LayoutItem = NonNullable<MCXUIOpt['layout']>[number];
type UnresolvedParams = LayoutItem['params'];
type UnresolvedLayoutItem = Omit<LayoutItem, 'params'> & {
  params: {
    [K in keyof UnresolvedParams]: UnresolvedParams[K];
  };
};
type UnresolvedLayout = UnresolvedLayoutItem[];
interface ParsedParams extends Omit<UnresolvedParams, 'click'> {
  click:
    | ((
        value: ModalFormResponse | MessageFormData | ActionFormResponse,
      ) => void)
    | { useProp: string };
}
interface ParsedUIOption extends Omit<MCXUIOpt, 'layout'> {
  layout: {
    params: ParsedParams;
    content:
      | string
      | {
          useProp: string;
        };
    type: LayoutItem['type'];
    for?:
      | string
      | {
          variable: string;
          useProp: string;
        };
    if?:
      | string
      | {
          useProp: string;
        };
  }[];
}
interface ResolvedParams {
  [key: string]: unknown;
  click?: (
    value: ModalFormResponse | MessageFormData | ActionFormResponse,
  ) => void;
}
interface ResolvedLayoutItem {
  type: LayoutItem['type'];
  params: ResolvedParams;
  content: string;
  for?:
    | string
    | {
        variable: string;
        useProp: string;
      };
  if?:
    | string
    | {
        useProp: string;
      };
}

type SetupRecord = Record<string, unknown>;

export class ui implements typesPkg.ui {
  private _mcUI: typeof import('@minecraft/server-ui');
  private _mcxSrcFn: (
    ctx: MCXCtx & { $prop?: Record<string, unknown> },
  ) => SetupRecord;
  private _srcResult: SetupRecord = {};
  private _startupDone = false;

  // Form mode (legacy FormData)
  private _UI: MCXUIOpt['use'];
  private _prop!: string[];
  private _layout!: ParsedUIOption['layout'];
  private _uiType: 'modal' | 'action' | 'message' | null = null;
  private _mode: 'form' | 'ui';

  // Ui mode (CustomForm)
  private _buildFn:
    | ((player: Player, setup: SetupRecord) => CustomForm)
    | null = null;

  constructor(
    UIConfig: MCXUIOpt & {
      build?: (player: Player, setup: SetupRecord) => CustomForm;
    },
    mcxSrcFn: (
      ctx: MCXCtx & { $prop?: Record<string, unknown> },
    ) => SetupRecord,
  ) {
    this._mcxSrcFn = mcxSrcFn;
    this._srcResult = mcxSrcFn({ $prop: {} });
    this._mcUI = UIConfig.UI;

    if (!UIConfig.UI) {
      throw new Error('[mcx runtime]: UI module is required');
    }

    // Detect mode: build function = Ui (CustomForm), layout = Form (legacy)
    if (UIConfig.build) {
      this._mode = 'ui';
      this._buildFn = UIConfig.build;
    } else {
      this._mode = 'form';
      this._UI = UIConfig.use;
      if (typeof this._srcResult !== 'object')
        throw new Error('[mcx runtime]: cannot load mcx setup');
      this._prop = (this._srcResult.prop as string[] | undefined) || [];
      if (!Array.isArray(this._prop))
        throw new Error("[mcx runtime]: can't load prop: invalid prop");

      this._layout = (UIConfig.layout || []).map(
        (i): ParsedUIOption['layout'][number] => {
          if (
            i.type == 'button' &&
            i.params.click &&
            typeof i.params.click === 'string'
          ) {
            i.params.click = this._srcResult[i.params.click] as
              | string
              | { useProp: string };
          }
          if (typeof i.for === 'string') {
            const match = i.for.match(/^(\w+)\s+in\s+(\w+)$/);
            if (match) {
              i.for = { variable: match[1]!, useProp: match[2]! };
            } else {
              throw new Error(
                `[mcx runtime]: invalid for syntax "${i.for}", expected "variable in propName"`,
              );
            }
          }
          if (typeof i.if === 'string') {
            i.if = { useProp: i.if };
          }
          return i as unknown as ParsedUIOption['layout'][number];
        },
      );
    }
  }

  // ---- Form mode (legacy) ----
  private _generateUI(layout: ResolvedLayoutItem[]) {
    const ui = new this._UI!();

    if (!this._uiType) {
      if (ui instanceof this._mcUI.ModalFormData) {
        this._uiType = 'modal';
      } else if (ui instanceof this._mcUI.ActionFormData) {
        this._uiType = 'action';
      } else if (ui instanceof this._mcUI.MessageFormData) {
        this._uiType = 'message';
      } else {
        throw new Error(
          '[mcx runtime]: Invalid UI type, must be ModalFormData, ActionFormData or MessageFormData',
        );
      }
    }

    let MsgFormUse = 0;
    let ActionBtnUse = 0;
    const clickEvent: Map<
      number,
      (
        value: ModalFormResponse | MessageFormData | ActionFormResponse,
        player: Player,
      ) => void
    > = new Map();

    for (const iIndex in layout) {
      const i = layout[iIndex];
      if (!i) continue;

      if (this._uiType === 'modal') {
        const actionUi = ui as InstanceType<typeof this._mcUI.ModalFormData>;
        if (i.type == 'input') {
          actionUi.textField(
            String(i.content),
            (i.params.placeholderText as string | undefined) || '',
            {
              defaultValue: i.params.default as string,
              tooltip: i.params.tip as string,
            },
          );
        } else if (i.type == 'slider') {
          actionUi.slider(
            String(i.content),
            parseFloat(i.params.min as string) || 0,
            parseFloat(i.params.max as string) || 10,
            {
              tooltip: {
                text: (i.params.tip as string | undefined) || '',
              },
            },
          );
        } else if (i.type == 'toggle') {
          actionUi.toggle(String(i.content), {
            defaultValue: Boolean(i.params.default),
          });
        } else if (i.type == 'dropdown') {
          actionUi.dropdown(
            String(i.content),
            (i.params.option as string).split(','),
          );
        } else if (i.type == 'submit') {
          actionUi.submitButton(String(i.content));
          if (i.params.click) clickEvent.set(0, i.params.click);
        } else if (i.type == 'body') {
          actionUi.label(String(i.content));
        } else if (i.type == 'divider') {
          actionUi.divider();
        }
      } else if (this._uiType === 'action') {
        const actionUi = ui as InstanceType<typeof this._mcUI.ActionFormData>;
        if (i.type == 'button') {
          actionUi.button(
            String(i.content),
            (i.params.img as string | undefined) || void 0,
          );
          if (i.params.click) clickEvent.set(ActionBtnUse, i.params.click);
          ActionBtnUse++;
        } else if (i.type == 'body') {
          actionUi.label(String(i.content));
        } else if (i.type == 'divider') {
          actionUi.divider();
        }
      } else if (this._uiType === 'message') {
        const messageUi = ui as InstanceType<typeof this._mcUI.MessageFormData>;
        if (i.type == 'button-m') {
          if (MsgFormUse == 0) {
            messageUi.button1(String(i.content));
          } else if (MsgFormUse == 1) {
            messageUi.button2(String(i.content));
          } else {
            throw new Error('[mcx runtime]: MessageFormData only can call two');
          }
          if (i.params.click) clickEvent.set(MsgFormUse, i.params.click);
          MsgFormUse++;
        }
      } else if (i.type == 'title') {
        ui.title(String(i.content));
      }
    }
    return [ui, clickEvent] as const;
  }

  private async _showForm(
    player: Player,
    prop: Record<string, unknown>,
  ): Promise<void> {
    const srcResult = this._mcxSrcFn({ $prop: prop });

    const clickHandlers: Map<number, Function> = new Map();
    for (const iIndex in this._layout) {
      const i = this._layout[iIndex];
      if (i?.params.click && typeof i.params.click === 'function') {
        clickHandlers.set(parseInt(iIndex), i.params.click as Function);
      }
    }

    const cLayout: UnresolvedLayoutItem[] = JSON.parse(
      JSON.stringify(this._layout),
    );

    for (const [index, handler] of clickHandlers) {
      if (cLayout[index]) {
        (cLayout[index].params as unknown as { click: Function }).click =
          handler;
      }
    }

    // expand for-loop items
    const expandedLayout: UnresolvedLayoutItem[] = [];
    for (const item of cLayout) {
      if (
        item.for &&
        typeof item.for !== 'string' &&
        typeof item.for.useProp === 'string'
      ) {
        const arr = prop[item.for.useProp];
        if (!Array.isArray(arr)) {
          throw new Error(
            `[mcx runtime]: for "${item.for.useProp}" is not an array`,
          );
        }
        const varName = item.for.variable;
        for (const element of arr) {
          const copy = JSON.parse(JSON.stringify(item)) as UnresolvedLayoutItem;
          if (typeof item.params.click === 'function') {
            (copy.params as Record<string, unknown>).click = item.params.click;
          }
          if (
            typeof copy.content === 'object' &&
            copy.content &&
            'useProp' in copy.content &&
            typeof copy.content.useProp === 'string'
          ) {
            if (copy.content.useProp === varName) {
              copy.content = String(element ?? '');
            } else if (copy.content.useProp.startsWith(varName + '.')) {
              const key = copy.content.useProp.slice(varName.length + 1);
              copy.content = String(
                (element as Record<string, unknown>)[key] ?? '',
              );
            }
          }
          for (const paramKey of Object.keys(copy.params)) {
            const paramValue =
              copy.params[paramKey as string & keyof typeof copy.params];
            if (
              typeof paramValue === 'object' &&
              paramValue &&
              'useProp' in paramValue &&
              typeof paramValue.useProp === 'string'
            ) {
              if (paramValue.useProp === varName) {
                (copy.params as Record<string, unknown>)[paramKey] = element;
              } else if (paramValue.useProp.startsWith(varName + '.')) {
                const key = paramValue.useProp.slice(varName.length + 1);
                (copy.params as Record<string, unknown>)[paramKey] = (
                  element as Record<string, unknown>
                )[key];
              }
            }
          }
          delete copy.for;
          if (
            copy.if &&
            typeof copy.if !== 'string' &&
            typeof copy.if.useProp === 'string'
          ) {
            if (copy.if.useProp === varName) {
              if (!element) continue;
              delete copy.if;
            } else if (copy.if.useProp.startsWith(varName + '.')) {
              const key = copy.if.useProp.slice(varName.length + 1);
              if (!(element as Record<string, unknown>)[key]) continue;
              delete copy.if;
            }
          }
          expandedLayout.push(copy);
        }
      } else {
        expandedLayout.push(item);
      }
    }

    // resolve remaining useProp references on expanded layout
    for (const layout of expandedLayout) {
      if (
        typeof layout.content === 'object' &&
        layout.content &&
        'useProp' in layout.content &&
        typeof layout.content.useProp === 'string'
      ) {
        const resolved = prop[layout.content.useProp];
        if (resolved === undefined) {
          throw new Error(
            `[mcx runtime]: prop "${layout.content.useProp}" not found in props`,
          );
        }
        layout.content = resolved as string;
      }
      for (const paramKey of Object.keys(layout.params)) {
        const paramValue =
          layout.params[paramKey as string & keyof typeof layout.params];
        if (
          typeof paramValue === 'object' &&
          paramValue &&
          'useProp' in paramValue &&
          typeof paramValue.useProp === 'string'
        ) {
          const useProp = paramValue.useProp;
          const resolved = prop[useProp];
          if (resolved === undefined) {
            throw new Error(
              `[mcx runtime]: prop "${useProp}" not found in props`,
            );
          }
          if (paramKey === 'click') {
            (layout.params as Record<string, unknown>)[paramKey] =
              typeof resolved === 'string' ? srcResult[resolved] : resolved;
          } else {
            (layout.params as Record<string, unknown>)[paramKey] = resolved;
          }
        }
      }
    }

    // resolve if and filter out falsy items
    const filteredLayout: typeof expandedLayout = [];
    for (const layout of expandedLayout) {
      if (
        layout.if &&
        typeof layout.if !== 'string' &&
        typeof layout.if.useProp === 'string'
      ) {
        const resolved = prop[layout.if.useProp];
        if (!resolved) continue;
        delete layout.if;
      }
      filteredLayout.push(layout);
    }

    const _temp = this._generateUI(
      filteredLayout as unknown as ResolvedLayoutItem[],
    );
    const formUi = _temp[0];
    const promise = formUi.show(player);
    const formResponse = await promise;
    if (formResponse.canceled) return;

    if (this._uiType === 'action') {
      const clickIndex = (formResponse as ActionFormResponse).selection;
      if (clickIndex !== undefined) {
        const handler = _temp[1].get(clickIndex);
        if (handler) handler(formResponse, player);
      }
    } else if (this._uiType === 'message') {
      const selection = (formResponse as MessageFormResponse).selection;
      if (selection !== undefined) {
        const handler = _temp[1].get(selection);
        if (handler) handler(formResponse, player);
      }
    } else if (this._uiType === 'modal') {
      const handler = _temp[1].get(0);
      if (handler) handler(formResponse, player);
    }
  }

  private async _showCustomForm(
    player: Player,
    prop: Record<string, unknown>,
  ): Promise<DataDrivenScreenClosedReason | void> {
    const setup = this._mcxSrcFn({ $prop: prop });

    // onStartup — once
    if (!this._startupDone) {
      const startupFn = setup.__mcx_startup as (() => void) | undefined;
      if (typeof startupFn === 'function') {
        startupFn();
      }
      this._startupDone = true;
    }

    // onMounted — every show
    const mountedFn = setup.__mcx_mounted as (() => void) | undefined;
    if (typeof mountedFn === 'function') {
      mountedFn();
    }

    if (!this._buildFn) {
      throw new Error('[mcx runtime]: CustomForm build function not found');
    }

    const form = this._buildFn(player, setup);
    return form.show();
  }

  async show(
    player: Player,
    prop?: Record<string, unknown>,
  ): Promise<void> {
    const resolvedProp = prop || {};

    if (this._mode === 'form') {
      await this._showForm(player, resolvedProp);
    } else {
      await this._showCustomForm(player, resolvedProp);
    }
  }
}

export function showForm(
  formMcx: typesPkg.MCXFile<'ui'>,
  player: Player,
  prop?: Record<string, unknown>,
) {
  return formMcx.app.ui.show(player, prop);
}
