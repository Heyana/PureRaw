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

export function useContextMenu() {
  function open(items: MenuItem[], x: number, y: number) {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
    state.items = items;
    state.x = x;
    state.y = y;
    state.visible = true;
  }

  function close() {
    closeTimer = setTimeout(() => {
      state.visible = false;
      state.items = [];
    }, 100);
  }

  function cancelClose() {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  }

  /** 点击菜单项后自动关闭 */
  function handleItemClick(item: MenuItem) {
    state.visible = false;
    state.items = [];
    item.action();
  }

  /**
   * 便捷导出，可直接 import { rightMenu } from "..." 使用
   */
  const rightMenu = {
    open,
    close,
  };

  return {
    state,
    rightMenu,
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
  },
  close() {
    closeTimer = setTimeout(() => {
      state.visible = false;
      state.items = [];
    }, 100);
  },
};
