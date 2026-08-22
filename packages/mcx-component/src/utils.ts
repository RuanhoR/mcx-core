const normalize = (v: string | null | undefined): string => {
  return String(v || '').trim();
};
const parts = (v: string | null | undefined): number[] => {
  return normalize(v)
    .split('.')
    .slice(0, 3)
    .map((n: string): number => parseInt(n, 10) || 0);
};

const compareVar = (a: string, b: string): number => {
  const A = parts(a);
  const B = parts(b);
  for (let i = 0; i < 3; i++) {
    const a = A[i];
    const b = B[i];
    if (a === undefined || b === undefined) break;
    if (a !== b) return a > b ? 1 : -1;
  }
  return 0;
};
export default compareVar;
