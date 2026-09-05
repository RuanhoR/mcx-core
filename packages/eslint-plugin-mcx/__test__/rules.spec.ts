import { RuleTester } from 'eslint';
import { describe } from 'vitest';
import { parser } from '../src/parser';
import { rules } from '../src/rules';

const tester = new RuleTester({ languageOptions: { parser } });

// real binding block from addon/mcbe-bedwars-addon/behavior/scripts/event.mcx
const bedwarsScript = `
<script lang="ts">
export function onUseItem(): void {}
export function onEntityHurt(): void {}
export function onProjectileHitBlock(): void {}
export function onEntityDie(): void {}
export function onPlayerSpawn(): void {}
export function onPlayerBreakBlock(): void {}
</script>`;

const bedwarsEvent = `<Event @after>
itemUse = onUseItem
entityHurt = onEntityHurt
projectileHitBlock = onProjectileHitBlock
entityDie = onEntityDie
playerSpawn = onPlayerSpawn
playerBreakBlock = onPlayerBreakBlock
</Event>`;

describe('mcx rules', () => {
  tester.run('valid-event-binding', rules['valid-event-binding']!, {
    valid: [
      `${bedwarsEvent}\n${bedwarsScript}`,
      // before-events from addon/Demo/behavior/scripts/event.mcx, incl. the
      // McxExtendsBy directive which is not a world event
      {
        code: `<Event @before>
  playerBreakBlock = onPlayerBreakBlock
  playerPlaceBlock = onPlayerPlaceBlock
  McxExtendsBy = ./eventAfter.mcx
</Event>
<script lang="ts">
export function onPlayerBreakBlock(): void {}
export function onPlayerPlaceBlock(): void {}
</script>`,
      },
      // itemUse exists in both world.afterEvents and world.beforeEvents
      {
        code: `<Event @before>
  itemUse = onUseItem
</Event>
<script lang="ts">
export function onUseItem(): void {}
</script>`,
      },
      // no scope attribute: an event from either list is accepted
      {
        code: `<Event>
  projectileHitBlock = onHit
</Event>
<script lang="ts">
export function onHit(): void {}
</script>`,
      },
      {
        code: `<Event @after>
  mysteryEvent = onMystery
</Event>
<script lang="ts">
export function onMystery(): void {}
</script>`,
        options: [{ allowUnknown: true }],
      },
      // script-only file: nothing to validate
      `<script lang="ts">
const hidden = 41;
export function hello(): string { return 'hi'; }
</script>`,
    ],
    invalid: [
      // entityDie is after-only: valid under @after but not @before
      {
        code: `<Event @before>
  entityDie = onDeath
</Event>
<script lang="ts">
export function onDeath(): void {}
</script>`,
        errors: [{ messageId: 'unknownEventInScope' }],
      },
      {
        code: `<Event @after>
  itemUse = onUseItem
  notAWorldEvent = onUseItem
</Event>
<script lang="ts">
export function onUseItem(): void {}
</script>`,
        errors: [{ messageId: 'unknownEventInScope' }],
      },
      // no scope attribute: generic unknownEvent message
      {
        code: `<Event>
  notAWorldEvent = onUseItem
</Event>
<script lang="ts">
export function onUseItem(): void {}
</script>`,
        errors: [{ messageId: 'unknownEvent' }],
      },
      {
        code: `<Event @after>
  itemUse = missingHandler
</Event>
<script lang="ts">
export function onUseItem(): void {}
</script>`,
        errors: [{ messageId: 'missingExport' }],
      },
      // non-exported function is not a valid handler
      {
        code: `<Event @after>
  itemUse = localFn
</Event>
<script lang="ts">
function localFn(): void {}
</script>`,
        errors: [{ messageId: 'missingExport' }],
      },
    ],
  });

  tester.run('no-duplicate-root-tag', rules['no-duplicate-root-tag']!, {
    valid: [
      `<Event @after>
  itemUse = onUseItem
</Event>
<script lang="ts">
export function onUseItem(): void {}
</script>`,
      // one per tag kind
      `<App></App>\n<Event @after>\n  itemUse = onUseItem\n</Event>\n<script lang="ts">\nexport function onUseItem(): void {}\n</script>`,
    ],
    invalid: [
      {
        code: `<App></App>\n<App></App>\n<script lang="ts">\n</script>`,
        errors: [{ messageId: 'duplicate', data: { name: 'App' } }],
      },
      {
        code: `<Event @after>\n  itemUse = onUseItem\n</Event>\n<Event @before>\n  itemUse = onUseItem\n</Event>\n<script lang="ts">\nexport function onUseItem(): void {}\n</script>`,
        errors: [{ messageId: 'duplicate', data: { name: 'Event' } }],
      },
    ],
  });

  tester.run('valid-prop-value', rules['valid-prop-value']!, {
    valid: [
      `<Event @after>
  itemUse = onUseItem
</Event>
<script lang="ts">
export function onUseItem(): void {}
</script>`,
      {
        code: `<Component>
items = [{"name":"demo","icon":"x.png"}]
</Component>
<script lang="ts">
</script>`,
      },
    ],
    invalid: [
      {
        code: `<Component>
items = [{"name":"demo}]
</Component>
<script lang="ts">
</script>`,
        errors: [{ messageId: 'invalidJson' }],
      },
    ],
  });

  tester.run('require-script-lang', rules['require-script-lang']!, {
    valid: [
      '<script lang="ts">\n</script>',
      {
        code: '<script lang="js">\n</script>',
        options: [{ allow: ['js'] }],
      },
    ],
    invalid: [
      {
        code: '<script>\n</script>',
        errors: [{ messageId: 'missingLang' }],
      },
      {
        code: '<script lang="python">\n</script>',
        errors: [{ messageId: 'unknownLang' }],
      },
    ],
  });
});
