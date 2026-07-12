import {
  ActionFormData,
  MessageFormData,
  ModalFormData,
  CustomForm,
} from '@minecraft/server-ui';
import type { Player } from '@minecraft/server';

type SetupRecord = Record<string, unknown>;

export interface MCXUIOpt {
  layout?: {
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
        | 'img']: string | { useProp: string };
    };
    content:
      | string
      | {
          useProp: string;
        };
    for?: string | {
      variable: string;
      useProp: string;
    };
    if?: string | {
      useProp: string;
    };
  }[];
  build?: (player: Player, setup: SetupRecord) => CustomForm;
  use?: typeof ModalFormData | typeof MessageFormData | typeof ActionFormData;
  UI: typeof import('@minecraft/server-ui');
}
