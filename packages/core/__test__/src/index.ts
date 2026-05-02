import { stdout } from "node:process";
import MCX from "../../dist/index.js";

// test compiler

function fail(msg?: string, err?: any) {
  if (err) console.error(err);
  console.error("[test failed]", msg || "");
  process.exit(1);
}

const testv1 = async () => {
  try {
    const result = MCX.Compiler.compileJSFn(
      "import * as test from './'; test.default(); export * from '@babel/parser'; ",
    );
    if (!result || !result.BuildCache)
      fail("compileJSFn returned no BuildCache", result);
    if (
      !Array.isArray(result.BuildCache.import) ||
      result.BuildCache.import.length < 1
    )
      fail("no import in BuildCache.import", result.BuildCache);
    if (
      !Array.isArray(result.BuildCache.call) ||
      result.BuildCache.call.length < 1
    )
      fail("no call in BuildCache.call", result.BuildCache);
    if (
      !Array.isArray(result.BuildCache.export) ||
      result.BuildCache.export.length < 1
    )
      fail("no export in BuildCache.export", result.BuildCache);

    const result$1 = MCX.Compiler.compileMCXFn(
      "<script> console.log('test') </script> <Event @after>PlayerJoin=test</Event>",
    );
    if (!result$1 || !result$1.strLoc || !result$1.strLoc.Event)
      fail("compileMCXFn returned unexpected shape", result$1);
    if (!result$1.strLoc.Event.isLoad)
      fail(
        "no load Event in result$1.strLoc.Event.isLoad",
        result$1.strLoc.Event,
      );
    if (result$1.strLoc.script.indexOf("console.log('test')") === -1)
      fail("script content missing from parse result", result$1);


  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Additional transform tests
const testv2 = async () => {
  try {
    const ctx = {
      error: (msg: any) => {
        throw new Error(String(msg));
      },
      warn: (msg: any) => {
        /* ignore */
      },
    } as any;

    const runTransform = async (compileData: any) => {
      const transformer = MCX.transform;
      if (!transformer)
        throw new Error("transform function not found on MCX default export");
      return await transformer(compileData, new Map(), "/root/test.mcx", ctx, {
        moduleDir: "/dev/null",
        ProjectDir: "",
        main: "",
        output: "",
      });
    };

    // 1) tick numeric and @after should be recognized and emitted
    const mcx1 =
      '<script>console.log("testv1")</script> <Event @after tick="5">PlayerJoin=test</Event>';
    const cd1 = MCX.Compiler.compileMCXFn(mcx1);
    if (cd1.strLoc.Event.on !== "after")
      fail("Event @after not recognized", cd1.strLoc.Event);
    const code1 = await runTransform(cd1);
    if (typeof code1 !== "string")
      fail("transform did not return code string", code1);
    if (!/tick\s*[:=]\s*5/.test(code1))
      fail("tick numeric not emitted by transform", code1);
    if (!/on\s*[:=].*after/.test(code1))
      fail("@after not emitted by transform", code1);

    // 2) both Event and Component should cause an error
    const mcx2 =
      '<script>console.log("testv2")</script> <Event @after>PlayerJoin=test</Event> <Component><items><item id="a">a</item></items></Component>';

    let threw = false;
    try {
      const cd2 = MCX.Compiler.compileMCXFn(mcx2);
      await runTransform(cd2);
    } catch (e) {
      threw = true;
    }
    if (!threw)
      fail("transform should throw when both Event and Component exist");
    console.log("Transform tests passed");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// AST 注释功能测试
const testv3 = async () => {
  try {
    // 测试注释忽略功能
    const testCode1 = `<div class="test">Hello<!--comment 1-->World</div>`;

    // 直接使用 MXC.AST.tag 类（它本身是 McxAst 构造函数）
    const ast1 = new (MCX.AST.tag as any)(testCode1);
    const result1 = ast1.parseAST();

    if (result1.length !== 1) {
      fail("Expected 1 root node for testCode1");
    }

    const divNode1 = result1[0];

    // 检查默认情况下的注释处理（应该被忽略）
    if (divNode1.content) {
      const hasComment = divNode1.content.some((item: any) => item && item.type === 'Comment');
      if (hasComment) {
        fail("Comments should be ignored in default mode");
      }
    }

    // 测试注释保留功能
    const ast2 = new (MCX.AST.tag as any)(testCode1, true);
    const result2 = ast2.parseAST();

    if (result2.length !== 1) {
      fail("Expected 1 root node for testCode1 with comments");
    }

    const divNode2 = result2[0];

    // 检查启用注释保留的情况
    if (divNode2.content) {
      const commentNodes = divNode2.content.filter((item: any) => item && item.type === 'Comment');
      if (commentNodes.length === 0) {
        fail("Expected at least 1 comment node when comments are included");
      }
    }

    // 测试嵌套标签中的注释
    const testCode2 = `
      <div>
        Hello
        <!-- comment 2 -->
        <span>test</span>
        <!-- comment 3 -->
      </div>
    `;

    const ast3 = new (MCX.AST.tag as any)(testCode2, true);
    const result3 = ast3.parseAST();

    if (result3.length !== 1) {
      fail("Expected 1 root node for nested test");
    }

    const rootNode = result3[0];

    // 验证注释功能基本工作
    if (rootNode.content) {
      const commentCount = rootNode.content.filter((item: any) => item && item.type === 'Comment').length;
      if (commentCount < 2) {
        console.warn("Warning: Expected at least 2 comment nodes in nested test, found", commentCount);
      }
    }

    console.log("AST comment tests passed");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

testv1()
  .then(testv2)
  .then(testv3)
  .then(() => console.log("All tests passed"));