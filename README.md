# mcx

mcx-core 是 mbler 的 mcx 功能的编译器核心，目前在 alpha 阶段。  

本工具基于 typescript 开发，底层模块加载由 rollup 支持由工具 mbler 串起编译流程。  
## 整体架构

| **npm包名**             | **描述**                       | **完成度(%)** |
|-----------------------|------------------------------|---------|
| **@mbler/mcx**        |  为用户提供的typescript类型包         | 0       |
| **@mbler/mcx-core**   | mcx核心编译器啥的代码                 | 10      |
| **@mbler/mcx-types**  | 提供类型 | 10 |
| **@mbler/mcx-compat** | mcx检查器规则，主要适配不一样的minecraft版本 | 0       |
| **mbler**             | 核心脚手架，把这些东西组装成一个方便使用的cli工具   | 90      |

## 加入开发

前往作者QQ : 3915264929

## 文档（没写完）

**[这里](https://mbler-docs.ruanhor.dpdns.org/guide/mcx)**