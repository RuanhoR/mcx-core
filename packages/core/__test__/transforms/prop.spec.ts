import { describe, it, expect } from 'vitest';
import { compileMCXFn } from '../../src/compile-mcx/compiler/index';
import { transform } from '../../src/transforms/index';
import type {
  RollupFsModule,
  ModuleInfo,
  SourceMap,
  TransformPluginContext,
} from 'rollup';
import type { CompileOpt } from '@mbler/mcx-types';
import type { transformCtx } from '../../src/types';

function compileMCX(mcxSource: string): Promise<string> {
  const compileData = compileMCXFn(mcxSource);
  const cache = new Map();
  const output = { dist: '', behavior: '', resources: '' };
  return transform(
    compileData,
    cache,
    'test.ui.mcx',
    {
      environment: {} as never,
      error: err => {
        const msg =
          typeof err === 'string' ? err : (err?.message ?? String(err));
        throw new Error(msg);
      },
      warn: _msg => {},
      parse: _input => {
        throw new Error('Not implemented');
      },
      resolve: async (_source, _importer, _options) => null,
      emitFile: _file => '',
      getFileName: (_ref: string) => '',
      getModuleInfo: (_id: string) => null,
      info: _log => {},
      debug: _log => {},
      fs: {} as unknown as RollupFsModule,
      load: _opt => null as unknown as Promise<ModuleInfo>,
      meta: {
        rollupVersion: '',
        viteVersion: '',
        watchMode: false,
      },
      getWatchFiles: () => [],
      setAssetSource: () => {},
      getModuleIds: () => null as unknown as IterableIterator<string>,
      addWatchFile: (_id: string) => {},
      getCombinedSourcemap: () => null as unknown as SourceMap,
      cache: new Map(),
    } as TransformPluginContext,
    {} as unknown as CompileOpt,
    output,
  );
}

describe('defineProp transform (Ui mode)', () => {
  it('should wrap string default in ObservableString', async () => {
    const mcxSource = `<Ui setup>
  <title>Hi</title>
</Ui>
<script lang="ts">
  const name = defineProp('Player');
</script>`;
    const code = await compileMCX(mcxSource);
    expect(code).toContain(
      "new ObservableString(__mcx__ctx.$prop.name ?? 'Player')",
    );
    expect(code).toContain('ObservableString');
  });

  it('should wrap boolean default in ObservableBoolean', async () => {
    const mcxSource = `<Ui setup>
  <title>Hi</title>
</Ui>
<script lang="ts">
  const enabled = defineProp(true);
</script>`;
    const code = await compileMCX(mcxSource);
    expect(code).toContain(
      'new ObservableBoolean(__mcx__ctx.$prop.enabled ?? true)',
    );
  });

  it('should wrap number default in ObservableNumber', async () => {
    const mcxSource = `<Ui setup>
  <title>Hi</title>
</Ui>
<script lang="ts">
  const count = defineProp(0);
</script>`;
    const code = await compileMCX(mcxSource);
    expect(code).toContain('new ObservableNumber(__mcx__ctx.$prop.count ?? 0)');
  });

  it('should wrap negative number default in ObservableNumber', async () => {
    const mcxSource = `<Ui setup>
  <title>Hi</title>
</Ui>
<script lang="ts">
  const offset = defineProp(-1);
</script>`;
    const code = await compileMCX(mcxSource);
    expect(code).toContain(
      'new ObservableNumber(__mcx__ctx.$prop.offset ?? -1)',
    );
  });

  it('should wrap template literal default in ObservableString', async () => {
    const mcxSource = `<Ui setup>
  <title>Hi</title>
</Ui>
<script lang="ts">
  const greeting = defineProp(\`hello\`);
</script>`;
    const code = await compileMCX(mcxSource);
    expect(code).toContain(
      'new ObservableString(__mcx__ctx.$prop.greeting ?? `hello`)',
    );
  });

  it('should rewrite defineProp declared inside nested blocks', async () => {
    const mcxSource = `<Ui setup>
  <title>Hi</title>
</Ui>
<script lang="ts">
  if (true) {
    const nested = defineProp('inner');
  }
</script>`;
    const code = await compileMCX(mcxSource);
    expect(code).toContain("$prop.nested ?? 'inner'");
  });
});
