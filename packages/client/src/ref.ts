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

export class Computation {
  __deps: ((ctx: unknown[]) => Ref)[];
  __eval: (ctx: unknown[]) => unknown;
  __cleanupFns: (() => void)[] = [];

  constructor(evalFn: (ctx: unknown[]) => unknown, deps: ((ctx: unknown[]) => Ref)[]) {
    this.__eval = evalFn;
    this.__deps = deps;
  }

  get value(): unknown {
    return this.__eval([]);
  }

  evaluate(ctx: unknown[]): unknown {
    return this.__eval(ctx);
  }

  subscribeAll(ctx: unknown[], fn: () => void): void {
    for (const depFn of this.__deps) {
      const dep = depFn(ctx);
      if (dep instanceof Ref) {
        const handler = () => fn();
        dep.subscribe(handler);
        this.__cleanupFns.push(() => dep.unsubscribe(handler));
      }
    }
  }

  __cleanup(): void {
    for (const fn of this.__cleanupFns) fn();
    this.__cleanupFns = [];
  }
}
