# Wails3 桌面应用功能清单

这个文档列出了 Wails3 提供的桌面应用特有功能，这些功能是 Web 应用无法实现的。

## ✅ 已实现的功能

### 1. 文件拖放 (File Drop)

- ✅ 从操作系统拖放文件到应用
- ✅ 获取文件的真实路径
- ✅ 多区域拖放支持
- ✅ 拖放目标识别

**组件**: `DragDropArea.tsx`  
**后端**: `handlers/file_drop.go`

### 2. 剪贴板操作 (Clipboard)

- ✅ 读取系统剪贴板文本
- ✅ 写入文本到系统剪贴板
- ⚠️ 图片和富文本支持（待测试）

**前端**: `FeatureTests.tsx`  
**后端**: `services/clipboard_service.go`

### 3. 窗口控制 (Window Management)

- ✅ 最小化/最大化/还原
- ✅ 显示/隐藏窗口
- ✅ 居中窗口
- ✅ 设置窗口标题
- ✅ 检查窗口状态

**后端**: `services/window_service.go`

## 🔧 需要配置的功能

### 4. 系统托盘 (System Tray)

在系统托盘显示应用图标和菜单。

**用途**:

- 后台运行应用
- 快速访问常用功能
- 显示通知和状态

**实现步骤**:

```go
// main.go
import "github.com/wailsapp/wails/v3/pkg/application"

app := application.New(application.Options{
    // ... 其他配置
})

// 创建系统托盘
tray := app.NewSystemTray()
tray.SetIcon(iconBytes)
tray.SetTooltip("My App")

// 添加菜单
menu := app.NewMenu()
menu.Add("显示窗口").OnClick(func() {
    window.Show()
})
menu.Add("退出").OnClick(func() {
    app.Quit()
})
tray.SetMenu(menu)
```

**参考**: https://v3alpha.wails.io/learn/systray/

### 5. 右键菜单 (Context Menu)

自定义右键菜单。

**用途**:

- 提供上下文相关的操作
- 快捷操作入口

**实现步骤**:

```go
// 创建右键菜单
contextMenu := app.NewMenu()
contextMenu.Add("复制").OnClick(func() {
    // 复制操作
})
contextMenu.Add("粘贴").OnClick(func() {
    // 粘贴操作
})

// 在前端触发
window.ShowContextMenu(contextMenu, x, y)
```

**参考**: https://v3alpha.wails.io/guides/menus/

### 6. 应用菜单 (Application Menu)

顶部菜单栏（Windows/Linux）或系统菜单栏（macOS）。

**实现步骤**:

```go
menu := app.NewMenu()

// 文件菜单
fileMenu := menu.AddSubmenu("文件")
fileMenu.Add("打开").OnClick(func() {
    // 打开文件对话框
})
fileMenu.Add("保存").OnClick(func() {
    // 保存文件
})
fileMenu.AddSeparator()
fileMenu.Add("退出").OnClick(func() {
    app.Quit()
})

// 编辑菜单
editMenu := menu.AddSubmenu("编辑")
editMenu.Add("复制").SetAccelerator("Ctrl+C")
editMenu.Add("粘贴").SetAccelerator("Ctrl+V")

app.SetMenu(menu)
```

**参考**: https://v3alpha.wails
