import { describe, it, expect } from 'vitest';
import type { ParsedTagNode } from '../src/types';
import { AST } from '../src/index.js';

type SourceCase = { src: string; tags: string[]; attrs?: Record<string, string> };

const cases: SourceCase[] = [
  { src: '<Ui><button>ok</button></Ui>', tags: ['Ui', 'button'] },
  { src: '<Event @after>playerJoin = handler</Event>', tags: ['Event'] },
  { src: '<Event @before>playerJoin = h</Event>', tags: ['Event'] },
  { src: '<Component><items></items></Component>', tags: ['Component', 'items'] },
  { src: '<App><script>x</script></App>', tags: ['App', 'script'] },
  { src: '<Ui setup><title>T</title></Ui>', tags: ['Ui', 'title'] },
  { src: '<Ui lang="ts"><button>b</button></Ui>', tags: ['Ui', 'button'] },
  { src: '<div a="1" b="2">x</div>', tags: ['div'] },
  { src: '<self-closing />', tags: [] },
  { src: '<a><b><c>deep</c></b></a>', tags: ['a', 'b', 'c'] },
  { src: '<one></one><two></two>', tags: ['one', 'two'] },
  { src: '<x>plain text</x>', tags: ['x'] },
  { src: '<empty></empty>', tags: ['empty'] },
  { src: '<quote attr="has &quot;quotes&quot;">y</quote>', tags: ['quote'] },
  { src: '<dash-name_under.score>v</dash-name_under.score>', tags: ['dash-name_under.score'] },
  { src: '<UPPER>u</UPPER>', tags: ['UPPER'] },
  { src: '<digits123>n</digits123>', tags: ['digits123'] },
  { src: '<Event  tick=100 >a = b</Event>', tags: ['Event'] },
  { src: '<multi  attr=plain  x="2">t</multi>', tags: ['multi'] },
  { src: '<parent><one/><two/></parent>', tags: ['parent', 'one', 'two'] },
];

describe('AST.tag parse matrix (structure)', () => {
  const hasTag = (nodes: ParsedTagNode[], name: string): boolean =>
    nodes.some(n => {
      if (n.type !== 'TagNode') return false;
      return n.name === name || hasTag(n.content as ParsedTagNode[], name);
    });
  it.each(cases)('parses %j', ({ src, tags }) => {
    const result = new AST.tag(src).parseAST() as ParsedTagNode[];
    expect(Array.isArray(result)).toBe(true);
    for (const expected of tags) {
      expect(hasTag(result, expected), `tag <${expected}> not found in ${src}`).toBe(true);
    }
  });
});

describe('AST.tag parse matrix (attributes)', () => {
  it.each([
    { src: '<Ui setup>x</Ui>', attr: 'setup', value: 'true' },
    { src: '<Event @after>a = b</Event>', attr: '@after', value: 'true' },
    { src: '<Event @before>a = b</Event>', attr: '@before', value: 'true' },
    { src: '<Event tick=50>a = b</Event>', attr: 'tick', value: '50' },
    { src: '<Event tick="120">a = b</Event>', attr: 'tick', value: '120' },
    { src: '<t lang="ts">x</t>', attr: 'lang', value: 'ts' },
    { src: '<t lang="js">x</t>', attr: 'lang', value: 'js' },
    { src: '<t id="demo:test">x</t>', attr: 'id', value: 'demo:test' },
    { src: '<t McxExtendsBy="./other.mcx">x</t>', attr: 'McxExtendsBy', value: './other.mcx' },
    { src: '<t empty-attr="">x</t>', attr: 'empty-attr', value: '' },
  ])('$src exposes $attr', ({ src, attr, value }) => {
    const result = new AST.tag(src).parseAST() as ParsedTagNode[];
    const node = result.find(n => n.type === 'TagNode') as ParsedTagNode;
    const attrs = (node as unknown as { arr: Record<string, string> }).arr;
    expect(attrs[attr]).toBe(value);
  });
});

describe('AST.tag parse matrix (content)', () => {
  it.each([
    { src: '<x>hello</x>', text: 'hello' },
    { src: '<x>\n  hello\n</x>', text: '\n  hello\n' },
    { src: '<x>a<b>c</b></x>', text: 'a' },
    { src: '<x></x>', text: '' },
  ])('$src holds text %j', ({ src, text }) => {
    const result = new AST.tag(src).parseAST() as ParsedTagNode[];
    const node = result.find(n => n.type === 'TagNode') as ParsedTagNode;
    const data = node.content
      .filter((c): c is { type: 'TagContent'; data: string } => c.type === 'TagContent')
      .map(c => c.data)
      .join('');
    expect(data).toBe(text);
  });
});

describe('AST.tag parse error handling', () => {
  it.each([
    '<div>text</span>',
    '<div></other>',
    '<a><b></a></b>',
  ])('throws on mismatched tags %j', src => {
    expect(() => new AST.tag(src).parseAST()).toThrow();
  });
});
