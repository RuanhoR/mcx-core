// Generated from @minecraft/server typings; see scripts/generate-events.mjs.
// This module re-exports the scoped lists plus helpers for mcx directives.
import { WORLD_AFTER_EVENTS, WORLD_BEFORE_EVENTS } from './generated-events';

export { WORLD_AFTER_EVENTS, WORLD_BEFORE_EVENTS };

/** Prop keys with mcx-compiler meaning, not world events. */
export const MCX_EVENT_DIRECTIVES: readonly string[] = ['McxExtendsBy'];

export function isMcxDirectiveKey(key: string): boolean {
  return MCX_EVENT_DIRECTIVES.includes(key) || /^Mcx[A-Z]/.test(key);
}
