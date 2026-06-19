/**
 * Web 平台适配器（浏览器降级方案）
 */

import {
  PlatformAPI,
  WindowAPI,
  ClipboardAPI,
  FileAPI,
  DialogAPI,
} from "./base";

/**
 * Web 窗口 API 实现（无操作）
 */
class WebWindowAPI extends WindowAPI {
  minimize(): void {
    console.warn("[Web] Window minimize not supported in browser");
  }

  maximize(): void {
    console.warn("[Web] Window maximize not supported in browser");
  }

  close(): void {
    console.warn("[Web] Window close not supported in browser");
    // 可以尝试关闭当前标签页
    // window.close();
  }

  async isMaximized(): Promise<boolean> {
    return false;
  }
}

/**
 * Web 剪贴板 API 实现
 */
class WebClipboardAPI extends ClipboardAPI {
  async writeText(text: string): Promise<void> {
    if (navigator.clipboard) {
      return navigator.clipboard.writeText(text);
    }
    // 降级方案
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }

  async readText(): Promise<string> {
    if (navigator.clipboard) {
      return navigator.clipboard.readText();
    }
    console.warn("[Web] Clipboard read not supported");
    return "";
  }
}

/**
 * Web 文件 API 实现
 */
class WebFileAPI extends FileAPI {
  async selectFile(options?: {
    filters?: Array<{ name: string; extensions: string[] }>;
    multiple?: boolean;
  }): Promise<string[]> {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = options?.multiple ?? false;

      if (options?.filters) {
        const accept = options.filters
          .flatMap((f) => f.extensions.map((ext) => `.${ext}`))
          .join(",");
        input.accept = accept;
      }

      input.onchange = () => {
        const files = Array.from(input.files || []).map((f) => f.name);
        resolve(files);
      };

      input.click();
    });
  }

  async selectFolder(): Promise<string> {
    console.warn("[Web] Folder selection not fully supported in browser");
    return "";
  }
}

/**
 * Web 对话框 API 实现
 */
class WebDialogAPI extends DialogAPI {
  async showMessage(options: {
    title: string;
    message: string;
    type?: "info" | "warning" | "error";
  }): Promise<void> {
    alert(`${options.title}\n\n${options.message}`);
  }

  async showConfirm(options: {
    title: string;
    message: string;
  }): Promise<boolean> {
    return confirm(`${options.title}\n\n${options.message}`);
  }
}

/**
 * Web 平台实现
 */
export class WebPlatform extends PlatformAPI {
  readonly name = "web";
  readonly window: WindowAPI;
  readonly clipboard: ClipboardAPI;
  readonly file: FileAPI;
  readonly dialog: DialogAPI;

  constructor() {
    super();
    this.window = new WebWindowAPI();
    this.clipboard = new WebClipboardAPI();
    this.file = new WebFileAPI();
    this.dialog = new WebDialogAPI();
  }

  async init(): Promise<void> {
    console.log("[Platform] Web platform initialized (fallback mode)");
  }
}
