import { describe, expect, it } from 'vitest';
import plain from './fixture/plain.mcx';
import event from './fixture/event.mcx';

// Runs in the `mcx-integration` project of the root vitest config, which is
// the only project with the mcx Vite plugin applied.
describe('vitest + @mbler/mcx-core rollupPlugin (via mcxPlugin)', () => {
  it('compiles a script-only .mcx into an importable module', () => {
    expect(plain.type).toBe('app');
    expect(typeof plain.setup).toBe('function');
  });

  it('compiles an Event .mcx with a stubbed @mbler/mcx runtime', () => {
    expect(event.type).toBe('event');
  });
});
