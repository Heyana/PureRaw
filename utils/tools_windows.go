//go:build windows

package utils

import (
	"fmt"
	"io/fs"
	"os"
	"os/exec"
	"path/filepath"

	embedded "PureRaw/static"
)

// extractEmbedded 从嵌入的 static/libs/windows/ 提取二进制到目标路径
func extractEmbedded(name string, target string) {
	base := fmt.Sprintf("libs/windows/%s.exe", name)

	// 尝试读取并写入主要二进制
	data, err := fs.ReadFile(embedded.Libs, base)
	if err != nil {
		return
	}

	_ = os.MkdirAll(filepath.Dir(target), 0755)
	_ = os.WriteFile(target, data, 0755)

	// 特殊处理 exiftool：还需要 exiftool_files 目录
	if name == "exiftool" {
		extractDir("exiftool_files", filepath.Join(filepath.Dir(target), "exiftool_files"))
	}
}

// extractDir 从嵌入文件系统递归提取目录
func extractDir(embedPath string, targetDir string) {
	entries, err := fs.ReadDir(embedded.Libs, "libs/windows/"+embedPath)
	if err != nil {
		return
	}

	_ = os.MkdirAll(targetDir, 0755)

	for _, entry := range entries {
		src := fmt.Sprintf("libs/windows/%s/%s", embedPath, entry.Name())
		dst := filepath.Join(targetDir, entry.Name())

		if entry.IsDir() {
			extractDir(embedPath+"/"+entry.Name(), dst)
		} else {
			data, err := fs.ReadFile(embedded.Libs, src)
			if err == nil {
				_ = os.WriteFile(dst, data, 0644)
			}
		}
	}
}

// lookPath 在系统 PATH 中查找可执行文件
func lookPath(file string) (string, error) {
	return exec.LookPath(file)
}
