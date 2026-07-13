/**
 * Lifecycle hooks and compile-time macros for MCX UI/Form components.
 *
 * These are processed by the MCX compiler at compile time.
 * At runtime, they serve as type declarations only.
 */

import { Ref } from './ref';

export function onStartup(callback: () => void): void {
  // compile-time macro — no runtime behavior
}

export function onMounted(callback: () => void): void {
  // compile-time macro — no runtime behavior
}

export function defineProp<T extends string | boolean | number>(
  ...args: [defaultValue: T] | [name: string, defaultValue: T]
): Ref<T> {
  const val: T = args.length === 1 ? args[0] : args[1];
  return new Ref(
    typeof val === 'string' ? val : typeof val === 'boolean' ? val : Number(val),
  ) as Ref<T>;
}
