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
  | 'enum'
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
  | 'location';

interface EnumParamOptions {
  type: 'enum';
  options: string[];
}

interface SimpleParamOptions {
  type: Exclude<CommandParamTypeName, 'enum'>;
}

type ParamOptions = EnumParamOptions | SimpleParamOptions;

type CommandParamDef =
  | CommandParamTypeName
  | ParamOptions;

const paramTypeMap: Record<Exclude<CommandParamTypeName, 'enum'>, CustomCommandParamType> = {
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
};

/** Error patterns that indicate the command/enum already exists from a previous session. */
const DUPLICATE_PATTERNS = [
  'again',
  'already',
  'duplicate',
  'exists',
];

function isDuplicateError(err: unknown): boolean {
  const msg = String(err).toLowerCase();
  return DUPLICATE_PATTERNS.some(p => msg.includes(p));
}

let subscribed = false;
const commandQueue: Command[] = [];

function registryCommand(command: Command): void {
  commandQueue.push(command);

  if (!subscribed) {
    subscribed = true;
    system.beforeEvents.startup.subscribe((event: StartupEvent) => {
      const registry = event.customCommandRegistry;

      // Phase 1: register all enums first so commands can reference them
      const registeredEnums = new Set<string>();
      for (const cmd of commandQueue) {
        cmd.registerEnums(registry, registeredEnums);
      }

      // Phase 2: register commands
      for (const cmd of commandQueue) {
        try {
          registry.registerCommand(cmd.toCustomCommand(), cmd.getCallback());
        } catch (e) {
          if (!isDuplicateError(e)) {
            console.error(
              `[mcx command]: Failed to register command '${cmd.getName()}'`,
              e
            );
          }
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
  /** Globally-unique enum definitions collected during parameter setup */
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
      cmd.mandatoryParameters = [...this.mandatoryParams];
    }
    if (this.optionalParams.length > 0) {
      cmd.optionalParameters = [...this.optionalParams];
    }
    return cmd;
  }

  /**
   * Register all pending enums.  Skips duplicates via `registeredEnums`
   * (shared across commands in the same startup batch).
   */
  registerEnums(
    registry: CustomCommandRegistry,
    registeredEnums: Set<string>
  ): void {
    for (const enumDef of this.enums) {
      if (registeredEnums.has(enumDef.name)) continue;
      registeredEnums.add(enumDef.name);
      try {
        registry.registerEnum(enumDef.name, enumDef.values);
      } catch (e) {
        if (!isDuplicateError(e)) {
          console.error(
            `[mcx command]: Failed to register enum '${enumDef.name}'`,
            e
          );
        }
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
    ) => CustomCommandResult | undefined
  ): void {
    this.callback = callback;
    registryCommand(this);
  }

  /**
   * Resolve a user-facing parameter definition into a CustomCommandParameter.
   *
   * For enum params, the enum is registered under a globally-unique name
   * derived from `<commandName>_<paramName>` to avoid cross-command collisions.
   */
  private resolveParameter(
    paramName: string,
    param: CommandParamDef
  ): CustomCommandParameter {
    // Simple string shorthand → map directly
    if (typeof param === 'string') {
      if (param === 'enum') {
        throw new TypeError(
          `[mcx command]: Parameter '${paramName}' uses type 'enum' but no options were provided. Use an object: { type: 'enum', options: [...] }`
        );
      }
      return {
        name: paramName,
        type: paramTypeMap[param] ?? CustomCommandParamType.String,
      };
    }

    // Enum params: register a uniquely-named enum and reference it
    if (param.type === 'enum') {
      const opts = param as EnumParamOptions;
      if (!opts.options || opts.options.length === 0) {
        throw new TypeError(
          `[mcx command]: Enum parameter '${paramName}' requires non-empty options array`
        );
      }
      // Globally-unique enum name: <command>_<param> (sanitised)
      const enumName = `${this.name.replace(/[^a-zA-Z0-9_]/g, '_')}_${paramName.replace(/[^a-zA-Z0-9_]/g, '_')}`;
      this.enums.push({ name: enumName, values: opts.options });
      return {
        name: paramName,
        type: CustomCommandParamType.Enum,
      };
    }

    // Simple typed params
    const simple = param as SimpleParamOptions;
    return {
      name: paramName,
      type: paramTypeMap[simple.type] ?? CustomCommandParamType.String,
    };
  }
}

export { Command, registryCommand };
