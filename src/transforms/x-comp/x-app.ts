import path from "node:path";
import { transformParseCtx } from "../../types";
import * as t from "@babel/types"
import { readFile } from "node:fs/promises";
import { compileMCXFn } from "../../compile-mcx/compiler";
import config from "../config";
export async function Comp(ctx: transformParseCtx) {
  const eventImportIdList: ({
    type: "default" | "all",
    as: string
  })[] = [];
  for (const impNode of ctx.ctx.compiledCode.JSIR.BuildCache.import) {
    const source = impNode.source;
    const parsed = path.parse(source);
    if (!parsed.root && !parsed.dir.startsWith(".")) {
      continue;
    };
    // path
    const fPath = path.join(ctx.ctx.currentId, "../", source)
    try {
      // read file
      const code = await readFile(fPath, "utf-8");
      const compiledCode = compileMCXFn(code);
      // write cache
      ctx.ctx.cache.set(fPath, compiledCode)
      if (compiledCode.strLoc.Event.isLoad) {
        for (const impItem of impNode.imported) {
          let type: "all" | "default";
          if (impItem.isAll) type = "all";
          else if (impItem.import == "default") type = "default";
          else {
            throw new Error("not vaild importDeclartion: Event mcx only resolve default and all import, can't use other import");
          }
          eventImportIdList.push({
            type,
            as: impItem.as
          });
        }
      }
    } catch (err) {
      // if error: file not found, file can't write, mcx syntax error
      ctx.ctx.rollupContext.warn(`[extract import]: can't resolve file ${fPath} and import by ${ctx.ctx.currentId}\n- err: ${(err instanceof Error) ? err.stack : err}`)
    }
  }
  // only have event import
  if (eventImportIdList.length >= 1) {
    const eventMemberNode = t.memberExpression(
      t.identifier(config.paramCtx),
      t.identifier("event")
    )
    ctx.mainFn.unshift(
      // add declaration

      t.variableDeclaration("var", eventImportIdList.map(
        (item, index) => {
          if (item.type == "all") {
            return t.variableDeclarator(t.identifier(item.as), t.objectExpression([
              t.objectProperty(t.identifier("default"),
                t.memberExpression(
                  eventMemberNode,
                  t.numericLiteral(index),
                  true
                ),
              ),
            ]))
          } else if (item.type == "default") {
            return t.variableDeclarator(
              t.identifier(item.as),
              t.memberExpression(
                eventMemberNode,
                t.numericLiteral(index),
                true
              ),
            )
          }
          // ts galgame
          throw new Error("[javascript error]: why it not in [default, all]")
        })
      )
    );
    // app: add event export to runtime framework

    const appData = [
      t.objectProperty(
        t.identifier("event"),
        t.arrayExpression(eventImportIdList.map(vl => {
          if (vl.type == "all") {
            return t.memberExpression(
              t.identifier(vl.as),
              t.identifier("default")
            )
          } else if (vl.type == "default") {
            return t.identifier(vl.as)
          };
          throw new Error("[add prop]: can't format eventImportList")
        }))
      )
    ];
    ctx.app(appData);
  }
}