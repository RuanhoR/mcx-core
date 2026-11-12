import { parse, parseExpression } from '@babel/parser';
import { generate } from '@babel/generator';
import * as t from '@babel/types';
import type {
  CompileOpt,
  McxPlugin,
  McxPluginContext,
  McxPluginOutput,
  McxPosition,
  McxTagHandler,
  McxTagNode,
} from '@mbler/mcx-types';

export interface McxPluginState {
  imports: string[];
  statements: string[];
  exports: Record<string, string>;
  type?: string;
  tags: Map<string, McxTagHandler[]>;
}

export interface McxHookContextOptions {
  id: string;
  source: string;
  nodes: McxTagNode[];
  opt: CompileOpt;
  output: McxPluginOutput;
  error: (message: string, loc?: McxPosition) => never;
}

/** Identity helper so plugin authors get full typing without an explicit import. */
export function defineMcxPlugin(plugin: McxPlugin): McxPlugin {
  return plugin;
}

/**
 * Normalise `CompileOpt.mcxPlugin` into a flat, ordered plugin list.
 *
 * Accepts a single plugin, a factory, or arrays/nested arrays of either:
 * `mcxPlugin: [jsonui(), other()]` and `mcxPlugin: [jsonui, other]` both work.
 * Factories are invoked once, in declaration order, so the order in the array
 * is the hook execution order.
 */
export function resolveMcxPlugins(opt: CompileOpt): McxPlugin[] {
  const raw: unknown = opt.mcxPlugin;
  if (!raw) return [];
  const flat: unknown[] = [];
  const walk = (value: unknown, depth: number): void => {
    if (Array.isArray(value)) {
      if (depth > 8) {
        throw new Error('[mcx plugin]: mcxPlugin arrays are nested too deeply');
      }
      for (const item of value) walk(item, depth + 1);
      return;
    }
    flat.push(typeof value === 'function' ? (value as () => unknown)() : value);
  };
  walk(raw, 0);

  const plugins = flat.map((plugin, index) => {
    if (
      !plugin ||
      typeof plugin !== 'object' ||
      typeof (plugin as McxPlugin).name !== 'string' ||
      (plugin as McxPlugin).name.length === 0
    ) {
      throw new Error(
        `[mcx plugin]: mcxPlugin[${index}] must be a plugin object (or a factory returning one) with a non-empty "name"`,
      );
    }
    return plugin as McxPlugin;
  });
  return plugins;
}

export function cloneMcxNodes(nodes: unknown): McxTagNode[] {
  if (!Array.isArray(nodes)) return [];
  try {
    return structuredClone(nodes) as McxTagNode[];
  } catch {
    return nodes as McxTagNode[];
  }
}

export function createMcxPluginContext(options: McxHookContextOptions): {
  hook: McxPluginContext;
  state: McxPluginState;
} {
  const plugins = resolveMcxPlugins(options.opt);
  const state: McxPluginState = {
    imports: [],
    statements: [],
    exports: {},
    tags: new Map(),
  };
  const hook: McxPluginContext = {
    id: options.id,
    source: options.source,
    code: options.source,
    nodes: options.nodes,
    opt: options.opt,
    output: options.output,
    plugins,
    tag(name) {
      return options.nodes.find(node => node.name === name);
    },
    tags(name) {
      return options.nodes.filter(node => node.name === name);
    },
    registerTag(name, handler) {
      const handlers = state.tags.get(name) ?? [];
      handlers.push(handler);
      state.tags.set(name, handlers);
    },
    addImport(code) {
      state.imports.push(code);
    },
    addStatement(code) {
      state.statements.push(code);
    },
    addExport(name, expression) {
      state.exports[name] = expression;
    },
    setType(type) {
      state.type = type;
    },
    error(message, loc) {
      return options.error(message, loc);
    },
  };
  return { hook, state };
}

/**
 * Runs `tags` + `onTransform` + root tag handlers for one .mcx file.
 * A string result short-circuits the built-in transform and becomes the
 * module code (plugin injections are still applied afterwards).
 */
export async function runMcxTransformHooks(
  hook: McxPluginContext,
  state: McxPluginState,
  plugins: McxPlugin[],
): Promise<string | undefined> {
  for (const plugin of plugins) {
    for (const [name, handler] of Object.entries(plugin.tags ?? {})) {
      if (typeof handler === 'function') hook.registerTag(name, handler);
    }
  }
  for (const plugin of plugins) {
    if (!plugin.onTransform) continue;
    const result = await plugin.onTransform(hook);
    if (typeof result === 'string') {
      hook.code = result;
      return result;
    }
  }
  for (const node of hook.nodes) {
    const handlers = state.tags.get(node.name);
    if (!handlers) continue;
    for (const handler of handlers) {
      const result = await handler(node, hook);
      if (typeof result === 'string') {
        hook.code = result;
        return result;
      }
    }
  }
  return undefined;
}

/** Chains `onTransformed` hooks over the generated JS. */
export async function runMcxTransformedHooks(
  code: string,
  hook: McxPluginContext,
  plugins: McxPlugin[],
): Promise<string> {
  let current = code;
  hook.code = current;
  for (const plugin of plugins) {
    if (!plugin.onTransformed) continue;
    const result = await plugin.onTransformed(current, hook);
    if (typeof result === 'string') {
      current = result;
      hook.code = current;
    }
  }
  return current;
}

/** First `onThrow` hook returning code recovers the failed compilation. */
export async function runMcxThrowHooks(
  error: Error,
  hook: McxPluginContext,
  plugins: McxPlugin[],
): Promise<string | undefined> {
  for (const plugin of plugins) {
    if (!plugin.onThrow) continue;
    const result = await plugin.onThrow(error, hook);
    if (typeof result === 'string') {
      hook.code = result;
      return result;
    }
  }
  return undefined;
}

export async function runMcxBuildStart(plugins: McxPlugin[]): Promise<void> {
  for (const plugin of plugins) await plugin.onBuildStart?.();
}

export async function runMcxBuildEnd(plugins: McxPlugin[]): Promise<void> {
  for (const plugin of plugins) await plugin.onBuildEnd?.();
}

function parseStatements(raw: string): t.Statement[] {
  try {
    return parse(raw, { sourceType: 'module' }).program.body;
  } catch (err) {
    throw new Error(`[mcx plugin]: invalid injected code: ${raw}`, {
      cause: err,
    });
  }
}

function parseValue(expression: string): t.Expression {
  try {
    return parseExpression(expression);
  } catch (err) {
    throw new Error(
      `[mcx plugin]: invalid injected expression: ${expression}`,
      {
        cause: err,
      },
    );
  }
}

function propertyKey(name: string): t.Identifier | t.StringLiteral {
  return /^[A-Za-z_$][\w$]*$/.test(name)
    ? t.identifier(name)
    : t.stringLiteral(name);
}

function setObjectField(
  object: t.ObjectExpression,
  name: string,
  value: t.Expression,
): void {
  for (const property of object.properties) {
    if (!t.isObjectProperty(property)) continue;
    const key = property.key;
    const matches = t.isIdentifier(key)
      ? key.name === name
      : t.isStringLiteral(key)
        ? key.value === name
        : false;
    if (matches) {
      property.value = value;
      return;
    }
  }
  object.properties.push(t.objectProperty(propertyKey(name), value));
}

/**
 * Applies the code collected by hook helpers to the generated module.
 * Skipped entirely when no plugin injected anything, so the default build
 * output stays byte-for-byte identical.
 */
export function applyMcxPluginInjections(
  code: string,
  state: McxPluginState,
): string {
  const exportEntries = Object.entries(state.exports);
  const hasType = state.type !== undefined;
  if (
    state.imports.length === 0 &&
    state.statements.length === 0 &&
    exportEntries.length === 0 &&
    !hasType
  ) {
    return code;
  }
  const ast = parse(code, { sourceType: 'module' });
  const body = ast.program.body;

  const seenImports = new Set(
    body
      .filter(statement => t.isImportDeclaration(statement))
      .map(statement => generate(statement).code),
  );
  const newImports: t.ImportDeclaration[] = [];
  for (const raw of state.imports) {
    for (const statement of parseStatements(raw)) {
      if (!t.isImportDeclaration(statement)) {
        throw new Error(
          `[mcx plugin]: addImport() only accepts import statements: ${raw}`,
        );
      }
      const key = generate(statement).code;
      if (seenImports.has(key)) continue;
      seenImports.add(key);
      newImports.push(statement);
    }
  }
  body.unshift(...newImports);

  const defaultExport = body.find(statement =>
    t.isExportDefaultDeclaration(statement),
  );
  if (defaultExport && t.isExportDefaultDeclaration(defaultExport)) {
    if (!t.isObjectExpression(defaultExport.declaration)) {
      throw new Error(
        '[mcx plugin]: cannot inject exports into a module whose default export is not an object',
      );
    }
    if (hasType) {
      setObjectField(
        defaultExport.declaration,
        'type',
        t.stringLiteral(state.type as string),
      );
    }
    for (const [name, expression] of exportEntries) {
      setObjectField(defaultExport.declaration, name, parseValue(expression));
    }
  } else if (exportEntries.length > 0 || hasType) {
    const properties: t.ObjectProperty[] = [];
    if (hasType) {
      properties.push(
        t.objectProperty(
          t.identifier('type'),
          t.stringLiteral(state.type as string),
        ),
      );
    }
    for (const [name, expression] of exportEntries) {
      properties.push(
        t.objectProperty(propertyKey(name), parseValue(expression)),
      );
    }
    body.push(t.exportDefaultDeclaration(t.objectExpression(properties)));
  }

  for (const raw of state.statements) {
    body.push(...parseStatements(raw));
  }
  return generate(ast).code;
}
