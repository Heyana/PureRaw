# Components 组件库

## DragDropArea - 文件拖放区域组件

一个可复用的文件拖放区域组件，与 Wails3 的文件拖放 API 集成。

### 特性

- ✅ 完全集成 Wails3 文件拖放事件
- ✅ 支持多个独立的拖放区域
- ✅ 可自定义样式和行为
- ✅ 支持多种文件列表显示模式
- ✅ 自动管理事件监听器生命周期

### Props

| 属性              | 类型                              | 默认值                       | 说明                                            |
| ----------------- | --------------------------------- | ---------------------------- | ----------------------------------------------- |
| `id`              | `string`                          | `自动生成`                   | 区域的唯一标识符，可选。不传入会自动生成唯一 ID |
| `title`           | `string`                          | `"拖放区域"`                 | 区域标题                                        |
| `description`     | `string`                          | `"拖放文件到这里"`           | 区域描述文本                                    |
| `hint`            | `string`                          | `""`                         | 提示文本（如文件类型）                          |
| `backgroundColor` | `string`                          | `"rgba(200, 200, 200, 0.1)"` | 背景颜色                                        |
| `minWidth`        | `string`                          | `"300px"`                    | 最小宽度                                        |
| `showClearButton` | `boolean`                         | `true`                       | 是否显示清空按钮                                |
| `displayMode`     | `"full" \| "filename" \| "count"` | `"full"`                     | 文件列表显示模式                                |

### Events

| 事件           | 参数                                      | 说明               |
| -------------- | ----------------------------------------- | ------------------ |
| `filesDropped` | `{ files: string[], allFiles: string[] }` | 文件拖放时触发     |
| `filesCleared` | -                                         | 清空文件列表时触发 |

### 显示模式

- **`full`**: 显示完整文件路径
- **`filename`**: 只显示文件名
- **`count`**: 只显示文件数量

### 基础用法

```tsx
import DragDropArea from "./DragDropArea";

export default defineComponent({
  setup() {
    const handleFilesDropped = (data: any) => {
      console.log("收到文件:", data.files);
      console.log("所有文件:", data.allFiles);
    };

    return () => (
      <DragDropArea
        id="my-drop-zone"
        title="上传区域"
        description="拖放文件到这里"
        onFilesDropped={handleFilesDropped}
      />
    );
  },
});
```

### 高级用法

#### 多个区域

```tsx
<div style={{ display: "flex", gap: "20px" }}>
  <DragDropArea
    id="images"
    title="图片"
    hint="(.jpg, .png)"
    backgroundColor="rgba(255, 200, 200, 0.1)"
    displayMode="filename"
  />

  <DragDropArea
    id="documents"
    title="文档"
    hint="(.pdf, .doc)"
    backgroundColor="rgba(200, 255, 200, 0.1)"
    displayMode="count"
  />
</div>
```

#### 自定义处理逻辑

```tsx
const handleFilesDropped = (data: any) => {
  // 验证文件类型
  const validFiles = data.files.filter(
    (file: string) => file.endsWith(".jpg") || file.endsWith(".png"),
  );

  if (validFiles.length !== data.files.length) {
    alert("只支持 JPG 和 PNG 格式");
  }

  // 上传文件或其他处理
  uploadFiles(validFiles);
};

return () => (
  <DragDropArea
    id="image-upload"
    title="图片上传"
    onFilesDropped={handleFilesDropped}
  />
);
```

### 与 Wails 后端集成

确保后端正确配置：

```go
// main.go
window := app.Window.NewWithOptions(application.WebviewWindowOptions{
    EnableFileDrop: true,  // 启用文件拖放
})

// 注册事件处理器
windowHandlers := handlers.NewWindowHandlers(app)
windowHandlers.Register(window)
```

后端会发送事件：

```go
app.Event.Emit("files-dropped", map[string]any{
    "files":  []string{"/path/to/file1", "/path/to/file2"},
    "target": "my-drop-zone",  // 对应组件的 id
})
```

### 样式自定义

组件使用全局 CSS 类 `.drop-zone`，可以在 `style.css` 中自定义：

```css
.drop-zone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 40px;
  transition: all 0.2s ease;
}

.drop-zone.file-drop-target-active {
  border-color: #007bff;
  background-color: rgba(0, 123, 255, 0.1);
}
```

### 注意事项

1. **唯一 ID**: 每个 `DragDropArea` 的 `id` 必须唯一
2. **事件清理**: 组件会自动在 `onUnmounted` 时清理事件监听器
3. **文件累积**: 文件会累积在列表中，使用清空按钮或 `filesCleared` 事件来清空
4. **路径格式**: Windows 路径使用反斜杠 `\`，需要注意处理

### 完整示例

参考 `HelloWorld.tsx` 查看完整的使用示例。

### 不指定 ID 的用法

如果不需要在多个地方引用同一个区域，可以省略 `id` 属性：

```tsx
// 简单用法 - 自动生成 ID
<DragDropArea
  title="上传文件"
  description="拖放任意文件"
  onFilesDropped={(data) => console.log(data)}
/>

// 多个自动 ID 区域
<div>
  <DragDropArea title="区域 1" />
  <DragDropArea title="区域 2" />
  <DragDropArea title="区域 3" />
</div>
```

每个组件实例会自动生成唯一的 ID，格式为：`drag-drop-area-{counter}-{timestamp}`

### 何时使用自定义 ID

- ✅ **需要在代码中引用特定区域** - 使用自定义 ID
- ✅ **需要持久化区域状态** - 使用自定义 ID
- ✅ **需要与后端特定逻辑关联** - 使用自定义 ID
- ❌ **只是简单的文件上传** - 可以省略 ID
- ❌ **临时或一次性使用** - 可以省略 ID
