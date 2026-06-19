#!/bin/bash
# 快速开发模式 - 跳过绑定和前端构建
# 使用方法: ./dev-fast.sh

echo "🚀 Fast Dev Mode - 跳过绑定和前端构建"
echo ""

# 设置环境变量
export WAILS_VITE_PORT=9245
export DEV=true

# 直接运行 Go 应用
echo "启动 Go 后端..."
go run -tags dev .
