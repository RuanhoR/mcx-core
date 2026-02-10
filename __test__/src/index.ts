import MCX from "../../dist/index.js";

// test compiler

const result = MCX.Compiler.compileJSFn("import * as test from './'; test.default(); export * from '@babel/parser'; ");
if (result.BuildCache.import.length < 1) throw new Error("[test error]: no import");
if (result.BuildCache.call.length < 1) throw new Error("[test error]: no call");
if (result.BuildCache.export.length < 1) throw new Error("[test]: no export");

const result$1 = MCX.Compiler.compileMCXFn("<script> console.log('test') </script> <Event @after>PlayerJoin=test</Event>");
if (!result$1.strLoc.Event.isLoad) throw new Error("[test mcx]: no load Event");
