/**
 * Create a lazy class proxy that defers loading until `new` is called.
 * Supports both sync and async loaders (import() returns Promise).
 *
 * Usage:
 *   export const ItemComponent = createLazyClass(
 *     () => import('./components/item').then(m => m.ItemComponent)
 *   );
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ClassConstructor = new (...args: any[]) => any;

export function createLazyClass<T extends ClassConstructor>(
  loader: () => T | Promise<T>,
): T {
  let RealClass: T | null = null;
  let loadingPromise: Promise<T> | null = null;

  async function ensureAsync(): Promise<T> {
    if (RealClass) return RealClass;
    if (!loadingPromise) {
      const result = loader();
      loadingPromise = result instanceof Promise ? result : Promise.resolve(result);
    }
    RealClass = await loadingPromise;
    return RealClass;
  }

  const initPromise = (async () => {
    try {
      const result = loader();
      RealClass = result instanceof Promise ? await result : result;
    } catch {
      // Will be retried on new()
    }
  })();

  function DummyConstructor(this: Record<string, unknown>, ...args: unknown[]) {
    if (RealClass) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const instance = new (RealClass as any)(...args);
      return new Proxy(instance as Record<string, unknown>, {
        get(target, prop, receiver) {
          const value = Reflect.get(target, prop, receiver);
          if (typeof value === 'function') return (value as Function).bind(target);
          return value;
        },
      });
    }
    throw new Error(
      '[lazy] Class not loaded yet. Wait for initialization or use createLazyClass with sync loader.',
    );
  }

  // Attach static members
  (DummyConstructor as unknown as Record<string, unknown>)['ensureAsync'] = ensureAsync;
  (DummyConstructor as unknown as Record<string, unknown>)['ready'] = initPromise;

  return new Proxy(DummyConstructor as unknown as T, {
    get(_target, prop, _receiver) {
      if (prop === 'then') return undefined;
      if (prop === Symbol.toPrimitive) return undefined;
      if (prop === 'ensureAsync') return ensureAsync;
      if (prop === 'ready') return initPromise;

      if (RealClass) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = (RealClass as any)[prop as string];
        if (typeof value === 'function') return (value as Function).bind(RealClass);
        return value;
      }
      return undefined;
    },
    has(_target, prop) {
      if (!RealClass) return false;
      return prop in RealClass;
    },
    getOwnPropertyDescriptor(_target, prop) {
      if (!RealClass) return undefined;
      return Object.getOwnPropertyDescriptor(RealClass, prop);
    },
    ownKeys() {
      if (!RealClass) return [];
      return Reflect.ownKeys(RealClass);
    },
  });
}
