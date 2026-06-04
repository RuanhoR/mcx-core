import type { World, Player } from '@minecraft/server';
import type { LanguagePlugin } from '@volar/language-core';
import * as serverUI from '@minecraft/server-ui';
interface CompileOpt {
  moduleDir: string;
  tsconfigPath: string;
  sourcemap: boolean;
  basedir?: string;
  ts?: typeof import('typescript');
  mcxLanguagePlugin?: (
    ts: typeof import('typescript'),
  ) => LanguagePlugin<unknown>;
}
interface EventOpt {
  on: 'after' | 'before';
  data: Record<string, (event: any) => void>;
  extends?: MCXFile<'event'>[];
  tick?: number;
}
interface MCXUIOpt {
  layout: {
    type:
      | 'input'
      | 'dropdown'
      | 'submit'
      | 'toggle'
      | 'slider'
      | 'button-m'
      | 'button'
      | 'divider'
      | 'title'
      | 'body';
    params: {
      [key in
        | 'click'
        | 'default'
        | 'option'
        | 'min'
        | 'max'
        | 'placeholderText'
        | 'tip'
        | 'img']: string;
    };
    content:
      | string
      | {
          useProp: string;
        };
  }[];
  use:
    | typeof serverUI.ModalFormData
    | typeof serverUI.MessageFormData
    | typeof serverUI.ActionFormData;
  UI: typeof serverUI;
}
declare class ui {
  constructor(UIConfig: MCXUIOpt, mcxSrcFn: (ctx: MCXCtx) => any);
  show(player: Player, prop: Record<string, string>): Promise<void>;
}
declare class Event {
  constructor(opt: EventOpt);
  subscribe(...events: string[]): boolean;
  unsubscribe(...events: string[]): boolean;
  useWorld(_world: World): void;
}
type MCXFileType = 'app' | 'component' | 'event' | 'ui';
/** runtime context passed into `setup` */
/**
 * MCX Setup CTX will auto-generate by core
 * You should't use MCXCtx in your other code.
 */
type MCXCtx = {
  event?: Event[];
};

interface MCXFileBase {
  type: MCXFileType;
  setup: (ctx: MCXCtx) => any;
}
interface AppMCXContent {
  event: MCXFile<'event'>[];
}
interface MCXEventData {
  event: {
    data: Record<string, string>;
    on: EventOpt['on'];
    extends: EventOpt['extends'];
    tick: EventOpt['tick'];
  };
}
interface MCXFileTypeMap {
  app: AppMCXContent;
  event: MCXEventData;
  ui: {
    ui: ui;
  };
  component: never;
}
interface MCXFile<T extends MCXFileType> extends MCXFileBase {
  app: MCXFileTypeMap[T] | never;
}
export type {
  CompileOpt,
  MCXFile,
  EventOpt,
  MCXCtx,
  MCXFileBase,
  ui,
  Event,
  EventOpt,
  MCXUIOpt,
};
