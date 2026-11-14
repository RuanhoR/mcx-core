import { spawn } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { startPreviewServer } from './preview/server.js';

const useColor = process.stdout.isTTY && !process.env['NO_COLOR'];
const paint = (code: string, text: string): string =>
  useColor ? `\u001B[${code}m${text}\u001B[0m` : text;
const dim = (text: string): string => paint('2', text);
const bold = (text: string): string => paint('1', text);
const green = (text: string): string => paint('32', text);
const red = (text: string): string => paint('31', text);
const cyan = (text: string): string => paint('36', text);

export const DEFAULT_PORT = 5174;
export const DEFAULT_HOST = '127.0.0.1';
export const DEFAULT_SIZE = { width: 960, height: 540 };

const HELP = `${bold('mcx-plugin-jsonui')} — preview JSON UI screens in the browser

${bold('Usage')}
  mcx-plugin-jsonui preview [dir] [options]

${bold('Options')}
  -p, --port <port>     port to listen on (default ${DEFAULT_PORT})
  -H, --host <host>     host to bind (default ${DEFAULT_HOST})
  -s, --size <WxH>      logical canvas size (default 960x540)
  -w, --watch           watch the project and hot reload (default on)
      --no-watch        disable the file watcher
  -o, --open            open the browser (default on)
      --no-open         do not open the browser
  -h, --help            show this help
  -v, --version         print the version

${bold('Screenshot API')}
  GET /api/screenshot?id=<screen>&format=png|svg&scale=2&bg=dark|checker|transparent
  GET /api/screenshot?id=<screen>&w=1280&h=720

${bold('Examples')}
  mcx-plugin-jsonui preview
  mcx-plugin-jsonui preview ./src/ui --port 6000 --host 0.0.0.0
`;

interface ParsedArgs {
  command: string;
  dir: string | undefined;
  port: number;
  host: string;
  width: number;
  height: number;
  watch: boolean;
  open: boolean;
  help: boolean;
  version: boolean;
}

function readVersion(): string {
  const candidates = ['../package.json', '../../package.json'];
  for (const candidate of candidates) {
    try {
      const file = new URL(candidate, import.meta.url);
      if (!fs.existsSync(file)) continue;
      const raw = JSON.parse(fs.readFileSync(file, 'utf-8')) as { version?: string };
      if (raw.version) return raw.version;
    } catch {
      /* try the next candidate */
    }
  }
  return '0.0.0';
}

export function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    command: 'preview',
    dir: undefined,
    port: DEFAULT_PORT,
    host: DEFAULT_HOST,
    width: DEFAULT_SIZE.width,
    height: DEFAULT_SIZE.height,
    watch: true,
    open: true,
    help: false,
    version: false,
  };
  const positional: string[] = [];
  const next = (index: number): string | undefined => argv[index + 1];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index] ?? '';
    if (arg === '--') break;
    if (arg === '-h' || arg === '--help') {
      parsed.help = true;
      continue;
    }
    if (arg === '-v' || arg === '--version') {
      parsed.version = true;
      continue;
    }
    const [flag, inlineValue] = arg.includes('=')
      ? [arg.slice(0, arg.indexOf('=')), arg.slice(arg.indexOf('=') + 1)]
      : [arg, undefined];
    const takeValue = (): string | undefined => {
      if (inlineValue !== undefined) return inlineValue;
      const value = next(index);
      if (value !== undefined) index += 1;
      return value;
    };
    if (flag === '-p' || flag === '--port') {
      const value = Number.parseInt(takeValue() ?? '', 10);
      if (Number.isFinite(value) && value >= 0) parsed.port = value;
      continue;
    }
    if (flag === '-H' || flag === '--host') {
      const value = takeValue();
      if (value) parsed.host = value;
      continue;
    }
    if (flag === '-s' || flag === '--size') {
      const value = takeValue() ?? '';
      const match = /^(\d+)\s*[x×]\s*(\d+)$/i.exec(value.trim());
      if (match) {
        parsed.width = Number.parseInt(match[1] ?? '960', 10);
        parsed.height = Number.parseInt(match[2] ?? '540', 10);
      }
      continue;
    }
    if (flag === '-w' || flag === '--watch') {
      parsed.watch = true;
      continue;
    }
    if (flag === '--no-watch') {
      parsed.watch = false;
      continue;
    }
    if (flag === '-o' || flag === '--open') {
      parsed.open = true;
      continue;
    }
    if (flag === '--no-open') {
      parsed.open = false;
      continue;
    }
    if (arg.startsWith('-')) continue;
    positional.push(arg);
  }

  const [first, ...rest] = positional;
  if (first && ['preview', 'serve', 'dev'].includes(first)) {
    parsed.command = 'preview';
    parsed.dir = rest[0];
  } else if (first) {
    parsed.command = first;
    parsed.dir = rest[0];
  }
  return parsed;
}

function openBrowser(url: string): void {
  try {
    if (process.platform === 'win32') {
      spawn('cmd', ['/c', 'start', '', url], {
        detached: true,
        stdio: 'ignore',
        windowsHide: true,
      }).unref();
      return;
    }
    const command = process.platform === 'darwin' ? 'open' : 'xdg-open';
    spawn(command, [url], { detached: true, stdio: 'ignore' }).unref();
  } catch {
    /* opening the browser is best effort */
  }
}

export async function run(argv: string[]): Promise<number> {
  const args = parseArgs(argv);

  if (args.version) {
    process.stdout.write(`${readVersion()}\n`);
    return 0;
  }
  if (args.help || args.command === 'help') {
    process.stdout.write(HELP);
    return 0;
  }
  if (args.command !== 'preview') {
    process.stderr.write(`${red('unknown command')} ${args.command}\n\n${HELP}`);
    return 1;
  }

  const target = path.resolve(args.dir ?? process.cwd());
  if (!fs.existsSync(target)) {
    process.stderr.write(`${red('no such path')} ${target}\n`);
    return 1;
  }
  const only = target.endsWith('.mcx') ? target : undefined;
  const root = only ? path.dirname(only) : target;

  let handle;
  try {
    handle = await startPreviewServer({
      root,
      port: args.port,
      host: args.host,
      width: args.width,
      height: args.height,
      watch: args.watch,
      ...(only ? { only } : {}),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/EADDRINUSE/i.test(message)) {
      process.stderr.write(
        `${red('port in use')} ${args.port} — try ${cyan(
          `mcx-plugin-jsonui preview --port ${args.port + 1}`,
        )}\n`,
      );
      return 1;
    }
    process.stderr.write(`${red('preview failed')} ${message}\n`);
    return 1;
  }

  const collection = handle.collection();
  const watching = args.watch ? green('on') : dim('off');
  process.stdout.write(
    [
      '',
      `  ${bold('JSON UI Preview')}  ${cyan(handle.url)}`,
      '',
      `  ${dim('project')}   ${collection.root}`,
      `  ${dim('screens')}   ${collection.screens.length}${
        collection.problems.length > 0
          ? ` ${red(`(${collection.problems.length} with problems)`)}`
          : ''
      }`,
      `  ${dim('canvas')}    ${args.width} × ${args.height}`,
      `  ${dim('watching')}  ${watching}`,
      '',
      `  ${dim('Ctrl+C to stop')}`,
      '',
    ].join('\n'),
  );
  for (const problem of collection.problems) {
    process.stdout.write(`  ${red('!')} ${problem.relative}: ${problem.message}\n`);
  }
  if (collection.screens.length === 0) {
    process.stdout.write(
      `  ${dim('no <Ui type="jsonui"> files yet — add one and the page updates itself')}\n\n`,
    );
  }
  if (args.open) openBrowser(handle.url);

  await new Promise<void>(resolve => {
    const stop = (): void => {
      void handle.close().then(() => resolve());
    };
    process.once('SIGINT', stop);
    process.once('SIGTERM', stop);
  });
  return 0;
}
