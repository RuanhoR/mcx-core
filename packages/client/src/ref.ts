import {
  ObservableString,
  ObservableBoolean,
  ObservableNumber,
} from '@minecraft/server-ui';

export type RefValue = string | boolean | number;

export class Ref<T extends RefValue = RefValue> {
  __obs: ObservableString | ObservableBoolean | ObservableNumber;
  __watchers: Set<(val: T, old: T) => void> = new Set();
  __oldValue: T;

  constructor(defaultValue: T) {
    this.__oldValue = defaultValue;
    if (typeof defaultValue === 'string') {
      this.__obs = new ObservableString(defaultValue);
    } else if (typeof defaultValue === 'boolean') {
      this.__obs = new ObservableBoolean(defaultValue);
    } else {
      this.__obs = new ObservableNumber(defaultValue);
    }
    this.__obs.subscribe((val: unknown) => {
      const old = this.__oldValue;
      this.__oldValue = val as T;
      for (const fn of this.__watchers) {
        fn(val as T, old);
      }
    });
  }

  get value(): T {
    return this.__obs.getData() as T;
  }

  set value(v: T) {
    this.__obs.setData(v as string & boolean & number);
  }

  subscribe(fn: (val: T, old: T) => void): void {
    this.__watchers.add(fn);
  }

  unsubscribe(fn: (val: T, old: T) => void): void {
    this.__watchers.delete(fn);
  }

  __cleanup(): void {
    this.__watchers.clear();
  }
}

export function ref<T extends RefValue>(defaultValue: T): Ref<T> {
  return new Ref(defaultValue);
}
