import { defineComponent, ref, onMounted } from "vue";
import { platform } from "@/platform";

export default defineComponent({
  name: "CustomTitleBar",
  props: {
    title: {
      type: String,
      default: "Wails App",
    },
  },
  setup(props) {
    const isMaximized = ref(false);

    const minimize = () => { platform.window.minimize(); };

    const toggleMaximize = async () => {
      platform.window.maximize();
      setTimeout(async () => {
        isMaximized.value = await platform.window.isMaximized();
      }, 100);
    };

    const close = () => { platform.window.close(); };

    onMounted(async () => {
      isMaximized.value = await platform.window.isMaximized();
    });

    const btnClass = "w-8 h-8 flex items-center justify-center rounded hover:bg-foreground/10 text-foreground/60 hover:text-foreground/90 transition-colors active:scale-95";
    const iconClass = "pointer-events-none";

    return () => (
      <div
        class="fixed top-0 left-0 right-0 h-10 bg-background/95 backdrop-blur-sm border-b z-[9999] select-none"
        data-wails-drag
        style="--wails-draggable: drag"
      >
        <div class="flex items-center justify-between h-full px-2.5 select-none">
          <div class="flex-1 text-center text-[13px] font-medium text-foreground/80 pointer-events-none">
            {props.title}
          </div>
          <div class="absolute right-2.5 flex gap-2" data-wails-no-drag>
            <button class={btnClass} onClick={minimize} title="最小化">
              <svg width="12" height="12" viewBox="0 0 12 12" class={iconClass}>
                <rect x="0" y="5" width="12" height="2" fill="currentColor" />
              </svg>
            </button>
            <button class={btnClass} onClick={toggleMaximize} title={isMaximized.value ? "还原" : "最大化"}>
              {!isMaximized.value ? (
                <svg width="12" height="12" viewBox="0 0 12 12" class={iconClass}>
                  <rect x="1" y="1" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.5" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 12 12" class={iconClass}>
                  <rect x="2" y="0" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.5" />
                  <rect x="0" y="2" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.5" />
                </svg>
              )}
            </button>
            <button class={`${btnClass} hover:bg-destructive hover:text-destructive-foreground`} onClick={close} title="关闭">
              <svg width="12" height="12" viewBox="0 0 12 12" class={iconClass}>
                <path d="M1 1 L11 11 M11 1 L1 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  },
});
