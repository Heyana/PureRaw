# 快速开发模式 - 跳过绑定和前端构建
# 使用方法: .\dev-fast.ps1

Write-Host "🚀 Fast Dev Mode - 跳过绑定和前端构建" -ForegroundColor Green
Write-Host ""

# 设置环境变量
$env:WAILS_VITE_PORT = "9245"
$env:DEV = "true"

# 直接运行 Go 应用
Write-Host "启动 Go 后端..." -ForegroundColor Cyan
go run -tags dev .
