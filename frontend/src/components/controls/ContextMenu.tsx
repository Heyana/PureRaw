import { defineComponent, Teleport, h } from "vue";
import { useContextMenu } from "@/composables/useContextMenu";
import { Trash2, RefreshCw } from "@lucide/vue";

const ICON_MAP: Record<string, any> = {
  refresh: RefreshCw,
  delete: Trash2,
};

export default defineComponent({
  name: "ContextMenu",
  setup() {
    const { state, cancelClose, handleItemClick } = useContextMenu();

    function renderIcon(name?: string) {
      if (!name) return null;
      const Icon = ICON_MAP[name];
      return Icon ? h(Icon, { class: "size-3.5 shrink-0" }) : null;
    }

    return () => (
      <Teleport to="body">
        {state.visible ? (
          <div
            class="context-menu-root fixed z-[9999] min-w-[160px] py-1 rounded-lg border bg-popover text-popover-foreground shadow-xl"
            style={{ left: `${state.x}px`, top: `${state.y}px` }}
            onClick={(e) => { e.stopPropagation(); cancelClose(); }}
            onContextmenu={(e) => e.preventDefault()}
          >
            {state.items.map((item, i) => (
              item.separator ? (
                <div key={i} class="h-px bg-border my-1" />
              ) : (
                <div
                  key={i}
                  class={[
                    "flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer mx-1 rounded-md transition-colors",
                    item.danger
                      ? "text-destructive hover:bg-destructive/10"
                      : "hover:bg-accent",
                  ]}
                  onClick={() => handleItemClick(item)}
                >
                  {renderIcon(item.icon)}
                  <span>{item.label}</span>
                </div>
              )
            ))}
          </div>
        ) : null}
      </Teleport>
    );
  },
});
