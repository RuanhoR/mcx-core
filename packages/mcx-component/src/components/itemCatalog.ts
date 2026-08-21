type ItemCatalogCategory = 'construction' | 'equipment' | 'items' | 'nature';

interface ItemCatalogGroupOptions {
  icon?: string;
  name?: string;
}

interface ItemCatalogGroup {
  group_identifier?: { icon: string; name: string };
  items: string[];
}

interface ItemCatalogOptions {
  format?: string;
  categories?: Record<string, ItemCatalogGroup[]>;
}

class ItemCatalogComponent {
  #opt: ItemCatalogOptions;
  #categories: Record<string, ItemCatalogGroup[]> = {};

  constructor(opt: ItemCatalogOptions = {}) {
    this.#opt = opt;
    if (opt.categories) {
      this.#categories = { ...opt.categories };
    }
  }

  getFormat(): string {
    return this.#opt.format || '1.26.30';
  }

  setFormat(value: string) {
    this.#opt.format = value;
  }

  getCategories(): Record<string, ItemCatalogGroup[]> {
    return this.#categories;
  }

  addGroup(
    category: ItemCatalogCategory,
    items: string[],
    options: ItemCatalogGroupOptions = {},
  ): this {
    const valid = ['construction', 'equipment', 'items', 'nature'];
    if (!valid.includes(category)) {
      throw new Error(
        `[set error]: item_catalog: unknown category "${category}", valid: ${valid.join(', ')}`,
      );
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('[set error]: item_catalog: items must be non-empty array');
    }
    for (const item of items) {
      if (typeof item !== 'string') {
        throw new Error('[set error]: item_catalog: all items must be strings');
      }
    }

    const group: ItemCatalogGroup = { items: [...items] };
    const { icon, name } = options;
    if (icon !== undefined || name !== undefined) {
      if (typeof icon !== 'string' || typeof name !== 'string') {
        throw new Error(
          '[set error]: item_catalog: group_identifier icon and name must both be strings',
        );
      }
      group.group_identifier = { icon, name };
    }

    if (!this.#categories[category]) {
      this.#categories[category] = [];
    }
    this.#categories[category].push(group);
    return this;
  }

  addItem(
    category: ItemCatalogCategory,
    item: string,
    options: ItemCatalogGroupOptions = {},
  ): this {
    return this.addGroup(category, [item], options);
  }

  public toJSON(): Record<string, unknown> {
    const formatVersion = this.#opt.format || '1.26.30';
    const categories = Object.entries(this.#categories).map(
      ([category_name, groups]) => ({
        category_name,
        groups,
      }),
    );

    return {
      format_version: formatVersion,
      'minecraft:crafting_items_catalog': {
        categories,
      },
    };
  }
}

export { ItemCatalogComponent };
