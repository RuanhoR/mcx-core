declare module '*.mcx' {
  const mod: {
    type: string;
    setup?: (...args: unknown[]) => unknown;
    app?: Record<string, unknown>;
  };
  export default mod;
}
