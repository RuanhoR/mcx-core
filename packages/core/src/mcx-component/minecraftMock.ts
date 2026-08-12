export function createMock<T extends object = object>(): T {
  const cache = new Map<PropertyKey, unknown>();
  const fn = function () {
    return createMock();
  };
  return new Proxy(fn, {
    get: (_target, prop) => {
      if (prop === Symbol.toPrimitive) return () => '[mcx:minecraft-mock]';
      if (!cache.has(prop)) cache.set(prop, createMock());
      return cache.get(prop);
    },
    set: () => true,
    apply: () => createMock(),
    construct: () => createMock(),
  }) as T;
}

export const MINECRAFT_MOCK: Record<string, unknown> = createMock();
export const MINECRAFT_MOCK_SCOPE = '@minecraft/';
