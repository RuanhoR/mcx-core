import {
  Dimension,
  Entity,
  EntityComponentTypes,
  EntityInventoryComponent,
  ItemStack,
  Player,
  system,
  world,
  type Block,
  type RawMessage,
  type Vector3,
} from '@minecraft/server';
import { mainhand, selectEvent } from './utils';
import luckyEvents from './events/luckyEvents';
import badEvents from './events/badEvents';
import { LoreParser } from './loreParser';
import { luckBlockTypeId, WorldDymicPropKeys } from '../config';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui';
export class LuckBlockCore {
  public static async onBreak(block: Block, player: Player) {
    // don't clean luckBlock item, because loot null
    // need get block luckNum from world Dyprop
    const luckNum =
      this.removeAndReturnBlockLuckNumData(block.location, block.dimension) ||
      0;
    const exec = selectEvent(luckyEvents, badEvents, luckNum);
    await exec(block, player);
  }
  public static async onHit(entity: Entity, player: Player) {
    const exec = selectEvent(luckyEvents, badEvents, 0);
    let data: {
      location: Vector3;
      dimension: Dimension;
    };
    try {
      data = {
        dimension: entity.dimension,
        location: entity.location,
      };
    } catch {
      try {
        data = {
          dimension: player.dimension,
          location: entity.location,
        };
      } catch {
        data = {
          dimension: player.dimension,
          location: player.location,
        };
      }
    }
    await exec(data, player);
  }
  public static LoreParser = LoreParser;
  public static addBlockLuckNumData(
    location: Vector3,
    dimension: Dimension,
    num: number,
  ) {
    let oldValue = world.getDynamicProperty(
      WorldDymicPropKeys.LuckBlockMap,
    ) as string;
    if (!oldValue || typeof oldValue !== 'string') oldValue = '[]';
    let oldParsed: {
      l: Vector3;
      d: string;
      n: number;
    }[];
    try {
      oldParsed = JSON.parse(oldValue);
    } catch (_) {
      console.warn(`[LuckBlockCore]: Parse Block Data Error: ${_}`);
      oldParsed = [];
    }
    oldParsed.push({
      l: location,
      d: dimension.id,
      n: num,
    });
    world.setDynamicProperty(
      WorldDymicPropKeys.LuckBlockMap,
      JSON.stringify(oldParsed),
    );
  }
  private static removeAndReturnBlockLuckNumData(
    location: Vector3,
    dimension: Dimension,
  ) {
    let oldValue = world.getDynamicProperty(
      WorldDymicPropKeys.LuckBlockMap,
    ) as string;
    if (!oldValue || typeof oldValue !== 'string') oldValue = '[]';
    let oldParsed: {
      l: Vector3;
      d: string;
      n: number;
    }[];
    try {
      oldParsed = JSON.parse(oldValue);
    } catch (_) {
      console.warn(`[LuckBlockCore]: Parse Block Data Error: ${_}`);
      oldParsed = [];
    }
    const index = oldParsed.findIndex(v => {
      return (
        v.d == dimension.id &&
        v.l.x == location.x &&
        v.l.y == location.y &&
        v.l.z == location.z
      );
    });
    if (index === -1) return 0;
    const luckNum = oldParsed[index].n;
    oldParsed.splice(index, 1);
    world.setDynamicProperty(
      WorldDymicPropKeys.LuckBlockMap,
      JSON.stringify(oldParsed),
    );
    return luckNum;
  }
  public static startLoop() {
    system.runInterval(
      () =>
        system.run(() => {
          try {
            let oldValue = world.getDynamicProperty(
              WorldDymicPropKeys.LuckBlockMap,
            ) as string;
            if (!oldValue || typeof oldValue !== 'string') oldValue = '[]';
            let oldParsed: {
              l: Vector3;
              d: string;
              n: number;
            }[];
            try {
              oldParsed = JSON.parse(oldValue);
            } catch (_) {
              console.warn(`[LuckBlockCore]: Parse Block Data Error: ${_}`);
              oldParsed = [];
            }
            for (
              let blockDataIndex = 0;
              blockDataIndex < oldParsed.length;
              blockDataIndex++
            ) {
              const blockData = oldParsed[blockDataIndex];
              if (!blockData) continue;
              const isVaild =
                world.getDimension(blockData.d).getBlock(blockData.l)?.typeId ==
                luckBlockTypeId;
              if (!isVaild) {
                oldParsed.splice(blockDataIndex, 1);
                blockDataIndex--;
              }
            }
            world.setDynamicProperty(
              WorldDymicPropKeys.LuckBlockMap,
              JSON.stringify(oldParsed),
            );
          } catch (err) {
            console.warn('Check LuckBlock err: ' + err);
          }
        }),
      100,
    );

    system.runInterval(() => {
      const players = world.getPlayers();
      for (const player of players) {
        if (!mainhand(player)) continue;
        if (
          (mainhand(player) as ItemStack)?.typeId == luckBlockTypeId &&
          player.isSneaking
        ) {
          system.run(() => LuckBlockCore.showLuckNumChangeForm(player));
        }
      }
    }, 10);
  }
  private static readonly materialAmplifier = new Map<string, number>([
    ['minecraft:rotten_flesh', -20],
    ['minecraft:spider_eye', -30],
    ['minecraft:gold_ingot', 60],
    ['minecraft:diamond', 70],
    ['minecraft:emerald', 100],
  ]);

  public static async showLuckNumChangeForm(player: Player) {
    const luckBlockSlot = await this._pickInventorySlot(
      player,
      { translate: 'sapi.form.lucknum.select_luckblock' },
      'sapi.form.lucknum.no_luckblock',
      item => item?.typeId === luckBlockTypeId,
    );
    if (luckBlockSlot === undefined) return;

    const materialSlot = await this._pickInventorySlot(
      player,
      { translate: 'sapi.form.lucknum.select_material' },
      'sapi.form.lucknum.no_material',
      item => item !== undefined && this.materialAmplifier.has(item.typeId),
    );
    if (materialSlot === undefined) return;

    const inv = player.getComponent(
      EntityComponentTypes.Inventory,
    ) as EntityInventoryComponent;
    if (!inv?.container) return;

    const luckBlockItem = inv.container.getItem(luckBlockSlot);
    const materialItem = inv.container.getItem(materialSlot);
    if (!luckBlockItem || !materialItem) return;

    const maxCount = Math.min(luckBlockItem.amount, materialItem.amount);
    if (maxCount < 1) return;

    const modal = new ModalFormData()
      .title({ translate: 'sapi.form.lucknum.title' })
      .slider({ translate: 'sapi.form.lucknum.quantity' }, 1, maxCount, {
        defaultValue: 1,
        valueStep: 1,
      });
    const modalResult = await modal.show(player);
    if (modalResult.canceled || !modalResult.formValues) return;
    const quantity = modalResult.formValues[0] as number;

    const loreStr = luckBlockItem.getLore()[0];
    let baseLuck = 0;
    if (loreStr) {
      try {
        baseLuck = LoreParser.parseLuckBlockLore(loreStr).num;
      } catch (_) {}
    }

    const amplifier = this.materialAmplifier.get(materialItem.typeId)!;
    let newLuck = baseLuck + amplifier;
    if (newLuck > 100) newLuck = 100;
    if (newLuck < -100) newLuck = -100;

    if (luckBlockItem.amount > quantity) {
      luckBlockItem.amount -= quantity;
      inv.container.setItem(luckBlockSlot, luckBlockItem);
    } else {
      inv.container.setItem(luckBlockSlot, undefined);
    }

    if (materialItem.amount > quantity) {
      materialItem.amount -= quantity;
      inv.container.setItem(materialSlot, materialItem);
    } else {
      inv.container.setItem(materialSlot, undefined);
    }

    const newItem = new ItemStack(luckBlockTypeId, quantity);
    newItem.setLore([
      LoreParser.generateLuckBlockLore({
        type: newLuck > 0 ? 'good' : 'bad',
        num: newLuck,
      }),
    ]);
    player.addItem(newItem);
  }

  private static async _pickInventorySlot(
    player: Player,
    title: string | RawMessage,
    noItemLangKey: string,
    filter?: (item: ItemStack | undefined) => boolean,
  ): Promise<number | undefined> {
    const inv = player.getComponent(
      EntityComponentTypes.Inventory,
    ) as EntityInventoryComponent;
    if (!inv?.container) {
      player.sendMessage('Unkown Error: Cannot resolve your inventory');
      return undefined;
    }

    const form = new ActionFormData().title(title);
    const slotMap: number[] = [];

    for (let i = 0; i < inv.container.size; i++) {
      const item = inv.container.getItem(i);
      if (filter && !filter(item)) continue;
      form.button({
        rawtext: [
          {
            translate: item?.localizationKey,
          },
          {
            text: ' \n',
          },
          {
            translate: 'sapi.form.lucknum.slot',
            with: [i.toString()],
          },
        ],
      });
      slotMap.push(i);
    }

    if (slotMap.length === 0) {
      player.sendMessage({ translate: noItemLangKey });
      return undefined;
    }

    const r = await form.show(player);
    if (r.canceled || r.selection === undefined) return undefined;
    return slotMap[r.selection];
  }
}
