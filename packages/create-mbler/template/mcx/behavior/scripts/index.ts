import { createApp } from '@mbler/mcx';
import app from './app.mcx';
import { world } from '@minecraft/server';
import './DefineItems.mcx';
import './components/blocks.mcx';
import './components/recipes.mcx';
import { registryCommand } from '@mbler/mcx';
import { LuckBlockCore } from './core/luckBlock';
import { debugCommand } from './command/vdebug';
import { giveLuckBlockCommand } from './command/giveluckblock';
LuckBlockCore.startLoop();
registryCommand(debugCommand);
registryCommand(giveLuckBlockCommand);
// @ts-ignore
createApp(app).mount(world);
