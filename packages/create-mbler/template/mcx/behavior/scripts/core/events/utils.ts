import {
  BlockPermutation,
  Dimension,
  EntityComponentTypes,
  EntityEquippableComponent,
  EquipmentSlot,
  ItemStack,
  Player,
  type VanillaEntityIdentifier,
  type Vector3,
} from "@minecraft/server";
import { randomNum } from "../utils";

export function summonEntity(
  dim: Dimension,
  location: Vector3,
  id: string,
  count: number = 1,
) {
  for (let i = 0; i < count; i++) {
    try {
      dim.spawnEntity(id as VanillaEntityIdentifier, {
        x: location.x + randomNum(-2, 2),
        y: location.y,
        z: location.z + randomNum(-2, 2),
      });
    } catch (err) {
      console.error(err);
    }
  }
}

export function setBlock(dim: Dimension, loc: Vector3, blockId: string) {
  try {
    dim.setBlockPermutation(loc, BlockPermutation.resolve(blockId));
  } catch (err) {
    console.error(`[LuckBlock] setBlock error: ${blockId}`, err);
  }
}

export function fillArea(
  dim: Dimension,
  center: Vector3,
  r: number,
  blockId: string,
) {
  const perm = BlockPermutation.resolve(blockId);
  for (let x = center.x - r; x <= center.x + r; x++) {
    for (let y = center.y; y <= center.y + 2; y++) {
      for (let z = center.z - r; z <= center.z + r; z++) {
        try {
          dim.setBlockPermutation({ x, y, z }, perm);
        } catch (_) {}
      }
    }
  }
}

export function fillSquare(
  dim: Dimension,
  center: Vector3,
  r: number,
  yOff: number,
  blockId: string,
) {
  const perm = BlockPermutation.resolve(blockId);
  for (let x = center.x - r; x <= center.x + r; x++) {
    for (let z = center.z - r; z <= center.z + r; z++) {
      try {
        dim.setBlockPermutation({ x, y: center.y + yOff, z }, perm);
      } catch (_) {}
    }
  }
}

export function playerEffect(
  player: Player,
  effectId: string,
  duration: number,
  amplifier: number = 0,
  showParticles: boolean = true,
) {
  try {
    player.addEffect(effectId, duration, { amplifier, showParticles });
  } catch (err) {
    console.error(`[LuckBlock] Effect error: ${effectId}`, err);
  }
}

export function clearInventory(player: Player) {
  try {
    const cont = player.getComponent(EntityComponentTypes.Inventory)?.container;
    if (cont) cont.clearAll();
  } catch (err) {
    console.error(err);
  }
}

export function giveItem(player: Player, itemId: string, amount: number = 1) {
  try {
    const cont = player.getComponent(EntityComponentTypes.Inventory)?.container;
    if (!cont) return;
    for (let i = 0; i < cont.size; i++) {
      if (!cont.getItem(i)) {
        cont.setItem(i, new ItemStack(itemId, amount));
        return;
      }
    }
  } catch (err) {
    console.error(err);
  }
}

export function setHelmet(player: Player, itemId: string) {
  try {
    const eq = player.getComponent(
      EntityComponentTypes.Equippable,
    ) as EntityEquippableComponent;
    if (eq) eq.setEquipment(EquipmentSlot.Head, new ItemStack(itemId));
  } catch (err) {
    console.error(`[LuckBlock] Helmet error: ${itemId}`, err);
  }
}

export function clearMainhand(player: Player) {
  try {
    const eq = player.getComponent(
      EntityComponentTypes.Equippable,
    ) as EntityEquippableComponent;
    if (eq) eq.setEquipment(EquipmentSlot.Mainhand);
  } catch (err) {
    console.error(err);
  }
}
