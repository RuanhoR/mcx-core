#!/usr/bin/env node
import process from 'node:process';

const entry = new URL('../dist/cli.js', import.meta.url);

try {
  const mod = await import(entry.href);
  const code = await mod.run(process.argv.slice(2));
  process.exitCode = typeof code === 'number' ? code : 0;
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  if (/ERR_MODULE_NOT_FOUND|Cannot find module/i.test(message)) {
    console.error(
      '[mcx-plugin-jsonui] the preview CLI is not built yet — run `pnpm build` inside @mbler/mcx-plugin-jsonui',
    );
  } else {
    console.error(error instanceof Error ? error.stack ?? message : message);
  }
  process.exitCode = 1;
}
