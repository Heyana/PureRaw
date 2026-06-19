package handlers

import (
	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/events"
)

// WindowHandlers 管理所有窗口事件处理器
type WindowHandlers struct {
	app             *application.App
	fileDropHandler *FileDropHandler
}

// NewWindowHandlers 创建窗口事件处理器管理器
func NewWindowHandlers(app *application.App) *WindowHandlers {
	return &WindowHandlers{
		app:             app,
		fileDropHandler: NewFileDropHandler(app),
	}
}

// Register 注册所有窗口事件处理器
func (h *WindowHandlers) Register(window *application.WebviewWindow) {
	// 注册文件拖放事件
	window.OnWindowEvent(events.Common.WindowFilesDropped, h.fileDropHandler.Handle)
	
	// 可以在这里添加更多事件处理器
	// window.OnWindowEvent(events.Common.WindowDidShow, h.handleWindowShow)
	// window.OnWindowEvent(events.Common.WindowDidHide, h.handleWindowHide)
}
