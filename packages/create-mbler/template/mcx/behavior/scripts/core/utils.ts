import {
  Block,
  EnchantmentType,
  EntityComponentTypes,
  EquipmentSlot,
  ItemStack,
  Player,
  type Dimension,
  type Vector3,
} from "@minecraft/server";

export function pickRandomItem<T extends unknown[]>(arr: T): T[number] {
  return arr[Math.floor(Math.random() * arr.length)];
}
export function randomNum(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
interface itemDesc {
  name?: string;
  id: string;
  cout?: number;
  ench?: {
    id: string;
    level: number;
  }[];
}
export function spawnItem(
  itemArr: itemDesc[],
  location: Vector3,
  dim: Dimension,
) {
  for (const i of itemArr) {
    const item = new ItemStack(i.id, i.cout || 1);
    if (i.name) item.nameTag = i.name;
    if (i.ench) {
      const enchd = item.getComponent("enchantable");
      if (enchd) {
        for (const enchItem of i.ench) {
          enchd.addEnchantment({
            level: enchItem.level,
            type: new EnchantmentType(enchItem.id),
          });
        }
      }
    }
    dim.spawnItem(item, location);
  }
}
export function selectEvent(
  luckEvents: ((
    block: {
      dimension: Dimension;
      location: Vector3;
    },
    player: Player,
  ) => Promise<void> | void)[],
  badEvents: ((
    block: {
      dimension: Dimension;
      location: Vector3;
    },
    player: Player,
  ) => Promise<void> | void)[],
  currenyLuck: number,
): (
  block: {
    dimension: Dimension;
    location: Vector3;
  },
  player: Player,
) => Promise<void> | void {
  const clampedLuck = Math.max(-100, Math.min(100, currenyLuck));
  const normalized = clampedLuck / 100;
  const goodProbability = 1 / (1 + Math.exp(-normalized * 4));
  if (Math.random() < goodProbability) {
    const randomIndex = Math.floor(Math.random() * luckEvents.length);
    return luckEvents[randomIndex];
  } else {
    const randomIndex = Math.floor(Math.random() * badEvents.length);
    return badEvents[randomIndex];
  }
}
export function mainhand(player: Player): ItemStack | void {
  return player
    .getComponent(EntityComponentTypes.Equippable)
    ?.getEquipmentSlot(EquipmentSlot.Mainhand)
    .getItem();
}
