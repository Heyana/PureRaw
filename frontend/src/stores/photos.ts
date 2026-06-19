import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { FileService, PhotoInfo } from "../../bindings/PureRaw/services/index.js";

export type ViewMode = "grid" | "list";

export const usePhotosStore = defineStore("photos", () => {
  // === 文件夹 ===
  const folderHistory = ref<string[]>([]);
  const currentFolder = ref("");
  const photos = ref<PhotoInfo[]>([]);

  // === 浏览模式 ===
  const viewMode = ref<ViewMode>("grid");

  // === 筛选模式 ===
  const currentIndex = ref(-1);
  const ratings = ref<Record<number, number>>({});
  const rejected = ref<Set<number>>(new Set());
  const flagged = ref<Set<number>>(new Set());
  const currentImage = ref<string>("");
  const thumbnails = ref<Record<string, string>>({});

  // === 共享状态 ===
  const loading = ref(false);
  const error = ref("");

  // 筛选模式下的当前照片
  const currentPhoto = computed(() =>
    currentIndex.value >= 0 ? photos.value[currentIndex.value] : null
  );

  const totalCount = computed(() => photos.value.length);
  const ratedCount = computed(() => Object.keys(ratings.value).length);

  const currentRating = computed(() =>
    currentIndex.value >= 0 ? (ratings.value[currentIndex.value] ?? 0) : 0
  );

  const isCurrentRejected = computed(() => rejected.value.has(currentIndex.value));
  const isCurrentFlagged = computed(() => flagged.value.has(currentIndex.value));

  // === 文件夹操作 ===

  async function loadFolderHistory(): Promise<void> {
    try {
      const history = await FileService.GetFolderHistory();
      folderHistory.value = history || [];
    } catch {
      // ignore
    }
  }

  async function openFolder(): Promise<void> {
    loading.value = true;
    error.value = "";
    try {
      const path = await FileService.SelectFolder();
      if (!path) { loading.value = false; return; }
      await selectFolder(path);
    } catch (e: any) {
      error.value = e?.message || String(e);
      loading.value = false;
    }
  }

  async function selectFolder(path: string): Promise<void> {
    currentFolder.value = path;
    loading.value = true;
    error.value = "";
    try {
      const files = await FileService.GetFiles(path);
      photos.value = files || [];
      ratings.value = {};
      rejected.value = new Set();
      flagged.value = new Set();
      currentIndex.value = -1;
      thumbnails.value = {};
      await loadFolderHistory();
      if (files && files.length > 0) {
        // 预加载前几张小图
        await loadThumbnails(files.slice(0, 20));
      }
    } catch (e: any) {
      error.value = e?.message || String(e);
    } finally {
      loading.value = false;
    }
  }

  async function removeFromHistory(path: string): Promise<void> {
    await FileService.RemoveFolderHistory(path);
    await loadFolderHistory();
  }

  // === 缩略图 ===

  async function loadThumbnails(photoList: PhotoInfo[]): Promise<void> {
    for (const photo of photoList) {
      if (thumbnails.value[photo.path]) continue;
      const previewExts = [".jpg", ".jpeg", ".png", ".webp", ".bmp", ".gif",
        ".arw", ".cr2", ".cr3", ".crw", ".dng", ".nef", ".nrw", ".orf",
        ".raf", ".rw2", ".pef", ".raw"];
      if (!previewExts.includes(photo.ext)) continue;
      try {
        const thumb = await FileService.GetThumbnail(photo.path);
        if (thumb) thumbnails.value[photo.path] = thumb;
      } catch {
        // skip
      }
    }
  }

  /** 刷新当前文件夹所有缩略图 */
  async function refreshThumbnails(): Promise<void> {
    thumbnails.value = {};
    await loadThumbnails(photos.value);
  }

  // === 筛选模式 ===

  function enterCulling(index: number): void {
    currentIndex.value = index;
    loadCurrentImage();
  }

  function exitCulling(): void {
    currentIndex.value = -1;
    currentImage.value = "";
  }

  async function loadCurrentImage(): Promise<void> {
    const photo = currentPhoto.value;
    if (!photo) { currentImage.value = ""; return; }
    const previewExts = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];
    if (previewExts.includes(photo.ext)) {
      try {
        currentImage.value = await FileService.GetFileDataURI(photo.path);
      } catch {
        currentImage.value = "";
      }
    } else {
      currentImage.value = "";
    }
  }

  function setRating(rating: number): void {
    if (currentIndex.value >= 0) {
      ratings.value = { ...ratings.value, [currentIndex.value]: rating };
    }
  }

  function toggleRejected(): void {
    const idx = currentIndex.value;
    if (idx < 0) return;
    const next = new Set(rejected.value);
    next.has(idx) ? next.delete(idx) : next.add(idx);
    rejected.value = next;
  }

  function toggleFlagged(): void {
    const idx = currentIndex.value;
    if (idx < 0) return;
    const next = new Set(flagged.value);
    next.has(idx) ? next.delete(idx) : next.add(idx);
    flagged.value = next;
  }

  async function prev(): Promise<void> {
    if (currentIndex.value > 0) {
      currentIndex.value--;
      await loadCurrentImage();
    }
  }

  async function next(): Promise<void> {
    if (currentIndex.value < photos.value.length - 1) {
      currentIndex.value++;
      await loadCurrentImage();
    }
  }

  async function goTo(index: number): Promise<void> {
    if (index >= 0 && index < photos.value.length) {
      currentIndex.value = index;
      await loadCurrentImage();
    }
  }

  return {
    folderHistory, currentFolder, photos, viewMode,
    currentIndex, ratings, rejected, flagged, currentImage, thumbnails,
    loading, error,
    currentPhoto, totalCount, ratedCount, currentRating,
    isCurrentRejected, isCurrentFlagged,
    loadFolderHistory, openFolder, selectFolder, removeFromHistory,
    loadThumbnails,
    refreshThumbnails,
    enterCulling, exitCulling,
    setRating, toggleRejected, toggleFlagged,
    prev, next, goTo,
  };
});
