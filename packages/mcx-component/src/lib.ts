import { statSync } from 'node:fs';
import { extname } from 'node:path';

export class ImageComponent {
  public classId = 'mcx_image_0918392' as string;
  constructor(
    public filePath: string,
    public imageType: string[],
  ) {
    try {
      statSync(filePath);
      const ext = extname(filePath);
      if (!imageType.includes(ext.slice(1)))
        throw new Error(
          '[image type]: file extname: ' + ext + ' !includes ' + imageType,
        );
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('[image type]')) throw err;
      throw new Error(
        "[mcx image]: can't resolve image: " + filePath + ' : \n  ' + err,
      );
    }
  }
}

export class PNGImageComponent extends ImageComponent {
  public classId = 'mcx_png_2340192' as const;
  constructor(filePath: string) {
    super(filePath, ['png']);
  }
}

export class JPGImageComponent extends ImageComponent {
  public classId = 'mcx_jpg/jpeg_019173' as const;
  constructor(filePath: string) {
    super(filePath, ['jpg', 'jpeg']);
  }
}

export class SVGImageComponent extends ImageComponent {
  public classId = 'mcx_svg_129371' as const;
  constructor(filePath: string) {
    super(filePath, ['svg', 'xml']);
  }
}

export class GIFImageComponent extends ImageComponent {
  public classId = 'mcx_git_019723' as const;
  constructor(filePath: string) {
    super(filePath, ['gif']);
  }
}
