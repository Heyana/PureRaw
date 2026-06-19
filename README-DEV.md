# 开发模式说明

## 标准开发模式

```bash
# 完整开发模式（包含绑定生成和前端构建）
task dev
# 或
wails3 dev
```

## 快速开发模式 + 热重载（推荐）⚡

使用 Air 实现 Go 代码热重载：

### 1. 安装 Air

```bash
go install github.com/cosmtrek/air@latest
```

### 2. 运行开发环境

```bash
# 终端 1: 运行前端开发服务器（支持热重载）
task dev:frontend

# 终端 2: 运行 Go 后端（Air 热重载）
task dev:air
```

现在修改 Go 代码会自动重新编译和重启，前端也会自动热重载！

## 各模式对比

| 模式                | 启动速度 | 绑定生成 | 前端构建 | Go热重载 | 前端热重载 | 适用场景           |
| ------------------- | -------- | -------- | -------- | -------- | ---------- | ------------------ |
| `wails3 dev`        | 慢       | ✅       | ✅       | ✅       | ✅         | 首次开发、修改绑定 |
| `task dev:air`      | 快       | ❌       | ❌       | ✅       | ❌         | Go 后端开发        |
| `task dev:frontend` | 快       | ❌       | ❌       | ❌       | ✅         | 前端开发           |
| 分离模式            | 最快     | ❌       | ❌       | ✅       | ✅         | 全栈快速迭代       |

## 推荐工作流

### 日常开发（最快）

```bash
# 终端 1
task dev:frontend

# 终端 2
task dev:air
```

这样你修改 Go 代码和前端代码都会自动重载！

### 修改了绑定相关代码

当你修改了以下内容时，需要重新生成绑定：

- Go 服务方法签名
- 事件注册
- 结构体定义（用于前端）

```bash
# 方式 1: 运行完整 dev（会自动生成绑定）
task dev

# 方式 2: 手动生成绑定
wails3 generate bindings
```

## Air 配置说明

`.air.toml` 配置了：

- 监听 `.go` 文件变化
- 排除 `frontend/`, `tmp/`, `bin/` 等目录
- 自动重新编译和重启应用
- 构建错误日志输出到 `build-errors.log`

## 端口配置

默认前端开发服务器端口：`9245`

修改端口：

```bash
# 设置环境变量
export WAILS_VITE_PORT=3000  # Linux/Mac
$env:WAILS_VITE_PORT = "3000"  # Windows PowerShell

# 然后运行
task dev:air
```

## 开发者工具

应用会在 `WindowRuntimeReady` 事件后自动打开开发者工具。

如需禁用，注释掉 `main.go` 中的：

```go
window.OnWindowEvent(events.Common.WindowRuntimeReady, func(event *application.WindowEvent) {
    window.OpenDevTools()
})
```

## 故障排除

### Air 未找到

```bash
# 确保 Air 已安装
go install github.com/cosmtrek/air@latest

# 确保 $GOPATH/bin 在 PATH 中
# Linux/Mac: export PATH=$PATH:$(go env GOPATH)/bin
# Windows: 添加 %GOPATH%\bin 到系统 PATH
```

### 端口冲突

如果端口 9245 被占用：

```bash
# 修改端口
export WAILS_VITE_PORT=3000
task dev:air
task dev:frontend
```

### 前端连接不上后端

确保前端和后端使用相同的端口配置，检查 `frontend/vite.config.ts` 中的端口设置。
