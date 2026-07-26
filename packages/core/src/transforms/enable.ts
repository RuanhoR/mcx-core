/**
 * Creates a single-shot guard function. Can only be called once.
 * Subsequent calls throw an error.
 */
export function createOnceGuard(): (() => void) & {
  prototype: {
    enable: boolean;
  };
} {
  let success = false;
  const fn = function () {
    if (success) throw new Error("[enable]: can't enable again");
    success = true;
    fn.prototype.enable = success;
  };
  fn.prototype.enable = success;
  return fn;
}

/**
 * Creates a single-shot data holder. Can only be set once.
 * Subsequent calls throw an error.
 */
export function createOnceData<T>(): ((data: T) => void) & {
  prototype: {
    enable: T | null;
  };
} {
  let d: null | T = null;
  const fn = function (data: T) {
    if (d) throw new Error("[enable]: can't enable again");
    d = data;
    fn.prototype.enable = d;
  };
  fn.prototype.enable = d;
  return fn;
}
