let fs: typeof import('fs') | null = null;
export function getFs(): typeof import('fs') {
  if (!fs) {
    throw new TypeError('[MCX Core]: Must set fs first');
  }
  return fs;
}
export function setGlobalFS(_fs: typeof import('fs')) {
  fs = _fs;
}
