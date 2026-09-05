import {
  Dimension,
  EquipmentSlot,
  ItemStack,
  system,
  world,
  type Player,
  type Vector3,
} from "@minecraft/server";
import { randomNum, spawnItem } from "../utils";
import {
  setBlock,
  summonEntity,
  fillArea,
  fillSquare,
  playerEffect,
  clearInventory,
  giveItem,
  setHelmet,
  clearMainhand,
} from "./utils";

const badEvents: ((
  block: {
    dimension: Dimension;
    location: Vector3;
  },
  player: Player,
) => Promise<void> | void)[] = [
  // 1. Summon zombie
  (b) =>
    summonEntity(b.dimension, b.location, "minecraft:zombie", randomNum(1, 3)),
  // 2. Obsidian water room trap (structure)
  (b, p) => {
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
  },
  // 3. Lightning strike
  (b) => b.dimension.spawnEntity("minecraft:lightning_bolt", b.location),
  // 4. TNT explosion (1-6)
  (b) => {
    for (let i = 0; i < randomNum(1, 6); i++) {
      b.dimension.spawnEntity("minecraft:tnt", {
        x: b.location.x + randomNum(-2, 2),
        y: b.location.y,
        z: b.location.z + randomNum(-2, 2),
      });
    }
  },
  // 5. Falling anvil from above
  (b) => {
    for (let y = 1; y < 10; y++) {
      setBlock(
        b.dimension,
        { x: b.location.x, y: b.location.y + y, z: b.location.z },
        "minecraft:air",
      );
    }
    setBlock(
      b.dimension,
      { x: b.location.x, y: b.location.y + 10, z: b.location.z },
      "minecraft:anvil",
    );
  },
  // 6. Skeleton squad (3)
  (b) => summonEntity(b.dimension, b.location, "minecraft:skeleton", 3),
  // 7. Set on fire (8s)
  (b, p) => {
    setBlock(b.dimension, b.location, "minecraft:fire");
    playerEffect(p, "fire_resistance", 8, 0, false);
  },
  // 8. Cobweb trap (5x5)
  (b) => fillArea(b.dimension, b.location, 2, "minecraft:web"),
  // 9. Creeper
  (b) =>
    summonEntity(b.dimension, b.location, "minecraft:creeper", randomNum(1, 2)),
  // 10. Blindness + slowness (30s)
  (b, p) => {
    playerEffect(p, "blindness", 30, 0);
    playerEffect(p, "slowness", 30, 1);
  },
  // 11. Random teleport (50 block radius)
  (b, p) => {
    p.teleport({
      x: b.location.x + randomNum(-50, 50),
      y: b.location.y + randomNum(-10, 10),
      z: b.location.z + randomNum(-50, 50),
    });
  },
  // 12. Spider + cave spider
  (b) => {
    summonEntity(b.dimension, b.location, "minecraft:spider", 1);
    summonEntity(b.dimension, b.location, "minecraft:cave_spider", 2);
  },
  // 13. Lava pool
  (b) => {
    fillSquare(b.dimension, b.location, 2, -1, "minecraft:lava");
    setBlock(b.dimension, b.location, "minecraft:lava");
  },
  // 14. Witch
  (b) => summonEntity(b.dimension, b.location, "minecraft:witch", 1),
  // 15. Clear inventory
  (b, p) => clearInventory(p),
  // 16. Rotten flesh prank
  (b, p) => giveItem(p, "minecraft:rotten_flesh", randomNum(16, 32)),
  // 17. Vex swarm (3)
  (b) => summonEntity(b.dimension, b.location, "minecraft:vex", 3),
  // 18. Hunger + weakness (30s)
  (b, p) => {
    playerEffect(p, "hunger", 30, 2);
    playerEffect(p, "weakness", 30, 1);
  },
  // 19. Flood (7x7 water source)
  (b) => fillSquare(b.dimension, b.location, 3, 0, "minecraft:water"),
  // 20. Ravager
  (b) => summonEntity(b.dimension, b.location, "minecraft:ravager", 1),
  // 21. Poison (15s)
  (b, p) => playerEffect(p, "poison", 15, 0),
  // 22. Pumpkin head
  (b, p) => setHelmet(p, "minecraft:pumpkin"),
  // 23. Phantom (2)
  (b) => summonEntity(b.dimension, b.location, "minecraft:phantom", 2),
  // 24. Clear main hand
  (b, p) => clearMainhand(p),
  // 25. Silverfish swarm (5-8)
  (b) =>
    summonEntity(
      b.dimension,
      b.location,
      "minecraft:silverfish",
      randomNum(5, 8),
    ),
  // 26. Wither effect (10s)
  (b, p) => playerEffect(p, "wither", 10, 1),
  // 27. Zombie pigman (2)
  (b) => summonEntity(b.dimension, b.location, "minecraft:zombie_pigman", 2),
  // 28. Nausea + mining fatigue (20s)
  (b, p) => {
    playerEffect(p, "nausea", 20, 0);
    playerEffect(p, "mining_fatigue", 20, 2);
  },
  // 29. Big explosion (crater)
  (b) => {
    fillArea(b.dimension, b.location, 3, "minecraft:air");
    b.dimension.spawnEntity("minecraft:tnt", b.location);
  },
  // 30. Evoker
  (b) => {
    summonEntity(b.dimension, b.location, "minecraft:evocation_illager", 1);
    summonEntity(b.dimension, b.location, "minecraft:vex", 2);
  },
  // 31. Enderman ambush + random teleport
  (b, p) => {
    summonEntity(b.dimension, b.location, "minecraft:enderman", 3);
    p.teleport({
      x: b.location.x + randomNum(-30, 30),
      y: b.location.y,
      z: b.location.z + randomNum(-30, 30),
    });
  },
  // 32. Zombie siege (zombies + zombie villagers)
  (b) => {
    summonEntity(b.dimension, b.location, "minecraft:zombie", 3);
    summonEntity(b.dimension, b.location, "minecraft:zombie_villager_v2", 2);
  },
  // 33. Drop all inventory items on ground
  (b, p) => {
    const cont = p.getComponent("inventory")?.container;
    if (!cont) return;
    for (let i = 0; i < cont.size; i++) {
      const item = cont.getItem(i);
      if (item) {
        b.dimension.spawnItem(item, b.location);
        cont.setItem(i, undefined);
      }
    }
  },
  // 34. Slime rain
  (b) =>
    summonEntity(b.dimension, b.location, "minecraft:slime", randomNum(6, 10)),
  // 35. Arrow trap (dispensers + arrows)
  (b) => {
    for (let i = 0; i < 4; i++) {
      const dir = i * 90;
      summonEntity(b.dimension, b.location, "minecraft:arrow", 3);
    }
  },
  // 36. Drowned with tridents
  (b) => summonEntity(b.dimension, b.location, "minecraft:drowned", 3),
  // 37. Magma cubes in netherrack room
  (b) => {
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        setBlock(
          b.dimension,
          { x: b.location.x + x, y: b.location.y - 1, z: b.location.z + z },
          "minecraft:netherrack",
        );
      }
    }
    summonEntity(
      b.dimension,
      b.location,
      "minecraft:magma_cube",
      randomNum(3, 5),
    );
  },
  // 38. Bad omen + phantom
  (b, p) => {
    playerEffect(p, "bad_omen", 6000, 1);
    summonEntity(b.dimension, b.location, "minecraft:phantom", 2);
  },
  // 39. Fall trap (teleport high + remove ground)
  (b, p) => {
    p.teleport({ x: b.location.x, y: b.location.y + 30, z: b.location.z });
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        setBlock(
          b.dimension,
          { x: b.location.x + x, y: b.location.y - 1, z: b.location.z + z },
          "minecraft:air",
        );
      }
    }
  },
  // 40. Wither skeleton + wither effect
  (b, p) => {
    summonEntity(b.dimension, b.location, "minecraft:wither_skeleton", 2);
    playerEffect(p, "wither", 15, 2);
  },
  // 41. Husk swarm + hunger
  (b, p) => {
    summonEntity(b.dimension, b.location, "minecraft:husk", 4);
    playerEffect(p, "hunger", 30, 3);
  },
  // 42. Levitation dropper (float up then fall damage)
  (b, p) => {
    playerEffect(p, "levitation", 6, 3);
    let tick = 0;
    const id = system.runInterval(() => {
      tick++;
      if (tick >= 120) {
        system.clearRun(id);
        playerEffect(p, "slow_falling", 1, 0, false);
      }
    }, 1);
  },
  // 43. Stray + slowness arrows
  (b) => summonEntity(b.dimension, b.location, "minecraft:stray", 3),
  // 44. Cactus wall
  (b) => {
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        if (x === -2 || x === 2 || z === -2 || z === 2) {
          for (let y = 0; y < 3; y++) {
            setBlock(
              b.dimension,
              { x: b.location.x + x, y: b.location.y + y, z: b.location.z + z },
              "minecraft:cactus",
            );
          }
        }
      }
    }
  },
  // 45. Guardian + mining fatigue
  (b, p) => {
    summonEntity(b.dimension, b.location, "minecraft:guardian", 2);
    playerEffect(p, "mining_fatigue", 60, 3);
  },
  // 46. Darkness + bat swarm
  (b, p) => {
    playerEffect(p, "darkness", 30, 0);
    summonEntity(b.dimension, b.location, "minecraft:bat", randomNum(8, 12));
  },
  // 47. Pillager patrol
  (b) => {
    summonEntity(b.dimension, b.location, "minecraft:pillager", 3);
    summonEntity(b.dimension, b.location, "minecraft:vindicator", 1);
  },
  // 48. Magma floor + fire
  (b, p) => {
    fillSquare(b.dimension, b.location, 3, -1, "minecraft:magma");
    playerEffect(p, "fire_resistance", 5, 0, false);
  },
  // 49. Shulker + levitation
  (b, p) => {
    summonEntity(b.dimension, b.location, "minecraft:shulker", 2);
    playerEffect(p, "levitation", 5, 1);
  },
  // 50. Instant damage
  (b, p) => {
    playerEffect(p, "instant_damage", 1, 2);
  },
  // 51. Hoglin
  (b) => summonEntity(b.dimension, b.location, "minecraft:hoglin", 2),
  // 52. Zoglin
  (b) => summonEntity(b.dimension, b.location, "minecraft:zoglin", 1),
  // 53. Endermite + random teleport
  (b, p) => {
    summonEntity(b.dimension, b.location, "minecraft:endermite", 4);
    p.teleport({
      x: b.location.x + randomNum(-20, 20),
      y: b.location.y + randomNum(-5, 5),
      z: b.location.z + randomNum(-20, 20),
    });
  },
  // 54. Ghast + fire
  (b) => summonEntity(b.dimension, b.location, "minecraft:ghast", 1),
  // 55. Blaze + fire effect
  (b, p) => {
    summonEntity(b.dimension, b.location, "minecraft:blaze", 2);
    playerEffect(p, "fire_resistance", 3, 0, false);
  },
  // 56. Piglin brute
  (b) => summonEntity(b.dimension, b.location, "minecraft:piglin_brute", 2),
  // 57. Soul sand floor + slowness
  (b, p) => {
    fillSquare(b.dimension, b.location, 3, -1, "minecraft:soul_sand");
    playerEffect(p, "slowness", 15, 2);
  },
  // 58. Gravel falling trap
  (b) => {
    for (let y = 2; y < 8; y++) {
      for (let x = -1; x <= 1; x++) {
        for (let z = -1; z <= 1; z++) {
          setBlock(
            b.dimension,
            { x: b.location.x + x, y: b.location.y + y, z: b.location.z + z },
            "minecraft:gravel",
          );
        }
      }
    }
  },
  // 59. Sweet berry bush trap
  (b) => {
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        setBlock(
          b.dimension,
          { x: b.location.x + x, y: b.location.y, z: b.location.z + z },
          "minecraft:sweet_berry_bush",
        );
      }
    }
  },
  // 60. Powder snow + freeze
  (b, p) => {
    fillSquare(b.dimension, b.location, 2, 0, "minecraft:powder_snow");
    playerEffect(p, "slowness", 10, 3);
  },
  // 61. Instant damage II
  (b, p) => playerEffect(p, "instant_damage", 1, 2),
  // 62. Pit trap (dig hole)
  (b) => {
    for (let y = 0; y > -5; y--) {
      for (let x = -1; x <= 1; x++) {
        for (let z = -1; z <= 1; z++) {
          setBlock(
            b.dimension,
            { x: b.location.x + x, y: b.location.y + y, z: b.location.z + z },
            "minecraft:air",
          );
        }
      }
    }
  },
  // 63. Poison IV (long)
  (b, p) => playerEffect(p, "poison", 30, 3),
  // 64. Vex surround (4 directions)
  (b) => {
    const dirs = [
      { x: 1, z: 0 },
      { x: -1, z: 0 },
      { x: 0, z: 1 },
      { x: 0, z: -1 },
    ];
    for (const d of dirs) {
      try {
        b.dimension.spawnEntity("minecraft:vex", {
          x: b.location.x + d.x * 3,
          y: b.location.y + 1,
          z: b.location.z + d.z * 3,
        });
      } catch (_) {}
    }
  },
  // 65. Zombie horse + skeleton trap
  (b) => {
    summonEntity(b.dimension, b.location, "minecraft:zombie_horse", 1);
    summonEntity(b.dimension, b.location, "minecraft:skeleton", 2);
  },
  // 66. Spider jockey (spider + skeleton)
  (b) => {
    summonEntity(b.dimension, b.location, "minecraft:spider", 2);
    summonEntity(b.dimension, b.location, "minecraft:skeleton", 2);
  },
  // 67. Baby zombie rider (chicken jockey style)
  (b) => {
    for (let i = 0; i < 3; i++) {
      try {
        b.dimension.spawnEntity("minecraft:zombie", {
          x: b.location.x + randomNum(-2, 2),
          y: b.location.y,
          z: b.location.z + randomNum(-2, 2),
        });
      } catch (_) {}
    }
  },
  // 68. Ravager + pillager raid
  (b) => {
    summonEntity(b.dimension, b.location, "minecraft:ravager", 1);
    summonEntity(b.dimension, b.location, "minecraft:pillager", 2);
  },
  // 69. Wandering trader + llamas
  (b) => {
    summonEntity(b.dimension, b.location, "minecraft:wandering_trader", 1);
    summonEntity(b.dimension, b.location, "minecraft:llama", 2);
  },
  // 70. Skeleton trap horse (lightning + skeleton horsemen)
  (b) => {
    summonEntity(b.dimension, b.location, "minecraft:skeleton_horse", 1);
    summonEntity(b.dimension, b.location, "minecraft:skeleton", 2);
    b.dimension.spawnEntity("minecraft:lightning_bolt", b.location);
  },
  // 71. Donkey + chest (slow annoying mob)
  (b) => summonEntity(b.dimension, b.location, "minecraft:donkey", 2),
  // 72. Mule + leather
  (b) => {
    summonEntity(b.dimension, b.location, "minecraft:mule", 2);
    spawnItem(
      [{ id: "leather", cout: randomNum(3, 6) }],
      b.location,
      b.dimension,
    );
  },
  // 73. Piglin + crossbow
  (b) => summonEntity(b.dimension, b.location, "minecraft:piglin", 3),
  // 74. Pufferfish (poison cloud)
  (b, p) => {
    summonEntity(b.dimension, b.location, "minecraft:pufferfish", 3);
    playerEffect(p, "poison", 8, 2);
  },
  // 75. Elder guardian + mining fatigue
  (b, p) => {
    summonEntity(b.dimension, b.location, "minecraft:elder_guardian", 1);
    playerEffect(p, "mining_fatigue", 120, 4);
  },
  // 76. Wither skeleton
  (b) => summonEntity(b.dimension, b.location, "minecraft:wither_skeleton", randomNum(1, 2)),
  // 77. Anvil trap
  (b) => {
    for (let y = 1; y <= 5; y++)
      setBlock(b.dimension, { x: b.location.x, y: b.location.y + y, z: b.location.z }, "minecraft:anvil");
  },
  // 78. Weakness bomb
  (b, p) => playerEffect(p, "weakness", 60, 2),
  // 79. Silverfish swarm
  (b) => summonEntity(b.dimension, b.location, "minecraft:silverfish", randomNum(8, 12)),
  // 80. Sinkhole — drop gravel
  (b) => {
    for (let y = 1; y <= 8; y++)
      setBlock(b.dimension, { x: b.location.x, y: b.location.y + y, z: b.location.z }, "minecraft:gravel");
  },
  // 81. Poison + hunger
  (b, p) => {
    playerEffect(p, "poison", 15, 1);
    playerEffect(p, "hunger", 30, 2);
  },
  // 82. Vex onslaught
  (b) => summonEntity(b.dimension, b.location, "minecraft:vex", randomNum(3, 5)),
  // 83. Fire ring
  (b) => {
    for (let x = -2; x <= 2; x++)
      for (let z = -2; z <= 2; z++)
        if (Math.abs(x) === 2 || Math.abs(z) === 2)
          setBlock(b.dimension, { x: b.location.x + x, y: b.location.y, z: b.location.z + z }, "minecraft:fire");
  },
  // 84. Nausea + blindness
  (b, p) => {
    playerEffect(p, "nausea", 30, 0);
    playerEffect(p, "blindness", 30, 0);
  },
  // 85. Armored zombies
  (b) => {
    for (let i = 0; i < 3; i++) {
      const z = b.dimension.spawnEntity("minecraft:zombie", b.location);
      z?.getComponent("equippable")?.getEquipmentSlot(EquipmentSlot.Mainhand).setItem(new ItemStack("minecraft:iron_sword"));
    }
  },
  // 86. Lava rain
  (b) => {
    for (let x = -2; x <= 2; x++)
      for (let z = -2; z <= 2; z++)
        setBlock(b.dimension, { x: b.location.x + x, y: b.location.y + 5, z: b.location.z + z }, "minecraft:lava");
  },
  // 87. Strip armor
  (b, p) => {
    const c = p.getComponent("equippable");
    if (!c) return;
    c.getEquipmentSlot(EquipmentSlot.Head).setItem(undefined);
    c.getEquipmentSlot(EquipmentSlot.Chest).setItem(undefined);
    c.getEquipmentSlot(EquipmentSlot.Legs).setItem(undefined);
    c.getEquipmentSlot(EquipmentSlot.Feet).setItem(undefined);
  },
  // 88. Ravager
  (b) => summonEntity(b.dimension, b.location, "minecraft:ravager", 1),
  // 89. Wither + slowness
  (b, p) => {
    playerEffect(p, "wither", 20, 1);
    playerEffect(p, "slowness", 20, 2);
  },
  // 90. Glass cage
  (b, p) => {
    for (let x = -1; x <= 1; x++)
      for (let z = -1; z <= 1; z++)
        for (let y = 0; y <= 3; y++)
          if (x !== 0 || z !== 0 || y < 3)
            setBlock(b.dimension, { x: b.location.x + x, y: b.location.y + y, z: b.location.z + z }, "minecraft:glass");
    p.teleport({ x: b.location.x, y: b.location.y + 1, z: b.location.z });
  },
  // 91. Skeleton trap
  (b) => {
    for (let i = 0; i < 4; i++)
      b.dimension.spawnEntity("minecraft:skeleton_horse", { x: b.location.x + randomNum(-2, 2), y: b.location.y, z: b.location.z + randomNum(-2, 2) });
  },
  // 92. Clear inventory
  (b, p) => clearInventory(p),
  // 93. Blindness + slowness
  (b, p) => {
    playerEffect(p, "blindness", 60, 0);
    playerEffect(p, "slowness", 60, 3);
  },
  // 94. Bee attack
  (b) => summonEntity(b.dimension, b.location, "minecraft:bee", randomNum(6, 10)),
  // 95. Creeper surprise
  (b) => summonEntity(b.dimension, b.location, "minecraft:creeper", randomNum(2, 3)),
  // 96. Cobweb + blindness
  (b, p) => {
    fillSquare(b.dimension, b.location, 2, 0, "minecraft:cobweb");
    playerEffect(p, "blindness", 20, 0);
  },
  // 97. Zombie villager swarm
  (b) => summonEntity(b.dimension, b.location, "minecraft:zombie_villager", randomNum(4, 6)),
  // 98. Drop mainhand item
  (b, p) => clearMainhand(p),
  // 99. Spore trap — huge mushroom + lingering poison
  (b, p) => {
    setBlock(b.dimension, b.location, "minecraft:brown_mushroom_block");
    setBlock(b.dimension, { x: b.location.x, y: b.location.y + 1, z: b.location.z }, "minecraft:brown_mushroom_block");
    setBlock(b.dimension, { x: b.location.x, y: b.location.y + 2, z: b.location.z }, "minecraft:brown_mushroom_block");
    setBlock(b.dimension, { x: b.location.x, y: b.location.y + 3, z: b.location.z }, "minecraft:brown_mushroom_block");
    playerEffect(p, "poison", 10, 2);
  },
  // 100. Evoker fangs
  (b) => {
    b.dimension.spawnEntity("minecraft:evocation_fang" as any, b.location);
    b.dimension.spawnEntity("minecraft:evocation_fang" as any, { x: b.location.x + 1, y: b.location.y, z: b.location.z });
    b.dimension.spawnEntity("minecraft:evocation_fang" as any, { x: b.location.x - 1, y: b.location.y, z: b.location.z });
    b.dimension.spawnEntity("minecraft:evocation_fang" as any, { x: b.location.x, y: b.location.y, z: b.location.z + 1 });
    b.dimension.spawnEntity("minecraft:evocation_fang" as any, { x: b.location.x, y: b.location.y, z: b.location.z - 1 });
  },
];

export default badEvents;
