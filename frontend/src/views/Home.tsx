import { defineComponent, onMounted, onUnmounted } from "vue";
import { Button } from "@/components/ui/button";
import {
  FolderOpen,
  Star,
  Flag,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "@lucide/vue";
import { usePhotosStore } from "@/stores/photos";
import { Events } from "@wailsio/runtime";

export default defineComponent({
  name: "Home",
  components: { FolderOpen },
  setup() {
    const store = usePhotosStore();

    // === 键盘快捷键 ===
    const handleKeydown = (e: KeyboardEvent) => {
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
      } else if (e.key === "Delete" || e.key === "x" || e.key === "X") {
        store.toggleRejected();
      } else if (e.key === "f" || e.key === "F") {
        store.toggleFlagged();
      }
    };

    // === 拖放 ===
    let dropCleanup: (() => void) | null = null;

    onMounted(() => {
      window.addEventListener("keydown", handleKeydown);

      dropCleanup = Events.On("files-dropped", (event: any) => {
        const data = event?.data || {};
        const files = data?.files || [];
        const paths: string[] = Array.isArray(files) ? files : [];
        if (paths.length === 0) return;

        const first = paths[0].toLowerCase();
        const isPhotoFile = /\.(arw|cr2|cr3|crw|dng|nef|nrw|orf|raf|rw2|pef|srf|sr2|3fr|kdc|erf|mrw|raw|jpe?g|png|tiff?|bmp|gif|webp|heic|heif)$/i.test(
          first
        );

        if (isPhotoFile) {
          store.addFiles(paths);
        } else {
          const dirPath =
            paths[0].substring(0, paths[0].lastIndexOf("\\")) || paths[0];
          store.loadFiles(dirPath);
        }
      });
    });

    onUnmounted(() => {
      window.removeEventListener("keydown", handleKeydown);
      if (dropCleanup) dropCleanup();
    });

    return () => (
      <div class="pureraw-app h-full flex flex-col">
        {/* 主内容：预览区 + 右侧面板 */}
        <div class="pureraw-layout flex-1 flex overflow-hidden">
          {/* ========== 主预览区 ========== */}
          <div class="pureraw-preview flex-1 relative bg-muted/40 flex items-center justify-center">
            {store.currentPhoto ? (
              <>
                {/* 图片 */}
                {store.currentImage ? (
                  <img
                    src={store.currentImage}
                    alt={store.currentPhoto.fileName}
                    class="max-w-full max-h-full w-full h-full object-contain p-4"
                  />
                ) : (
                  <div class="flex flex-col items-center gap-3 text-muted-foreground">
                    <p class="text-lg font-medium">
                      {store.currentPhoto.fileName}
                    </p>
                    <p class="text-sm">
                      {[".arw", ".cr2", ".cr3", ".nef", ".dng", ".raw"].includes(
                        store.currentPhoto.ext
                      )
                        ? "RAW 预览开发中"
                        : "无法加载预览"}
                    </p>
                  </div>
                )}

                {/* Rejected 遮罩 */}
                {store.isCurrentRejected && (
                  <div class="absolute inset-0 bg-destructive/10 pointer-events-none" />
                )}

                {/* 左下：信息叠加 */}
                <div class="absolute bottom-16 left-6 glass-overlay px-4 py-2.5 rounded-xl text-sm max-w-md">
                  <p
                    class={[
                      "font-semibold truncate",
                      store.isCurrentRejected
                        ? "line-through text-muted-foreground"
                        : "text-foreground",
                    ]}
                  >
                    {store.currentPhoto.fileName}
                  </p>
                  <p class="text-xs text-muted-foreground mt-0.5">
                    {store.currentPhoto.ext.toUpperCase()} ·{" "}
                    {store.currentIndex + 1} / {store.totalCount}
                  </p>
                </div>

                {/* 右下：星级叠加 */}
                <div class="absolute bottom-16 right-6 glass-overlay px-3 py-2 rounded-xl flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      class={[
                        "size-4 cursor-pointer transition-colors",
                        n <= store.currentRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/40",
                      ]}
                      onClick={() => store.setRating(n)}
                    />
                  ))}
                </div>

                {/* 底部：Action Bar */}
                <div class="glass-overlay absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full px-5 py-2.5 flex items-center gap-4">
                  {/* Flag */}
                  <button
                    class={[
                      "p-1.5 rounded-full transition-colors",
                      store.isCurrentFlagged ? "bg-accent" : "hover:bg-accent/50",
                    ]}
                    onClick={() => store.toggleFlagged()}
                    title="Flag (F)"
                  >
                    <Flag
                      class={[
                        "size-4",
                        store.isCurrentFlagged
                          ? "fill-emerald-500 text-emerald-500"
                          : "text-muted-foreground",
                      ]}
                    />
                  </button>

                  <div class="w-px h-5 bg-border" />

                  {/* Reject */}
                  <button
                    class={[
                      "p-1.5 rounded-full transition-colors",
                      store.isCurrentRejected ? "bg-accent" : "hover:bg-accent/50",
                    ]}
                    onClick={() => store.toggleRejected()}
                    title="Reject (X)"
                  >
                    <Trash2
                      class={[
                        "size-4",
                        store.isCurrentRejected
                          ? "text-destructive"
                          : "text-muted-foreground",
                      ]}
                    />
                  </button>

                  <div class="w-px h-5 bg-border" />

                  {/* 1-5 星星评分 */}
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      class={[
                        "p-1.5 rounded-full transition-colors",
                        n <= store.currentRating ? "bg-accent" : "hover:bg-accent/50",
                      ]}
                      onClick={() => store.setRating(n)}
                      title={`Rate ${n}`}
                    >
                      <Star
                        class={[
                          "size-4",
                          n <= store.currentRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground",
                        ]}
                      />
                    </button>
                  ))}

                  <div class="w-px h-5 bg-border" />

                  {/* 导航 */}
                  <button
                    class={[
                      "p-1.5 rounded-full transition-colors",
                      store.currentIndex <= 0
                        ? "opacity-30 cursor-not-allowed"
                        : "hover:bg-accent/50",
                    ]}
                    onClick={() => store.prev()}
                    disabled={store.currentIndex <= 0}
                    title="Previous (←)"
                  >
                    <ChevronLeft class="size-4 text-muted-foreground" />
                  </button>
                  <span class="text-xs text-muted-foreground tabular-nums min-w-[48px] text-center">
                    {store.currentIndex + 1}/{store.totalCount}
                  </span>
                  <button
                    class={[
                      "p-1.5 rounded-full transition-colors",
                      store.currentIndex >= store.totalCount - 1
                        ? "opacity-30 cursor-not-allowed"
                        : "hover:bg-accent/50",
                    ]}
                    onClick={() => store.next()}
                    disabled={store.currentIndex >= store.totalCount - 1}
                    title="Next (→)"
                  >
                    <ChevronRight class="size-4 text-muted-foreground" />
                  </button>
                </div>
              </>
            ) : (
              /* 空状态 */
              <div class="empty-state flex flex-col items-center gap-4 text-muted-foreground">
                <FolderOpen class="size-16 opacity-20" />
                <p class="text-lg">拖放照片或打开文件夹开始筛选</p>
                <p class="text-sm opacity-50">
                  ← → 导航 · 1-5 评分 · F 标记 · X 丢弃
                </p>
              </div>
            )}
          </div>

          {/* ========== 右侧缩略图面板 ========== */}
          <div class="pureraw-panel w-72 border-l flex flex-col bg-background">
            <div class="panel-header p-3 border-b shrink-0">
              {/* @ts-ignore Button 通过 reka-ui Primitive 转发原生事件 */}
              <Button
                variant="outline"
                class="w-full justify-start gap-2"
                // @ts-ignore
                onClick={() => store.openFolder()}
                // @ts-ignore
                disabled={store.loading}
              >
                <FolderOpen class="size-4" />
                {store.loading ? "加载中..." : "打开文件夹"}
              </Button>
            </div>

            {store.error && (
              <div class="px-3 py-1.5 text-xs text-destructive bg-destructive/5 border-b">
                {store.error}
              </div>
            )}

            <div class="panel-grid flex-1 overflow-auto p-2">
              {store.totalCount > 0 ? (
                <div class="grid grid-cols-2 gap-2">
                  {store.photos.map((photo, i) => (
                    <div
                      key={photo.path}
                      class={[
                        "thumbnail-item rounded-lg overflow-hidden cursor-pointer border-2 transition-all",
                        i === store.currentIndex
                          ? "border-primary shadow-sm"
                          : "border-transparent hover:border-border",
                        store.rejected.has(i) ? "opacity-50" : "",
                      ]}
                      onClick={() => store.goTo(i)}
                    >
                      <div class="aspect-[4/3] bg-muted relative">
                        {store.currentImage && i === store.currentIndex ? (
                          <img
                            src={store.currentImage}
                            alt=""
                            class="w-full h-full object-cover"
                          />
                        ) : (
                          <div class="w-full h-full flex items-center justify-center">
                            <span class="text-[10px] text-muted-foreground truncate px-1">
                              {photo.fileName}
                            </span>
                          </div>
                        )}

                        {/* 评分角标 */}
                        {store.ratings[i] && (
                          <div class="absolute top-1 left-1 bg-background/85 backdrop-blur-sm rounded px-1 py-px flex items-center gap-px shadow-sm">
                            <Star class="size-2.5 fill-yellow-400 text-yellow-400" />
                            <span class="text-[10px] font-medium text-foreground">
                              {store.ratings[i]}
                            </span>
                          </div>
                        )}

                        {/* Flagged 角标 */}
                        {store.flagged.has(i) && (
                          <div class="absolute top-1 right-1 size-3 rounded-full bg-emerald-500 border border-white" />
                        )}

                        {/* Rejected 角标 */}
                        {store.rejected.has(i) && (
                          <div class="absolute top-1 right-1 size-4 rounded-full bg-destructive flex items-center justify-center text-white">
                            <span class="text-[10px] font-bold">✕</span>
                          </div>
                        )}
                      </div>
                      <div class="px-1.5 py-1">
                        <p
                          class={[
                            "text-[11px] truncate",
                            store.rejected.has(i)
                              ? "line-through text-muted-foreground"
                              : "text-foreground",
                          ]}
                        >
                          {photo.fileName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div class="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-2 p-4">
                  <FolderOpen class="size-8 opacity-20" />
                  <p class="text-center">拖放照片或点击上方按钮</p>
                </div>
              )}
            </div>

            {/* 统计 */}
            {store.totalCount > 0 && (
              <div class="panel-status px-3 py-2 border-t text-xs text-muted-foreground flex justify-between">
                <span>
                  已评 {store.ratedCount} / {store.totalCount}
                </span>
                <span>
                  {store.rejected.size > 0
                    ? `丢弃 ${store.rejected.size}`
                    : ""}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
});
