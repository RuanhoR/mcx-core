import { describe, expect, it } from "vitest";
import { compiler, transform as _transform } from "../../src";
import { devNull } from "os";
import { TransformPluginContext } from "rollup";
import { CompileOpt } from "@mbler/mcx-types";
function transform(source: string): Promise<string> {
  return _transform(compiler.compileMCXFn(source), new Map, devNull, {} as unknown as TransformPluginContext, {} as unknown as CompileOpt, {} as unknown as {
    dist: string;
    resources: string;
    behavior: string;
  })
}
describe("Event MCX transform", () => {
  it("Inculde event name in compiled", async () => {
    const script = `<Event>
  playerJoin = onPlayerJoin
</Event>
<script lang="ts">
export function onPlayerJoin() {}
</script>`;
    const compiled = await transform(script);
    expect(compiled).contain("playerJoin")
  });
  it("Include event handler in compiled", async () => {
    const script = `<Event>
  playerJoin = onPlayerJoin
</Event>
<script lang="ts">
export function onPlayerJoin() {
  console.log("Hello world")
}
</script>`;
    const compiled = await transform(script);
    expect(compiled).contain("console.log(\"Hello world\")")
  })
})