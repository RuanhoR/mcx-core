import {
  Dimension,
  ItemStack,
  system,
  world,
  type Player,
  type Vector3,
} from "@minecraft/server";
import itemData from "../itemData";
import { pickRandomItem, randomNum, spawnItem } from "../utils";
import { setBlock, summonEntity, fillSquare, playerEffect } from "./utils";
import enchData from "../enchData";

const luckyEvents: ((
  block: {
    dimension: Dimension;
    location: Vector3;
  },
  player: Player,
) => Promise<void> | void)[] = [
  // 1. Drop 1-10 random items
  (b) => {
    const item = pickRandomItem(itemData);
    b.dimension.spawnItem(new ItemStack(item, randomNum(1, 10)), b.location);
  },
  // 2. Redstone tool bundle
  (b) =>
    spawnItem(
      [
        { id: "minecraft:dispenser", cout: 10 },
        { id: "minecraft:dropper", cout: 4 },
        { id: "minecraft:redstone", cout: 18 },
      ],
      b.location,
      b.dimension,
    ),
  // 3. Diamond pillar (4 blocks high)
  (b) => {
    for (let y = 0; y < 4; y++) {
      setBlock(
        b.dimension,
        { x: b.location.x, y: b.location.y + y, z: b.location.z },
        "minecraft:diamond_block",
      );
    }
  },
  // 4. Emerald pillar (4 blocks high)
  (b) => {
    for (let y = 0; y < 4; y++) {
      setBlock(
        b.dimension,
        { x: b.location.x, y: b.location.y + y, z: b.location.z },
        "minecraft:emerald_block",
      );
    }
  },
  // 5. Mineral bundle
  (b) =>
    spawnItem(
      [
        { id: "diamond", cout: randomNum(1, 8) },
        { id: "emerald", cout: randomNum(3, 10) },
        { id: "lapis_lazuli", cout: randomNum(6, 99) },
        { id: "iron_ingot", cout: randomNum(10, 66) },
        { id: "gold_ingot", cout: randomNum(4, 30) },
      ],
      b.location,
      b.dimension,
    ),
  // 6. Beds
  (b) =>
    spawnItem([{ id: "bed", cout: randomNum(2, 4) }], b.location, b.dimension),
  // 7. Enchanted golden apples + golden apples
  (b) =>
    spawnItem(
      [
        { id: "enchanted_golden_apple", cout: randomNum(1, 3) },
        { id: "golden_apple", cout: randomNum(2, 6) },
      ],
      b.location,
      b.dimension,
    ),
  // 8. Full diamond armor set
  (b) =>
    spawnItem(
      [
        { id: "diamond_helmet", cout: 1 },
        { id: "diamond_chestplate", cout: 1 },
        { id: "diamond_leggings", cout: 1 },
        { id: "diamond_boots", cout: 1 },
        { id: "diamond_sword", cout: 1 },
      ],
      b.location,
      b.dimension,
    ),
  // 9. Ender pearls + eyes of ender
  (b) =>
    spawnItem(
      [
        { id: "ender_pearl", cout: randomNum(3, 8) },
        { id: "ender_eye", cout: randomNum(2, 5) },
      ],
      b.location,
      b.dimension,
    ),
  // 10. XP boost (30s regeneration + XP levels)
  (b, p) => {
    playerEffect(p, "regeneration", 30, 2);
    p.addLevels(randomNum(10, 30));
  },
  // 11. Regeneration II (30s)
  (b, p) => playerEffect(p, "regeneration", 30, 1),
  // 12. Speed + jump boost (60s)
  (b, p) => {
    playerEffect(p, "speed", 60, 1);
    playerEffect(p, "jump_boost", 60, 1);
  },
  // 13. Villager support
  (b) => summonEntity(b.dimension, b.location, "minecraft:villager_v2", 3),
  // 14. Iron golem guard
  (b) => summonEntity(b.dimension, b.location, "minecraft:iron_golem", 1),
  // 15. Flower field (5x5 flowers)
  (b) => {
    const flowers = [
      "minecraft:poppy",
      "minecraft:dandelion",
      "minecraft:blue_orchid",
      "minecraft:allium",
      "minecraft:azure_bluet",
      "minecraft:red_tulip",
      "minecraft:oxeye_daisy",
      "minecraft:cornflower",
      "minecraft:lily_of_the_valley",
    ];
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        const flower = pickRandomItem(flowers);
        setBlock(
          b.dimension,
          { x: b.location.x + x, y: b.location.y, z: b.location.z + z },
          flower,
        );
      }
    }
  },
  // 16. Glowstone lighting
  (b) => {
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        if (Math.random() < 0.5) {
          setBlock(
            b.dimension,
            { x: b.location.x + x, y: b.location.y - 1, z: b.location.z + z },
            "minecraft:glowstone",
          );
        }
      }
    }
  },
  // 17. Bookshelves + enchanting table
  (b) => {
    setBlock(
      b.dimension,
      { x: b.location.x, y: b.location.y + 1, z: b.location.z },
      "minecraft:enchanting_table",
    );
    fillSquare(b.dimension, b.location, 2, 0, "minecraft:bookshelf");
  },
  // 18. Feast (assorted cooked food)
  (b) =>
    spawnItem(
      [
        { id: "cooked_beef", cout: randomNum(8, 16) },
        { id: "cooked_porkchop", cout: randomNum(8, 16) },
        { id: "baked_potato", cout: randomNum(6, 12) },
        { id: "bread", cout: randomNum(10, 20) },
        { id: "golden_carrot", cout: randomNum(4, 8) },
      ],
      b.location,
      b.dimension,
    ),
  // 19. Bow + arrows
  (b) =>
    spawnItem(
      [
        { id: "bow", cout: 1 },
        { id: "arrow", cout: randomNum(32, 64) },
      ],
      b.location,
      b.dimension,
    ),
  // 20. Loyal companion (wolf)
  (b) => summonEntity(b.dimension, b.location, "minecraft:wolf", 2),
  // 21. Night vision + water breathing (120s)
  (b, p) => {
    playerEffect(p, "night_vision", 120, 0);
    playerEffect(p, "water_breathing", 120, 0);
  },
  // 22. Treasure chest (with random loot)
  (b) => {
    const chestLoc = { x: b.location.x, y: b.location.y + 1, z: b.location.z };
    setBlock(b.dimension, chestLoc, "minecraft:chest");
    const treasures = [
      "diamond",
      "emerald",
      "gold_ingot",
      "iron_ingot",
      "golden_apple",
    ];
    const block = b.dimension.getBlock(chestLoc);
    const chest = block?.getComponent("inventory")?.container;
    if (chest) {
      for (let i = 0; i < randomNum(3, 6); i++) {
        chest.setItem(
          i,
          new ItemStack(
            `minecraft:${pickRandomItem(treasures)}`,
            randomNum(1, 5),
          ),
        );
      }
    }
  },
  // 23. Cake + pumpkin pies
  (b) =>
    spawnItem(
      [
        { id: "cake", cout: randomNum(1, 3) },
        { id: "pumpkin_pie", cout: randomNum(4, 8) },
      ],
      b.location,
      b.dimension,
    ),
  // 24. Horse + saddle
  (b) => {
    summonEntity(b.dimension, b.location, "minecraft:horse", 1);
    spawnItem([{ id: "saddle", cout: 1 }], b.location, b.dimension);
  },
  // 25. Diamond block
  (b) =>
    setBlock(
      b.dimension,
      { x: b.location.x, y: b.location.y + 1, z: b.location.z },
      "minecraft:diamond_block",
    ),
  // 26. XP orbs
  (b, p) => p.addExperience(randomNum(50, 200)),
  // 27. Snow golem squad
  (b) => summonEntity(b.dimension, b.location, "minecraft:snow_golem", 3),
  // 28. Ore vein (gold + iron ore)
  (b) => {
    fillSquare(b.dimension, b.location, 2, 0, "minecraft:gold_ore");
    fillSquare(b.dimension, b.location, 3, 1, "minecraft:iron_ore");
  },
  // 29. Rainbow carpet
  (b) => {
    const colors = [
      "white",
      "orange",
      "magenta",
      "light_blue",
      "yellow",
      "lime",
      "pink",
      "gray",
      "cyan",
      "purple",
      "blue",
      "brown",
      "green",
      "red",
      "black",
    ];
    for (let x = -3; x <= 3; x++) {
      for (let z = -3; z <= 3; z++) {
        setBlock(
          b.dimension,
          { x: b.location.x + x, y: b.location.y - 1, z: b.location.z + z },
          `minecraft:${pickRandomItem(colors)}_carpet`,
        );
      }
    }
  },
  // 30. Beacon
  (b) => {
    setBlock(
      b.dimension,
      { x: b.location.x, y: b.location.y + 1, z: b.location.z },
      "minecraft:beacon",
    );
    fillSquare(b.dimension, b.location, 1, 0, "minecraft:iron_block");
    fillSquare(b.dimension, b.location, 2, -1, "minecraft:iron_block");
  },
  // 31. Diamond path - blocks under the player turn into diamond for 10 seconds
  (b, p) => {
    let tick = 0;
    const id = system.runInterval(() => {
      if (tick >= 200) {
        system.clearRun(id);
        return;
      }
      const loc = p.location;
      setBlock(
        b.dimension,
        {
          x: Math.floor(loc.x),
          y: Math.floor(loc.y) - 1,
          z: Math.floor(loc.z),
        },
        "minecraft:diamond_block",
      );
      tick++;
    }, 1);
  },
  // 32. Levitation + obsidian water room trap after 10 seconds
  (b, p) => {
    playerEffect(p, "levitation", 10, 2);
    let tick = 0;
    const id = system.runInterval(() => {
      tick++;
      if (tick >= 200) {
        system.clearRun(id);
        world.structureManager.place(
          "luckblock_obsidian_waterplace",
          b.dimension,
          b.location,
        );
        p.teleport({
          x: b.location.x + 1,
          y: b.location.y,
          z: b.location.z + 1,
        });
      }
    }, 1);
  },
  // 33. Elytra + fireworks
  (b) =>
    spawnItem(
      [
        { id: "elytra", cout: 1 },
        { id: "firework_rocket", cout: randomNum(16, 32) },
      ],
      b.location,
      b.dimension,
    ),
  // 34. All positive effects (30s god mode)
  (b, p) => {
    const effects = [
      "speed",
      "haste",
      "strength",
      "regeneration",
      "resistance",
      "fire_resistance",
      "water_breathing",
      "night_vision",
      "jump_boost",
    ];
    for (const e of effects) playerEffect(p, e, 30, 1);
  },
  // 35. Netherite scrap + ancient debris
  (b) => {
    spawnItem(
      [
        { id: "netherite_scrap", cout: randomNum(3, 8) },
        { id: "netherite_ingot", cout: randomNum(1, 3) },
      ],
      b.location,
      b.dimension,
    );
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        setBlock(
          b.dimension,
          { x: b.location.x + x, y: b.location.y, z: b.location.z + z },
          "minecraft:ancient_debris",
        );
      }
    }
  },
  // 36. Totem of undying
  (b) =>
    spawnItem(
      [{ id: "totem_of_undying", cout: randomNum(1, 2) }],
      b.location,
      b.dimension,
    ),
  // 37. Trident + loyalty book
  (b) =>
    spawnItem(
      [
        { id: "trident", cout: 1 },
        {
          id: "enchanted_book",
          cout: 1,
          ench: [
            {
              id: "sharpness",
              level: randomNum(0, 5),
            },
          ],
        },
      ],
      b.location,
      b.dimension,
    ),

  // 38. Giant melon structure
  (b) => {
    for (let x = -1; x <= 1; x++) {
      for (let y = 0; y <= 2; y++) {
        for (let z = -1; z <= 1; z++) {
          setBlock(
            b.dimension,
            { x: b.location.x + x, y: b.location.y + y, z: b.location.z + z },
            "minecraft:melon_block",
          );
        }
      }
    }
  },
  // 39. Pandas + bamboo
  (b) => {
    summonEntity(b.dimension, b.location, "minecraft:panda", 2);
    spawnItem(
      [{ id: "bamboo", cout: randomNum(8, 16) }],
      b.location,
      b.dimension,
    );
  },
  // 40. Absorption + resistance (60s)
  (b, p) => {
    playerEffect(p, "absorption", 60, 4);
    playerEffect(p, "resistance", 60, 1);
  },
  // 41. Enchanted diamond pickaxe (efficiency + fortune)
  (b) =>
    spawnItem([{ id: "diamond_pickaxe", cout: 1 }], b.location, b.dimension),
  // 42. Allay + amethyst
  (b) => {
    summonEntity(b.dimension, b.location, "minecraft:allay", 2);
    spawnItem(
      [{ id: "amethyst_shard", cout: randomNum(8, 16) }],
      b.location,
      b.dimension,
    );
  },
  // 43. Turtles + seagrass
  (b) => {
    summonEntity(b.dimension, b.location, "minecraft:turtle", 3);
    spawnItem(
      [{ id: "seagrass", cout: randomNum(8, 16) }],
      b.location,
      b.dimension,
    );
  },
  // 44. Explorer set (empty map + compass + lead)
  (b) =>
    spawnItem(
      [
        { id: "empty_map", cout: 1 },
        { id: "compass", cout: 1 },
        { id: "lead", cout: 2 },
        { id: "spyglass", cout: 1 },
      ],
      b.location,
      b.dimension,
    ),
  // 45. Anvil + mending books
  (b) => {
    setBlock(
      b.dimension,
      { x: b.location.x, y: b.location.y + 1, z: b.location.z },
      "minecraft:anvil",
    );
    spawnItem(
      [{ id: "enchanted_book", cout: randomNum(1, 3) }],
      b.location,
      b.dimension,
    );
  },
  // 46. Fox with sweet berries
  (b) => {
    summonEntity(b.dimension, b.location, "minecraft:fox", 2);
    spawnItem(
      [{ id: "sweet_berries", cout: randomNum(8, 16) }],
      b.location,
      b.dimension,
    );
  },
  // 47. Giant red mushroom
  (b) => {
    for (let y = 0; y < 4; y++)
      setBlock(
        b.dimension,
        { x: b.location.x, y: b.location.y + y, z: b.location.z },
        "minecraft:mushroom_stem",
      );
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        setBlock(
          b.dimension,
          { x: b.location.x + x, y: b.location.y + 4, z: b.location.z + z },
          "minecraft:red_mushroom_block",
        );
      }
    }
  },
  // 48. Conduit + prismarine
  (b) => {
    setBlock(
      b.dimension,
      { x: b.location.x, y: b.location.y + 1, z: b.location.z },
      "minecraft:conduit",
    );
    fillSquare(b.dimension, b.location, 2, 0, "minecraft:prismarine");
    spawnItem(
      [{ id: "prismarine_shard", cout: randomNum(8, 16) }],
      b.location,
      b.dimension,
    );
  },
  // 49. Hero of the village (60s)
  (b, p) => playerEffect(p, "village_hero", 60, 1),
  // 50. Bees + honey
  (b) => {
    summonEntity(b.dimension, b.location, "minecraft:bee", 3);
    setBlock(
      b.dimension,
      { x: b.location.x, y: b.location.y + 1, z: b.location.z },
      "minecraft:beehive",
    );
    spawnItem(
      [{ id: "honey_bottle", cout: randomNum(3, 6) }],
      b.location,
      b.dimension,
    );
  },
  // 51. Leather + iron crafting bundle
  (b) =>
    spawnItem(
      [
        { id: "leather", cout: randomNum(8, 16) },
        { id: "iron_ingot", cout: randomNum(8, 16) },
        { id: "coal", cout: randomNum(16, 32) },
        { id: "stick", cout: randomNum(16, 32) },
      ],
      b.location,
      b.dimension,
    ),
  // 52. Quartz pillar
  (b) => {
    for (let y = 0; y < 4; y++)
      setBlock(
        b.dimension,
        { x: b.location.x, y: b.location.y + y, z: b.location.z },
        "minecraft:quartz_block",
      );
    spawnItem(
      [{ id: "quartz", cout: randomNum(16, 32) }],
      b.location,
      b.dimension,
    );
  },
  // 53. Rabbits + carrots
  (b) => {
    summonEntity(b.dimension, b.location, "minecraft:rabbit", 4);
    spawnItem(
      [{ id: "carrot", cout: randomNum(8, 16) }],
      b.location,
      b.dimension,
    );
  },
  // 54. Parrots + seeds
  (b) => {
    summonEntity(b.dimension, b.location, "minecraft:parrot", 3);
    spawnItem(
      [{ id: "wheat_seeds", cout: randomNum(8, 16) }],
      b.location,
      b.dimension,
    );
  },
  // 55. Cats + raw fish
  (b) => {
    summonEntity(b.dimension, b.location, "minecraft:cat", 2);
    spawnItem([{ id: "cod", cout: randomNum(8, 16) }], b.location, b.dimension);
  },
  // 56. Frogs + slimeballs
  (b) => {
    summonEntity(b.dimension, b.location, "minecraft:frog", 3);
    spawnItem(
      [{ id: "slime_ball", cout: randomNum(8, 16) }],
      b.location,
      b.dimension,
    );
  },
  // 57. Axolotls + tropical fish
  (b) => {
    summonEntity(b.dimension, b.location, "minecraft:axolotl", 2);
    spawnItem(
      [{ id: "tropical_fish", cout: randomNum(4, 8) }],
      b.location,
      b.dimension,
    );
  },
  // 58. Dolphin + ocean explorer
  (b) => {
    summonEntity(b.dimension, b.location, "minecraft:dolphin", 1);
    spawnItem(
      [
        { id: "heart_of_the_sea", cout: 1 },
        { id: "nautilus_shell", cout: randomNum(3, 6) },
      ],
      b.location,
      b.dimension,
    );
  },
  // 59. Goats + wheat
  (b) => {
    summonEntity(b.dimension, b.location, "minecraft:goat", 2);
    spawnItem(
      [{ id: "wheat", cout: randomNum(8, 16) }],
      b.location,
      b.dimension,
    );
  },
  // 60. Llamas + chests
  (b) => {
    summonEntity(b.dimension, b.location, "minecraft:llama", 2);
    spawnItem(
      [{ id: "chest", cout: randomNum(2, 4) }],
      b.location,
      b.dimension,
    );
  },
  // 61. Glow squid + glow ink
  (b) => {
    summonEntity(b.dimension, b.location, "minecraft:glow_squid", 2);
    spawnItem(
      [{ id: "glow_ink_sac", cout: randomNum(4, 8) }],
      b.location,
      b.dimension,
    );
  },
  // 62. Strider + warped fungus
  (b) => {
    summonEntity(b.dimension, b.location, "minecraft:strider", 2);
    spawnItem(
      [{ id: "warped_fungus_on_a_stick", cout: 1 }],
      b.location,
      b.dimension,
    );
  },
  // 63. Chainmail armor set
  (b) =>
    spawnItem(
      [
        { id: "chainmail_helmet", cout: 1 },
        { id: "chainmail_chestplate", cout: 1 },
        { id: "chainmail_leggings", cout: 1 },
        { id: "chainmail_boots", cout: 1 },
      ],
      b.location,
      b.dimension,
    ),
  // 64. Crossbow + fireworks
  (b) =>
    spawnItem(
      [
        { id: "crossbow", cout: 1 },
        { id: "firework_rocket", cout: randomNum(8, 16) },
      ],
      b.location,
      b.dimension,
    ),
  // 65. Shield + iron
  (b) =>
    spawnItem(
      [
        { id: "shield", cout: 1 },
        { id: "iron_ingot", cout: randomNum(8, 16) },
      ],
      b.location,
      b.dimension,
    ),
  // 66. Turtle shell helmet
  (b) => spawnItem([{ id: "turtle_helmet", cout: 1 }], b.location, b.dimension),
  // 67. Saturation + instant health
  (b, p) => {
    playerEffect(p, "saturation", 30, 2);
    playerEffect(p, "instant_health", 1, 2);
  },
  // 68. Conduit power + dolphins grace (120s)
  (b, p) => {
    playerEffect(p, "conduit_power", 120, 0);
    playerEffect(p, "speed", 120, 1);
  },
  // 69. Slow falling + resistance (60s)
  (b, p) => {
    playerEffect(p, "slow_falling", 60, 0);
    playerEffect(p, "resistance", 60, 0);
  },
  // 70. Small fountain (stone + water)
  (b) => {
    setBlock(
      b.dimension,
      { x: b.location.x, y: b.location.y + 1, z: b.location.z },
      "minecraft:stone",
    );
    setBlock(
      b.dimension,
      { x: b.location.x, y: b.location.y + 2, z: b.location.z },
      "minecraft:normal_stone_slab",
    );
    setBlock(
      b.dimension,
      { x: b.location.x, y: b.location.y + 2, z: b.location.z },
      "minecraft:water",
    );
  },
  // 71. Oak tree (small)
  (b) => {
    for (let y = 0; y < 5; y++)
      setBlock(
        b.dimension,
        { x: b.location.x, y: b.location.y + y, z: b.location.z },
        "minecraft:oak_log",
      );
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        setBlock(
          b.dimension,
          { x: b.location.x + x, y: b.location.y + 5, z: b.location.z + z },
          "minecraft:oak_leaves",
        );
      }
    }
    setBlock(
      b.dimension,
      { x: b.location.x, y: b.location.y + 6, z: b.location.z },
      "minecraft:oak_leaves",
    );
  },
  // 72. Gold block pillar
  (b) => {
    for (let y = 0; y < 4; y++)
      setBlock(
        b.dimension,
        { x: b.location.x, y: b.location.y + y, z: b.location.z },
        "minecraft:gold_block",
      );
  },
  // 73. Ocelot + tropical fish
  (b) => {
    summonEntity(b.dimension, b.location, "minecraft:ocelot", 2);
    spawnItem(
      [{ id: "tropical_fish", cout: randomNum(8, 16) }],
      b.location,
      b.dimension,
    );
  },
  // 74. Pig + carrot on a stick
  (b) => {
    summonEntity(b.dimension, b.location, "minecraft:pig", 2);
    spawnItem([{ id: "carrot_on_a_stick", cout: 1 }], b.location, b.dimension);
  },
  // 75. Chicken + eggs
  (b) => {
    summonEntity(b.dimension, b.location, "minecraft:chicken", 3);
    spawnItem([{ id: "egg", cout: randomNum(8, 16) }], b.location, b.dimension);
  },
  // 76. Cow + leather bundle
  (b) => {
    summonEntity(b.dimension, b.location, "minecraft:cow", 2);
    spawnItem(
      [
        { id: "leather", cout: randomNum(8, 16) },
        { id: "beef", cout: randomNum(8, 16) },
      ],
      b.location,
      b.dimension,
    );
  },
  // 77. Squid + ink sacs
  (b) => {
    summonEntity(b.dimension, b.location, "minecraft:squid", 2);
    spawnItem(
      [{ id: "ink_sac", cout: randomNum(8, 16) }],
      b.location,
      b.dimension,
    );
  },
  // 78. Luck Apples
  (b) =>
    spawnItem(
      [{ id: "rluckblock:luckly_apple", cout: randomNum(1, 3) }],
      b.location,
      b.dimension,
    ),
  // 79. random enchbook
  (b) => {
    const ench = pickRandomItem(Object.entries(enchData));
    spawnItem(
      [
        {
          id: "enchanted_book",
          cout: 1,
          ench: [
            {
              id: ench[0],
              level: randomNum(0, ench[1]),
            },
          ],
        },
      ],
      b.location,
      b.dimension,
    );
  },
  // 80. Music disks
  (b) => {
    const disks = [
      "music_disc_13",
      "music_disc_cat",
      "music_disc_blocks",
      "music_disc_chirp",
      "music_disc_far",
      "music_disc_mall",
      "music_disc_mellohi",
      "music_disc_stal",
      "music_disc_strad",
      "music_disc_ward",
      "music_disc_11",
      "music_disc_wait",
    ];
    spawnItem(
      [{ id: pickRandomItem(disks), cout: 1 }],
      b.location,
      b.dimension,
    );
  },
  // 81. Bee haven
  (b) => {
    summonEntity(b.dimension, b.location, "minecraft:bee", 3);
    setBlock(
      b.dimension,
      { x: b.location.x, y: b.location.y + 1, z: b.location.z },
      "minecraft:bee_nest",
    );
  },
  // 82. Long lasting resistance + regen
  (b, p) => {
    playerEffect(p, "resistance", 120, 2);
    playerEffect(p, "regeneration", 120, 1);
  },
  // 83. Emerald block pile
  (b) =>
    spawnItem(
      [{ id: "emerald_block", cout: randomNum(8, 16) }],
      b.location,
      b.dimension,
    ),
  // 84. Snowman army
  (b) =>
    summonEntity(
      b.dimension,
      b.location,
      "minecraft:snow_golem",
      randomNum(4, 6),
    ),
  // 85. End rod decoration
  (b) => {
    for (let x = -2; x <= 2; x++)
      for (let z = -2; z <= 2; z++)
        setBlock(
          b.dimension,
          { x: b.location.x + x, y: b.location.y, z: b.location.z + z },
          "minecraft:end_rod",
        );
  },
  // 86. Extra luck apple
  (b) =>
    spawnItem(
      [{ id: "rluckblock:luckly_apple", cout: 1 }],
      b.location,
      b.dimension,
    ),
  // 87. Feast
  (b) =>
    spawnItem(
      [
        { id: "cooked_beef", cout: randomNum(16, 32) },
        { id: "cooked_porkchop", cout: randomNum(16, 32) },
        { id: "cooked_chicken", cout: randomNum(16, 32) },
      ],
      b.location,
      b.dimension,
    ),
  // 88. Pumpkin patch
  (b) => {
    for (let x = -2; x <= 2; x++)
      for (let z = -2; z <= 2; z++)
        setBlock(
          b.dimension,
          { x: b.location.x + x, y: b.location.y, z: b.location.z + z },
          "minecraft:pumpkin",
        );
  },
  // 89. Fireworks stash
  (b) =>
    spawnItem(
      [{ id: "firework_rocket", cout: randomNum(16, 32) }],
      b.location,
      b.dimension,
    ),
  // 90. Haste + speed boost
  (b, p) => {
    playerEffect(p, "haste", 60, 2);
    playerEffect(p, "speed", 60, 2);
  },
  // 91. Scaffolding tower
  (b) => {
    for (let y = 1; y <= 10; y++)
      setBlock(
        b.dimension,
        { x: b.location.x, y: b.location.y + y, z: b.location.z },
        "minecraft:scaffolding",
      );
  },
  // 92. Bone meal stack
  (b) =>
    spawnItem(
      [{ id: "bone_meal", cout: randomNum(32, 64) }],
      b.location,
      b.dimension,
    ),
  // 93. Grass floor
  (b) => {
    for (let x = -4; x <= 4; x++)
      for (let z = -4; z <= 4; z++)
        setBlock(
          b.dimension,
          { x: b.location.x + x, y: b.location.y - 1, z: b.location.z + z },
          "minecraft:grass_block",
        );
  },
  // 94. Parrot party
  (b) =>
    summonEntity(b.dimension, b.location, "minecraft:parrot", randomNum(4, 6)),
  // 95. Enchanted tool set
  (b) =>
    spawnItem(
      [
        {
          id: "diamond_pickaxe",
          cout: 1,
          ench: [
            { id: "efficiency", level: 4 },
            { id: "unbreaking", level: 3 },
          ],
        },
        {
          id: "diamond_axe",
          cout: 1,
          ench: [
            { id: "efficiency", level: 4 },
            { id: "unbreaking", level: 3 },
          ],
        },
      ],
      b.location,
      b.dimension,
    ),
  // 96. Flower bundle
  (b) => {
    const flowers = [
      "poppy",
      "dandelion",
      "blue_orchid",
      "allium",
      "azure_bluet",
      "red_tulip",
      "oxeye_daisy",
      "cornflower",
      "lily_of_the_valley",
    ];
    const items = flowers.map((f) => ({ id: f, cout: randomNum(2, 4) }));
    spawnItem(items, b.location, b.dimension);
  },
  // 97. Shield + iron
  (b) =>
    spawnItem(
      [
        { id: "shield", cout: 1 },
        { id: "iron_ingot", cout: randomNum(16, 32) },
      ],
      b.location,
      b.dimension,
    ),
  // 98. Golden carrot feast
  (b) =>
    spawnItem(
      [{ id: "golden_carrot", cout: randomNum(16, 32) }],
      b.location,
      b.dimension,
    ),
  // 99. All effects 60s
  (b, p) => {
    const effects = [
      "speed",
      "haste",
      "strength",
      "regeneration",
      "resistance",
      "fire_resistance",
      "water_breathing",
      "night_vision",
      "jump_boost",
      "absorption",
    ];
    for (const e of effects) playerEffect(p, e, 60, 0);
  },
  // 100. Diamond block + XP
  (b, p) => {
    setBlock(b.dimension, b.location, "minecraft:diamond_block");
    p.spawnParticle("minecraft:totem_of_undying_particle", b.location);
  },
];

export default luckyEvents;
