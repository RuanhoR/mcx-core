import { Command } from "@mbler/mcx";
import {
  CommandPermissionLevel,
  CustomCommandStatus,
  ItemStack,
  Player,
  system,
} from "@minecraft/server";
import { luckBlockTypeId } from "../config";
import { LuckBlockCore } from "../core/luckBlock";

export const giveLuckBlockCommand = new Command("rluckly:givelb");

giveLuckBlockCommand.addMandatoryParameter("LuckNumber", "number");
giveLuckBlockCommand.setPermissionLevel(CommandPermissionLevel.GameDirectors);
giveLuckBlockCommand.action((origin, ...args) => {
  if (origin.sourceEntity?.typeId !== "minecraft:player") {
    return {
      status: CustomCommandStatus.Failure,
      message: "Must Player exec",
    };
  }
  const luckNum = parseInt(args[0] as string);
  if (
    typeof luckNum !== "number" ||
    isNaN(luckNum) ||
    luckNum < -100 ||
    luckNum > 100
  ) {
    return {
      status: CustomCommandStatus.Failure,
      message: "Invaild Paramer",
    };
  }
  system.runTimeout(() => {
    const player = origin.sourceEntity as Player;
    const item = new ItemStack(luckBlockTypeId);
    item.setLore([
      LuckBlockCore.LoreParser.generateLuckBlockLore({
        type: luckNum > 0 ? "good" : "bad",
        num: luckNum,
      }),
    ]);
    player.addItem(item);
  }, 2);
  return {
    status: CustomCommandStatus.Success,
    message: "Success",
  };
});
