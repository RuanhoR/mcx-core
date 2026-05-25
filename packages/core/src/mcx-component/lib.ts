import { statSync } from 'node:fs'
import { MCXstructureLocComponentType } from '../compile-mcx/types'
import { BlockComponent } from './components/block'
import { EntityComponent } from './components/entity'
import { ItemComponent } from './components/item'
import { extname } from 'node:path'

export default {
  item: ItemComponent,
  entity: EntityComponent,
  block: BlockComponent,
} satisfies {
  [key in MCXstructureLocComponentType]: unknown
}
class ImageComponent {
  public classId = 'mcx_image_0918392' as string
  constructor(
    public filePath: string,
    public imageType: string[],
  ) {
    try {
      statSync(filePath)
      const ext = extname(filePath)
      if (!imageType.includes(ext.slice(1)))
        throw new Error(
          '[image type]: file extname: ' + ext + ' !includes' + imageType,
        )
    } catch (err) {
      throw new Error(
        "[mcx image]: can't resolve image: " + filePath + ' : \n  ' + err,
      )
    }
  }
}
class PNGImageComponent extends ImageComponent {
  public classId = 'mcx_png_2340192' as const
  constructor(filePath: string) {
    super(filePath, ['png'])
  }
}
class JPGImageComponent extends ImageComponent {
  public classId = 'mcx_jpg/jpeg_019173' as const
  constructor(filePath: string) {
    super(filePath, ['jpg', 'jpeg'])
  }
}
class SVGImageComponent extends ImageComponent {
  public classId = 'mcx_svg_129371' as const
  constructor(filePath: string) {
    super(filePath, ['svg', 'xml'])
  }
}
class GIFImageComponent extends ImageComponent {
  public classId = 'mcx_git_019723' as const
  constructor(filePath: string) {
    super(filePath, ['gif'])
  }
}

export {
  ItemComponent,
  BlockComponent,
  EntityComponent,
  PNGImageComponent,
  JPGImageComponent,
  SVGImageComponent,
  GIFImageComponent,
}
