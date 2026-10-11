import {
  applyFormatVersion,
  requireField,
  requireIdentifier,
  requirePresent,
} from '../shared';

type RecipeType =
  | 'shaped'
  | 'shapeless'
  | 'furnace'
  | 'smithing_transform'
  | 'smithing_trim'
  | 'brewing_container'
  | 'brewing_mix';

/**
 * An item reference accepted anywhere a recipe takes an ingredient.
 * `item` and `tag` are mutually exclusive; `data` is deprecated from 1.20.0 on
 * and only works on older format versions.
 */
interface RecipeItem {
  item?: string;
  tag?: string;
  data?: number;
  count?: number;
}

/** A required item reference — the docs mark `result` as mandatory. */
type RecipeResult = RecipeItem & { item: string };

/** `template` / `base` / `addition` accept a bare id, an item or an item tag. */
type RecipeItemRef =
  | string
  | ({ item: string } & RecipeItem)
  | ({ tag: string } & RecipeItem);

/** Recipe book unlock condition; both fields are documented. */
interface RecipeUnlock {
  item: string;
  context?: 'AlwaysUnlocked' | 'PlayerInWater' | 'PlayerHasManyItems' | 'None';
}

/** `result` may be a single item or an array of them. */
type RecipeResultField = RecipeResult | RecipeResult[];

interface RecipeComponentOptions {
  format: string;
  id: string;
  type: RecipeType;
  tags?: string[];
  /** recipe book group identifier (shaped / shapeless only) */
  group?: string;
  priority?: number;
  assume_symmetry?: boolean;
  pattern?: string[];
  key?: Record<string, RecipeItem>;
  ingredients?: RecipeItem[];
  result?: RecipeResultField | string;
  input?: RecipeItemRef;
  output?: string;
  template?: RecipeItemRef;
  base?: RecipeItemRef;
  addition?: RecipeItemRef;
  reagent?: string;
  /** Items that unlock this recipe, e.g. [{ item: "minecraft:iron_ingot" }] */
  unlock?: RecipeUnlock[];
}

const isSmithing = (type: RecipeType): boolean =>
  type === 'smithing_transform' || type === 'smithing_trim';

class RecipeComponent {
  #opt: RecipeComponentOptions;
  constructor(opt: RecipeComponentOptions) {
    this.#opt = opt;
  }

  getFormat(): string {
    return this.#opt.format;
  }
  setFormat(value: string) {
    this.#opt.format = value;
  }

  getId(): string {
    return this.#opt.id;
  }
  setId(value: string) {
    this.#opt.id = value;
  }

  getType(): RecipeType {
    return this.#opt.type;
  }
  setType(value: RecipeType) {
    this.#opt.type = value;
  }

  getTags(): string[] | undefined {
    return this.#opt.tags;
  }
  setTags(value: string[]) {
    this.#opt.tags = value;
  }

  getGroup(): string | undefined {
    return this.#opt.group;
  }
  setGroup(value: string) {
    this.#opt.group = value;
  }

  getPriority(): number | undefined {
    return this.#opt.priority;
  }
  setPriority(value: number) {
    this.#opt.priority = value;
  }

  getAssumeSymmetry(): boolean | undefined {
    return this.#opt.assume_symmetry;
  }
  setAssumeSymmetry(value: boolean) {
    this.#opt.assume_symmetry = value;
  }

  getPattern(): string[] | undefined {
    return this.#opt.pattern;
  }
  setPattern(value: string[]) {
    this.#opt.pattern = value;
  }

  getKey(): Record<string, RecipeItem> | undefined {
    return this.#opt.key;
  }
  setKey(value: Record<string, RecipeItem>) {
    this.#opt.key = value;
  }

  getIngredients(): RecipeItem[] | undefined {
    return this.#opt.ingredients;
  }
  setIngredients(value: RecipeItem[]) {
    if (!Array.isArray(value)) {
      throw new Error(
        '[mcx component]: recipe ingredients must be an array of item objects',
      );
    }
    this.#opt.ingredients = value;
  }

  getResult(): RecipeResultField | string | undefined {
    return this.#opt.result;
  }
  setResult(value: RecipeResultField | string) {
    this.#opt.result = value;
  }

  getInput(): RecipeItemRef | undefined {
    return this.#opt.input;
  }
  setInput(value: RecipeItemRef) {
    this.#opt.input = value;
  }

  getOutput(): string | undefined {
    return this.#opt.output;
  }
  setOutput(value: string) {
    this.#opt.output = value;
  }

  getTemplate(): RecipeItemRef | undefined {
    return this.#opt.template;
  }
  setTemplate(value: RecipeItemRef) {
    this.#opt.template = value;
  }

  getBase(): RecipeItemRef | undefined {
    return this.#opt.base;
  }
  setBase(value: RecipeItemRef) {
    this.#opt.base = value;
  }

  getAddition(): RecipeItemRef | undefined {
    return this.#opt.addition;
  }
  setAddition(value: RecipeItemRef) {
    this.#opt.addition = value;
  }

  getReagent(): string | undefined {
    return this.#opt.reagent;
  }
  setReagent(value: string) {
    this.#opt.reagent = value;
  }

  getUnlock(): RecipeUnlock[] | undefined {
    return this.#opt.unlock;
  }
  setUnlock(value: RecipeUnlock[]) {
    if (!Array.isArray(value)) {
      throw new Error(
        '[mcx component]: unlock must be an array of { item: string } objects',
      );
    }
    this.#opt.unlock = value;
  }

  /** shared `description` / `tags` / `group` preamble. */
  private base(defaultTags: string[]) {
    const data: Record<string, unknown> = {
      description: {
        identifier: requireIdentifier(this.#opt.id, 'recipe'),
      },
      tags: this.#opt.tags?.length ? this.#opt.tags : defaultTags,
    };
    if (this.#opt.group !== undefined) data.group = this.#opt.group;
    return data;
  }

  /** every recipe that produces something must declare `result`. */
  private result() {
    return requirePresent(this.#opt.result, 'recipe', 'result');
  }

  /** furnace / brewing recipes produce a single item id in `output`. */
  private output() {
    return requireField(this.#opt.output, 'recipe', 'output');
  }

  private makeShaped() {
    const data = this.base(['crafting_table']);
    if (this.#opt.assume_symmetry !== undefined)
      data.assume_symmetry = this.#opt.assume_symmetry;
    if (this.#opt.pattern) data.pattern = this.#opt.pattern;
    if (this.#opt.key) data.key = this.#opt.key;
    if (this.#opt.priority !== undefined) data.priority = this.#opt.priority;
    data.result = this.result();
    if (this.#opt.unlock) data.unlock = this.#opt.unlock;
    return {
      'minecraft:recipe_shaped': data,
    };
  }

  private makeShapeless() {
    const data = this.base(['crafting_table']);
    if (this.#opt.ingredients) data.ingredients = this.#opt.ingredients;
    if (this.#opt.priority !== undefined) data.priority = this.#opt.priority;
    data.result = this.result();
    if (this.#opt.unlock) data.unlock = this.#opt.unlock;
    return {
      'minecraft:recipe_shapeless': data,
    };
  }

  private makeFurnace() {
    const data = this.base(['furnace']);
    data.input = requirePresent(this.#opt.input, 'recipe', 'input');
    data.output = this.output();
    return {
      'minecraft:recipe_furnace': data,
    };
  }

  private makeSmithingTransform() {
    const data = this.base(['smithing_table']);
    data.template = requirePresent(this.#opt.template, 'recipe', 'template');
    data.base = requirePresent(this.#opt.base, 'recipe', 'base');
    data.addition = requirePresent(this.#opt.addition, 'recipe', 'addition');
    data.result = this.result();
    return {
      'minecraft:recipe_smithing_transform': data,
    };
  }

  private makeSmithingTrim() {
    const data = this.base(['smithing_table']);
    data.template = requirePresent(this.#opt.template, 'recipe', 'template');
    data.base = requirePresent(this.#opt.base, 'recipe', 'base');
    data.addition = requirePresent(this.#opt.addition, 'recipe', 'addition');
    return {
      'minecraft:recipe_smithing_trim': data,
    };
  }

  private makeBrewingContainer() {
    const data = this.base(['brewing_stand']);
    data.input = requireField(this.#opt.input, 'recipe', 'input');
    data.reagent = requireField(this.#opt.reagent, 'recipe', 'reagent');
    data.output = this.output();
    return {
      'minecraft:recipe_brewing_container': data,
    };
  }

  private makeBrewingMix() {
    const data = this.base(['brewing_stand']);
    data.input = requireField(this.#opt.input, 'recipe', 'input');
    data.reagent = requireField(this.#opt.reagent, 'recipe', 'reagent');
    data.output = this.output();
    return {
      'minecraft:recipe_brewing_mix': data,
    };
  }

  public toJSON(): { format_version: string } & Record<string, unknown> {
    if (!this.#opt) throw new Error('[mcx component]: cannot read component');
    const type = this.#opt.type;

    let recipeData: Record<string, unknown>;
    switch (type) {
      case 'shaped':
        recipeData = this.makeShaped();
        break;
      case 'shapeless':
        recipeData = this.makeShapeless();
        break;
      case 'furnace':
        recipeData = this.makeFurnace();
        break;
      case 'smithing_transform':
        recipeData = this.makeSmithingTransform();
        break;
      case 'smithing_trim':
        recipeData = this.makeSmithingTrim();
        break;
      case 'brewing_container':
        recipeData = this.makeBrewingContainer();
        break;
      case 'brewing_mix':
        recipeData = this.makeBrewingMix();
        break;
      default:
        throw new Error(
          `[mcx component]: unknown recipe type: ${String(type)}`,
        );
    }

    const result: { format_version: string } & Record<string, unknown> = {
      format_version: '',
      ...recipeData,
    };
    applyFormatVersion(result, {
      component: 'recipe',
      format: this.#opt.format,
      fallback: isSmithing(type) ? '1.17' : undefined,
      required: true,
    });
    return result;
  }
}

export { RecipeComponent };
export type {
  RecipeComponentOptions,
  RecipeItem,
  RecipeItemRef,
  RecipeResult,
  RecipeResultField,
  RecipeType,
  RecipeUnlock,
};
