package utils

import (
	"os"
	"path/filepath"
	"runtime"
)

// ExifToolPath 返回平台对应的 exiftool 二进制路径
// 优先使用系统 PATH 中的，其次使用嵌入的
func ExifToolPath() string {
	toolName := "exiftool"
	if runtime.GOOS == "windows" {
		toolName = "exiftool.exe"
	}

	// 先查 PATH
	if p, err := lookPath(toolName); err == nil {
		return p
	}

	// 使用嵌入的二进制
	return EmbeddedPath("exiftool")
}

// CwebpPath 返回平台对应的 cwebp 二进制路径
func CwebpPath() string {
	toolName := "cwebp"
	if runtime.GOOS == "windows" {
		toolName = "cwebp.exe"
	}

	if p, err := lookPath(toolName); err == nil {
		return p
	}

	return EmbeddedPath("cwebp")
}

// EmbeddedPath 返回嵌入二进制在运行时提取的临时路径
func EmbeddedPath(name string) string {
	exePath, err := os.Executable()
	if err != nil {
		exePath = "."
	}
	exeDir := filepath.Dir(exePath)

	// 开发模式：直接从 static/libs/ 读取
	devPath := filepath.Join(exeDir, "static", "libs", runtime.GOOS, name)
	if runtime.GOOS == "windows" {
		devPath += ".exe"
	}
	if _, err := os.Stat(devPath); err == nil {
		return devPath
	}

	// 打包模式：从嵌入的临时目录读取
	cacheDir := toolsCacheDir()
	extracted := filepath.Join(cacheDir, name)
	if runtime.GOOS == "windows" {
		extracted += ".exe"
	}
	if _, err := os.Stat(extracted); err == nil {
		return extracted
	}

	// 从嵌入文件系统提取
	extractEmbedded(name, extracted)

	return extracted
}

// toolsCacheDir 工具缓存目录
func toolsCacheDir() string {
	home, _ := os.UserHomeDir()
	dir := filepath.Join(home, "Documents", "PureRaw", "tools")
	_ = os.MkdirAll(dir, 0755)
	return dir
}
