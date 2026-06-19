package main

import (
	"embed"
	_ "embed"
	"fmt"
	"log"
	"net/http/httputil"
	"net/url"
	"os"
	"time"

	"PureRaw/handlers"
	"PureRaw/services"

	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/events"
)

// Wails uses Go's `embed` package to embed the frontend files into the binary.
// Any files in the frontend/dist folder will be embedded into the binary and
// made available to the frontend.
// See https://pkg.go.dev/embed for more information.

//go:embed all:frontend/dist
var assets embed.FS

func init() {
	// Register a custom event whose associated data type is string.
	// This is not required, but the binding generator will pick up registered events
	// and provide a strongly typed JS/TS API for them.
	application.RegisterEvent[string]("time")

	// Register file drop event
	application.RegisterEvent[map[string]any]("files-dropped")
}

// main function serves as the application's entry point. It initializes the application, creates a window,
// and starts a goroutine that emits a time-based event every second. It subsequently runs the application and
// logs any error that might occur.
func main() {

	// Create a new Wails application by providing the necessary options.
	// Variables 'Name' and 'Description' are for application metadata.
	// 'Assets' configures the asset server with the 'FS' variable pointing to the frontend files.
	// 'Bind' is a list of Go struct instances. The frontend has access to the methods of these instances.
	// 'Mac' options tailor the application when running an macOS.
	// 配置资源处理器
	assetHandler := application.AssetFileServerFS(assets)

	// 如果设置了 WAILS_VITE_PORT，创建代理到 Vite 开发服务器
	if vitePort := os.Getenv("WAILS_VITE_PORT"); vitePort != "" {
		devServerURL := "http://localhost:" + vitePort
		log.Printf("🚀 开发模式: 代理到 Vite 服务器 %s", devServerURL)

		// 创建反向代理
		targetURL, err := url.Parse(devServerURL)
		if err != nil {
			log.Fatal("无法解析 Vite 服务器 URL:", err)
		}
		proxy := httputil.NewSingleHostReverseProxy(targetURL)
		assetHandler = proxy
	}

	app := application.New(application.Options{
		Name:        "PureRaw",
		Description: "专业照片筛选工具 - AI 辅助 RAW 照片评分与筛选",
		Services: []application.Service{
			application.NewService(&GreetService{}),
		},
		Assets: application.AssetOptions{
			Handler: assetHandler,
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
	})

	// Create a new window with the necessary options.
	// 'Title' is the title of the window.
	// 'Mac' options tailor the window when running on macOS.
	// 'BackgroundColour' is the background colour of the window.
	// 'URL' is the URL that will be loaded into the webview.
	// 'EnableFileDrop' enables file drag and drop from the OS.
	window := app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title:     "PureRaw",
		Frameless: true,
		// Width:          1024,
		// Height:         768,
		// BackgroundType: application.BackgroundTypeTransparent,
		Mac: application.MacWindow{
			InvisibleTitleBarHeight: 50,
			Backdrop:                application.MacBackdropTranslucent,
			TitleBar:                application.MacTitleBarHiddenInset,
		},
		BackgroundColour: application.NewRGBA(0, 0, 0, 0),
		URL:              "/",
		EnableFileDrop:   true,
	})

	// 监听窗口 Runtime 准备完成事件
	window.OnWindowEvent(events.Common.WindowRuntimeReady, func(event *application.WindowEvent) {
		app.Logger.Info("Window Runtime Ready - 可以安全地调用 API 了")
		// 在这里打开开发者工具
		log.Println("🔧 尝试打开 DevTools (WindowRuntimeReady)")
		window.OpenDevTools()
		// 或者执行其他初始化操作
	})

	// 直接尝试打开开发者工具（可能在窗口创建后立即生效）
	log.Println("🔧 尝试打开 DevTools (窗口创建后)")
	window.OpenDevTools()

	// 注册窗口事件处理器
	windowHandlers := handlers.NewWindowHandlers(app)
	windowHandlers.Register(window)

	// 注册窗口控制服务
	windowService := services.NewWindowService(window)
	app.RegisterService(application.NewService(windowService))

	// 注册剪贴板服务
	clipboardService := services.NewClipboardService(app)
	app.RegisterService(application.NewService(clipboardService))

	// Create a goroutine that emits an event containing the current time every second.
	// The frontend can listen to this event and update the UI accordingly.
	go func() {
		for {
			now := time.Now().Format(time.RFC1123)
			app.Event.Emit("time", now)
			time.Sleep(time.Second)

		}
	}()
	fmt.Printf("Window created12341234: %s (ID: %d)\n", window.Name(), window.ID())
	// Run the application. This blocks until the application has been exited.
	err := app.Run()

	// If an error occurred while running the application, log it and exit.
	if err != nil {
		log.Fatal(err)
	}
}
