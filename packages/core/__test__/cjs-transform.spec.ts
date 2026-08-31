import { describe, it, expect } from 'vitest';
import { transformESMToCJS } from '../src/mcx-component/cjsTransform';
import { generateMain } from '../src/transforms/utils';
import { compileJSFn } from '../src/compile-mcx/compiler/compileJS';

const script = `import { ItemComponent } from "@mbler/mcx-component";
import YeShengGouNaiIcon from "./assets/yeshenggounai.png"
export const YeShengGouNai = new ItemComponent({
  components: {},
  format: "1.21.80",
  id: "gounai:yesheng"
})
YeShengGouNai.setIcon(YeShengGouNaiIcon)`;

function assertCompilable(code: string): void {
  expect(() => new Function(code)).not.toThrow();
}

describe('cjsTransform: idempotent without duplicate declarations', () => {
  it('should not duplicate export const declarations on repeated transforms', () => {
    const out1 = transformESMToCJS(script);
    const out2 = transformESMToCJS(script);
    expect(out1).toBe(out2);
    assertCompilable(out2);
    expect(out2.match(/const YeShengGouNai =/g)?.length).toBe(1);
  });

  it('should keep export declarations at their source position to avoid TDZ', () => {
    const out = transformESMToCJS(script);
    const declIdx = out.indexOf('const YeShengGouNai =');
    const useIdx = out.indexOf('YeShengGouNai.setIcon');
    expect(declIdx).toBeGreaterThanOrEqual(0);
    expect(useIdx).toBeGreaterThan(declIdx);
  });
});

describe('generateMain: should not mutate the shared cached body', () => {
  it('should leave compileJSFn body untouched so component scripts stay valid', () => {
    const data = compileJSFn(script);
    const bodyBefore = data.node.body.length;
    generateMain(data);
    expect(data.node.body.length).toBe(bodyBefore);
    const out = transformESMToCJS(script);
    assertCompilable(out);
    expect(out.match(/const YeShengGouNai =/g)?.length).toBe(1);
  });
});

describe('cjsTransform: export * should not shadow named exports', () => {
  it('should use Object.assign for export * instead of module.exports reassignment', () => {
    const code = `
      export * from "./items";
      export var MyConst = "hello";
    `;
    const out = transformESMToCJS(code);
    expect(out).toContain('Object.assign');
    expect(out).not.toMatch(/module\.exports\s*=\s*\{[\s\S]*\.\.\./);
  });

  it('should preserve both re-exported and local named exports', () => {
    const code = `
      export * from "./items";
      export var AddonEnum;
      (function(AddonEnum) { AddonEnum["A"] = "a"; })(AddonEnum || (AddonEnum = {}));
    `;
    const out = transformESMToCJS(code);
    assertCompilable(out);
  });
});
