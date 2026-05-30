import type { World } from '@minecraft/server';
import type { LanguagePlugin } from '@volar/language-core';
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
  use: typeof ModalFormData | typeof MessageFormData | typeof ActionFormData;
  UI: typeof _minecraft_server_ui;
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
type MCXFileType = 'app' | 'component' | 'event';
/** runtime context passed into `setup` */
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
interface MCXFile<T extends MCXFileType> extends MCXFileBase {
  app: T extends 'app'
    ? AppMCXContent
    : T extends 'event'
      ? MCXEventData
      : T extends 'ui'
        ? {
            ui: ui;
          }
        : never;
}
export type { CompileOpt, MCXFile, EventOpt, MCXCtx, MCXFileBase };
