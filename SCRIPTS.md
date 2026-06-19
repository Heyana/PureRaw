# 📦 NPM Scripts 使用指南

所有命令都可以通过 `npm run <script>` 运行。

## 🚀 开发命令

### `npm run dev`

完整开发模式（推荐首次使用）

- 自动生成绑定
- 构建前端
- 启动应用
- 支持热重载

```bash
npm run dev
```

### `npm run dev:fast` ⚡

快速开发模式（推荐日常使用）

- 同时启动前端和后端
- 前端热重载
- Go 代码热重载（需要 Air）
- 跳过绑定生成和前端构建

```bash
# 首次使用需要安装依赖
npm install
npm run install:air

# 然后运行
npm run dev:fast
```

### `npm run dev:frontend`

只运行前端开发服务器

- Vite 热重载
- 端口 9245

```bash
npm run dev:frontend
```

### `npm run dev:backend`

只运行 Go 后端（Air 热重载）

- 自动重新编译
- 自动重启应用

```bash
npm run dev:backend
```

## 🏗️ 构建命令

### `npm run build`

构建应用程序

- 生成生产版本
- 输出到 `bin/` 目录

```bash
npm run build
```

### `npm run build:frontend`

只构建前端

- 输出到 `frontend/dist/`

```bash
npm run build:frontend
```

### `npm run build:server`

构建服务器模式（无 GUI）

- 纯 HTTP 服务器
- 适合部署

```bash
npm run build:server
```

### `npm run package`

打包应用程序

- 创建安装包
- 平台特定格式（.exe, .dmg, .deb 等）

```bash
npm run package
```

## ▶️ 运行命令

### `npm run run`

运行已构建的应用

```bash
npm run run
```

### `npm run run:server`

运行服务器模式

```bash
npm run run:server
```

## 🔧 工具命令

### `npm run generate:bindings`

生成 TypeScript 绑定

- 当修改 Go 服务方法时使用
- 输出到 `frontend/bindings/`

```bash
npm run generate:bindings
```

### `npm run generate:icons`

从图片生成图标

- 生成 .ico 和 .icns

```bash
npm run generate:icons
```

### `npm run install:frontend`

安装前端依赖

```bash
npm run install:frontend
```

### `npm run install:air`

安装 Air 热重载工具

```bash
npm run install:air
```

## 🧹 清理命令

### `npm run clean`

清理构建产物

- 删除 tmp/, bin/, frontend/dist/ 等

```bash
npm run clean
```

### `npm run clean:all`

完全清理

- 包括 node_modules

```bash
npm run clean:all
```

## 📊 命令对比

| 命令                   | 启动速度 | 热重载 | 绑定生成 | 适用场景   |
| ---------------------- | -------- | ------ | -------- | ---------- |
| `npm run dev`          | 慢       | ✅     | ✅       | 首次开发   |
| `npm run dev:fast`     | 快       | ✅     | ❌       | 日常开发   |
| `npm run dev:frontend` | 快       | 前端✅ | ❌       | 纯前端开发 |
| `npm run dev:backend`  | 快       | 后端✅ | ❌       | 纯后端开发 |

## 🎯 推荐工作流

### 首次启动

```bash
# 1. 安装依赖
npm install
npm run install:frontend
npm run install:air

# 2. 运行完整开发模式
npm run dev
```

### 日常开发（最快）

```bash
# 一条命令启动前端+后端，都支持热重载
npm run dev:fast
```

### 修改了 Go 服务方法

```bash
# 重新生成绑定
npm run generate:bindings

# 然后继续开发
npm run dev:fast
```

### 准备发布

```bash
# 1. 清理旧文件
npm run clean

# 2. 构建
npm run build

# 3. 打包
npm run package
```

## 🔍 故障排除

### Air 未找到

```bash
npm run install:air
```

### 前端依赖问题

```bash
npm run clean:all
npm install
npm run install:frontend
```

### 端口被占用

修改 `package.json` 中的端口号（默认 9245）

### 绑定不同步

```bash
npm run generate:bindings
```

## 💡 提示

- 使用 `npm run dev:fast` 获得最快的开发体验
- 只有修改 Go 服务接口时才需要重新生成绑定
- `concurrently` 会同时显示前端和后端的日志，用不同颜色区分
- 按 `Ctrl+C` 会同时停止前端和后端进程
