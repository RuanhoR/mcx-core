# mcx-core

MCX DSL的核心。
包:
- client
- types
- core

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="MIT License"></a>
</p>

## 其他语言README
- 英文: [./README.md]
- 韩文: [./docs/README.ko.md]
- 日文: [./docs/README.ja.md]

## MCX 示例

以下是四种 MCX 文件类型的完整示例：Component（组件）、Event（事件）、Form（表单）/ Ui（界面）和 App（应用）。

### 1. 定义物品组件 (`items/custom_sword.mcx`)

```xml
<Component>
  <items>
    <item id="sword.json">sword</item>
  </items>
</Component>
<script lang="ts">
import { ItemComponent } from "@mbler/mcx-component";

export const sword = new ItemComponent({
  id: "demo:custom_sword",
  name: "自定义剑",
  components: {
    "minecraft:damage": 7,
    "minecraft:max_stack_size": 1,
    "minecraft:hand_equipped": true,
  },
});
</script>
```

### 2. 订阅游戏事件 (`events/player_join.mcx`)

```xml
<Event @after>
playerJoin = onPlayerJoin
</Event>
<script lang="ts">
import { world } from "@minecraft/server";

export function onPlayerJoin(event: PlayerJoinAfterEvent) {
  event.player.sendMessage("欢迎来到服务器！");
}
</script>
```

### 3. 构建旧式表单 (`ui/greeting.mcx`)

使用 `<Form>` 标签构建传统 FormData 表单（ModalFormData / ActionFormData / MessageFormData）：

```xml
<Form>
  <label>你好，{{ playerName }}！</label>
  <button click="handleClose">关闭</button>
</Form>
<script lang="ts">
export const prop = ["playerName"];

export function handleClose() {
  // 关闭表单
}
</script>
```

### 4. 构建 CustomForm 界面 (`ui/settings.mcx`)

使用 `<Ui>` 标签构建新的 CustomForm 界面（支持 Observable 响应式绑定）：

```xml
<Ui setup>
  <title>设置</title>
  <input>{{ name }}</input>
  <toggle>{{ enabled }}</toggle>
  <button click="handleSave">保存</button>
</Ui>
<script>
import { onMounted, onStartup } from "@mbler/mcx";

const name = defineProp('玩家')
const enabled = defineProp(true)

onStartup(() => {
  // 启动时执行一次
  console.log('设置界面已加载')
})

onMounted(() => {
  // 每次显示表单时执行
  console.log('表单已打开')
})

function handleSave() {
  // name.getData() 获取当前值
}
</script>
```

**Setup 模式**（`<Ui setup>` 或 `<Form setup>`）：
- 使用 `defineProp` 声明 prop，自动设置默认值
- 所有顶层变量和函数自动收集到 setup 上下文
- 无需手动 `export` 声明

**传统模式**（`<Ui>` 或 `<Form>`，无 setup）：
- 需要手动 `export const prop = [...]` 声明 prop
- 需要手动 `export const setup = { ... }` 导出 setup 对象

### 5. 在 App 中整合 (`app.mcx`)

```xml
<script lang="ts">
import sword from "./items/custom_sword.mcx";
import "./events/player_join.mcx";
import { createApp } from "@mbler/mcx";
import { world } from "@minecraft/server";

createApp({}).mount(world);
</script>
```

每个 `.mcx` 文件会被编译为 MCBE 兼容的 JSON 和 TypeScript/JavaScript。

## 入门指南
请前往[文档](https://mbler-docs.ruanhor.dpdns.org)开始使用

## 介绍
MCX是MCBE附加组件的DSL。它与官方mcbe无关。它可以让你以简单的方式构建mcbe附加组件。

## 功能
- 组件: MCX可以快速生成mcbe组件JSON
- 表单: `<Form>` 构建传统 FormData（ModalFormData / ActionFormData / MessageFormData）
- 界面: `<Ui>` 构建 CustomForm（DDUI，支持 Observable 响应式绑定）
- 应用: MCX可以让你使用这些功能
- Setup 系统: `<Form setup>` / `<Ui setup>` 自动收集声明
- 生命周期钩子: `onStartup`（一次性）/ `onMounted`（每次显示）
- `defineProp` 宏: 编译期 prop 声明
- MCX客户端可以让你运行你的应用
- MCX编译器核心和[mbler](https://github.com/RuanhoR/mbler)可以让你构建应用
- 支持I18n