import { ParsedTagNode, transformParseCtx } from "../../types";
import * as t from "@babel/types"
import { generateEventConfig } from "../utils";
export async function Comp(ctx: transformParseCtx) {
  ctx.prop.push(
    t.objectProperty( // set prop's app = {event = eventConfig}
      t.identifier("app"),
      t.objectExpression([
        t.objectProperty(
          t.identifier("event"),
          await generateEventConfig(
            ctx.ctx.compiledCode.raw.find(
              (node) => node.name === "Event", // compileMCXFn had verify, don't verify
            ) as ParsedTagNode,
            ctx.ctx,
            ctx.impBody,
          ),
        ),
      ]),
    ),
  );
}