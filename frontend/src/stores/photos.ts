import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { FileService, PhotoInfo } from "../../bindings/PureRaw/services/index.js";

export const usePhotosStore = defineStore("photos", () => {
  const photos = ref<PhotoInfo[]>([]);
  const currentIndex = ref(-1);
  const ratings = ref<Record<number, number>>({});
  const rejected = ref<Set<number>>(new Set());
  const flagged = ref<Set<number>>(new Set());
  const currentImage = ref<string>("");
  const loading = ref(false);
  const error = ref("");

  // 当前照片
  const currentPhoto = computed(() =>
    currentIndex.value >= 0 ? photos.value[currentIndex.value] : null
  );

  // 照片总数
  const totalCount = computed(() => photos.value.length);

  // 已评分的照片数
  const ratedCount = computed(() => Object.keys(ratings.value).length);

  // 当前评分
  const currentRating = computed(() =>
    currentIndex.value >= 0 ? (ratings.value[currentIndex.value] ?? 0) : 0
  );

  // 当前是否 rejected
  const isCurrentRejected = computed(() =>
    currentIndex.value >= 0 ? rejected.value.has(currentIndex.value) : false
  );

  // 当前是否 flagged
  const isCurrentFlagged = computed(() =>
    currentIndex.value >= 0 ? flagged.value.has(currentIndex.value) : false
  );

  /** 通过文件夹对话框加载照片 */
  async function openFolder(): Promise<void> {
    loading.value = true;
    error.value = "";
    try {
      const folderPath = await FileService.SelectFolder();
      if (!folderPath) {
        loading.value = false;
        return;
      }
      await loadFiles(folderPath);
    } catch (e: any) {
      error.value = e?.message || String(e);
      loading.value = false;
    }
  }

  /** 从文件夹路径加载照片 */
  async function loadFiles(folderPath: string): Promise<void> {
    try {
      const files = await FileService.GetFiles(folderPath);
      if (files && files.length > 0) {
        photos.value = files;
        currentIndex.value = 0;
        ratings.value = {};
        rejected.value = new Set();
        flagged.value = new Set();
        await loadCurrentImage();
      }
    } catch (e: any) {
      error.value = e?.message || String(e);
    } finally {
      loading.value = false;
    }
  }

  /** 从拖放文件路径添加照片 */
  async function addFiles(paths: string[]): Promise<void> {
    const supportedExts = [
      ".arw", ".cr2", ".cr3", ".crw", ".dng", ".nef", ".nrw", ".orf",
      ".raf", ".rw2", ".pef", ".srf", ".sr2", ".3fr", ".kdc", ".erf",
      ".mrw", ".raw", ".jpg", ".jpeg", ".png", ".tiff", ".tif",
      ".bmp", ".gif", ".webp", ".heic", ".heif",
    ];

    const photoFiles: PhotoInfo[] = [];
    for (const path of paths) {
      const ext = path.toLowerCase().substring(path.lastIndexOf("."));
      if (supportedExts.includes(ext)) {
        const fileName = path.replace(/\\/g, "/").split("/").pop() || path;
        photoFiles.push({ path, fileName, ext });
      }
    }

    if (photoFiles.length > 0) {
      photos.value = [...photos.value, ...photoFiles];
      if (currentIndex.value < 0) {
        currentIndex.value = 0;
        await loadCurrentImage();
      }
    }
  }

  /** 加载当前照片的预览图 */
  async function loadCurrentImage(): Promise<void> {
    const photo = currentPhoto.value;
    if (!photo) {
      currentImage.value = "";
      return;
    }

    const previewExts = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];
    if (previewExts.includes(photo.ext)) {
      try {
        const dataUri = await FileService.GetFileDataURI(photo.path);
        currentImage.value = dataUri;
      } catch {
        currentImage.value = "";
      }
    } else {
      currentImage.value = "";
    }
  }

  /** 设置当前照片评分 */
  function setRating(rating: number): void {
    if (currentIndex.value >= 0) {
      ratings.value = { ...ratings.value, [currentIndex.value]: rating };
    }
  }

  /** 切换当前照片的 rejected 状态 */
  function toggleRejected(): void {
    const idx = currentIndex.value;
    if (idx < 0) return;
    const next = new Set(rejected.value);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      next.add(idx);
    }
    rejected.value = next;
  }

  /** 切换当前照片的 flagged 状态 */
  function toggleFlagged(): void {
    const idx = currentIndex.value;
    if (idx < 0) return;
    const next = new Set(flagged.value);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      next.add(idx);
    }
    flagged.value = next;
  }

  /** 导航到上一张（跳过 rejected 的可选） */
  async function prev(): Promise<void> {
    if (currentIndex.value > 0) {
      currentIndex.value--;
      await loadCurrentImage();
    }
  }

  /** 导航到下一张 */
  async function next(): Promise<void> {
    if (currentIndex.value < photos.value.length - 1) {
      currentIndex.value++;
      await loadCurrentImage();
    }
  }

  /** 跳转到指定索引 */
  async function goTo(index: number): Promise<void> {
    if (index >= 0 && index < photos.value.length) {
      currentIndex.value = index;
      await loadCurrentImage();
    }
  }

  return {
    photos,
    currentIndex,
    ratings,
    rejected,
    flagged,
    currentImage,
    loading,
    error,
    currentPhoto,
    totalCount,
    ratedCount,
    currentRating,
    isCurrentRejected,
    isCurrentFlagged,
    openFolder,
    loadFiles,
    addFiles,
    setRating,
    toggleRejected,
    toggleFlagged,
    prev,
    next,
    goTo,
  };
});
