# 项目介绍

## 项目概述

这是一个基于 Turborepo 和 Vite 的多包管理项目，旨在构建一个高效的组件市场和文档编辑器。项目采用 React 和 TypeScript 技术栈，支持模块化开发和共享组件库。

## 如何运行项目

### 环境要求

- Node.js >= 16.x
- npm >= 7.x 或 pnpm >= 7.x

1. 安装依赖

在项目根目录下运行以下命令安装依赖：

```shell
pnpm install
```

2. 启动项目
   运行以下命令启动开发环境：

```shell
pnpm run dev
```

## 组件市场

### 设计目标

组件市场旨在提供一个模块化、可扩展的组件管理平台，支持以下功能：

- 组件注册：通过 notionComponentManager 动态注册组件。
- 组件分类：支持按类型（如标题、列表、文本块等）对组件进行分类。
- 组件复用：组件可以在多个页面或模块中复用，减少重复开发。

> 注册完的组件会自动在输入 / 后的组件搜索中出现，用户可以直接使用。

### 技术实现

- 组件注册：通过 notionComponentManager.registerComponent 动态注册组件。
- 组件渲染：使用 React.createElement 动态渲染组件，支持不同类型的组件（如标题、列表等）。
- 拖拽排序：基于 react-dnd 实现组件的拖拽排序和嵌套。

以下是一个组件注册的示例：

```javascript
const H1Component = {
  metaData: {
    blockType: "H1" as const,
    title: "一级标题",
    icon: "H1",
  },
  defaultProps: {
    level: "1" as const,
    content: "Heading 1",
  },
  component: Header,
};

notionComponentManager.registerComponent<"H1">(H1Component);
```

## 当前已完成的功能

### 核心功能

#### 文档编辑器

- 支持多种块类型（如标题、文本、列表等）的动态渲染。
- 支持块的嵌套结构（如列表嵌套）。
- 支持块的拖拽排序和层级调整。
- 支持 / 快捷键操作
- 支持退格键、上下键、enter键等快捷键

#### 组件市场

- 支持动态注册和渲染组件。
- 提供组件的元信息（如类型、图标、默认属性等）。
- 支持按分类展示组件。

#### 已完成的组件

- 文档组件（Page）
- 标题组件（H1、H2、H3）
- 文本块组件（Text）
- 列表组件（BulletedList、NumberedList）

#### 编辑历史记录

## 待实现功能

1. 文本加粗，斜体，下划线，删除线等ToolBar组件。当前已经在组件市场注册时预留了相关接口，但还没有实现。

```javascript

export interface NotionCompProps<T extends BlockType> {
  defaultProps: BlockPropsMap[T];
  component: React.ForwardRefExoticComponent<
    BaseBlockProps<T> & React.RefAttributes<HTMLElement>
  >;
  toolBar?: string[];
  isShowInMenu?: boolean;
  metaData: {
    blockType: T;
    title: string;
    description?: string;
    icon?: React.ReactNode;
    placeholder?: string;
  };
}
```

2. 复制md文档后，粘贴时，用markdown-it解析后转换成NotionoDoc的格式。
3. 当前组件的 content 定义为字符串，后续需要处理更复杂的场景，考虑使用 html2json 解析html字符串，与 toolbar 联动。
4. 输入 / 后支持组件的筛选
