# Air 开发模式 - Go 热重载 + Vite 开发服务器
# 使用方法: .\dev-air.ps1

Write-Host "🚀 Air Dev Mode - Go 热重载 + Vite HMR" -ForegroundColor Green
Write-Host ""

# 设置环境变量
$env:WAILS_VITE_PORT = "9245"

# 检查是否已经有 Vite 服务器在运行
$viteRunning = Get-NetTCPConnection -LocalPort 9245 -ErrorAction SilentlyContinue
if (-not $viteRunning) {
    Write-Host "⚠️  请先在另一个终端启动 Vite 开发服务器:" -ForegroundColor Yellow
    Write-Host "   task dev:frontend" -ForegroundColor Cyan
    Write-Host "   或者: cd frontend && npm run dev -- --port 9245 --strictPort" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "按 Enter 继续（确保 Vite 已启动）"
}

# 启动 Air
Write-Host "启动 Air (Go 热重载)..." -ForegroundColor Cyan
air
