package services

import (
	"github.com/wailsapp/wails/v3/pkg/application"
)

// WindowService 提供窗口控制功能
type WindowService struct {
	window *application.WebviewWindow
}

// NewWindowService 创建窗口服务
func NewWindowService(window *application.WebviewWindow) *WindowService {
	return &WindowService{
		window: window,
	}
}

// Minimize 最小化窗口
func (s *WindowService) Minimize() {
	s.window.Minimise()
}

// Maximize 最大化窗口
func (s *WindowService) Maximize() {
	if s.window.IsMaximised() {
		s.window.UnMaximise()
	} else {
		s.window.Maximise()
	}
}

// Restore 恢复窗口
func (s *WindowService) Restore() {
	if s.window.IsMinimised() {
		s.window.UnMinimise()
	} else if s.window.IsMaximised() {
		s.window.UnMaximise()
	}
}

// Hide 隐藏窗口
func (s *WindowService) Hide() {
	s.window.Hide()
}

// Show 显示窗口
func (s *WindowService) Show() {
	s.window.Show()
}

// Close 关闭窗口
func (s *WindowService) Close() {
	s.window.Close()
}

// Center 居中窗口
func (s *WindowService) Center() {
	s.window.Center()
}

// SetTitle 设置窗口标题
func (s *WindowService) SetTitle(title string) {
	s.window.SetTitle(title)
}

// SetSize 设置窗口大小
func (s *WindowService) SetSize(width, height int) {
	s.window.SetSize(width, height)
}

// GetSize 获取窗口大小
func (s *WindowService) GetSize() (int, int) {
	return s.window.Size()
}

// SetPosition 设置窗口位置
func (s *WindowService) SetPosition(x, y int) {
	s.window.SetPosition(x, y)
}

// GetPosition 获取窗口位置
func (s *WindowService) GetPosition() (int, int) {
	return s.window.Position()
}

// SetMinSize 设置最小窗口大小
func (s *WindowService) SetMinSize(width, height int) {
	s.window.SetMinSize(width, height)
}

// SetMaxSize 设置最大窗口大小
func (s *WindowService) SetMaxSize(width, height int) {
	s.window.SetMaxSize(width, height)
}

// Fullscreen 全屏
func (s *WindowService) Fullscreen() {
	s.window.Fullscreen()
}

// UnFullscreen 退出全屏
func (s *WindowService) UnFullscreen() {
	s.window.UnFullscreen()
}

// IsMinimised 检查是否最小化
func (s *WindowService) IsMinimised() bool {
	return s.window.IsMinimised()
}

// IsMaximised 检查是否最大化
func (s *WindowService) IsMaximised() bool {
	return s.window.IsMaximised()
}

// IsFullscreen 检查是否全屏
func (s *WindowService) IsFullscreen() bool {
	return s.window.IsFullscreen()
}

// SetAlwaysOnTop 设置窗口置顶
func (s *WindowService) SetAlwaysOnTop(alwaysOnTop bool) {
	s.window.SetAlwaysOnTop(alwaysOnTop)
}

// SetResizable 设置窗口是否可调整大小
func (s *WindowService) SetResizable(resizable bool) {
	s.window.SetResizable(resizable)
}
