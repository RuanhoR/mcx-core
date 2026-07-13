/**
 * Lifecycle hooks and compile-time macros for MCX UI/Form components.
 *
 * These are processed by the MCX compiler at compile time.
 * At runtime, they serve as type declarations only.
 */

import {
  ObservableString,
  ObservableBoolean,
  ObservableNumber,
} from '@minecraft/server-ui';

export function onStartup(callback: () => void): void {
  // compile-time macro — no runtime behavior
}

export function onMounted(callback: () => void): void {
  // compile-time macro — no runtime behavior
}

type ObservableFor<T> =
  T extends string ? ObservableString :
  T extends boolean ? ObservableBoolean :
  T extends number ? ObservableNumber :
  never;

export function defineProp<T extends string | boolean | number>(
  ...args: [defaultValue: T] | [name: string, defaultValue: T]
): ObservableFor<T> {
  const val = args.length === 1 ? args[0] : args[1];
  if (typeof val === 'string') return new ObservableString(val) as ObservableFor<T>;
  if (typeof val === 'boolean') return new ObservableBoolean(val) as ObservableFor<T>;
  return new ObservableNumber(Number(val)) as ObservableFor<T>;
}
