import { defineComponent, onMounted, onUnmounted } from "vue";
import { Button } from "@/components/ui/button";
import {
  FolderOpen, Star, Flag, Trash2, ChevronLeft, ChevronRight,
  Grid3x3, List, X, Image, Info,
} from "@lucide/vue";
import { usePhotosStore } from "@/stores/photos";
import { Events } from "@wailsio/runtime";

export default defineComponent({
  name: "Home",
  setup() {
    const store = usePhotosStore();

    // === 键盘 ===
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (store.currentIndex >= 0) {
        if (e.key >= "1" && e.key <= "5") { store.setRating(parseInt(e.key)); return; }
        if (e.key === "ArrowLeft") { store.prev(); return; }
        if (e.key === "ArrowRight") { store.next(); return; }
        if (e.key === "Delete" || e.key === "x" || e.key === "X") { store.toggleRejected(); return; }
        if (e.key === "f" || e.key === "F") { store.toggleFlagged(); return; }
        if (e.key === "Escape") { store.exitCulling(); return; }
      }
    };

    let dropCleanup: (() => void) | null = null;

    onMounted(() => {
      window.addEventListener("keydown", handleKeydown);
      store.loadFolderHistory();

      dropCleanup = Events.On("files-dropped", (event: any) => {
        const files: string[] = event?.data?.files || [];
        if (files.length === 0) return;
        const first = files[0].toLowerCase();
        const isPhoto = /\.(arw|cr2|cr3|crw|dng|nef|nrw|orf|raf|rw2|pef|srf|sr2|3fr|kdc|erf|mrw|raw|jpe?g|png|tiff?|bmp|gif|webp|heic|heif)$/i.test(first);
        if (isPhoto) {
          store.selectFolder(files[0].substring(0, files[0].lastIndexOf("\\")) || files[0]);
        } else {
          store.selectFolder(files[0]);
        }
      });
    });

    onUnmounted(() => {
      window.removeEventListener("keydown", handleKeydown);
      if (dropCleanup) dropCleanup();
    });

    return () => (
      <div class="pureraw-app h-full flex flex-col">
        <div class="pureraw-layout flex-1 flex overflow-hidden">

          {/* ======== 左侧：文件夹面板 (始终显示) ======== */}
          <div class="pureraw-folder-panel w-56 border-r flex flex-col bg-background shrink-0">
            <div class="p-3 border-b">
              {/* @ts-ignore */}
              <Button variant="outline" class="w-full justify-start gap-2" // @ts-ignore
                onClick={() => store.openFolder()} // @ts-ignore
                disabled={store.loading}>
                <FolderOpen class="size-4" />
                {store.loading ? "加载中..." : "打开文件夹"}
              </Button>
            </div>
            {store.error && (
              <div class="px-3 py-1.5 text-xs text-destructive bg-destructive/5 border-b">{store.error}</div>
            )}
            <div class="folder-tree flex-1 overflow-auto p-2">
              {store.currentFolder ? (
                <div class="folder-root px-2 py-1.5 rounded-md bg-accent text-accent-foreground text-sm font-medium truncate cursor-pointer"
                  onClick={() => store.exitCulling()}>
                  📁 {store.currentFolder.split(/[\\\/]/).pop()}
                  <span class="text-xs text-muted-foreground ml-1">({store.totalCount})</span>
                </div>
              ) : null}

              {store.folderHistory.length > 0 && (
                <div class="mt-4">
                  <p class="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1.5">最近使用</p>
                  <div class="space-y-0.5">
                    {store.folderHistory.map(p => (
                      <div key={p} class="group flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer text-sm truncate"
                        title={p}
                        onClick={() => { store.exitCulling(); store.selectFolder(p); }}>
                        <span class="truncate flex-1">📁 {p.split(/[\\\/]/).pop()}</span>
                        <button class="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-accent shrink-0"
                          onClick={(e) => { e.stopPropagation(); store.removeFromHistory(p); }}>
                          <X class="size-3 text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!store.currentFolder && store.folderHistory.length === 0 && (
                <div class="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-2 p-4">
                  <FolderOpen class="size-8 opacity-20" />
                  <p class="text-center">打开文件夹开始</p>
                </div>
              )}
            </div>
          </div>

          {/* ======== 中间：主内容区 ======== */}
          {store.currentIndex >= 0 ? (
            /* --- 筛选模式 --- */
            <div class="pureraw-culling flex-1 relative bg-muted/40 flex items-center justify-center">
              {store.currentImage ? (
                <img src={store.currentImage} class="max-w-full max-h-full w-full h-full object-contain p-4" />
              ) : (
                <div class="text-muted-foreground text-center">
                  <p class="text-lg font-medium">{store.currentPhoto?.fileName}</p>
                  <p class="text-sm mt-1">
                    {store.currentPhoto?.ext && [".arw",".cr2",".cr3",".nef",".dng",".raw"].includes(store.currentPhoto.ext)
                      ? "RAW 预览开发中" : "加载中..."}
                  </p>
                </div>
              )}
              {store.isCurrentRejected && <div class="absolute inset-0 bg-destructive/10 pointer-events-none" />}

              {/* 左下信息 */}
              <div class="absolute bottom-16 left-6 glass-overlay px-4 py-2.5 rounded-xl text-sm max-w-md">
                <p class={["font-semibold truncate", store.isCurrentRejected ? "line-through text-muted-foreground" : "text-foreground"]}>
                  {store.currentPhoto?.fileName}
                </p>
                <p class="text-xs text-muted-foreground mt-0.5">{store.currentIndex + 1} / {store.totalCount}</p>
              </div>

              {/* Action Bar */}
              <div class="glass-overlay absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full px-5 py-2.5 flex items-center gap-4">
                <ActionBtn active={store.isCurrentFlagged} onClick={() => store.toggleFlagged()} title="Flag (F)">
                  <Flag class={["size-4", store.isCurrentFlagged ? "fill-emerald-500 text-emerald-500" : "text-muted-foreground"]} />
                </ActionBtn>
                <div class="w-px h-5 bg-border" />
                <ActionBtn active={store.isCurrentRejected} onClick={() => store.toggleRejected()} title="Reject (X)">
                  <Trash2 class={["size-4", store.isCurrentRejected ? "text-destructive" : "text-muted-foreground"]} />
                </ActionBtn>
                <div class="w-px h-5 bg-border" />
                {[1,2,3,4,5].map(n => (
                  <ActionBtn key={n} active={n <= store.currentRating} onClick={() => store.setRating(n)} title={`Rate ${n}`}>
                    <Star class={["size-4", n <= store.currentRating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"]} />
                  </ActionBtn>
                ))}
                <div class="w-px h-5 bg-border" />
                <ActionBtn onClick={() => store.prev()} disabled={store.currentIndex <= 0} title="←">
                  <ChevronLeft class="size-4 text-muted-foreground" />
                </ActionBtn>
                <span class="text-xs text-muted-foreground tabular-nums min-w-[48px] text-center">
                  {store.currentIndex + 1}/{store.totalCount}
                </span>
                <ActionBtn onClick={() => store.next()} disabled={store.currentIndex >= store.totalCount - 1} title="→">
                  <ChevronRight class="size-4 text-muted-foreground" />
                </ActionBtn>
                <div class="w-px h-5 bg-border" />
                <ActionBtn onClick={() => store.exitCulling()} title="返回 (Esc)">
                  <X class="size-4 text-muted-foreground" />
                </ActionBtn>
              </div>
            </div>
          ) : store.currentFolder ? (
            /* --- Grid/List 浏览 --- */
            <div class="pureraw-content flex-1 flex flex-col bg-muted/20">
              <div class="content-toolbar flex items-center justify-between px-4 py-2 border-b bg-background">
                <span class="text-sm font-medium text-muted-foreground">{store.totalCount} 张照片</span>
                <div class="flex items-center gap-1 bg-muted rounded-md p-0.5">
                  <button class={["p-1.5 rounded transition-colors", store.viewMode === "grid" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"]}
                    onClick={() => store.viewMode = "grid"} title="网格">
                    <Grid3x3 class="size-3.5" />
                  </button>
                  <button class={["p-1.5 rounded transition-colors", store.viewMode === "list" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"]}
                    onClick={() => store.viewMode = "list"} title="列表">
                    <List class="size-3.5" />
                  </button>
                </div>
              </div>

              {store.viewMode === "grid" ? (
                <div class="photo-grid flex-1 overflow-auto p-4">
                  <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {store.photos.map((photo, i) => (
                      <div key={photo.path} class="grid-item group cursor-pointer"
                        onClick={() => store.enterCulling(i)}>
                        <div class={[
                          "aspect-[4/3] rounded-lg overflow-hidden bg-muted relative border-2 transition-all",
                          store.ratings[i] ? "border-yellow-400/50" : "border-transparent",
                          store.rejected.has(i) ? "opacity-40" : "group-hover:border-primary/50",
                        ]}>
                          {store.thumbnails[photo.path] ? (
                            <img src={store.thumbnails[photo.path]} class="w-full h-full object-cover" />
                          ) : (
                            <div class="w-full h-full flex items-center justify-center bg-muted">
                              <Image class="size-5 opacity-15" />
                            </div>
                          )}
                          {store.ratings[i] ? (
                            <div class="absolute top-1.5 left-1.5 bg-background/90 backdrop-blur-sm rounded px-1.5 py-px flex items-center gap-px shadow-sm">
                              <Star class="size-2.5 fill-yellow-400 text-yellow-400" /><span class="text-[10px] font-medium">{store.ratings[i]}</span>
                            </div>
                          ) : null}
                          {store.flagged.has(i) && <div class="absolute top-1.5 right-1.5 size-3 rounded-full bg-emerald-500 border border-white shadow-sm" />}
                          {store.rejected.has(i) && (
                            <div class="absolute top-1.5 right-1.5 size-4 rounded-full bg-destructive flex items-center justify-center text-white shadow-sm">
                              <span class="text-[10px] font-bold">✕</span>
                            </div>
                          )}
                        </div>
                        <p class={["text-[11px] mt-1 px-0.5 truncate", store.rejected.has(i) ? "line-through text-muted-foreground" : "text-foreground"]}>
                          {photo.fileName}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div class="photo-list flex-1 overflow-auto">
                  {store.photos.map((photo, i) => (
                    <div key={photo.path} class={[
                      "flex items-center gap-3 px-4 py-2 border-b border-border/50 cursor-pointer hover:bg-muted/50 transition-colors",
                      store.rejected.has(i) ? "opacity-40" : "",
                    ]} onClick={() => store.enterCulling(i)}>
                      <div class="w-10 h-10 rounded bg-muted overflow-hidden shrink-0">
                        {store.thumbnails[photo.path] ? (
                          <img src={store.thumbnails[photo.path]} class="w-full h-full object-cover" />
                        ) : (
                          <div class="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">{photo.ext.toUpperCase()}</div>
                        )}
                      </div>
                      <span class={["text-sm flex-1 truncate", store.rejected.has(i) ? "line-through text-muted-foreground" : "text-foreground"]}>{photo.fileName}</span>
                      <span class="text-xs text-muted-foreground">{photo.ext.toUpperCase()}</span>
                      {store.ratings[i] ? (
                        <div class="flex items-center gap-px"><Star class="size-3 fill-yellow-400 text-yellow-400" /><span class="text-xs font-medium">{store.ratings[i]}</span></div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* --- 空状态 --- */
            <div class="pureraw-content flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3 bg-muted/20">
              <FolderOpen class="size-16 opacity-15" />
              <p>打开文件夹或从历史记录中选择</p>
              <p class="text-xs opacity-50">支持拖放文件夹到窗口</p>
            </div>
          )}

          {/* ======== 右侧：Info 面板 (始终显示) ======== */}
          <div class="pureraw-info-panel w-56 border-l flex flex-col bg-background shrink-0">
            <div class="p-3 border-b">
              <div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Info class="size-4" />
                详细信息
              </div>
            </div>

            <div class="info-body flex-1 overflow-auto p-3">
              {store.currentIndex >= 0 && store.currentPhoto ? (
                /* 照片信息 */
                <div class="space-y-4">
                  <div>
                    <p class="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">文件名</p>
                    <p class={["text-sm font-medium break-all", store.isCurrentRejected ? "line-through text-muted-foreground" : "text-foreground"]}>
                      {store.currentPhoto.fileName}
                    </p>
                  </div>

                  <div>
                    <p class="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">格式</p>
                    <p class="text-sm text-foreground">{store.currentPhoto.ext.toUpperCase()}</p>
                  </div>

                  <div>
                    <p class="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">序号</p>
                    <p class="text-sm text-foreground">{store.currentIndex + 1} / {store.totalCount}</p>
                  </div>

                  <div>
                    <p class="text-[11px] text-muted-foreground uppercase tracking-wider mb-1.5">评分</p>
                    <div class="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} class={["size-4 cursor-pointer transition-colors", n <= store.currentRating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30 hover:text-muted-foreground"]}
                          onClick={() => store.setRating(n)} />
                      ))}
                    </div>
                  </div>

                  <div class="flex items-center gap-4">
                    <div>
                      <p class="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">标记</p>
                      {/* @ts-ignore */}
                      <Button variant={store.isCurrentFlagged ? "default" : "outline"} size="xs" class="gap-1" // @ts-ignore
                        onClick={() => store.toggleFlagged()}>
                        <Flag class={["size-3", store.isCurrentFlagged ? "fill-white" : ""]} />
                        {store.isCurrentFlagged ? "已标记" : "标记"}
                      </Button>
                    </div>
                    <div>
                      <p class="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">丢弃</p>
                      {/* @ts-ignore */}
                      <Button variant={store.isCurrentRejected ? "destructive" : "outline"} size="xs" class="gap-1" // @ts-ignore
                        onClick={() => store.toggleRejected()}>
                        <Trash2 class="size-3" />
                        {store.isCurrentRejected ? "已丢弃" : "丢弃"}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <p class="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">路径</p>
                    <p class="text-[11px] text-muted-foreground break-all leading-relaxed">{store.currentPhoto.path}</p>
                  </div>
                </div>
              ) : store.currentFolder ? (
                /* 文件夹信息 */
                <div class="space-y-4">
                  <div>
                    <p class="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">文件夹</p>
                    <p class="text-sm font-medium text-foreground break-all">{store.currentFolder.split(/[\\\/]/).pop()}</p>
                  </div>
                  <div>
                    <p class="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">照片数</p>
                    <p class="text-sm text-foreground">{store.totalCount} 张</p>
                  </div>
                  <div>
                    <p class="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">已评分</p>
                    <p class="text-sm text-foreground">{store.ratedCount} 张</p>
                  </div>
                  <div>
                    <p class="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">路径</p>
                    <p class="text-[11px] text-muted-foreground break-all leading-relaxed">{store.currentFolder}</p>
                  </div>
                </div>
              ) : (
                <div class="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-2">
                  <Info class="size-6 opacity-20" />
                  <p class="text-center text-xs">选择文件夹或照片<br/>查看详细信息</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  },
});

const ActionBtn = (props: { active?: boolean; onClick: () => void; disabled?: boolean; title: string }, { slots }: any) => (
  <button class={["p-1.5 rounded-full transition-colors", props.disabled ? "opacity-30 cursor-not-allowed" : props.active ? "bg-accent" : "hover:bg-accent/50"]}
    onClick={props.onClick} disabled={props.disabled} title={props.title}>
    {slots.default?.()}
  </button>
);
