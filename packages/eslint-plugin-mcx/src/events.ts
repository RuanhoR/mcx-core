/**
 * World event names accepted inside `<Event>` blocks, from
 * `@minecraft/server` `world.afterEvents` / `world.beforeEvents` (2.x).
 */
export const KNOWN_WORLD_EVENTS: readonly string[] = [
  // afterEvents
  'blockBreak',
  'blockExplode',
  'blockContainerClosed',
  'blockContainerOpened',
  'buttonPush',
  'chatSend',
  'effectAdd',
  'entityDie',
  'entityExplode',
  'entityHealthChanged',
  'entityHitBlock',
  'entityHitEntity',
  'entityHurt',
  'entityLoad',
  'entityRemove',
  'entitySpawn',
  'explosion',
  'itemCompleteUse',
  'itemDefinitionTrigger',
  'itemReleaseUse',
  'itemStartUse',
  'itemStartUseOn',
  'itemStopUse',
  'itemStopUseOn',
  'itemUse',
  'itemUseOn',
  'leverAction',
  'pistonActivate',
  'playerBreakBlock',
  'playerButtonInput',
  'playerDimensionChange',
  'playerEmote',
  'playerGameModeChange',
  'playerInteractWithBlock',
  'playerInteractWithEntity',
  'playerJoin',
  'playerLeave',
  'playerPlaceBlock',
  'playerSpawn',
  'pressurePlatePop',
  'pressurePlatePush',
  'projectileHitBlock',
  'projectileHitEntity',
  'screenDisplay',
  'scriptEventReceive',
  'tripWireTrip',
  'weatherChange',
  'worldLoad',
  'worldInitialize',
  // beforeEvents (subset that also exists there)
  'playerLeave',
];

/** Prop keys with mcx-compiler meaning, not world events. */
export const MCX_EVENT_DIRECTIVES: readonly string[] = ['McxExtendsBy'];

export function isMcxDirectiveKey(key: string): boolean {
  return MCX_EVENT_DIRECTIVES.includes(key) || /^Mcx[A-Z]/.test(key);
}
