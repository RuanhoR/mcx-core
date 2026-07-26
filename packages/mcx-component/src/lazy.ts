/**
 * Create a lazy class proxy that defers loading until `new` is called.
 *
 * Usage:
 *   export const ItemComponent = createLazyClass<typeof OriginalItemComponent>(
 *     () => require('./components/item').ItemComponent,
 *   );
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AbstractConstructor = new (...args: any[]) => any;

export function createLazyClass<T extends AbstractConstructor>(loader: () => T): T {
  let RealClass: T | null = null;

  const initPromise = (async () => {
    try {
      RealClass = loader();
    } catch {
      // Will be retried on new()
    }
  })();

  // The proxy function that acts as a drop-in replacement for the real class
  function ProxyClass(this: unknown, ...args: unknown[]) {
    if (RealClass) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return new (RealClass as any)(...args);
    }
    throw new Error(
      '[lazy] Class not loaded yet. Wait for initialization or use createLazyClass with sync loader.',
    );
  }

  // Copy static properties lazily
  return new Proxy(ProxyClass as unknown as T, {
    get(_target, prop, _receiver) {
      if (prop === 'then') return undefined;
      if (prop === Symbol.toPrimitive) return undefined;
      if (prop === 'ensureAsync') {
        return async () => {
          if (!RealClass) RealClass = loader();
          return RealClass;
        };
      }
      if (prop === 'ready') return initPromise;

      // Static members from the real class
      if (RealClass) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = (RealClass as any)[prop as string | symbol];
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
