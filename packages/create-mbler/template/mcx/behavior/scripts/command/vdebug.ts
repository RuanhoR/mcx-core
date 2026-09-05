import { Command, showForm } from "@mbler/mcx";
import {
  CommandPermissionLevel,
  CustomCommandStatus,
  system,
  world,
} from "@minecraft/server";
import { Player } from "@minecraft/server";
import { LuckBlockCore } from "../core/luckBlock";

export const debugCommand = new Command("rluckly:vdebug");

debugCommand.addMandatoryParameter("option: [remove | list | read]", "string");
debugCommand.addOptionalParameter("value: any", "string");
debugCommand.setPermissionLevel(CommandPermissionLevel.GameDirectors);
debugCommand.action((origin, ...args) => {
  if (origin.sourceEntity?.typeId !== "minecraft:player") {
    return {
      status: CustomCommandStatus.Failure,
      message: "Must Player exec",
    };
  }
  if (args[0] == "remove" && typeof args[1] == "string") {
    void world.setDynamicProperty(args[1]);
    return {
      status: CustomCommandStatus.Success,
      message: "ok",
    };
  }
  if (args[0] == "list") {
    return {
      status: CustomCommandStatus.Success,
      message: `success with data: ${world.getDynamicPropertyIds()}`,
    };
  }
  if (args[0] == "read" && typeof args[1] == "string") {
    return {
      status: CustomCommandStatus.Success,
      message: `success with data: ${world.getDynamicProperty(args[1])}`,
    };
  }
  if (args[0] == "_") {
    if (args[1] == "us_lbmenu") {
      system.run(() => {
        LuckBlockCore.showLuckNumChangeForm(origin.sourceEntity as Player);
      });
      return {
        status: CustomCommandStatus.Success,
        message: "Success",
      };
    }
  }
  return {
    status: CustomCommandStatus.Failure,
    message: "Invaild Paramer",
  };
});
