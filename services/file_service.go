package services

import (
	"crypto/md5"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"image"
	_ "image/gif"
	"image/jpeg"
	_ "image/png"
	"os"
	"path/filepath"
	"strings"

	"PureRaw/utils"

	"github.com/wailsapp/wails/v3/pkg/application"
	"golang.org/x/image/draw"
	_ "golang.org/x/image/webp" // WebP 解码器注册
)

// PhotoInfo 照片文件信息
type PhotoInfo struct {
	Path     string `json:"path"`
	FileName string `json:"fileName"`
	Ext      string `json:"ext"`
}

// FolderNode 文件夹树节点
type FolderNode struct {
	Name     string   `json:"name"`
	Path     string   `json:"path"`
	PhotoCnt int      `json:"photoCnt"`
	SubDirs  []FolderNode `json:"subDirs,omitempty"`
}

// 支持的照片格式
var supportedExtensions = map[string]bool{
	".arw": true, ".cr2": true, ".cr3": true, ".crw": true,
	".dng": true, ".nef": true, ".nrw": true, ".orf": true,
	".raf": true, ".rw2": true, ".pef": true, ".srf": true,
	".sr2": true, ".3fr": true, ".kdc": true, ".erf": true,
	".mrw": true, ".raw": true,
	".jpg": true, ".jpeg": true, ".png": true, ".tiff": true,
	".tif": true, ".bmp": true, ".gif": true, ".webp": true,
	".heic": true, ".heif": true,
}

// 可预览的格式（能生成缩略图）
var previewableExtensions = map[string]bool{
	".jpg": true, ".jpeg": true, ".png": true, ".webp": true,
	".bmp": true, ".gif": true,
}

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

// thumbDir 获取缩略图缓存目录
func thumbDir() string {
	home, _ := os.UserHomeDir()
	return filepath.Join(home, "Documents", "PureRaw", "thumbnails")
}

// hashPath 对文件路径做 MD5 生成缓存文件名
func hashPath(path string) string {
	h := md5.Sum([]byte(path))
	return fmt.Sprintf("%x.webp", h)
}

// SelectFolder 打开原生文件夹选择对话框
func (s *FileService) SelectFolder() (string, error) {
	dialog := &application.OpenFileDialogStruct{}
	dialog.SetTitle("选择包含照片的文件夹")
	dialog.CanChooseDirectories(true)
	dialog.CanChooseFiles(false)
	path, err := dialog.PromptForSingleSelection()
	if err != nil {
		return "", err
	}
	if path != "" {
		s.AddFolderHistory(path)
	}
	return path, nil
}

// GetFiles 递归扫描文件夹，返回所有支持的照片文件
func (s *FileService) GetFiles(folderPath string) ([]PhotoInfo, error) {
	var photos []PhotoInfo

	err := filepath.Walk(folderPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
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

// GetFolderTree 获取文件夹树结构（单层子目录）
func (s *FileService) GetFolderTree(folderPath string) (FolderNode, error) {
	root := FolderNode{
		Name: filepath.Base(folderPath),
		Path: folderPath,
	}

	entries, err := os.ReadDir(folderPath)
	if err != nil {
		return root, err
	}

	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}
		subPath := filepath.Join(folderPath, entry.Name())
		subNode := FolderNode{
			Name: entry.Name(),
			Path: subPath,
		}

		// 统计该子目录下照片数量
		subEntries, err := os.ReadDir(subPath)
		if err == nil {
			for _, se := range subEntries {
				if !se.IsDir() && isPhotoFile(se.Name()) {
					subNode.PhotoCnt++
				}
			}
		}

		if subNode.PhotoCnt > 0 {
			root.SubDirs = append(root.SubDirs, subNode)
		}
		root.PhotoCnt += subNode.PhotoCnt
	}

	// 统计根目录下的照片
	for _, entry := range entries {
		if !entry.IsDir() && isPhotoFile(entry.Name()) {
			root.PhotoCnt++
		}
	}

	return root, nil
}

// rawExtensions RAW 格式扩展名
var rawExtensions = map[string]bool{
	".arw": true, ".cr2": true, ".cr3": true, ".crw": true,
	".dng": true, ".nef": true, ".nrw": true, ".orf": true,
	".raf": true, ".rw2": true, ".pef": true, ".srf": true,
	".sr2": true, ".3fr": true, ".kdc": true, ".erf": true,
	".mrw": true, ".raw": true,
}

// GetThumbnail 获取照片缩略图 data URI（自动生成 WebP 缓存）
func (s *FileService) GetThumbnail(path string) (string, error) {
	dir := thumbDir()
	_ = os.MkdirAll(dir, 0755)

	cacheFile := filepath.Join(dir, hashPath(path))

	// 缓存命中：直接返回 data URI
	if _, err := os.Stat(cacheFile); err == nil {
		return readAsDataURI(cacheFile)
	}

	ext := strings.ToLower(filepath.Ext(path))

	// RAW 文件：通过 exiftool 提取内嵌预览
	if rawExtensions[ext] {
		tmpJpg := filepath.Join(dir, hashPath(path)+".tmp.jpg")
		defer os.Remove(tmpJpg)

		if err := utils.ExtractPreview(path, tmpJpg); err != nil {
			return "", fmt.Errorf("raw preview: %w", err)
		}

		if err := utils.ConvertToWebP(tmpJpg, cacheFile, 80); err != nil {
			return "", fmt.Errorf("raw→webp: %w", err)
		}

		return readAsDataURI(cacheFile)
	}

	// 常规图片文件
	if !previewableExtensions[ext] {
		return "", fmt.Errorf("unsupported format for thumbnail: %s", path)
	}

	// 先尝试直接用 cwebp（更快）
	if ext == ".jpg" || ext == ".jpeg" || ext == ".png" || ext == ".webp" || ext == ".gif" {
		if err := utils.ConvertToWebP(path, cacheFile, 80); err == nil {
			return readAsDataURI(cacheFile)
		}
	}

	// Go 手动解码 + 缩放
	srcFile, err := os.Open(path)
	if err != nil {
		return "", err
	}
	defer srcFile.Close()

	img, _, err := image.Decode(srcFile)
	if err != nil {
		return "", fmt.Errorf("decode: %w", err)
	}

	const thumbWidth = 320
	bounds := img.Bounds()
	w, h := bounds.Dx(), bounds.Dy()
	if w > thumbWidth {
		h = h * thumbWidth / w
		w = thumbWidth
	}

	thumb := image.NewRGBA(image.Rect(0, 0, w, h))
	draw.ApproxBiLinear.Scale(thumb, thumb.Bounds(), img, bounds, draw.Over, nil)

	tmpJpg := filepath.Join(dir, hashPath(path)+".temp.jpg")
	defer os.Remove(tmpJpg)

	outFile, err := os.Create(tmpJpg)
	if err != nil {
		return "", err
	}
	if err := jpeg.Encode(outFile, thumb, &jpeg.Options{Quality: 90}); err != nil {
		outFile.Close()
		return "", err
	}
	outFile.Close()

	if err := utils.ConvertToWebP(tmpJpg, cacheFile, 80); err != nil {
		return "", err
	}

	return readAsDataURI(cacheFile)
}

// readAsDataURI 读取文件返回 data:image/webp;base64,... 格式
func readAsDataURI(filePath string) (string, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return "", err
	}
	return "data:image/webp;base64," + base64.StdEncoding.EncodeToString(data), nil
}

// GetFileDataURI 读取文件并返回 data URI
func (s *FileService) GetFileDataURI(path string) (string, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}

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

// ClearThumbnailCache 清除缩略图缓存目录
func (s *FileService) ClearThumbnailCache() error {
	return os.RemoveAll(thumbDir())
}

// === 文件夹历史 ===

type historyData struct {
	Folders []string `json:"folders"`
}

func historyPath() string {
	home, _ := os.UserHomeDir()
	dir := filepath.Join(home, "Documents", "PureRaw")
	_ = os.MkdirAll(dir, 0755)
	return filepath.Join(dir, "folder_history.json")
}

// GetFolderHistory 获取最近打开的文件夹列表
func (s *FileService) GetFolderHistory() ([]string, error) {
	data, err := os.ReadFile(historyPath())
	if err != nil {
		if os.IsNotExist(err) {
			return []string{}, nil
		}
		return nil, err
	}

	var h historyData
	if err := json.Unmarshal(data, &h); err != nil {
		return []string{}, nil
	}

	// 过滤掉不存在的文件夹
	var valid []string
	for _, p := range h.Folders {
		if info, err := os.Stat(p); err == nil && info.IsDir() {
			valid = append(valid, p)
		}
	}
	return valid, nil
}

// AddFolderHistory 添加文件夹到历史记录
func (s *FileService) AddFolderHistory(folderPath string) {
	existing, _ := s.GetFolderHistory()

	// 去重 + 移到最前
	var newList []string
	newList = append(newList, folderPath)
	for _, p := range existing {
		if p != folderPath {
			newList = append(newList, p)
		}
	}

	// 最多保留 20 个
	if len(newList) > 20 {
		newList = newList[:20]
	}

	h := historyData{Folders: newList}
	b, _ := json.MarshalIndent(h, "", "  ")
	_ = os.WriteFile(historyPath(), b, 0644)
}

// RemoveFolderHistory 从历史记录中移除
func (s *FileService) RemoveFolderHistory(folderPath string) {
	existing, _ := s.GetFolderHistory()
	var newList []string
	for _, p := range existing {
		if p != folderPath {
			newList = append(newList, p)
		}
	}
	h := historyData{Folders: newList}
	b, _ := json.MarshalIndent(h, "", "  ")
	_ = os.WriteFile(historyPath(), b, 0644)
}
