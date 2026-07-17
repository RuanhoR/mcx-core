import { describe, it, expect } from 'vitest';
import { compileMCXFn } from '../../src/compile-mcx/compiler/index';
import { transform } from '../../src/transforms/index';
import type { CustomPluginOptions, ModuleInfo, RollupFsModule, SourceMap, TransformPluginContext } from 'rollup';
import type { CompileOpt } from '@mbler/mcx-types';
import type { transformCtx } from '../../src/types';
function createMockOutput(): transformCtx['output'] {
  return {
    dist: '',
    behavior: '',
    resources: '',
  };
}

function compileMCX(mcxSource: string): Promise<string> {
  const compileData = compileMCXFn(mcxSource);
  const cache = new Map();
  const output = createMockOutput();
  return transform(compileData, cache, 'test.ui.mcx', {
    error: (err) => {
      const msg = typeof err === 'string' ? err : err?.message ?? String(err);
      throw new Error(msg);
    },
    warn: (_msg) => { },
    parse: (_input) => {
      throw new Error('Not implemented');
    },
    resolve: async (_source, _importer, _options) => null,
    emitFile: (_file) => '',
    getFileName: (_ref: string) => '',
    getModuleInfo: (_id: string) => null,
    info: (_log) => { },
    debug: (_log) => { },
    fs: {} as unknown as RollupFsModule,
    load: (_opt) => null as unknown as Promise<ModuleInfo>,
    meta: {
      rollupVersion: "",
      watchMode: false
    },
    getWatchFiles: () => [],
    setAssetSource: () => { },
    getModuleIds: () => null as unknown as IterableIterator<string>,
    addWatchFile: (_id: string) => { },
    getCombinedSourcemap: () => null as unknown as SourceMap,
    cache: new Map,
  } as TransformPluginContext, {} as unknown as CompileOpt, output);
}

describe('UI Transform - Computation import', () => {
  it('should use arrow function for {{ }} interpolation in content (Ui mode)', async () => {
    const mcxSource = `<Ui setup>
  <button :click="handleClick">hello {{ a }}</button>
</Ui>
<script lang="ts">
  const a = 1;
  function handleClick() {}
  export { a, handleClick };
</script>`;

    const code = await compileMCX(mcxSource);
    expect(code).toContain("Computation");
    expect(code).toContain("import { ui as __mcx__ui, Computation } from \"@mbler/mcx\"");
    expect(code).toContain("content: ctx => `hello ${ctx[0].a}`");
  });

  it('should use arrow function for static content (Ui mode)', async () => {
    const mcxSource = `<Ui setup>
  <button :click="handleClick">hello</button>
</Ui>
<script lang="ts">
  const a = 1;
  function handleClick() {}
  export { a, handleClick };
</script>`;

    const code = await compileMCX(mcxSource);
    expect(code).toContain("Computation");
    expect(code).toContain("import { ui as __mcx__ui, Computation } from \"@mbler/mcx\"");
    expect(code).toContain("content: ctx => \"hello\"");
  });

  it('should NOT add Computation import in Form mode, even with {{ }}', async () => {
    const mcxSource = `<Form setup>
  <input>hello {{ a }}</input>
</Form>
<script lang="ts">
  const a = 1;
  export { a };
</script>`;

    const code = await compileMCX(mcxSource);
    expect(code).not.toContain("Computation");
    expect(code).not.toContain("new Computation");
    expect(code).toContain("import { ui as __mcx__ui } from \"@mbler/mcx\"");
    // Form mode should use plain arrow function for interpolation
    expect(code).toContain("ctx => `hello ${ctx[0].a}`");
  });

  it('should reject invalid tags in Ui mode', async () => {
    const mcxSource = `<Ui setup>
  <invalidTag>test</invalidTag>
</Ui>
<script lang="ts">
  const a = 1;
  export { a };
</script>`;

    await expect(compileMCX(mcxSource)).rejects.toThrow("don't support tag: invalidTag");
  });

  it('should reject invalid tags in Form mode', async () => {
    const mcxSource = `<Form setup>
  <invalidTag>test</invalidTag>
</Form>
<script lang="ts">
  const a = 1;
  export { a };
</script>`;

    await expect(compileMCX(mcxSource)).rejects.toThrow("don't support tag: invalidTag");
  });

  it('should reject unsupported attributes', async () => {
    const mcxSource = `<Ui setup>
  <button invalidAttr="x">test</button>
</Ui>
<script lang="ts">
  const a = 1;
  export { a };
</script>`;

    await expect(compileMCX(mcxSource)).rejects.toThrow("does not support attribute 'invalidAttr'");
  });

  it('should accept valid Ui tags and attributes', async () => {
    const mcxSource = `<Ui setup>
  <input placeholderText="name" :value="a">Name</input>
  <toggle :default="true">Enable</toggle>
  <dropdown option="a,b,c" :default="0">Choose</dropdown>
  <slider :min="0" :max="100" :default="50">Volume</slider>
  <button :click="handleClick">Go</button>
  <label>Info</label>
  <header>Title</header>
  <divider></divider>
  <spacer></spacer>
  <close-button></close-button>
  <textField placeholderText="text">Text</textField>
</Ui>
<script lang="ts">
  const a = "hello";
  function handleClick() {}
  export { a, handleClick };
</script>`;

    const code = await compileMCX(mcxSource);
    expect(code).toContain("type: \"ui\"");
  });
});
