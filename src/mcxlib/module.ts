function __mcxlib__module__() {
  const _: any = function() {}
  /**
   * @type {Record<number, {status: "loading" | "loaded" | "wait" | "error", factory: Function, exports: any}>}
   */
  _.prototype.module = {};
  _.prototype.define = function (moduleId: number, factory: Function) {
    this.module[moduleId] = {
      status: "wait",
      factory,
      exports: {}
    };
  };
  _.prototype.import = function (moduleId: number) {
    try {const i = this.module[moduleId];
    if (!i) throw new Error(`[mcxlib]: cannot find module ${moduleId}`);
    if (i.status === "loaded") return i.exports;
    i.status = "loading";
    const moduleExports = {};
    const moduleObject = { exports: moduleExports };
    i.factory(
      moduleExports,
      (id: number) => this.import(id)
    );
    i.exports = moduleObject.exports;
    i.status = "loaded";
    return i.exports;} catch (e: any) {
      throw new Error(`[mcxlib]: load module ${moduleId} (look more at sourcemap.json) error: message: ${e.message}; stack: ${e.stack}`);
    }
  };
  return new _();
}
export default __mcxlib__module__;