import { MCXstructureLocComponentType } from "../compile-mcx/types"
import { EntityComponent } from "./components/entity"
import { ItemComponent } from "./components/item"

class BlockComponent {
  public toJSON() {
    return {}
  }
}
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