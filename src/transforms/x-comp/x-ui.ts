import { transformParseCtx } from "../../types";

export async function Comp(ctx: transformParseCtx) {
  const internalCtx = ctx.ctx;
  if (!internalCtx.compiledCode.strLoc.UI) throw new Error("[UI Component]: why didn't parent compeled verify?");
  // TODO: compele transform
}