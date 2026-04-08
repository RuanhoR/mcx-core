import { MCXstructureLocComponentType } from "../compile-mcx/types"
import { BlockComponent } from "./components/block"
import { EntityComponent } from "./components/entity"
import { ItemComponent } from "./components/item"

export default {
  item: ItemComponent,
  entity: EntityComponent,
  block: BlockComponent
} satisfies {
  [key in MCXstructureLocComponentType]: unknown
}
export {
  ItemComponent,
  BlockComponent,
  EntityComponent
}