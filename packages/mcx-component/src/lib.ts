import { statSync } from 'node:fs';
import { extname } from 'node:path';
const lib = new Proxy(
  {
    item: () => require('./components/item').ItemComponent,
    entity: () => require('./components/entity').EntityComponent,
    block: () => require('./components/block').BlockComponent,
    recipe: () => require('./components/recipe').RecipeComponent,
  },
  {
    get(target, prop, receiver) {
      const value = target[prop as keyof typeof target];
      if (typeof value === 'function') {
        return value();
      }
      return value;
    },
    set() {
      return false;
    },
  },
) as unknown as {
  item: (typeof import('./components/item'))['ItemComponent'];
  block: (typeof import('./components/block'))['BlockComponent'];
  entity: (typeof import('./components/entity'))['EntityComponent'];
  recipe: (typeof import('./components/recipe'))['RecipeComponent'];
};

class ImageComponent {
  public classId = 'mcx_image_0918392' as string;
  constructor(
    public filePath: string,
    public imageType: string[],
  ) {
    try {
      const ext = extname(filePath);
      if (!imageType.includes(ext.slice(1)))
        throw new Error(
          '[image type]: file extname: ' + ext + ' !includes ' + imageType,
        );
    } catch (err) {
      throw new Error(
        "[mcx image]: can't resolve image: " + filePath + ' : \n  ' + err,
      );
    }
  }
}
class PNGImageComponent extends ImageComponent {
  public classId = 'mcx_png_2340192' as const;
  constructor(filePath: string) {
    super(filePath, ['png']);
  }
}
class JPGImageComponent extends ImageComponent {
  public classId = 'mcx_jpg/jpeg_019173' as const;
  constructor(filePath: string) {
    super(filePath, ['jpg', 'jpeg']);
  }
}
class SVGImageComponent extends ImageComponent {
  public classId = 'mcx_svg_129371' as const;
  constructor(filePath: string) {
    super(filePath, ['svg', 'xml']);
  }
}
class GIFImageComponent extends ImageComponent {
  public classId = 'mcx_git_019723' as const;
  constructor(filePath: string) {
    super(filePath, ['gif']);
  }
}

export default lib;
export {
  PNGImageComponent,
  JPGImageComponent,
  SVGImageComponent,
  GIFImageComponent,
};
