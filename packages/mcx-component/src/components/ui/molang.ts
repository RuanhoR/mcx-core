import type { UIBinding, UIBindingCondition, UIBindingType } from './types';

/**
 * Molang expressions and JSON UI bindings.
 *
 * JSON UI is data-driven: a control shows values from *bindings*, and a binding
 * is a Molang expression evaluated by the client. Writing those expressions as
 * raw strings in a template works for simple cases but loses typing and makes
 * composition painful (`"(#text == 'a') && (#visible)"`). These classes build
 * the same strings from code:
 *
 * ```ts
 * Molang.query('get_health').div(20).mul(100) // "(query.get_health / 20) * 100"
 * Molang.bind.view(Molang.variable('#text'), '#label')
 * // { binding_type: 'view', source_property_name: '(#text)', target_property_name: '#label' }
 * ```
 *
 * Reference: https://learn.microsoft.com/en-us/minecraft/creator/reference/content/molangreference
 */

/** Anything that can appear as an operand of a Molang expression. */
export type MolangInput = string | number | boolean | MolangExpression;

/** Raw Molang source, with helpers to compose larger expressions. */
export class MolangExpression {
  readonly source: string;

  constructor(source: string) {
    this.source = source;
  }

  /** Wrap raw Molang text, e.g. `Molang.raw('query.day > 3')`. */
  static raw(source: string): MolangExpression {
    return new MolangExpression(String(source));
  }

  /** A number literal. */
  static literal(value: number): MolangExpression {
    if (!Number.isFinite(value)) {
      throw new Error(
        `[molang]: literal must be a finite number, got ${value}`,
      );
    }
    return new MolangExpression(String(value));
  }

  /** A Molang string literal (`'text'`). */
  static string(value: string): MolangExpression {
    return new MolangExpression(
      `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`,
    );
  }

  /** A boolean literal, rendered as `true` / `false`. */
  static bool(value: boolean): MolangExpression {
    return new MolangExpression(value ? 'true' : 'false');
  }

  /** `query.<name>` — the entity/screen queries, e.g. `query.get_health`. */
  static query(name: string): MolangExpression {
    const trimmed = name.replace(/^query\.|^q\./, '');
    return new MolangExpression(`query.${trimmed}`);
  }

  /** `context.<name>` — context values for the current control. */
  static context(name: string): MolangExpression {
    return new MolangExpression(`context.${name.replace(/^context\./, '')}`);
  }

  /**
   * A binding variable. `#name` is a view/control property (JSON UI names),
   * `$name` is a global variable from `_global_variables.json`.
   */
  static variable(name: string): MolangExpression {
    const value = name.trim();
    if (!value.startsWith('#') && !value.startsWith('$')) {
      throw new Error(
        `[molang]: variable must start with "#" (view) or "$" (global), got "${name}"`,
      );
    }
    return new MolangExpression(value);
  }

  /** A `math.*` call, e.g. `Molang.math('clamp', x, 0, 1)`. */
  static math(name: string, ...args: MolangInput[]): MolangExpression {
    return MolangExpression.call(`math.${name.replace(/^math\./, '')}`, args);
  }

  /** Any function call, e.g. `Molang.call('query.is_item_name_any', ...)`. */
  static call(name: string, args: MolangInput[] = []): MolangExpression {
    return new MolangExpression(
      `${name}(${args.map(arg => toMolangSource(arg)).join(', ')})`,
    );
  }

  /** `cond ? then : else`. */
  static when(
    condition: MolangInput,
    then: MolangInput,
    otherwise: MolangInput,
  ): MolangExpression {
    return new MolangExpression(
      `(${toMolangSource(condition)} ? ${toMolangSource(then)} : ${toMolangSource(otherwise)})`,
    );
  }

  /** String concatenation with `+` (Molang treats `'a' + 'b'` as one string). */
  static concat(...parts: MolangInput[]): MolangExpression {
    if (parts.length === 0) return MolangExpression.string('');
    return parts
      .map(part => asExpression(part))
      .reduce((left, right) => left.add(right));
  }

  /** `this` as Molang source. */
  toMolang(): string {
    return this.source;
  }

  toString(): string {
    return this.source;
  }

  private binary(operator: string, other: MolangInput): MolangExpression {
    return new MolangExpression(
      `(${this.source} ${operator} ${toMolangSource(other)})`,
    );
  }

  add(other: MolangInput): MolangExpression {
    return this.binary('+', other);
  }
  sub(other: MolangInput): MolangExpression {
    return this.binary('-', other);
  }
  mul(other: MolangInput): MolangExpression {
    return this.binary('*', other);
  }
  div(other: MolangInput): MolangExpression {
    return this.binary('/', other);
  }
  mod(other: MolangInput): MolangExpression {
    return this.binary('%', other);
  }
  gt(other: MolangInput): MolangExpression {
    return this.binary('>', other);
  }
  gte(other: MolangInput): MolangExpression {
    return this.binary('>=', other);
  }
  lt(other: MolangInput): MolangExpression {
    return this.binary('<', other);
  }
  lte(other: MolangInput): MolangExpression {
    return this.binary('<=', other);
  }
  eq(other: MolangInput): MolangExpression {
    return this.binary('==', other);
  }
  neq(other: MolangInput): MolangExpression {
    return this.binary('!=', other);
  }
  and(other: MolangInput): MolangExpression {
    return this.binary('&&', other);
  }
  or(other: MolangInput): MolangExpression {
    return this.binary('||', other);
  }
  /** Unary minus. */
  neg(): MolangExpression {
    return new MolangExpression(`(-${this.source})`);
  }
  /** Logical negation. */
  not(): MolangExpression {
    return new MolangExpression(`(!${this.source})`);
  }
}

function asExpression(value: MolangInput): MolangExpression {
  return value instanceof MolangExpression
    ? value
    : new MolangExpression(toMolangSource(value));
}

/** Render any operand into Molang source. */
export function toMolangSource(value: MolangInput): string {
  if (value instanceof MolangExpression) return value.source;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
}

/** `binding_type` — where the source expression is evaluated. */
export type MolangBindingType = UIBindingType;

/** `binding_condition` — when the binding is evaluated. */
export type MolangBindingCondition = UIBindingCondition;

export interface MolangBindingInit {
  /** expression evaluated by the client */
  source: MolangInput;
  /** property written on the target control, e.g. `#text` */
  target?: string | undefined;
  /** defaults to `view` */
  type?: MolangBindingType | undefined;
  /** defaults to `always` */
  condition?: MolangBindingCondition | undefined;
  /** `binding_name` — name the binding exposes on the control */
  name?: string | undefined;
  /** `binding_name_override` — rename an inherited binding */
  nameOverride?: string | undefined;
  /** `binding_collection_name` — required by `collection` bindings */
  collectionName?: string | undefined;
  /** `source_control_name` — read the source from another control */
  sourceControl?: string | undefined;
  /** any other JSON UI binding field, passed through unchanged */
  [key: string]: unknown;
}

/**
 * One JSON UI binding: a Molang source expression written into a target
 * property of a control.
 */
export class MolangBinding {
  readonly binding: UIBinding;

  constructor(init: MolangBindingInit) {
    const {
      source,
      target,
      type,
      condition,
      name,
      nameOverride,
      collectionName,
      sourceControl,
      ...rest
    } = init;
    this.binding = {
      ...rest,
      source_property_name: toMolangSource(source),
      binding_type: type ?? 'view',
      binding_condition: condition ?? 'always',
    };
    if (target) this.binding.target_property_name = target;
    if (name) this.binding.binding_name = name;
    if (nameOverride) this.binding.binding_name_override = nameOverride;
    if (collectionName) this.binding.binding_collection_name = collectionName;
    if (sourceControl) this.binding.source_control_name = sourceControl;
  }

  /** Binding that reads a control property, e.g. `#text`. */
  static view(
    source: MolangInput,
    target: string,
    condition?: MolangBindingCondition,
  ): MolangBinding {
    return new MolangBinding({ source, target, type: 'view', condition });
  }

  /** Binding that evaluates against global variables (`$var`). */
  static global(
    source: MolangInput,
    target: string,
    condition?: MolangBindingCondition,
  ): MolangBinding {
    return new MolangBinding({ source, target, type: 'global', condition });
  }

  /** Binding inside a collection factory (needs `collectionName`). */
  static collection(
    source: MolangInput,
    target: string,
    collectionName: string,
    condition?: MolangBindingCondition,
  ): MolangBinding {
    return new MolangBinding({
      source,
      target,
      collectionName,
      type: 'collection',
      condition,
    });
  }

  /** Plain JSON UI object, ready to be pushed into `bindings`. */
  toJSON(): UIBinding {
    return this.binding;
  }

  toString(): string {
    return `${this.binding.source_property_name ?? ''} -> ${
      this.binding.target_property_name ?? ''
    }`;
  }
}

/**
 * Convenience facade so call sites read like Molang:
 *
 * ```ts
 * Molang.variable('#text');
 * Molang.query('get_health').div(20);
 * Molang.bind.view(Molang.query('get_health'), '#text');
 * ```
 */
export const Molang = {
  raw: (source: string) => MolangExpression.raw(source),
  literal: (value: number) => MolangExpression.literal(value),
  string: (value: string) => MolangExpression.string(value),
  bool: (value: boolean) => MolangExpression.bool(value),
  query: (name: string) => MolangExpression.query(name),
  context: (name: string) => MolangExpression.context(name),
  variable: (name: string) => MolangExpression.variable(name),
  math: (name: string, ...args: MolangInput[]) =>
    MolangExpression.math(name, ...args),
  call: (name: string, args: MolangInput[] = []) =>
    MolangExpression.call(name, args),
  when: (condition: MolangInput, then: MolangInput, otherwise: MolangInput) =>
    MolangExpression.when(condition, then, otherwise),
  concat: (...parts: MolangInput[]) => MolangExpression.concat(...parts),
  /** Binding constructors, grouped by `binding_type`. */
  bind: {
    view: (
      source: MolangInput,
      target: string,
      condition?: MolangBindingCondition,
    ) => MolangBinding.view(source, target, condition),
    global: (
      source: MolangInput,
      target: string,
      condition?: MolangBindingCondition,
    ) => MolangBinding.global(source, target, condition),
    collection: (
      source: MolangInput,
      target: string,
      collectionName: string,
      condition?: MolangBindingCondition,
    ) => MolangBinding.collection(source, target, collectionName, condition),
    /** Custom binding, for fields the shortcuts do not cover. */
    of: (init: MolangBindingInit) => new MolangBinding(init),
  },
} as const;
