# @mbler/mcx-plugin-jsonui

[![npm](https://img.shields.io/npm/v/@mbler/mcx-plugin-jsonui?label=npm&color=blue)](https://www.npmjs.com/package/@mbler/mcx-plugin-jsonui)

MCX 官方插件：把 `<Ui type="jsonui">` 编译成 [JSON UI](https://mcbeui.netlify.app/) 资源文件。

它只依赖上一版加入的编译器插件钩子，不改动 mcx-core 内置的 `<Ui>` 表单逻辑：

1. **transform 与挂载分离** —— `<Ui>` 先被编译成一份纯 JSON UI 文档（namespace + 控件），
2. 再由 **availability（可用性）适配器** 决定这份文档写到哪里、怎么挂进原版界面。

`<Ui>` 上除保留属性外的所有属性都会原样写进 JSON UI（合法的 JSON 值会自动转成数字/布尔/数组/对象），
子标签变成 `controls`，嵌套标签递归变成子控件，所以不需要为每种控件改编译器。

## 安装

```bash
# 0.0.1 仍是预览版，需要显式指定 alpha 标签
pnpm add -D @mbler/mcx-plugin-jsonui@alpha
```

包地址：https://www.npmjs.com/package/@mbler/mcx-plugin-jsonui

在 `mbler.config.js` 中启用（`script.lang` 必须是 `mcx`）：

```js
import { defineConfig } from 'mbler';
import jsonui from '@mbler/mcx-plugin-jsonui';

export default defineConfig({
  description: 'demo',
  mcVersion: '1.21.120',
  script: { lang: 'mcx', main: 'index.ts' },
  mcxPlugin: [jsonui()],
  // 或带选项： mcxPlugin: [jsonui({ formMarker: 'my_ui:', uiDir: 'ui' })]
  // 也可以和其他插件一起： mcxPlugin: [jsonui(), otherPlugin]
});
```

## `<Ui>` 属性

```xml
<script>export const a = 1</script>
<Ui type="jsonui"
    target="shop"
    availability="server_form"
    namespace="mypack"
    size="[100, 100]">
  <label text="欢迎" size="[80, 20]" />
  <button id="buy" text="购买" />
  <panel id="row" size="[100, 30]">
    <image texture="textures/ui/icon" />
  </panel>
</Ui>
```

| 属性                             | 说明                                                        |
| -------------------------------- | ----------------------------------------------------------- |
| `type="jsonui"`                  | 启用插件（必填）；也可用自定义根标签 `<JsonUi>` 省略 `type` |
| `target`                         | 目标屏幕 / 控件名；**可省略**，此时用文件名推导             |
| `availability` / `avail` / `use` | 挂载方式，默认 `file`                                       |
| `namespace` / `ns`               | JSON UI namespace，默认取 `.mcx` 文件名                     |
| `id`                             | 根控件 id，默认 `target` 或 namespace                       |
| `element-type` / `control-type`  | 根控件 `type`，默认 `screen`                                |
| `file` / `save`                  | 额外把原始 JSON 文档直接保存到该路径                        |
| 其他任意属性                     | 原样写入根控件（如 `size`、`anchor_from`、`bindings`）      |

子标签的 `id` / `name` 决定控件名，`type` 属性决定控件类型（默认标签名），
`:xxx="expr"` 会去掉冒号并保留表达式字符串，便于写绑定。

## availability（可用性）

| 名称           | 产物                                                               | target                    | 全局唯一 |
| -------------- | ------------------------------------------------------------------ | ------------------------- | -------- |
| `file`（默认） | `ui/<namespace>.json`，登记进 `_ui_defs.json`                      | 可选                      | 否       |
| `server_form`  | `ui/<namespace>_<target>.json` + 共享 `ui/server_form.json` 路由壳 | 可选                      | 否       |
| `hud`          | `ui/<namespace>_hud.json`，向 `hud_screen` 注入 `modifications`    | 可选（默认 `hud_screen`） | 否       |
| `vanilla`      | `ui/<namespace>_vanilla.json`，子控件按 id 覆盖原版元素            | 可选                      | **是**   |
| `none`         | 不写文件，只在模块里保留 JSON 文档                                 | 可选                      | 否       |

- `server_form` 采用 Bedrock Wiki 的 “Modifying Server Forms” 路由：
  `main_screen_content` 里插入 gated factory → `@<ns>.root`，`long_form` 用标题前缀隐藏原生表单。
  脚本侧用 `component.getFormTitle()` 作为 `ActionFormData().title(...)` 即可点亮自定义屏。
- `vanilla` 用于原版组件重载，不需要 `target`，且一次构建中只能出现一次（由插件校验）。
- 所有生成的 UI 文件会在 `onBuildEnd` 合并进 `ui/_ui_defs.json`（保留已有条目）；
  多个 `server_form` 屏共用同一个路由壳。

自定义挂载方式：

```js
import { jsonui, defineJsonUIAvailability } from '@mbler/mcx-plugin-jsonui';

const custom = defineJsonUIAvailability({
  name: 'my_screen',
  requiresTarget: true, // 强制 target
  singleton: false, // true = 全局只允许一个
  emit(ctx) {
    const file = `${ctx.uiDir}/${ctx.namespace}.mine.json`;
    return {
      files: [{ path: file, content: ctx.document }],
      uiDefs: [file],
      meta: { path: file, formTitle: `my_ui:${ctx.target}` },
    };
  },
});

export default jsonui({ availabilities: [custom] });
```

插件选项：`availability`、`namespace`、`uiDir`（默认 `ui`）、`formMarker`（默认 `mbler_ui:`）、
`saveRaw`（额外导出原始 JSON）、`resourcesDir`（覆盖输出目录）、`availabilities`。

## 生成的模块

编译后的 `.mcx` 默认导出一个描述对象，并导出 `JSONUIComponent` 类与实例：

```js
import ui, { JSONUIComponent, jsonui } from './shop.mcx';

jsonui.document; // 纯 JSON UI 文档
jsonui.getPath(); // 'ui/shop_shop.json'
jsonui.getControls(); // 根控件的 controls
jsonui.getFormTitle(); // 'mbler_ui:shop'（server_form 用）
```

`JSONUIComponent` 也可以从 `@mbler/mcx-plugin-jsonui/component` 直接导入，
它不依赖任何 Node 模块，因此能在 `<Component>` 编译期脚本和游戏内 Script API 里使用：

```js
// 在 SAPI 表单中使用 server_form 路由
import { ActionFormData } from '@minecraft/server-ui';
import shop from './shop.mcx';

new ActionFormData().title(shop.jsonui.getFormTitle()).body('...').show(player);
```

## `<script>` 与 Molang binding

`<script>` 会被追加到生成的模块里（TS 会用编译器自带的 TypeScript 转译），与 `jsonui` 共享作用域，因此可以直接给控件建 binding：

```ts
import { Molang } from '@mbler/mcx-component';

jsonui.text('hp', Molang.query('get_health').div(20).mul(100));
jsonui.visible('low_hp', Molang.query('get_health').lt(5), 'always_when_visible');
jsonui.bind('title', Molang.bind.view(Molang.variable('#text'), '#label'));
```

`Molang` 提供 `query` / `variable` / `context` / `math` / `when` / `concat` 以及 `add`、`gt`、`and` 等运算符，`Molang.bind.{view,global,collection}` 产出 `binding_type`、`source_property_name`、`target_property_name` 等字段，`toJSON()` 可直接塞进 `bindings`。

`JSONUIComponent` 还有 `addBinding` / `setBindings` / `clearBindings` / `text` / `visible` / `addControl` / `removeControl` / `findElement`，`{ create: true }` 可以就地声明缺失的控件。脚本里不能用 `export default`（已被 jsonui 描述对象占用）。

## 纯 JSON UI 文件

`.mcx` 里可以只有 `<Ui type="jsonui">` 而没有 `<script>`：编译器会先报「缺少 script」，
插件通过 `onThrow` 从源码里重新解析并恢复，因此仍然会输出 `.json` 与模块。

## 预览

不用启动游戏就能看效果：

```bash
pnpm mcx-plugin-jsonui preview                      # http://127.0.0.1:5174
pnpm mcx-plugin-jsonui preview ./src/ui --port 6000
```

左侧列出工程里所有 `<Ui type="jsonui">` 文件，点开按游戏规则渲染（anchor、`%`/`px` 长度、`stack_panel`、`grid`、`$变量`、`#binding`），贴图从资源包里取，保存即热更新。`--port` / `--host` / `--size` / `--no-open` / `--no-watch` 可调。

截图走服务端计算，不启动浏览器也不依赖原生图像库，方便工具链和 agent 调试：

```bash
curl "http://127.0.0.1:5174/api/screenshot?id=src/ui/shop.mcx&format=png&scale=2" -o shop.png
curl "http://127.0.0.1:5174/api/screens"      # 文件树 + 元信息
```

`format=png`（默认）由内置光栅化器绘制，文字用 5×7 像素字体、图片画成占位块；需要真实字体与嵌入贴图时用 `format=svg`。

## 相关资料

- JSON UI 文档：https://mcbeui.netlify.app/
- `_ui_defs.json`：https://mcbeui.netlify.app/document/ui_defs
