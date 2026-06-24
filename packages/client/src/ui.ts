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
type UnresolvedParams = MCXUIOpt['layout'][number]['params'];
type UnresolvedLayout = Omit<MCXUIOpt['layout'][number], 'params'> & {
  params: {
    [K in keyof UnresolvedParams]: UnresolvedParams[K];
  };
};
interface ParsedParams extends Omit<UnresolvedParams, 'click'> {
  click:
    | ((value: ModalFormResponse | MessageFormData | ActionFormResponse) => void)
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
    type: MCXUIOpt['layout'][number]['type'];
  }[];
}
interface ResolvedParams {
  [key: string]: unknown;
  click?: ((value: ModalFormResponse | MessageFormData | ActionFormResponse) => void);
}
interface ResolvedLayoutItem {
  type: MCXUIOpt['layout'][number]['type'];
  params: ResolvedParams;
  content: string;
}
export class ui implements typesPkg.ui {
  private _mcUI: typeof import('@minecraft/server-ui');
  private _mcxSrcFn: (ctx: MCXCtx & { $prop?: Record<string, unknown> }) => Record<string, unknown>;
  private _srcResult: Record<string, unknown> = {};
  private _UI: MCXUIOpt['use'];
  private _prop: string[];
  private _layout: ParsedUIOption['layout'];
  private _usePropLayoutIndexList: number[] = [];
  private _usePropParamsMap: Map<number, string[]> = new Map();
  private _uiType: 'modal' | 'action' | 'message';
  constructor(UIConfig: MCXUIOpt, mcxSrcFn: (ctx: MCXCtx & { $prop?: Record<string, unknown> }) => Record<string, unknown>) {
    this._mcxSrcFn = mcxSrcFn;
    this._srcResult = mcxSrcFn({ $prop: {} });
    this._UI = UIConfig.use;
    if (typeof this._srcResult !== 'object')
      throw new Error('[mcx runtime]: can;t load mcx setup');
    this._prop = (this._srcResult.prop as string[] | undefined) || [];
    if (!Array.isArray(this._prop))
      throw new Error("[mcx runtime]: can't load prop: invalid prop");

    if (!UIConfig.UI) {
      throw new Error('[mcx runtime]: UI module is required');
    }
    this._mcUI = UIConfig.UI;

    const tempUI = new this._UI();
    if (tempUI instanceof this._mcUI.ModalFormData) {
      this._uiType = 'modal';
    } else if (tempUI instanceof this._mcUI.ActionFormData) {
      this._uiType = 'action';
    } else if (tempUI instanceof this._mcUI.MessageFormData) {
      this._uiType = 'message';
    } else {
      throw new Error(
        '[mcx runtime]: Invalid UI type, must be ModalFormData, ActionFormData or MessageFormData',
      );
    }

    this._layout = UIConfig.layout.map(
      (i): ParsedUIOption['layout'][number] => {
        if (i.type == 'button' && i.params.click && typeof i.params.click === 'string') {
          i.params.click = this._srcResult[i.params.click] as string | { useProp: string };
        }
        return i as unknown as ParsedUIOption['layout'][number];
      },
    );
    this._init();
  }
  private _init() {
    for (const layoutIndex in this._layout) {
      const layout = this._layout[layoutIndex];
      if (!layout) continue;
      if (typeof layout.content !== 'string') {
        if (typeof layout.content?.useProp == 'string') {
          this._usePropLayoutIndexList.push(parseInt(layoutIndex));
        } else {
          throw new Error(
            "[mcx runtime]: can't load ui: useProp is not a string",
          );
        }
      }
      for (const [paramKey, paramValue] of Object.entries(layout.params)) {
        if (typeof paramValue === 'object' && paramValue !== null && 'useProp' in paramValue) {
          const existing = this._usePropParamsMap.get(parseInt(layoutIndex));
          if (existing) {
            existing.push(paramKey);
          } else {
            this._usePropParamsMap.set(parseInt(layoutIndex), [paramKey]);
          }
        }
      }
    }
  }
  private _generateUI(layout: ResolvedLayoutItem[]) {
    const ui = new this._UI();
    let MsgFormUse = 0;
    const clickEvent: Map<number, (value: ModalFormResponse | MessageFormData | ActionFormResponse) => void> = new Map();

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
          actionUi.dropdown(String(i.content), (i.params.option as string).split(','));
        } else if (i.type == 'submit') {
          actionUi.submitButton(String(i.content));
          if (i.params.click) clickEvent.set(0, i.params.click);
        } else if (i.type == 'body') {
          actionUi.label(String(i.content));
        } else if (i.type == 'divider') {
          actionUi.divider();
        }
      }
      else if (this._uiType === 'action') {
        const actionUi = ui as InstanceType<typeof this._mcUI.ActionFormData>;
        if (i.type == 'button') {
          actionUi.button(String(i.content), (i.params.img as string | undefined) || void 0);
          if (i.params.click) clickEvent.set(parseInt(iIndex), i.params.click);
        } else if (i.type == 'body') {
          actionUi.label(String(i.content));
        } else if (i.type == 'divider') {
          actionUi.divider();
        }
      }
      else if (this._uiType === 'message') {
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
  async show(player: Player, prop: Record<string, unknown>) {
    const srcResult = this._mcxSrcFn({ $prop: prop });

    const clickHandlers: Map<number, Function> = new Map();
    for (const iIndex in this._layout) {
      const i = this._layout[iIndex];
      if (i?.params.click && typeof i.params.click === 'function') {
        clickHandlers.set(parseInt(iIndex), i.params.click as Function);
      }
    }

    const cLayout: UnresolvedLayout[] = JSON.parse(
      JSON.stringify(this._layout),
    );

    for (const [index, handler] of clickHandlers) {
      if (cLayout[index]) {
        (cLayout[index].params as unknown as { click: Function }).click = handler;
      }
    }

    for (const propIndex of this._usePropLayoutIndexList) {
      const layout = cLayout[propIndex] as UnresolvedLayout;
      if (!layout || typeof layout.content !== 'object' || !layout.content.useProp)
        continue;
      const resolved = prop[layout.content.useProp];
      if (resolved === undefined) {
        throw new Error(
          `[mcx runtime]: prop "${layout.content.useProp}" not found in props`,
        );
      }
      layout.content = resolved as string | { useProp: string };
    }

    for (const [layoutIndex, paramKeys] of this._usePropParamsMap.entries()) {
      const layout = cLayout[layoutIndex] as UnresolvedLayout & { params: Record<string, string | { useProp: string } | ((value: ModalFormResponse | MessageFormData | ActionFormResponse) => void)> };
      if (!layout) continue;
      for (const paramKey of paramKeys) {
        const paramValue = layout.params[paramKey];
        if (typeof paramValue !== 'object' || !paramValue || !('useProp' in paramValue))
          continue;
        const useProp = paramValue.useProp;
        const resolved = prop[useProp];
        if (resolved === undefined) {
          throw new Error(
            `[mcx runtime]: prop "${useProp}" not found in props`,
          );
        }
        if (paramKey === 'click') {
          layout.params[paramKey] = (typeof resolved === 'string'
            ? srcResult[resolved]
            : resolved) as string | { useProp: string };
        } else {
          layout.params[paramKey] = resolved as string | { useProp: string };
        }
      }
    }

    const _temp = this._generateUI(cLayout as unknown as ResolvedLayoutItem[]);
    const ui = _temp[0];
    const promise = ui.show(player);
    const formResponse = await promise;
    if (formResponse.canceled) return;

    if (this._uiType === 'action') {
      const clickIndex = (formResponse as ActionFormResponse).selection;
      if (clickIndex !== undefined) {
        const handler = _temp[1].get(clickIndex);
        if (handler) handler(formResponse);
      }
    } else if (this._uiType === 'message') {
      const selection = (formResponse as MessageFormResponse).selection;
      if (selection !== undefined) {
        const handler = _temp[1].get(selection);
        if (handler) handler(formResponse);
      }
    } else if (this._uiType === 'modal') {
      const handler = _temp[1].get(0);
      if (handler) handler(formResponse);
    }
  }
}
