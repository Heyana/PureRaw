package static

import "embed"

// Libs 嵌入的静态二进制文件
// 结构: static/libs/{windows|darwin|linux}/
//
//go:embed all:libs
var Libs embed.FS
