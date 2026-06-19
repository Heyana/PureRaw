package services

import (
	"github.com/wailsapp/wails/v3/pkg/application"
)

// ClipboardService 提供剪贴板功能
type ClipboardService struct {
	app *application.App
}

// NewClipboardService 创建剪贴板服务
func NewClipboardService(app *application.App) *ClipboardService {
	return &ClipboardService{
		app: app,
	}
}

// SetText 设置剪贴板文本
func (s *ClipboardService) SetText(text string) bool {
	return s.app.Clipboard.SetText(text)
}

// GetText 获取剪贴板文本
func (s *ClipboardService) GetText() string {
	text, _ := s.app.Clipboard.Text()
	return text
}
