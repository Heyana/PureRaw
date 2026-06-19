# 平台抽象层

## 概述

平台抽象层提供了统一的 API 接口，使应用可以在不同平台（Wails、Electron、Web）间无缝切换。

## 设计原则

- **依赖倒置原则（DIP）** - 依赖抽象而不是具体实现
- **开闭原则（OCP）** - 对扩展开放，对修改关闭
- **面向对象设计** - 使用抽象基类而不是接口

## 架构

```
platform/
├── base.ts          # 抽象基类定义
├── wails.ts         # Wails 平台实现
├── electron.ts      # Electron 平台实现
├── web.ts           # Web 浏览器实现
└── index.ts         # 平台检测和导出
```

## 使用方法

### 基本使用

```typescript
import { platform } from "@/platform";

// 窗口操作
platform.window.minimize();
platform.window.maximize();
platform.window.close();
const isMax = await platform.window.isMaximized();

// 剪贴板操作
await platform.clipboard.writeText("Hello");
const text = await platform.clipboard.readText();

// 文件选择
const files = await platform.file.selectFile({
  filters: [{ name: "Images", extensions: ["png", "jpg"] }],
  multiple: true,
});

// 对话框
await platform.dialog.showMessage({
  title: "提示",
  message: "操作成功",
  type: "info",
});

const confirmed = await platform.dialog.showConfirm({
  title: "确认",
  message: "确定要删除吗？",
});
```

### 检查当前平台

```typescript
import { platform } from "@/platform";

console.log(platform.name); // 'wails' | 'electron' | 'web'

if (platform.name === "wails") {
  // Wails 特定逻辑
}
```

## 扩展新平台

### 1. 创建平台适配器

```typescript
// platform/tauri.ts
import {
  PlatformAPI,
  WindowAPI,
  ClipboardAPI,
  FileAPI,
  DialogAPI,
} from "./base";

class TauriWindowAPI extends WindowAPI {
  minimize(): void {
    // Tauri 实现
  }
  // ... 其他方法
}

export class TauriPlatform extends PlatformAPI {
  readonly name = "tauri";
  readonly window = new TauriWindowAPI();
  // ... 其他 API
}
```

### 2. 注册到平台检测

```typescript
// platform/index.ts
import { TauriPlatform } from "./tauri";

function detectPlatform(): PlatformType {
  if ((window as any).__TAURI__) {
    return "tauri";
  }
  // ... 其他检测
}

function createPlatform(): PlatformAPI {
  const type = detectPlatform();
  switch (type) {
    case "tauri":
      return new TauriPlatform();
    // ... 其他平台
  }
}
```

## 迁移指南

### 从 Wails 直接调用迁移

**之前：**

```typescript
import { Window } from "@wailsio/runtime";

Window.Minimise();
Window.Maximise();
```

**之后：**

```typescript
import { platform } from "@/platform";

platform.window.minimize();
platform.window.maximize();
```

### 好处

1. **平台无关** - 代码不依赖特定平台
2. **易于测试** - 可以 mock 整个平台 API
3. **易于迁移** - 切换平台只需实现新的适配器
4. **类型安全** - 完整的 TypeScript 类型支持

## API 参考

### WindowAPI

- `minimize(): void` - 最小化窗口
- `maximize(): void` - 最大化窗口
- `close(): void` - 关闭窗口
- `isMaximized(): Promise<boolean>` - 检查是否最大化
- `toggleMaximize(): Promise<void>` - 切换最大化状态

### ClipboardAPI

- `writeText(text: string): Promise<void>` - 写入文本
- `readText(): Promise<string>` - 读取文本

### FileAPI

- `selectFile(options?): Promise<string[]>` - 选择文件
- `selectFolder(): Promise<string>` - 选择文件夹

### DialogAPI

- `showMessage(options): Promise<void>` - 显示消息
- `showConfirm(options): Promise<boolean>` - 显示确认对话框

## 注意事项

1. 所有异步操作都返回 Promise
2. Web 平台某些功能受限（如窗口操作）
3. 平台会自动初始化，无需手动调用
4. 建议在组件中使用，避免在模块顶层调用
