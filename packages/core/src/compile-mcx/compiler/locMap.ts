/**
 * Position remapping for script code compiled out of a <script> block.
 *
 * TS script blocks are transpiled with ts.transpileModule before babel ever
 * sees them, and the transpiler reprints the program, so babel/AST positions
 * refer to the transpiled output, not the .mcx file. Each compiled script
 * registers a mapper (TS source map + the <script> open-tag line offset) under
 * its compiled code string; compileJSFn rewrites CompileError positions with
 * it so diagnostics land on the original .mcx source.
 */

interface Segment {
  genCol: number;
  srcLine: number; // 0-based
  srcCol: number; // 0-based
}

const B64 =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const B64_LOOKUP = new Map<string, number>();
for (let i = 0; i < B64.length; i++) B64_LOOKUP.set(B64[i]!, i);

/** Decode one VLQ value starting at `pos`; returns [value, nextPos]. */
function decodeVlqSegment(
  str: string,
  pos: number,
): [value: number, nextPos: number] {
  let result = 0;
  let shift = 0;
  let continuation = true;
  while (continuation) {
    const char = str[pos];
    if (char === undefined) throw new Error('invalid source map: truncated VLQ');
    const digit = B64_LOOKUP.get(char);
    if (digit === undefined)
      throw new Error(`invalid source map: bad base64 char '${char}'`);
    pos++;
    continuation = (digit & 32) !== 0;
    result += (digit & 31) << shift;
    shift += 5;
  }
  const negate = (result & 1) === 1;
  result >>= 1;
  return [negate ? -result : result, pos];
}

/** Decode a mappings field into per-output-line segment lists. */
export function decodeMappings(mappings: string): Segment[][] {
  const lines: Segment[][] = [];
  let srcIdx = 0;
  let srcLine = 0;
  let srcCol = 0;
  for (const lineStr of mappings.split(';')) {
    const segments: Segment[] = [];
    let genCol = 0;
    if (lineStr.length > 0) {
      for (const segStr of lineStr.split(',')) {
        if (segStr.length === 0) continue;
        let pos = 0;
        const genDelta = decodeVlqSegment(segStr, pos);
        pos = genDelta[1];
        genCol += genDelta[0];
        // 1-field segments carry no source mapping
        if (pos >= segStr.length) {
          segments.push({ genCol, srcLine: -1, srcCol: -1 });
          continue;
        }
        const srcIdxDelta = decodeVlqSegment(segStr, pos);
        pos = srcIdxDelta[1];
        srcIdx += srcIdxDelta[0];
        const srcLineDelta = decodeVlqSegment(segStr, pos);
        pos = srcLineDelta[1];
        srcLine += srcLineDelta[0];
        const srcColDelta = decodeVlqSegment(segStr, pos);
        pos = srcColDelta[1];
        srcCol += srcColDelta[0];
        if (srcIdx !== 0) continue; // only one source (the script itself)
        segments.push({ genCol, srcLine, srcCol });
      }
    }
    lines.push(segments);
  }
  return lines;
}

export interface Loc {
  line: number; // 1-based
  column: number; // 0-based
}

/**
 * Build a mapper from transpile-output positions to .mcx positions.
 * `scriptOpenLine` is the 1-based line of the <script> open tag in the .mcx
 * file: the transpiled input starts right after that tag, so script line 1 is
 * .mcx line `scriptOpenLine`.
 */
export function createScriptLocMapper(
  sourceMapText: string | undefined,
  scriptOpenLine: number,
): (loc: Loc) => Loc {
  let segments: Segment[][] | null = null;
  if (sourceMapText) {
    try {
      segments = decodeMappings(JSON.parse(sourceMapText).mappings ?? '');
    } catch {
      segments = null;
    }
  }
  return (loc: Loc): Loc => {
    let line = loc.line;
    let column = loc.column;
    if (segments) {
      const mapped = lookup(segments, line, column);
      if (mapped) {
        line = mapped.line;
        column = mapped.column;
      }
    }
    return { line: line + scriptOpenLine - 1, column };
  };
}

/** Map an output position to the script position, falling back backwards. */
function lookup(
  segments: Segment[][],
  line: number, // 1-based output line
  column: number, // 0-based output column
): Loc | null {
  let idx = line - 1;
  while (idx >= 0 && (segments[idx] ?? []).length === 0) idx--;
  if (idx < 0) return null;
  const segs = segments[idx]!;
  let lo = 0;
  let hi = segs.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (segs[mid]!.genCol <= column) lo = mid;
    else hi = mid - 1;
  }
  const seg = segs[lo]!;
  if (seg.srcLine < 0) return null;
  return { line: seg.srcLine + 1, column: seg.srcCol };
}

const locMappers = new Map<string, (loc: Loc) => Loc>();

/** Register the position mapper for a compiled script's code string. */
export function setScriptLocMapper(
  code: string,
  mapper: (loc: Loc) => Loc,
): void {
  locMappers.set(code, mapper);
}

export function clearScriptLocMappers(): void {
  locMappers.clear();
}

/** Rewrite a position from compiled-code space into .mcx space (if known). */
export function remapScriptLoc(code: string, loc: Loc): Loc {
  const mapper = locMappers.get(code);
  return mapper ? mapper(loc) : loc;
}
