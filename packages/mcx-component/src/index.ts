import type { BlockComponent } from './components/block';
import type { EntityComponent } from './components/entity';
import type { ItemComponent } from './components/item';
import type { RecipeComponent } from './components/recipe';
import lib, {
  PNGImageComponent,
  JPGImageComponent,
  SVGImageComponent,
  GIFImageComponent,
} from './lib';

type TypeModuleExport = typeof import('./types');

interface Export extends TypeModuleExport {
  PNGImageComponent: typeof PNGImageComponent;
  JPGImageComponent: typeof JPGImageComponent;
  SVGImageComponent: typeof SVGImageComponent;
  GIFImageComponent: typeof GIFImageComponent;
  ItemComponent: typeof ItemComponent;
  RecipeComponent: typeof RecipeComponent;
  BlockComponent: typeof BlockComponent;
  EntityComponent: typeof EntityComponent;
  default: typeof lib;
}

const LAZY_LOADERS: Record<string, () => unknown> = {
  ItemComponent: () => require('./components/item').ItemComponent,
  BlockComponent: () => require('./components/block').BlockComponent,
  RecipeComponent: () => require('./components/recipe').RecipeComponent,
  EntityComponent: () => require('./components/entity').EntityComponent,
};

export default new Proxy(
  {
    PNGImageComponent,
    JPGImageComponent,
    SVGImageComponent,
    GIFImageComponent,
  },
  {
    get(target, prop, receiver) {
      if (prop in target) {
        return Reflect.get(target, prop, receiver);
      }
      if (prop === 'lib') return lib;
      const loader = LAZY_LOADERS[prop as string];
      if (loader) return loader();
      return undefined;
    },
    set() {
      return false;
    },
  },
) as unknown as Export;
