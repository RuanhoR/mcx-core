import {
  system,
  StartupEvent,
  CustomCommand,
  CustomCommandOrigin,
  CustomCommandResult,
  CustomCommandParameter,
  CustomCommandParamType,
  CustomCommandRegistry,
  CommandPermissionLevel,
} from '@minecraft/server';

type CommandParamTypeName =
  | 'boolean'
  | 'number'
  | 'float'
  | 'integer'
  | 'string'
  | 'player'
  | 'entity'
  | 'entityType'
  | 'blockType'
  | 'itemType'
  | 'location'
  | 'enum';

interface ParamOptions {
  type: CommandParamTypeName;
  min?: number;
  max?: number;
  options?: string[];
}

type CommandParamDef = CommandParamTypeName | ParamOptions;

const paramTypeMap: Record<string, CustomCommandParamType> = {
  boolean: CustomCommandParamType.Boolean,
  number: CustomCommandParamType.Float,
  float: CustomCommandParamType.Float,
  integer: CustomCommandParamType.Integer,
  string: CustomCommandParamType.String,
  player: CustomCommandParamType.PlayerSelector,
  entity: CustomCommandParamType.EntitySelector,
  entityType: CustomCommandParamType.EntityType,
  blockType: CustomCommandParamType.BlockType,
  itemType: CustomCommandParamType.ItemType,
  location: CustomCommandParamType.Location,
  enum: CustomCommandParamType.Enum,
};

let isInitd = false;
let subscribed = false;
const commandQueue: Command[] = [];

function registryCommand(command: Command): void {
  if (isInitd) {
    console.error(
      `[mcx command]: Cannot register command '${command.getName()}' after startup`,
    );
    return;
  }

  commandQueue.push(command);

  if (!subscribed) {
    subscribed = true;
    system.beforeEvents.startup.subscribe((event: StartupEvent) => {
      isInitd = true;
      const registry = event.customCommandRegistry;
      for (const cmd of commandQueue) {
        cmd.registerEnums(registry);
        try {
          registry.registerCommand(cmd.toCustomCommand(), cmd.getCallback());
        } catch (e) {
          console.error(
            `[mcx command]: Failed to register command '${cmd.getName()}'`,
            e,
          );
        }
      }
      commandQueue.length = 0;
    });
  }
}

class Command {
  private name: string;
  private description: string;
  private permissionLevel: CommandPermissionLevel = CommandPermissionLevel.Any;
  private cheatsRequired: boolean = true;
  private mandatoryParams: CustomCommandParameter[] = [];
  private optionalParams: CustomCommandParameter[] = [];
  private callback:
    | ((
        origin: CustomCommandOrigin,
        ...args: unknown[]
      ) => CustomCommandResult | undefined)
    | null = null;
  private enums: { name: string; values: string[] }[] = [];

  constructor(name: string) {
    this.name = name;
    this.description = name;
  }

  getName(): string {
    return this.name;
  }

  getCallback(): (
    origin: CustomCommandOrigin,
    ...args: unknown[]
  ) => CustomCommandResult | undefined {
    return this.callback!;
  }

  toCustomCommand(): CustomCommand {
    const cmd: CustomCommand = {
      name: this.name,
      description: this.description,
      permissionLevel: this.permissionLevel,
      cheatsRequired: this.cheatsRequired,
    };
    if (this.mandatoryParams.length > 0) {
      cmd.mandatoryParameters = this.mandatoryParams;
    }
    if (this.optionalParams.length > 0) {
      cmd.optionalParameters = this.optionalParams;
    }
    return cmd;
  }

  registerEnums(registry: CustomCommandRegistry): void {
    for (const enumDef of this.enums) {
      try {
        registry.registerEnum(enumDef.name, enumDef.values);
      } catch (e) {
        console.error(
          `[mcx command]: Failed to register enum '${enumDef.name}' for command '${this.name}'`,
          e,
        );
      }
    }
  }

  addMandatoryParameter(name: string, param: CommandParamDef): this {
    this.mandatoryParams.push(this.resolveParameter(name, param));
    return this;
  }

  addOptionalParameter(name: string, param: CommandParamDef): this {
    this.optionalParams.push(this.resolveParameter(name, param));
    return this;
  }

  setDescription(description: string): this {
    this.description = description;
    return this;
  }

  setPermissionLevel(level: CommandPermissionLevel): this {
    this.permissionLevel = level;
    return this;
  }

  setCheatsRequired(required: boolean): this {
    this.cheatsRequired = required;
    return this;
  }

  action(
    callback: (
      origin: CustomCommandOrigin,
      ...args: unknown[]
    ) => CustomCommandResult | undefined,
  ): void {
    this.callback = callback;
    registryCommand(this);
  }

  private resolveParameter(
    name: string,
    param: CommandParamDef,
  ): CustomCommandParameter {
    if (typeof param === 'string') {
      return {
        name,
        type: paramTypeMap[param] ?? CustomCommandParamType.String,
      };
    }

    const result: CustomCommandParameter = {
      name,
      type: paramTypeMap[param.type] ?? CustomCommandParamType.String,
    };

    if (param.type === 'enum' && param.options && param.options.length > 0) {
      this.enums.push({ name, values: param.options });
      result.enumName = name;
    }

    return result;
  }
}

export { Command, registryCommand };
