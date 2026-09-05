// Generates src/generated-events.ts from @minecraft/server's index.d.ts by
// collecting the readonly properties of WorldAfterEvents / WorldBeforeEvents.
// Run: pnpm --filter @mbler/eslint-plugin-mcx gen:events
import { createRequire } from 'node:module';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, writeFileSync } from 'node:fs';
import ts from 'typescript';

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const serverPkg = require.resolve('@minecraft/server/package.json');
const dtsPath = path.join(path.dirname(serverPkg), 'index.d.ts');
const serverVersion = JSON.parse(
  readFileSync(serverPkg, 'utf-8'),
).version;

const source = ts.createSourceFile(
  dtsPath,
  readFileSync(dtsPath, 'utf-8'),
  ts.ScriptTarget.Latest,
  true,
);

function eventNamesOf(className) {
  for (const stmt of source.statements) {
    if (
      ts.isClassDeclaration(stmt) &&
      stmt.name?.text === className
    ) {
      const names = [];
      for (const member of stmt.members) {
        if (
          ts.isPropertyDeclaration(member) &&
          member.name &&
          ts.isIdentifier(member.name)
        ) {
          names.push(member.name.text);
        }
      }
      return names.sort();
    }
  }
  throw new Error(`${className} not found in ${dtsPath}`);
}

const after = eventNamesOf('WorldAfterEvents');
const before = eventNamesOf('WorldBeforeEvents');

const banner = `// AUTO-GENERATED from @minecraft/server@${serverVersion} index.d.ts by
// scripts/generate-events.mjs (WorldAfterEvents / WorldBeforeEvents
// property names). Do not edit by hand; re-run the script to refresh.
//
// This is the FALLBACK list, used when a user project has no resolvable
// @minecraft/server. At lint time the plugin normally extracts the lists
// from the project's own @minecraft/server and caches them under
// node_modules/.tmp/eslint-plugin-mcx/ (see src/event-source.ts).
`;

const out = `${banner}export const WORLD_AFTER_EVENTS: readonly string[] = ${JSON.stringify(
  after,
  null,
  2,
)};

export const WORLD_BEFORE_EVENTS: readonly string[] = ${JSON.stringify(
  before,
  null,
  2,
)};
`;

writeFileSync(path.join(here, '..', 'src', 'generated-events.ts'), out);
console.log(
  `wrote src/generated-events.ts: ${after.length} afterEvents, ${before.length} beforeEvents (@minecraft/server@${serverVersion})`,
);
