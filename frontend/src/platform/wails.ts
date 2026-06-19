/**
 * Wails 平台适配器
 */

import {
  PlatformAPI,
  WindowAPI,
  ClipboardAPI,
  FileAPI,
  DialogAPI,
  LTWServiceAPI,
  TabInfo,
  HistoryItem,
} from "./base";

// Wails Runtime 导入
import { Window, Clipboard } from "@wailsio/runtime";

// Wails 后端服务导入

/**
 * Wails 窗口 API 实现
 */
class WailsWindowAPI extends WindowAPI {
  minimize(): void {
    Window.Minimise();
  }

  maximize(): void {
    Window.Maximise();
  }

  close(): void {
    Window.Close();
  }

  async isMaximized(): Promise<boolean> {
    return Window.IsMaximised();
  }
}

/**
 * Wails 剪贴板 API 实现
 */
class WailsClipboardAPI extends ClipboardAPI {
  async writeText(text: string): Promise<void> {
    return Clipboard.SetText(text);
  }

  async readText(): Promise<string> {
    return Clipboard.Text();
  }
}

/**
 * Wails 文件 API 实现
 */
class WailsFileAPI extends FileAPI {
  async selectFile(options?: {
    filters?: Array<{ name: string; extensions: string[] }>;
    multiple?: boolean;
  }): Promise<string[]> {
    // TODO: 实现 Wails 文件选择对话框
    console.warn("WailsFileAPI.selectFile not implemented yet");
    return [];
  }

  async selectFolder(): Promise<string> {
    // TODO: 实现 Wails 文件夹选择对话框
    console.warn("WailsFileAPI.selectFolder not implemented yet");
    return "";
  }
}

/**
 * Wails 对话框 API 实现
 */
class WailsDialogAPI extends DialogAPI {
  async showMessage(options: {
    title: string;
    message: string;
    type?: "info" | "warning" | "error";
  }): Promise<void> {
    // TODO: 实现 Wails 消息对话框
    console.warn("WailsDialogAPI.showMessage not implemented yet");
    alert(`${options.title}\n\n${options.message}`);
  }

  async showConfirm(options: {
    title: string;
    message: string;
  }): Promise<boolean> {
    // TODO: 实现 Wails 确认对话框
    console.warn("WailsDialogAPI.showConfirm not implemented yet");
    return confirm(`${options.title}\n\n${options.message}`);
  }
}

/**
 * Wails LTW 服务 API 实现
 */

/**
 * Wails 平台实现
 */
export class WailsPlatform extends PlatformAPI {
  readonly name = "wails";
  readonly window: WindowAPI;
  readonly clipboard: ClipboardAPI;
  readonly file: FileAPI;
  readonly dialog: DialogAPI;

  constructor() {
    super();
    this.window = new WailsWindowAPI();
    this.clipboard = new WailsClipboardAPI();
    this.file = new WailsFileAPI();
    this.dialog = new WailsDialogAPI();
  }

  async init(): Promise<void> {
    console.log("[Platform] Wails platform initialized");
  }
}
