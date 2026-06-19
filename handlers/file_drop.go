package handlers

import (
	"fmt"

	"github.com/wailsapp/wails/v3/pkg/application"
)

// FileDropHandler 处理文件拖放事件
type FileDropHandler struct {
	app *application.App
}

// NewFileDropHandler 创建文件拖放处理器
func NewFileDropHandler(app *application.App) *FileDropHandler {
	return &FileDropHandler{
		app: app,
	}
}

// Handle 处理文件拖放事件
func (h *FileDropHandler) Handle(event *application.WindowEvent) {
	files := event.Context().DroppedFiles()
	details := event.Context().DropTargetDetails()

	// 打印日志
	for _, file := range files {
		fmt.Println("Dropped:", file)
	}

	// 发送文件路径到前端
	h.app.Event.Emit("files-dropped", map[string]any{
		"files":  files,
		"target": details.ElementID,
	})
}
