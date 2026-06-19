# Handlers 目录

这个目录包含所有的事件处理器，用于组织和管理应用程序的事件逻辑。

## 文件结构

```
handlers/
├── window.go       # 窗口事件处理器管理器
├── file_drop.go    # 文件拖放事件处理器
└── README.md       # 本文件
```

## 使用方式

### 1. 在 main.go 中注册处理器

```go
import "changeme/handlers"

// 创建窗口
window := app.Window.NewWithOptions(...)

// 注册所有窗口事件处理器
windowHandlers := handlers.NewWindowHandlers(app)
windowHandlers.Register(window)
```

### 2. 添加新的事件处理器

#### 步骤 1: 创建新的处理器文件

例如 `handlers/window_lifecycle.go`:

```go
package handlers

import (
    "fmt"
    "github.com/wailsapp/wails/v3/pkg/application"
)

type WindowLifecycleHandler struct {
    app *application.App
}

func NewWindowLifecycleHandler(app *application.App) *WindowLifecycleHandler {
    return &WindowLifecycleHandler{app: app}
}

func (h *WindowLifecycleHandler) HandleShow(event *application.WindowEvent) {
    fmt.Println("Window shown")
}

func (h *WindowLifecycleHandler) HandleHide(event *application.WindowEvent) {
    fmt.Println("Window hidden")
}
```

#### 步骤 2: 在 window.go 中注册

```go
type WindowHandlers struct {
    app                    *application.App
    fileDropHandler        *FileDropHandler
    lifecycleHandler       *WindowLifecycleHandler  // 添加新字段
}

func NewWindowHandlers(app *application.App) *WindowHandlers {
    return &WindowHandlers{
        app:              app,
        fileDropHandler:  NewFileDropHandler(app),
        lifecycleHandler: NewWindowLifecycleHandler(app),  // 初始化
    }
}

func (h *WindowHandlers) Register(window *application.WebviewWindow) {
    window.OnWindowEvent(events.Common.WindowFilesDropped, h.fileDropHandler.Handle)
    window.OnWindowEvent(events.Common.WindowDidShow, h.lifecycleHandler.HandleShow)
    window.OnWindowEvent(events.Common.WindowDidHide, h.lifecycleHandler.HandleHide)
}
```

## 设计原则

1. **单一职责**: 每个处理器文件只负责一类事件
2. **依赖注入**: 通过构造函数注入 `*application.App`
3. **集中管理**: 所有事件注册都在 `window.go` 中统一管理
4. **易于扩展**: 添加新功能只需创建新文件并在 `window.go` 中注册

## 当前实现的处理器

### FileDropHandler (file_drop.go)

处理文件拖放事件，支持多区域拖放。

- 接收拖放的文件路径
- 识别拖放目标区域 (通过 ElementID)
- 将文件信息发送到前端

**前端事件**: `files-dropped`

**数据格式**:

```go
{
    "files": []string,    // 文件路径列表
    "target": string,     // 拖放区域的 ID
}
```
