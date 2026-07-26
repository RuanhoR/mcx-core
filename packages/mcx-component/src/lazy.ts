/**
 * Create a lazy class proxy that defers loading until `new` is called.
 * Supports both sync and async loaders (import() returns Promise).
 *
 * Usage:
 *   export const ItemComponent = createLazyClass(
 *     () => import('./components/item').then(m => m.ItemComponent)
 *   );
 */
export function createLazyClass<T extends new (...args: any[]) => any>(
  loader: () => T | Promise<T>,
): T {
  let RealClass: T | null = null;
  let loadingPromise: Promise<T> | null = null;

  function ensureSync(): T {
    if (RealClass) return RealClass;
    throw new Error(
      '[lazy] Class not loaded yet. It will be available after first new() call.',
    );
  }

  async function ensureAsync(): Promise<T> {
    if (RealClass) return RealClass;
    if (!loadingPromise) {
      const result = loader();
      loadingPromise = result instanceof Promise ? result : Promise.resolve(result);
    }
    RealClass = await loadingPromise;
    return RealClass;
  }

  // Eagerly kick off the load in the background
  const initPromise = (async () => {
    try {
      const result = loader();
      RealClass = result instanceof Promise ? await result : result;
    } catch {
      // Will be retried on new()
    }
  })();

  const DummyConstructor = function (this: any, ...args: any[]) {
    // If already loaded synchronously, use it
    if (RealClass) {
      const instance = new RealClass(...args);
      return new Proxy(instance, {
        get(target, prop, receiver) {
          const value = Reflect.get(target, prop, receiver);
          if (typeof value === 'function') return value.bind(target);
          return value;
        },
      });
    }
    // Not loaded yet — throw with helpful message
    throw new Error(
      '[lazy] Class not loaded yet. Wait for initialization or use createLazyClass with sync loader.',
    );
  } as unknown as T;

  // Expose async initializer on the proxy
  (DummyConstructor as any).ensureAsync = ensureAsync;
  (DummyConstructor as any).ready = initPromise;

  return new Proxy(DummyConstructor, {
    get(_target, prop, _receiver) {
      // Don't intercept 'then' (prevents Promise detection)
      if (prop === 'then') return undefined;
      if (prop === Symbol.toPrimitive) return undefined;
      if (prop === 'ensureAsync') return ensureAsync;
      if (prop === 'ready') return initPromise;

      if (RealClass) {
        const value = (RealClass as any)[prop];
        if (typeof value === 'function') return value.bind(RealClass);
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
