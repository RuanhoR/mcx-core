import type {
  BaseToken,
  TagToken,
  TagEndToken,
  ContentToken,
  CommentToken,
  Token,
  ParsedTagNode,
  AttributeMap,
  ParsedTagContentNode,
  ParsedCommentNode,
  MCXLoc,
  MCXPosition,
  TokenType,
} from './../types.js'

function createPos(line: number, column: number): MCXPosition {
  return { line, column }
}
class Tokenizer {
  private text: string

  constructor(text: string) {
    this.text = text
  }
  *splitTokens(): IterableIterator<Token> {
    const text = this.text
    let i = 0
    let line = 1
    let column = 0
    const len = text.length

    while (i < len) {
      const ch = text[i]

      if (ch === '<') {
        if (text.startsWith('!--', i + 1)) {
          const commentStart = i
          const tokenStartLine = line
          const tokenStartColumn = column
          const endIdx = text.indexOf('-->', i + 4)
          const commentEnd = endIdx === -1 ? len - 1 : endIdx + 2
          for (let j = i; j <= commentEnd; j++) {
            if (text[j] === '\n') {
              line++
              column = 0
            } else {
              column++
            }
          }
          const buffer = text.slice(commentStart, commentEnd + 1)
          const tok: Token = {
            data: buffer,
            type: 'Comment' as TokenType,
            start: createPos(tokenStartLine, tokenStartColumn),
            end: createPos(line, column),
          }
          yield tok
          i = commentEnd + 1
          if (i < len && text[i] === '>') column++
          continue
        }
        const tokenStart = i
        const tokenStartLine = line
        const tokenStartColumn = column
        let j = i + 1
        let sawGt = false
        for (; j < len; j++) {
          const c = text[j]
          if (c === '>') {
            sawGt = true
            break
          }
          if (c === '\n') {
            line++
            column = 0
          } else {
            column++
          }
        }
        const buffer = text.slice(tokenStart, sawGt ? j + 1 : len)
        const type: TokenType = buffer.startsWith('</') ? 'TagEnd' : 'Tag'
        const tok: Token = {
          data: buffer,
          type,
          start: createPos(tokenStartLine, tokenStartColumn),
          end: createPos(line, column),
        }
        yield tok
        i = sawGt ? j + 1 : len
        if (sawGt) column++
      } else {
        const contentStart = i
        const contentStartLine = line
        const contentStartColumn = column
        let j = i
        for (; j < len; j++) {
          const c = text[j]
          if (c === '<') break
          if (c === '\n') {
            line++
            column = 0
          } else {
            column++
          }
        }
        const data = text.slice(contentStart, j)
        const n: Token = {
          data,
          type: 'Content',
          start: createPos(contentStartLine, contentStartColumn),
          end: createPos(line, j > contentStart ? column - 1 : column),
        }
        yield n
        i = j
      }
    }
  }
}

class Lexer {
  private text: string
  private includeComments: boolean
  private booleanProxyCache: WeakMap<object, Record<string, boolean>>

  constructor(text: string, includeComments: boolean = false) {
    this.text = text
    this.includeComments = includeComments
    this.booleanProxyCache = new WeakMap()
  }
  *tokenStream(): IterableIterator<Token> {
    const tokenizer = new Tokenizer(this.text)

    for (const token of tokenizer.splitTokens()) {
      // 如果includeComments为false，跳过注释Token
      if (!this.includeComments && token.type === 'Comment') {
        continue
      }
      yield token
    }
  }

  /**
   * 生成 Token 迭代器，用于遍历所有结构化 Token
   */
  *tokenIterator(): IterableIterator<Token> {
    yield* this.tokenStream()
  }

  get tokens(): Iterable<Token> {
    return {
      [Symbol.iterator]: () => this.tokenIterator(),
    }
  }

  /**
   * 创建一个动态布尔属性访问的 Proxy（可选功能）
   */
  getBooleanCheckProxy(): Record<string, boolean> {
    if (!this.booleanProxyCache.has(this)) {
      const charMap = new Map<string, boolean>()
      const proxy = new Proxy(
        {},
        {
          get(_: unknown, prop: string | symbol): boolean {
            if (typeof prop !== 'string') return false
            return charMap.get(prop) || false
          },
          set(_: unknown, prop: string | symbol, value: unknown): boolean {
            if (typeof prop !== 'string') return false
            charMap.set(prop, Boolean(value))
            return true
          },
        },
      )
      this.booleanProxyCache.set(this, proxy as Record<string, boolean>)
    }
    return this.booleanProxyCache.get(this) as Record<string, boolean>
  }
}

/** Parser - 负责将Token流解析为AST */
class Parser {
  private lexer: Lexer

  constructor(lexer: Lexer) {
    this.lexer = lexer
  }

  /**
   * 解析标签属性，如：<div id="app" disabled />
   */
  private parseAttributes(tagContent: string): {
    name: string
    arr: AttributeMap
  } {
    const attributes: Record<string, string> = {}
    let currentKey = ''
    let currentValue = ''
    let inKey = true
    let name = ''
    let inValue = false
    let quoteChar: string | null = null
    let isTagName = true

    for (let i = 0; i < tagContent.length; i++) {
      const char = tagContent[i]

      if (isTagName) {
        if (char === ' ' || char === '>') {
          name = currentKey.trim()
          currentKey = ''
          isTagName = false
          if (char === '>') break
        } else {
          currentKey += char
        }
        continue
      }

      if (inValue) {
        if (
          char === quoteChar &&
          (currentValue.length === 0 ||
            currentValue[currentValue.length - 1] !== '\\')
        ) {
          attributes[currentKey.trim()] = currentValue
          currentKey = ''
          currentValue = ''
          inKey = true
          inValue = false
          quoteChar = null
        } else {
          currentValue += char
        }
      } else if (char === '=' && inKey) {
        inKey = false
        inValue = true
        const nextIndex = i + 1
        const nextChar =
          nextIndex < tagContent.length ? tagContent[nextIndex] : ' '
        quoteChar = null
      } else if (char === ' ' && inKey && currentKey) {
        attributes[currentKey.trim()] = 'true'
        currentKey = ''
      } else if (inKey) {
        currentKey += char
      }
    }

    if (isTagName) {
      name = currentKey.trim()
    } else if (currentKey) {
      attributes[currentKey.trim()] = inValue
        ? currentValue.replace(/^["']/, '').replace(/["']$/, '')
        : 'true'
    }

    return {
      name,
      arr: attributes,
    }
  }

  /**
   * 基于stack的解析以支持嵌套，并为ParsedTagNode添加loc: { start, end }
   * Content和Comment改为递归节点数组 (ParsedTagContentNode | ParsedCommentNode | ParsedTagNode)[]
   */
  *parseAST(): IterableIterator<ParsedTagNode> {
    const rawTokens = Array.from(this.lexer.tokenStream())
    const root: (ParsedTagNode | ParsedTagContentNode | ParsedCommentNode)[] =
      []
    const stack: ParsedTagNode[] = []

    for (let idx = 0; idx < rawTokens.length; idx++) {
      const token = rawTokens[idx]
      if (!token) continue

      if (token.type === 'Content') {
        const contentNode: ParsedTagContentNode = {
          data: token.data,
          type: 'TagContent',
        }
        if (stack.length > 0) {
          const top = stack[stack.length - 1]
          ;(top as ParsedTagNode).content.push(contentNode)
        } else {
          root.push(contentNode)
        }
      } else if (token.type === 'Comment') {
        const commentNode: ParsedCommentNode = {
          data: token.data,
          type: 'Comment',
          loc: {
            start: { ...token.start },
            end: { ...token.end },
          },
        }
        if (stack.length > 0) {
          const top = stack[stack.length - 1]
          ;(top as ParsedTagNode).content.push(commentNode)
        } else {
          root.push(commentNode)
        }
      } else if (token.type === 'Tag') {
        const inner = token.data.slice(1, -1).trim()
        // 自闭合 <br/> 或 <img ... /> 也当作单节点（没有 end），这里简单检测末尾 '/'
        const isSelfClosing = inner.endsWith('/')
        const arr = this.parseAttributes(
          isSelfClosing ? inner.slice(0, -1).trim() : inner,
        )
        const node: ParsedTagNode = {
          start: token as TagToken,
          name: arr.name,
          arr: arr.arr as AttributeMap,
          // content 现在是一个数组，包含文本节点、注释节点或子标签
          content: [] as (
            | ParsedTagContentNode
            | ParsedCommentNode
            | ParsedTagNode
          )[],
          end: null,
          type: 'TagNode',
          loc: {
            start: { ...token.start },
            end: { ...token.end },
          } as MCXLoc,
        }

        if (isSelfClosing) {
          // self-closing: immediately close and attach to parent or root
          if (stack.length > 0) {
            ;(stack[stack.length - 1] as ParsedTagNode).content.push(node)
          } else {
            // yield top-level node
            yield node
          }
        } else {
          stack.push(node)
        }
      } else if (token.type === 'TagEnd') {
        // 从 '</name>' 中提取 name
        const name = token.data
          .replace(/^<\/\s*/, '')
          .replace(/\s*>$/, '')
          .trim()
        // 找到最近的匹配开始标签
        for (let s = stack.length - 1; s >= 0; s--) {
          const candidate = stack[s]
          if (candidate && candidate.name === name) {
            // 设置结束
            candidate.end = token
            candidate.loc.end = { ...token.end }
            // 从 stack 中移除并附加到父节点或作为顶层节点产出
            stack.splice(s, 1)
            if (stack.length > 0) {
              ;(stack[stack.length - 1] as ParsedTagNode).content.push(
                candidate,
              )
            } else {
              // yield completed top-level node
              yield candidate
            }
            break
          }
        }
      }
    }
    while (stack.length > 0) {
      const node = stack.shift()!
      if (stack.length > 0) {
        ;(stack[0] as ParsedTagNode).content.push(node)
      } else {
        yield node
      }
    }
  }

  get ast(): Iterable<ParsedTagNode> {
    return {
      [Symbol.iterator]: () => this.parseAST(),
    }
  }
}
export default class McxAst {
  private text: string
  private includeComments: boolean

  constructor(text: string, includeComments: boolean = false) {
    this.text = text
    this.includeComments = includeComments
  }

  private getAST(): ParsedTagNode[] {
    const lexer = new Lexer(this.text, this.includeComments)
    const parser = new Parser(lexer)
    return Array.from(parser.parseAST())
  }

  get data(): ParsedTagNode[] {
    return this.getAST()
  }

  parseAST(): ParsedTagNode[] {
    return this.getAST()
  }

  /**
   * 生成代码字符串
   * @param node 代码的AST节点
   * @returns 代码字符串
   */
  static generateCode(node: ParsedTagNode): string {
    let code = `<${node.name}`
    // 添加属性
    for (const [key, value] of Object.entries(node.arr || {})) {
      if (value === 'true') {
        code += ` ${key}`
      } else {
        code += ` ${key}=${String(value)}`
      }
    }
    code += '>'
    const contentArr = node.content
    if (Array.isArray(contentArr)) {
      for (const item of contentArr) {
        if ((item as ParsedTagContentNode).type === 'TagContent') {
          code += (item as ParsedTagContentNode).data
        } else {
          code += McxAst.generateCode(item as ParsedTagNode)
        }
      }
    }
    code += `</${node.name}>`
    return code
  }
}

export { Tokenizer, Lexer, Parser, MCXUtils }
class MCXUtils {
  static isTagNode(node: unknown): node is ParsedTagNode {
    return (
      !!node &&
      typeof node === 'object' &&
      'start' in (node as object) &&
      'name' in (node as object) &&
      'arr' in (node as object) &&
      'content' in (node as object) &&
      'end' in (node as object)
    )
  }
  static isTagContentNode(node: unknown): node is ParsedTagContentNode {
    return (
      !!node &&
      typeof node === 'object' &&
      'data' in (node as object) &&
      'type' in (node as object) &&
      (node as ParsedTagContentNode).type === 'TagContent'
    )
  }
  static isCommentNode(node: unknown): node is ParsedCommentNode {
    return (
      !!node &&
      typeof node === 'object' &&
      'data' in (node as object) &&
      'type' in (node as object) &&
      'loc' in (node as object) &&
      (node as ParsedCommentNode).type === 'Comment'
    )
  }
  static isAttributeMap(obj: unknown): obj is AttributeMap {
    return !!obj && typeof obj === 'object' && !Array.isArray(obj)
  }
  static isToken(obj: unknown): obj is Token {
    return (
      !!obj &&
      typeof obj === 'object' &&
      'data' in (obj as object) &&
      'type' in (obj as object) &&
      'start' in (obj as object) &&
      'end' in (obj as object) &&
      ((obj as Token).type === 'Tag' ||
        (obj as Token).type === 'TagEnd' ||
        (obj as Token).type === 'Content' ||
        (obj as Token).type === 'Comment')
    )
  }
  static isTagToken(obj: unknown): obj is TagToken {
    return MCXUtils.isToken(obj) && (obj as Token).type === 'Tag'
  }
  static isTagEndToken(obj: unknown): obj is TagEndToken {
    return MCXUtils.isToken(obj) && (obj as Token).type === 'TagEnd'
  }
  static isContentToken(obj: unknown): obj is ContentToken {
    return MCXUtils.isToken(obj) && (obj as Token).type === 'Content'
  }
  static isCommentToken(obj: unknown): obj is CommentToken {
    return MCXUtils.isToken(obj) && (obj as Token).type === 'Comment'
  }
  static isBaseToken(obj: unknown): obj is BaseToken {
    return (
      !!obj &&
      typeof obj === 'object' &&
      'data' in (obj as object) &&
      'type' in (obj as object) &&
      'start' in (obj as object) &&
      'end' in (obj as object)
    )
  }
  static isTokenType(value: unknown): value is TokenType {
    return (
      value === 'Tag' ||
      value === 'TagEnd' ||
      value === 'Content' ||
      value === 'Comment'
    )
  }
  static isParseNode(node: unknown): node is ParsedTagNode[] {
    return Array.isArray(node) && (node as unknown[]).every(MCXUtils.isTagNode)
  }
}
