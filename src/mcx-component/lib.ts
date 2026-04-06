import { MCXstructureLocComponentType } from "../compile-mcx/types";
import * as t from "./types"
class ItemComponent {
  #opt: t.ItemComponentOpt
  constructor(opt: t.ItemComponentOpt) {
    this.#opt = opt;
  }
  public toJSON(): t.ItemJSON {
    if (!this.#opt) throw new Error("[mcx component]: cannot read component")
    const result: t.ItemJSON = {
      format_version: "",
      "minecraft:item": {
        components: {},
        description: {
          identifier: ""
        }
      }
    }
    if (typeof this.#opt.format == "string" && /\d.\d.\d/.test(this.#opt.format)) {
      result["format_version"] = this.#opt.format;
    } else {
      throw new Error("[compile component]: no format")
    }
    if (typeof this.#opt.id == "string" && /[a-zA-Z0-9_]:[a-zA-Z0-9_]/.test(this.#opt.id)) {
      result["minecraft:item"].description.identifier = this.#opt.id
    } else {
      throw new Error("[compile component]:cno id")
    }
    const ApplyComponents = result["minecraft:item"].components;
    if (typeof this.#opt.name == "string") {
      ApplyComponents["minecraft:display_name"] = {
        value: this.#opt.name
      }
    }
    if (this.#opt.components) {
      const components = this.#opt.components;
      if (typeof components.damage == "number") {
        ApplyComponents["minecraft:damage"] = {
          value: components.damage
        }
      }
      if (typeof components.offHand == "boolean" && components.offHand) {
        ApplyComponents["minecraft:allow_off_hand"] = {
          value: true
        }
      }
      if (typeof components.DestroyInCreate == "boolean") {
        ApplyComponents["minecraft:can_destroy_in_creative"] = {
          value: components.DestroyInCreate
        }
      }
    }
    return result
  }
  /**
   * set name
   * @throws {Error}&
   * @param {string} newValue 
   * @returns {void}
   */
  public setName(newValue: string): void {
    if (typeof newValue == "string") {
      this.#opt.name = newValue
    } else {
      throw new Error("[set error]: name type error")
    }
  }
  public setIcon(newValue: string): void {
    if (typeof newValue == "string") {
      this.#opt.components.icon = newValue
    } else {
      throw new Error("[set error]: icon: type error")
    }
  }
  /**
   * get name
   * @returns {string} name
   */
  public getName(): string {
    return this.#opt.name
  }
  /**
   * set identifier
   * @param {string} newValue
   */
  public setId(newValue: string): void {
    if (typeof newValue == "string") {
      this.#opt.id == newValue
    } else {
      throw new Error("[set error]: id: type error")
    }
  }
  /**
   * get item component identifier
   */
  public getId() {
    return this.#opt.id
  }
  /**
   * setAllowOffHand
   * @param vl {boolean} allow off hand
   */
  public setAllowOffHand(vl: boolean) {
    if (typeof vl == "boolean") {
      this.#opt.components.offHand == vl
    } else {
      throw new TypeError("[set error]: allowOffHand: type error")
    }
  }

}
class EntityComponent {
  public toJSON() {
    return {}
  }
}
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