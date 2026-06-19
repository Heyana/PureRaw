//go:build darwin

package utils

import (
	"os/exec"
)

func extractEmbedded(name string, target string) {
	// macOS 暂不处理嵌入提取
}

func lookPath(file string) (string, error) {
	return exec.LookPath(file)
}
