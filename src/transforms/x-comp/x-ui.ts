import { transformCompCtx } from "../../types";

export function compileUIFn(ctx: transformCompCtx) {
  if (ctx.enableSetup.prototype.enable) {
    throw new Error("[ui]: shouldn't enable setup")
  }
  const uiTagNode = ctx.code.strLoc.UI;
  if (!uiTagNode) {
    throw new Error("[ui]: shouldn't run ui transform fn on not enable ui");
  }
  for (const content of uiTagNode.content) {
    if (content.type == "TagContent") continue;

  }
}