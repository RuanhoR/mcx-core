import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { ReadFileOpt, ParseReadFileOpt, TypeVerifyBody } from './types.js';

export default class Utlis {
  public static async FileExsit(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }
  public static async readFile(
    filePath: string,
    opt: ReadFileOpt = {},
  ): Promise<object | string> {
    const opts: ParseReadFileOpt = {
      delay: 200,
      maxRetries: 3,
      want: 'string',
      ...opt,
    };

    for (let attempt = 0; attempt < opts.maxRetries; attempt++) {
      try {
        const buffer: Buffer = await fs.readFile(filePath);
        let text: string | object;
        if (opts.want === 'string') {
          text = buffer.toString(); // Buffer -> string
        } else if (opts.want === 'object') {
          try {
            text = JSON.parse(buffer.toString()); // Buffer -> string -> object
          } catch {
            text = {};
          }
        } else {
          text = buffer.toString();
        }

        return text;
      } catch {
        if (attempt < opts.maxRetries - 1) {
          await Utlis.sleep(opts.delay);
        }
      }
    }
    return opts.want === 'object' ? {} : '';
  }
  public static sleep(time: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, time));
  }
  public static TypeVerify<
    T extends Record<string, any>,
    U extends TypeVerifyBody,
  >(
    obj: T,
    types: U,
  ): obj is T & {
    [P in keyof U]: {
      boolean: boolean;
      number: number;
      string: string;
      object: object;
      function: Function;
      bigint: bigint;
      symbol: Symbol;
    }[U[P]];
  } {
    for (const item of Object.entries(types)) {
      const [key, ShouldType]: [string, string] = item;
      if (!(typeof obj[key] === ShouldType)) return false;
    }
    return true;
  }
  public static AbsoluteJoin(baseDir: string, inputPath: string): string {
    return path.isAbsolute(inputPath)
      ? inputPath
      : path.join(baseDir, inputPath);
  }
}
