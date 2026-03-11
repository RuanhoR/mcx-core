import { MCXstructureLoc } from "../../compile-mcx/types";
import { ContentToken, ParsedTagNode, transformParseCtx } from "../../types";
import * as t from "@babel/types";
export async function Comp(ctx: transformParseCtx) {
  const internalCtx = ctx.ctx;

  ctx.impBody.push(
    t.importDeclaration(
      [t.importSpecifier(t.identifier("__mcx_ui"), t.identifier("ui"))],
      t.stringLiteral("@mbler/mcx"),
    ),
  );

  const uiTagNode = ctx.ctx.compiledCode.strLoc.UI;
  if (!uiTagNode || uiTagNode?.name !== "Ui")
    throw new Error("[UI Component]: why didn't parent compeled verify?");
  let MCXUIType: "ActionFromData" | "MessageFormData" | "ModalFormData" | null = null;
  const UITree: {
    arr: Record<string, string | boolean>;
    content: string;
    type: string;
    loc?: ParsedTagNode["loc"]
  }[] = []
  for (const uiClientTag of uiTagNode.content) {
    if (uiClientTag.type == "TagNode") {
      // if has client TagNode
      if (uiClientTag.content.some(i => i.type == "TagNode")) {
        internalCtx.rollupContext.error("[UI]: can't support ui client element", uiClientTag.loc ? {
          column: uiClientTag.loc.start.index,
          line: uiClientTag.loc.start.line
        } : void 0);
      }
      // add to tree
      UITree.push({
        arr: uiClientTag.arr,
        content: uiClientTag.content.map(i => i.type == "TagContent" && i.data || "").join(""),
        type: uiClientTag.name,
        loc: uiClientTag.loc
      })
    }
    // continue TagContentNode
  }
  const parsedObj: t.Expression[] = [];
  function pushToTree(name: string, params: Record<string, string | boolean>, content: string) {
    parsedObj.push(t.objectExpression([
      t.objectProperty(
        t.identifier("type"),
        t.stringLiteral(name)
      ),
      t.objectProperty(
        t.identifier("params"),
        t.objectExpression(Object.entries(params).map(i => {
          return t.objectProperty(
            t.identifier(i[0]),
            typeof i[1] == "boolean" ? t.booleanLiteral(i[1]) : t.stringLiteral(i[1])
          )
        }))
      ),
      t.objectProperty(
        t.identifier("content"),
        t.stringLiteral(content)
      )
    ]))
  }
  // generate type and parsed tree
  for (const tp of UITree) {
    const name = tp.type;
    // only ModalFormData Element
    if (["input", "dropdown", "submit", "toggle", "slider"].includes(name)) {
      // ModalFromData
      if (MCXUIType && MCXUIType !== "ModalFormData") {
        internalCtx.rollupContext.error("[UI]: a mcx can't have a ModalFormData Node and other form tag", tp.loc ? {
          line: tp.loc.start.line,
          column: tp.loc.start.index
        } : void 0)
      }
      MCXUIType = "ModalFormData";
      pushToTree(name, tp.arr, tp.content)
    }
    // only MessageFormData Element
    else if (["button-m"].includes(name)) {
      if (MCXUIType && MCXUIType !== "MessageFormData") {
        internalCtx.rollupContext.error("[UI]: ", tp.loc ? {
          line: tp.loc.start.line,
          column: tp.loc.start.index
        } : void 0)
      }
      MCXUIType = "MessageFormData";
      pushToTree(name, tp.arr, tp.content)
    }
    // public
    else if (["body", "divider", "title"].includes(name)) {
      pushToTree(name, tp.arr, tp.content)
    }
    else {
      if (name == "button") {
        if (MCXUIType == "MessageFormData") internalCtx.rollupContext.error("[UI]: don't support use button for messageFormData", tp.loc ? {
          line: tp.loc.start.line,
          column: tp.loc.start.index
        } : void 0);
        pushToTree(name, tp.arr, tp.content)
      } else {
        internalCtx.rollupContext.error("[UI]: don't support tag: " + name, tp.loc ? {
          line: tp.loc.start.line,
          column: tp.loc.start.index
        } : void 0);
      }
    }
  }
  if (!MCXUIType) MCXUIType = "ActionFromData";
  const finallyData = t.objectExpression([
    t.objectProperty(t.identifier("layout"), t.arrayExpression(parsedObj)),
    t.objectProperty(t.identifier("use"), t.identifier(MCXUIType))
  ]);
  ctx.impBody.push(t.importDeclaration([
    t.importSpecifier(
      t.identifier(MCXUIType),
      t.identifier(MCXUIType)
    )
  ], t.stringLiteral("@minecraft/server-ui"))
  )
  ctx.app([
    t.objectProperty(
      t.identifier("ui"),
      t.newExpression(t.identifier("__mcx__ui"), [finallyData])
    )
  ])
}
