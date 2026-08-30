import { describe, it, expect } from 'vitest';
import { compiler, transform as _transform } from '../../src';
import { devNull } from 'os';
import { TransformPluginContext } from 'rollup';
import { CompileOpt } from '@mbler/mcx-types';

function transform(source: string): Promise<string> {
  return _transform(
    compiler.compileMCXFn(source),
    new Map(),
    devNull,
    {} as unknown as TransformPluginContext,
    {} as unknown as CompileOpt,
    {} as unknown as { dist: string; resources: string; behavior: string },
  );
}

const wrap = (body: string, tagAttrs = '') =>
  `<Event ${tagAttrs}>
${body}
</Event>
<script lang="ts">
export function handler() {}
</script>`;

// 常见 world.afterEvents / beforeEvents 事件名矩阵
const afterEvents = [
  'playerJoin',
  'playerLeave',
  'playerSpawn',
  'itemUse',
  'itemCompleteUse',
  'entityHitEntity',
  'entityHurt',
  'entityDie',
  'entityHealthChanged',
  'entityEquippedArmor',
  'playerBreakBlock',
  'playerPlaceBlock',
  'playerInteractWithBlock',
  'playerInteractWithEntity',
  'playerEmote',
  'playerGameModeChange',
  'worldInitialize',
  'worldLoad',
  'worldTick',
  'blockBreak',
  'blockPlace',
  'chatSend',
  'effectAdd',
  'explosion',
  'projectileHitEntity',
  'weatherChange',
];

describe('Event MCX transform matrix (@after event names)', () => {
  it.each(afterEvents)('compiles %s handler reference', async name => {
    const compiled = await transform(wrap(`${name} = handler`, '@after'));
    expect(compiled).toContain(name);
    expect(compiled).toContain('handler');
  });
});

const beforeEvents = [
  'chatSend',
  'playerBreakBlock',
  'playerPlaceBlock',
  'playerInteractWithBlock',
  'playerInteractWithEntity',
  'blockBreak',
  'blockPlace',
  'explosion',
  'itemUse',
  'entityRemove',
];

describe('Event MCX transform matrix (@before event names)', () => {
  it.each(beforeEvents)('compiles @before %s', async name => {
    const compiled = await transform(wrap(`${name} = handler`, '@before'));
    expect(compiled).toContain(name);
  });
});

describe('Event MCX transform matrix (tag options)', () => {
  it.each([
    { attrs: '', match: /handler/ },
    { attrs: '@after', match: /after/ },
    { attrs: '@before', match: /before/ },
    { attrs: 'tick=100', match: /100/ },
    { attrs: 'tick=1', match: /"1"|1/ },
    { attrs: 'tick=20', match: /20/ },
  ])('compiles attrs "$attrs"', async ({ attrs, match }) => {
    const compiled = await transform(wrap('playerJoin = handler', attrs));
    expect(compiled).toMatch(match);
  });

  it.each(['0', '-5', 'abc'])('drops invalid tick=%s without throwing', async tick => {
    const compiled = await transform(wrap('playerJoin = handler', `tick=${tick}`));
    expect(compiled).toContain('playerJoin');
  });
});

describe('Event MCX transform matrix (multiple bindings)', () => {
  it.each([
    ['playerJoin = h1\nplayerLeave = h2', ['playerJoin', 'playerLeave']],
    ['itemUse = useItem\nitemCompleteUse = completeUse', ['itemUse', 'itemCompleteUse']],
    ['entityHitEntity = hit\nentityHurt = hurt\nentityDie = die', ['entityHitEntity', 'entityHurt', 'entityDie']],
  ])('compiles multi-binding tags', async (body, names) => {
    const script = `<Event @after>
${body}
</Event>
<script lang="ts">
export function h1() {}
export function h2() {}
export function useItem() {}
export function completeUse() {}
export function hit() {}
export function hurt() {}
export function die() {}
</script>`;
    const compiled = await transform(script);
    for (const name of names) expect(compiled).toContain(name);
  });
});

describe('Event MCX transform matrix (handler body preservation)', () => {
  it.each([
    'console.log("a")',
    'world.sendMessage("b")',
    'player.addEffect("speed", 20)',
  ])('keeps handler body %s', async body => {
    const script = `<Event @after>
playerJoin = handler
</Event>
<script lang="ts">
import { world } from "@minecraft/server";
export function handler(event) {
  const { player } = event as never;
  ${body}
}
</script>`;
    const compiled = await transform(script);
    expect(compiled).toContain(body.split('(')[0]);
  });
});
