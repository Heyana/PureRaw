import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { FileService } from "../../bindings/PureRaw/services/index.js";

export type SortBy = "name" | "date" | "type";
export type SortOrder = "asc" | "desc";

const STORAGE_KEY = "pureraw-settings";

interface SettingsData {
  sortBy: SortBy;
  sortOrder: SortOrder;
  gridMode: boolean;
  darkMode: boolean;
  cachePath: string;
}

function loadSettings(): SettingsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {} as SettingsData;
}

function saveSettings(data: SettingsData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const useSettingsStore = defineStore("settings", () => {
  const saved = loadSettings();

  const sortBy = ref<SortBy>(saved.sortBy || "name");
  const sortOrder = ref<SortOrder>(saved.sortOrder || "asc");
  const gridMode = ref(saved.gridMode !== false); // 默认 true
  const darkMode = ref(saved.darkMode || false);
  const cachePath = ref(saved.cachePath || "");

  // 初始化暗黑模式
  function applyDarkMode(on: boolean) {
    document.documentElement.classList.toggle("dark", on);
  }
  applyDarkMode(darkMode.value);

  // 监听变化并持久化
  function persist() {
    saveSettings({
      sortBy: sortBy.value,
      sortOrder: sortOrder.value,
      gridMode: gridMode.value,
      darkMode: darkMode.value,
      cachePath: cachePath.value,
    });
  }

  watch([sortBy, sortOrder, gridMode, darkMode, cachePath], persist);

  function toggleDarkMode() {
    darkMode.value = !darkMode.value;
    applyDarkMode(darkMode.value);
  }

  /** 清除缓存 */
  async function clearCache() {
    await FileService.ClearThumbnailCache();
    localStorage.removeItem(STORAGE_KEY);
    sortBy.value = "name";
    sortOrder.value = "asc";
    gridMode.value = true;
    darkMode.value = false;
    cachePath.value = "";
    applyDarkMode(false);
  }

  return {
    sortBy,
    sortOrder,
    gridMode,
    darkMode,
    cachePath,
    toggleDarkMode,
    clearCache,
  };
});
