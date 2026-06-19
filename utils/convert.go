package utils

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

// ExtractPreview 从 RAW 文件中提取内嵌 JPEG 预览图
func ExtractPreview(rawPath, outputJpg string) error {
	exifPath := ExifToolPath()
	if exifPath == "" {
		return fmt.Errorf("exiftool not found")
	}

	cmd := exec.Command(exifPath, "-b", "-PreviewImage", rawPath)
	stdout, err := cmd.Output()
	if err != nil {
		return fmt.Errorf("exiftool extract: %w", err)
	}

	if len(stdout) == 0 {
		return fmt.Errorf("no embedded preview in %s", rawPath)
	}

	_ = os.MkdirAll(filepath.Dir(outputJpg), 0755)
	return os.WriteFile(outputJpg, stdout, 0644)
}

// ConvertToWebP 将图片转换为 WebP 格式
func ConvertToWebP(inputPath, outputWebp string, quality int) error {
	cwebpPath := CwebpPath()
	if cwebpPath == "" {
		return fmt.Errorf("cwebp not found")
	}

	_ = os.MkdirAll(filepath.Dir(outputWebp), 0755)

	args := []string{"-q", fmt.Sprintf("%d", quality), "-resize", "320", "0"}
	args = append(args, inputPath, "-o", outputWebp)

	cmd := exec.Command(cwebpPath, args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("cwebp: %s: %w", string(output), err)
	}

	return nil
}
