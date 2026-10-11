import type { MenuCategoryName } from '@mbler/mcx-types';

export const MenuCategoryArray = [
  'construction',
  'nature',
  'equipment',
  'items',
  'none',
] as const satisfies readonly MenuCategoryName[];

export type MenuCategory = (typeof MenuCategoryArray)[number];

export const MenuCategoryEnum = MenuCategoryArray;

export default MenuCategory;
