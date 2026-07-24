type RecipeType =
  | 'shaped'
  | 'shapeless'
  | 'furnace'
  | 'smithing_transform'
  | 'smithing_trim'
  | 'brewing_container'
  | 'brewing_mix';

interface RecipeItem {
  item: string;
  data?: number;
  count?: number;
}

interface RecipeComponentOptions {
  format: string;
  id: string;
  type: RecipeType;
  tags?: string[];
  priority?: number;
  assume_symmetry?: boolean;
  pattern?: string[];
  key?: Record<string, RecipeItem>;
  ingredients?: RecipeItem[];
  result?: RecipeItem | string;
  input?: RecipeItem | string;
  output?: string;
  template?: string;
  base?: string;
  addition?: string;
  reagent?: string;
}

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
    this.#opt.ingredients = value;
  }

  getResult(): RecipeItem | string | undefined {
    return this.#opt.result;
  }
  setResult(value: RecipeItem | string) {
    this.#opt.result = value;
  }

  getInput(): RecipeItem | string | undefined {
    return this.#opt.input;
  }
  setInput(value: RecipeItem | string) {
    this.#opt.input = value;
  }

  getOutput(): string | undefined {
    return this.#opt.output;
  }
  setOutput(value: string) {
    this.#opt.output = value;
  }

  getTemplate(): string | undefined {
    return this.#opt.template;
  }
  setTemplate(value: string) {
    this.#opt.template = value;
  }

  getBase(): string | undefined {
    return this.#opt.base;
  }
  setBase(value: string) {
    this.#opt.base = value;
  }

  getAddition(): string | undefined {
    return this.#opt.addition;
  }
  setAddition(value: string) {
    this.#opt.addition = value;
  }

  getReagent(): string | undefined {
    return this.#opt.reagent;
  }
  setReagent(value: string) {
    this.#opt.reagent = value;
  }

  private makeShaped() {
    const data: Record<string, unknown> = {
      description: { identifier: this.#opt.id },
      tags: this.#opt.tags || ['crafting_table'],
    };
    if (this.#opt.assume_symmetry !== undefined) data.assume_symmetry = this.#opt.assume_symmetry;
    if (this.#opt.pattern) data.pattern = this.#opt.pattern;
    if (this.#opt.key) data.key = this.#opt.key;
    if (this.#opt.priority !== undefined) data.priority = this.#opt.priority;
    if (this.#opt.result) data.result = this.#opt.result;
    return {
      'minecraft:recipe_shaped': data,
    };
  }

  private makeShapeless() {
    const data: Record<string, unknown> = {
      description: { identifier: this.#opt.id },
      tags: this.#opt.tags || ['crafting_table'],
    };
    if (this.#opt.ingredients) data.ingredients = this.#opt.ingredients;
    if (this.#opt.priority !== undefined) data.priority = this.#opt.priority;
    if (this.#opt.result) data.result = this.#opt.result;
    return {
      'minecraft:recipe_shapeless': data,
    };
  }

  private makeFurnace() {
    const data: Record<string, unknown> = {
      description: { identifier: this.#opt.id },
      tags: this.#opt.tags || ['furnace'],
    };
    if (this.#opt.input) data.input = this.#opt.input;
    if (this.#opt.output) data.output = this.#opt.output;
    return {
      'minecraft:recipe_furnace': data,
    };
  }

  private makeSmithingTransform() {
    const data: Record<string, unknown> = {
      description: { identifier: this.#opt.id },
      tags: this.#opt.tags || ['smithing_table'],
    };
    if (this.#opt.template) data.template = this.#opt.template;
    if (this.#opt.base) data.base = this.#opt.base;
    if (this.#opt.addition) data.addition = this.#opt.addition;
    if (this.#opt.result) data.result = this.#opt.result;
    return {
      'minecraft:recipe_smithing_transform': data,
    };
  }

  private makeSmithingTrim() {
    const data: Record<string, unknown> = {
      description: { identifier: this.#opt.id },
      tags: this.#opt.tags || ['smithing_table'],
    };
    if (this.#opt.template) data.template = this.#opt.template;
    if (this.#opt.base) data.base = this.#opt.base;
    if (this.#opt.addition) data.addition = this.#opt.addition;
    return {
      'minecraft:recipe_smithing_trim': data,
    };
  }

  private makeBrewingContainer() {
    const data: Record<string, unknown> = {
      description: { identifier: this.#opt.id },
      tags: this.#opt.tags || ['brewing_stand'],
    };
    if (this.#opt.input) data.input = this.#opt.input;
    if (this.#opt.reagent) data.reagent = this.#opt.reagent;
    if (this.#opt.output) data.output = this.#opt.output;
    return {
      'minecraft:recipe_brewing_container': data,
    };
  }

  private makeBrewingMix() {
    const data: Record<string, unknown> = {
      description: { identifier: this.#opt.id },
      tags: this.#opt.tags || ['brewing_stand'],
    };
    if (this.#opt.input) data.input = this.#opt.input;
    if (this.#opt.reagent) data.reagent = this.#opt.reagent;
    if (this.#opt.output) data.output = this.#opt.output;
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
        throw new Error(`[mcx component]: unknown recipe type: ${type}`);
    }

    let formatVersion = '1.12';
    if (
      this.#opt.format &&
      typeof this.#opt.format == 'string' &&
      /^\d+\.\d+\.\d+$/.test(this.#opt.format)
    ) {
      formatVersion = this.#opt.format;
    } else if (type === 'smithing_transform' || type === 'smithing_trim') {
      formatVersion = '1.17';
    } else if (typeof this.#opt.format == 'string') {
      throw new Error('[compile component]: no format');
    }

    return {
      format_version: formatVersion,
      ...recipeData,
    };
  }
}

export { RecipeComponent };
