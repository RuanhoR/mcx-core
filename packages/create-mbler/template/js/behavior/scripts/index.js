import { world } from '@minecraft/server';

console.log('Hello world in minecraft');

world.afterEvents.itemUse.subscribe(r => {
  r.source.sendMessage(`You Use ${r.itemStack.typeId}`);
});
