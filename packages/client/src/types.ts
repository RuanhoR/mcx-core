import {
  ActionFormData,
  MessageFormData,
  ModalFormData,
  CustomForm,
} from '@minecraft/server-ui';
import type { Player } from '@minecraft/server';

type SetupRecord = Record<string, unknown>;
type LayoutFn = (s: SetupRecord) => unknown;

interface LayoutItem {
  type: string;
  params: Record<string, LayoutFn>;
  content: LayoutFn;
  for?: { variable: string; useSetup: string };
  if?: { useSetup: string };
}

export interface MCXUIOpt {
  mode?: 'form' | 'ui';
  layout?: LayoutItem[];
  use?: typeof ModalFormData | typeof MessageFormData | typeof ActionFormData | typeof CustomForm;
  UI: typeof import('@minecraft/server-ui');
}
