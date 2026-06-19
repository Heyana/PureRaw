import { defineComponent, Teleport } from "vue";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/stores/settings";
import { X, Moon, Sun, Trash2 } from "@lucide/vue";

export default defineComponent({
  name: "SettingsDialog",
  emits: ["requestClose"],
  props: {
    open: Boolean,
  },
  setup(props, { emit }) {
    const settings = useSettingsStore();
    const close = () => emit("requestClose");

    return () => props.open ? (
      <Teleport to="body">
        <div class="fixed inset-0 bg-black/40 z-[9998]" onClick={close} />

        <div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[400px] max-h-[80vh] overflow-auto rounded-xl border bg-popover text-popover-foreground shadow-2xl p-6">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-lg font-semibold">设置</h2>
            {/* @ts-ignore */}
            <Button variant="ghost" size="icon" class="size-8" // @ts-ignore
              onClick={close}>
              <X class="size-4" />
            </Button>
          </div>

          <div class="space-y-5">
            {/* 排序 */}
            <div>
              <p class="text-sm font-medium mb-2">照片排序</p>
              <div class="flex gap-1 bg-muted rounded-md p-0.5">
                {(["name", "date", "type"] as const).map((opt) => (
                  <button key={opt}
                    class={["flex-1 py-1.5 text-sm rounded transition-colors",
                      settings.sortBy === opt ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"]}
                    onClick={() => settings.sortBy = opt}>
                    {opt === "name" ? "文件名" : opt === "date" ? "日期" : "类型"}
                  </button>
                ))}
              </div>
              <div class="flex gap-1 mt-1.5">
                <button class={["text-xs px-2.5 py-1 rounded", settings.sortOrder === "asc" ? "bg-muted font-medium" : "text-muted-foreground"]}
                  onClick={() => settings.sortOrder = "asc"}>
                  ↑ 升序
                </button>
                <button class={["text-xs px-2.5 py-1 rounded", settings.sortOrder === "desc" ? "bg-muted font-medium" : "text-muted-foreground"]}
                  onClick={() => settings.sortOrder = "desc"}>
                  ↓ 降序
                </button>
              </div>
            </div>

            {/* 默认视图 */}
            <div>
              <p class="text-sm font-medium mb-2">默认视图</p>
              <div class="flex gap-1 bg-muted rounded-md p-0.5">
                <button class={["flex-1 py-1.5 text-sm rounded transition-colors", settings.gridMode ? "bg-background shadow-sm font-medium" : "text-muted-foreground"]}
                  onClick={() => settings.gridMode = true}>
                  Grid 网格
                </button>
                <button class={["flex-1 py-1.5 text-sm rounded transition-colors", !settings.gridMode ? "bg-background shadow-sm font-medium" : "text-muted-foreground"]}
                  onClick={() => settings.gridMode = false}>
                  List 列表
                </button>
              </div>
            </div>

            {/* 暗黑模式 */}
            <div>
              <p class="text-sm font-medium mb-2">外观</p>
              {/* @ts-ignore */}
              <Button variant="outline" class="w-full justify-start gap-2" // @ts-ignore
                onClick={() => settings.toggleDarkMode()}>
                {settings.darkMode ? <Moon class="size-4" /> : <Sun class="size-4" />}
                {settings.darkMode ? "暗黑模式" : "浅色模式"}
              </Button>
            </div>

            {/* 缓存 */}
            <div>
              <p class="text-sm font-medium mb-2">缓存管理</p>
              <p class="text-xs text-muted-foreground mb-2">
                缩略图缓存位置：Documents/PureRaw/thumbnails/
              </p>
              {/* @ts-ignore */}
              <Button variant="outline" size="sm" class="gap-2 text-destructive hover:text-destructive" // @ts-ignore
                onClick={() => settings.clearCache()}>
                <Trash2 class="size-3.5" />
                清除缓存
              </Button>
            </div>
          </div>
        </div>
      </Teleport>
    ) : null;
  },
});
