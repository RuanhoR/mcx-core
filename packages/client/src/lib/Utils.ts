export function generateAntiShake<T extends Function>(fn: T, tick: number): T {
  let lastRun: number = Date.now();
  return ((...args: unknown[]) => {
    const time = Date.now();
    if (time - lastRun <= tick) {
      lastRun = time;
      return;
    }
    lastRun = time;
    return fn(...args);
  }) as unknown as T;
}
