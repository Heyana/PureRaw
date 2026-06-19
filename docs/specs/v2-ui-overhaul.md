# PureRaw v2 UI Overhaul Spec

> 参考：pureraw_pro_photo_workflow.html（DetailView 筛选模式）
> 目标：去掉文件夹历史，评分融入图片区，全屏沉浸式筛选

## 整体布局

```
┌──────────────────────────────────────────────────────────┐
│ [TitleBar]                                  PureRaw [−□×] │
├──────────────────────────────┬───────────────────────────┤
│                              │                           │
│   主预览区 (flex-1)           │  右侧面板 (w-72)           │
│   ┌──────────────────────┐   │  ┌───────────────────┐   │
│   │                      │   │  │ 打开文件夹按钮      │   │
│   │   Photo Image        │   │  │ photo grid         │   │
│   │   (object-contain    │   │  │ ┌───┐ ┌───┐ ┌───┐ │   │
│   │    fill the space)   │   │  │ │   │ │   │ │   │ │   │
│   │                      │   │  │ └───┘ └───┘ └───┘ │   │
│   │  [info overlay]      │   │  │ ┌───┐ ┌───┐ ┌───┐ │   │
│   │  filename + specs    │   │  │ │   │ │   │ │   │ │   │
│   │  ★★★☆☆               │   │  │ └───┘ └───┘ └───┘ │   │
│   └──────────────────────┘   │  │ ...                │   │
│                              │  └───────────────────┘   │
│   Action Bar (overlay)       │                           │
│   [✓] [🚩] [🗑] ★★★★★ [←→]  │                           │
└──────────────────────────────┴───────────────────────────┘
```

### 区域职责

| 区域 | 内容 |
|------|------|
| 主预览区 | 照片全屏呈现，object-contain 填满空间 |
| 图片 overlay | 文件名 + 拍摄参数 + 星级评分（浮动在图片上） |
| Action Bar | 叠加在底部：Select / Flag / Reject(trash) / 星级按钮 / 导航箭头 |
| 右侧面板 | 打开文件夹入口 + grid 缩略图列表 |

## 废弃项
- ❌ 左侧文件夹历史列表
- ❌ 底部独立评分工具栏
- ❌ Card 包裹预览（改为无边框全屏）

## 组件树

```
Home.tsx
├── 主预览区 (.preview-stage)
│   ├── <img> 照片 (object-contain, fill space)
│   ├── Info Overlay (absolute bottom-left)
│   │   ├── 文件名 (text-lg, font-semibold)
│   │   └── 拍摄参数 (text-xs, muted: ISO · 焦距 · 光圈 · 快门)
│   ├── Rating Overlay (absolute bottom-right)
│   │   └── ★★★★★ (当前评分高亮)
│   └── Action Bar (absolute bottom-center/horizontal)
│       ├── Select 按钮 (✓)
│       ├── Flag 按钮 (🚩)
│       ├── Reject 按钮 (🗑, destructive)
│       ├── 分隔线
│       ├── 1-5 星级快速评分按钮
│       └── ← → 导航按钮
│
└── 右侧面板 (.photo-panel w-72)
    ├── 面板头部：打开文件夹按钮
    ├── Grid 缩略图列表 (grid-cols-2, overflow-auto)
    │   └── PhotoThumbnail × N
    │       ├── 缩略图 (aspect-[4/3])
    │       ├── 评分标记 (if rated)
    │       ├── 选中边框 (current)
    │       └── 文件名
    └── 状态栏：已评 X / N
```

## 交互细节

### 快捷键（不变）
- `1-5` → 评分
- `← →` → 导航
- `Delete` / `X` → 标记 rejected
- `F` → toggle flagged

### 点击
- 点击 thumbnail → 切换当前照片
- 双击预览图 → 全屏/缩放（暂不做）
- 评分按钮 → 等价于快捷键

### 视觉
- 预览区背景：bg-muted/50（与图片形成对比）
- Overlay 半透明背景：bg-background/80 + backdrop-blur
- Reject 状态：图片叠加红色半透明遮罩 + 文件名删除线
- 选中 thumbnail：ring-2 ring-primary

## 后端需要补充
- `GetFileInfo(path) FileInfo` → 返回 EXIF 信息（ISO, 焦距, 光圈, 快门）
- EXIF 解析库：go-exif 或自定义

## 实施顺序
1. 重构 Home.tsx 布局 → 左主预览 + 右面板
2. 实现主预览区：全屏图片 + overlay
3. 实现右侧 grid 缩略图面板
4. 实现 Action Bar（替代底部工具栏）
5. 实现 reject/flag 状态
6. Go 后端补充 EXIF 信息提取
7. 样式微调完善
