import { reactive } from "vue";

export interface MenuItem {
  label: string;
  icon?: string;
  action: () => void;
  danger?: boolean;
  separator?: boolean;
}

interface MenuState {
  visible: boolean;
  x: number;
  y: number;
  items: MenuItem[];
}

const state = reactive<MenuState>({
  visible: false,
  x: 0,
  y: 0,
  items: [],
});

let closeTimer: ReturnType<typeof setTimeout> | null = null;
let outsideHandler: ((e: MouseEvent) => void) | null = null;
let escapeHandler: ((e: KeyboardEvent) => void) | null = null;

function addListeners() {
  removeListeners();

  // 延迟注册，避免当前右键事件的冒泡触发关闭
  setTimeout(() => {
    outsideHandler = (e: MouseEvent) => {
      // 忽略右键菜单自身的点击
      const target = e.target as HTMLElement;
      if (target?.closest(".context-menu-root")) return;
      forceClose();
    };
    escapeHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") forceClose();
    };

    document.addEventListener("click", outsideHandler);
    document.addEventListener("contextmenu", outsideHandler);
    document.addEventListener("keydown", escapeHandler);
  }, 0);
}

function removeListeners() {
  if (outsideHandler) {
    document.removeEventListener("click", outsideHandler);
    document.removeEventListener("contextmenu", outsideHandler);
    outsideHandler = null;
  }
  if (escapeHandler) {
    document.removeEventListener("keydown", escapeHandler);
    escapeHandler = null;
  }
}

function forceClose() {
  if (closeTimer) clearTimeout(closeTimer);
  state.visible = false;
  state.items = [];
  removeListeners();
}

export function useContextMenu() {
  function open(items: MenuItem[], x: number, y: number) {
    if (closeTimer) clearTimeout(closeTimer);
    state.items = items;
    state.x = x;
    state.y = y;
    state.visible = true;
    addListeners();
  }

  function close() {
    closeTimer = setTimeout(() => {
      forceClose();
    }, 100);
  }

  function cancelClose() {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  }

  function handleItemClick(item: MenuItem) {
    forceClose();
    item.action();
  }

  return {
    state,
    rightMenu: { open, close },
    open,
    close,
    cancelClose,
    handleItemClick,
  };
}

/** 全局单例快捷调用 */
export const rightMenu = {
  open(items: MenuItem[], x: number, y: number) {
    if (closeTimer) clearTimeout(closeTimer);
    state.items = items;
    state.x = x;
    state.y = y;
    state.visible = true;
    addListeners();
  },
  close() {
    closeTimer = setTimeout(() => forceClose(), 100);
  },
};
