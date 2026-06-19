package services

import (
	"encoding/base64"
	"os"
	"path/filepath"
	"strings"

	"github.com/wailsapp/wails/v3/pkg/application"
)

// PhotoInfo 照片文件信息
type PhotoInfo struct {
	Path     string `json:"path"`
	FileName string `json:"fileName"`
	Ext      string `json:"ext"`
}

// 支持的照片格式
var supportedExtensions = map[string]bool{
	// RAW 格式
	".arw": true, ".cr2": true, ".cr3": true, ".crw": true,
	".dng": true, ".nef": true, ".nrw": true, ".orf": true,
	".raf": true, ".rw2": true, ".pef": true, ".srf": true,
	".sr2": true, ".3fr": true, ".kdc": true, ".erf": true,
	".mrw": true, ".raw": true,
	// 常见图片格式
	".jpg": true, ".jpeg": true, ".png": true, ".tiff": true,
	".tif": true, ".bmp": true, ".gif": true, ".webp": true,
	".heic": true, ".heif": true,
}

// isPhotoFile 检查文件是否为支持的照片格式
func isPhotoFile(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	return supportedExtensions[ext]
}

// FileService 提供文件操作功能
type FileService struct {
	app *application.App
}

// NewFileService 创建文件服务
func NewFileService(app *application.App) *FileService {
	return &FileService{app: app}
}

// SelectFolder 打开原生文件夹选择对话框，返回选择的路径
func (s *FileService) SelectFolder() (string, error) {
	dialog := &application.OpenFileDialogStruct{}
	dialog.SetTitle("选择包含照片的文件夹")
	dialog.CanChooseDirectories(true)
	dialog.CanChooseFiles(false)
	path, err := dialog.PromptForSingleSelection()
	if err != nil {
		return "", err
	}
	return path, nil
}

// GetFiles 递归扫描文件夹，返回所有支持的照片文件
func (s *FileService) GetFiles(folderPath string) ([]PhotoInfo, error) {
	var photos []PhotoInfo

	err := filepath.Walk(folderPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil // 跳过无法访问的文件
		}
		if info.IsDir() {
			return nil
		}
		if isPhotoFile(info.Name()) {
			photos = append(photos, PhotoInfo{
				Path:     path,
				FileName: info.Name(),
				Ext:      strings.ToLower(filepath.Ext(info.Name())),
			})
		}
		return nil
	})

	if err != nil {
		return nil, err
	}

	return photos, nil
}

// GetFileDataURI 读取文件并返回 data URI（用于前端图片预览）
func (s *FileService) GetFileDataURI(path string) (string, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}

	// 根据扩展名确定 MIME 类型
	mime := "image/jpeg"
	ext := strings.ToLower(filepath.Ext(path))
	switch ext {
	case ".png":
		mime = "image/png"
	case ".gif":
		mime = "image/gif"
	case ".webp":
		mime = "image/webp"
	case ".bmp":
		mime = "image/bmp"
	case ".tiff", ".tif":
		mime = "image/tiff"
	}

	b64 := base64.StdEncoding.EncodeToString(data)
	return "data:" + mime + ";base64," + b64, nil
}
