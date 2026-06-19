# PureRaw 项目记忆

## 项目信息
- 路径：D:\hxy\github\PureRaw
- GitHub：https://github.com/Heyana/PureRaw
- 分支：main

## 定位
专业照片筛选（Culling）工具，差异化：AI 评分 + 现代 UI

## 技术栈
- Wails3 v3.0.0-alpha2.104（Go 后端）
- Vue 3.5 + TypeScript + TSX（前端）
- Tailwind CSS v4 + shadcn-vue 2.7（reka-nova / stone / noto-sans）
- 图标：@lucide/vue

## 从 wails3_test_vue_ts 分叉
- 移除：NaiveUI/Less/FeatureTests/HelloWorld/DragDropArea
- 保留：shadcn-vue 组件、CustomTitleBar、窗口/剪贴板服务、文件拖放
- 不要改 --spacing：shadcn-vue 依赖默认 4px 间距体系

## 关键约定
- Tailwind 语义类名：布局容器必须有语义化 class 名，shadcn 组件不需要
- Frameless 窗口 + 自定义标题栏
- 全局无 border（Card 除外）

## 功能计划
- [x] 三栏布局：文件列表 + 预览 + 工具栏
- [x] 快捷键评分（1-5）
- [x] ← → 照片导航
- [ ] 文件拖放加载照片
- [ ] 图片预览（JPEG/PNG）
- [ ] RAW 格式支持
- [ ] AI 自动评分
