import { defineComponent, onMounted, onUnmounted } from "vue";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FolderOpen } from "@lucide/vue";
import { usePhotosStore } from "@/stores/photos";
import { Events } from "@wailsio/runtime";

export default defineComponent({
  name: "Home",
  components: { FolderOpen },
  setup() {
    const store = usePhotosStore();

    // 全局键盘快捷键
    const handleKeydown = (e: KeyboardEvent) => {
      // 忽略输入框中的按键
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key >= "1" && e.key <= "5") {
        store.setRating(parseInt(e.key));
      } else if (e.key === "ArrowLeft") {
        store.prev();
      } else if (e.key === "ArrowRight") {
        store.next();
      }
    };

    // 监听文件拖放事件
    let dropCleanup: (() => void) | null = null;

    onMounted(() => {
      window.addEventListener("keydown", handleKeydown);

      // 监听 Wails 文件拖放事件
      dropCleanup = Events.On("files-dropped", (event: any) => {
        const data = event?.data || {};
        const files = data?.files || [];
        const paths: string[] = Array.isArray(files) ? files : [];

        if (paths.length > 0) {
          // 判断是单个文件夹还是多个照片文件
          const first = paths[0].toLowerCase();
          const isPhotoFile = /\.(arw|cr2|cr3|crw|dng|nef|nrw|orf|raf|rw2|pef|srf|sr2|3fr|kdc|erf|mrw|raw|jpe?g|png|tiff?|bmp|gif|webp|heic|heif)$/i.test(
            first
          );

          if (isPhotoFile) {
            store.addFiles(paths);
          } else {
            // 当作文件夹处理：取第一个路径作为文件夹目录
            // 如果拖放的是文件夹，Wails 会返回文件夹内的文件列表
            // 这里简单处理：用第一个文件的目录作为文件夹路径
            const dirPath =
              paths[0].substring(0, paths[0].lastIndexOf("\\")) || paths[0];
            store.loadFiles(dirPath);
          }
        }
      });
    });

    onUnmounted(() => {
      window.removeEventListener("keydown", handleKeydown);
      if (dropCleanup) dropCleanup();
    });

    // 工具栏评分按钮
    const handleRating = (n: number) => {
      store.setRating(n);
    };

    return () => (
      <div class="pureraw-app h-full flex flex-col">
        <div class="pureraw-layout flex-1 flex overflow-hidden">
          {/* 左侧文件列表 */}
          <div class="pureraw-sidebar w-64 border-r flex flex-col">
            <div class="file-list-header p-3 border-b">
              <Button
                variant="outline"
                class="w-full justify-start gap-2"
                onClick={() => store.openFolder()}
                disabled={store.loading}
              >
                <FolderOpen class="size-4" />
                {store.loading ? "加载中..." : "打开文件夹"}
              </Button>
            </div>
            <div class="file-list-body flex-1 overflow-auto p-2">
              {store.totalCount === 0 ? (
                <div class="empty-state flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-2">
                  <FolderOpen class="size-8 opacity-30" />
                  <p>拖放照片或点击打开文件夹</p>
                </div>
              ) : (
                <div class="file-list space-y-1">
                  {store.photos.map((photo, i) => (
                    <div
                      key={photo.path}
                      class={[
                        "file-item px-2 py-1 rounded text-sm cursor-pointer truncate",
                        i === store.currentIndex
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted",
                      ]}
                      onClick={() => store.goTo(i)}
                    >
                      {photo.fileName}
                    </div>
                  ))}
                </div>
              )}
              {store.error && (
                <div class="text-destructive text-xs mt-2 px-1">
                  {store.error}
                </div>
              )}
            </div>
          </div>

          {/* 中间预览区 */}
          <div class="pureraw-preview flex-1 flex flex-col items-center justify-center bg-muted/30">
            {store.currentPhoto ? (
              <div class="preview-container flex flex-col items-center gap-4 p-4">
                <Card class="preview-card w-[640px] h-[480px] flex items-center justify-center overflow-hidden">
                  {store.currentImage ? (
                    <img
                      src={store.currentImage}
                      alt={store.currentPhoto.fileName}
                      class="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div class="flex flex-col items-center gap-2 text-muted-foreground">
                      <p class="text-lg">{store.currentPhoto.fileName}</p>
                      <p class="text-sm">
                        {[".arw", ".cr2", ".cr3", ".nef", ".dng", ".raw"].includes(
                          store.currentPhoto.ext
                        )
                          ? "RAW 格式预览开发中"
                          : "无法加载预览"}
                      </p>
                    </div>
                  )}
                </Card>
                <div class="preview-info text-sm text-muted-foreground flex items-center gap-3">
                  <span>
                    {store.currentIndex + 1} / {store.totalCount}
                  </span>
                  {store.currentRating && (
                    <span class="text-yellow-500">
                      {"★".repeat(store.currentRating)}
                      {"☆".repeat(5 - store.currentRating)}
                    </span>
                  )}
                  {store.ratedCount > 0 && (
                    <span>
                      已评 {store.ratedCount} / {store.totalCount}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div class="empty-preview flex flex-col items-center gap-3 text-muted-foreground">
                <FolderOpen class="size-12 opacity-20" />
                <p>拖放文件夹或照片到窗口开始筛选</p>
              </div>
            )}
          </div>
        </div>

        {/* 底部工具栏 */}
        <div class="pureraw-toolbar h-12 border-t flex items-center justify-center gap-2 px-4 bg-background shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => store.prev()}
            disabled={store.currentIndex <= 0}
          >
            ←
          </Button>
          {[1, 2, 3, 4, 5].map((n) => (
            <Button
              key={n}
              variant={store.currentRating === n ? "default" : "outline"}
              size="sm"
              class="w-10"
              onClick={() => handleRating(n)}
            >
              {n}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => store.next()}
            disabled={store.currentIndex >= store.totalCount - 1}
          >
            →
          </Button>
        </div>
      </div>
    );
  },
});
