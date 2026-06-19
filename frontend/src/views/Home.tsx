import { defineComponent, ref } from "vue";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FolderOpen } from "@lucide/vue";

export default defineComponent({
  name: "Home",
  components: { FolderOpen },
  setup() {
    const currentIndex = ref(0);
    const photos = ref<string[]>([]);
    const ratings = ref<Record<number, number>>({});

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key >= "1" && e.key <= "5") {
        ratings.value[currentIndex.value] = parseInt(e.key);
      } else if (e.key === "ArrowLeft" && currentIndex.value > 0) {
        currentIndex.value--;
      } else if (e.key === "ArrowRight" && currentIndex.value < photos.value.length - 1) {
        currentIndex.value++;
      }
    };

    return () => (
      <div class="pureraw-app h-full flex flex-col" onKeydown={handleKeydown} tabindex={-1}>
        <div class="pureraw-layout flex-1 flex overflow-hidden">
          {/* 左侧文件列表 */}
          <div class="pureraw-sidebar w-64 border-r flex flex-col">
            <div class="file-list-header p-3 border-b">
              <Button variant="outline" class="w-full justify-start gap-2">
                <FolderOpen class="size-4" />
                打开文件夹
              </Button>
            </div>
            <div class="file-list-body flex-1 overflow-auto p-2">
              {photos.value.length === 0 ? (
                <div class="empty-state flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-2">
                  <FolderOpen class="size-8 opacity-30" />
                  <p>拖放照片或点击打开文件夹</p>
                </div>
              ) : (
                <div class="file-list space-y-1">
                  {photos.value.map((path, i) => (
                    <div
                      key={i}
                      class={[
                        "file-item px-2 py-1 rounded text-sm cursor-pointer truncate",
                        i === currentIndex.value ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      ]}
                      onClick={() => currentIndex.value = i}
                    >
                      {path.split(/[\\/]/).pop()}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 中间预览区 */}
          <div class="pureraw-preview flex-1 flex flex-col items-center justify-center bg-muted/30">
            {photos.value[currentIndex.value] ? (
              <div class="preview-container flex flex-col items-center gap-4">
                <Card class="preview-card w-[640px] h-[480px] flex items-center justify-center">
                  <p class="text-muted-foreground">照片预览区域</p>
                </Card>
                <div class="preview-info text-sm text-muted-foreground">
                  {currentIndex.value + 1} / {photos.value.length}
                  {ratings.value[currentIndex.value] && (
                    <span class="ml-2">⭐ {ratings.value[currentIndex.value]}</span>
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
          <Button variant="outline" size="sm">←</Button>
          {[1, 2, 3, 4, 5].map(n => (
            <Button
              key={n}
              variant={ratings.value[currentIndex.value] === n ? "default" : "outline"}
              size="sm"
              class="w-10"
            >
              {n}
            </Button>
          ))}
          <Button variant="outline" size="sm">→</Button>
        </div>
      </div>
    );
  },
});
