/**
 * Electron 平台适配器（示例实现）
 */

import {
  PlatformAPI,
  WindowAPI,
  ClipboardAPI,
  FileAPI,
  DialogAPI,
} from "./base";

/**
 * Electron 窗口 API 实现
 */
class ElectronWindowAPI extends WindowAPI {
  private get ipc() {
    return (window as any).electron?.ipcRenderer;
  }

  minimize(): void {
    this.ipc?.send("window:minimize");
  }

  maximize(): void {
    this.ipc?.send("window:maximize");
  }

  close(): void {
    this.ipc?.send("window:close");
  }

  async isMaximized(): Promise<boolean> {
    return this.ipc?.invoke("window:isMaximized") ?? false;
  }
}

/**
 * Electron 剪贴板 API 实现
 */
class ElectronClipboardAPI extends ClipboardAPI {
  private get ipc() {
    return (window as any).electron?.ipcRenderer;
  }

  async writeText(text: string): Promise<void> {
    return this.ipc?.invoke("clipboard:write", text);
  }

  async readText(): Promise<string> {
    return this.ipc?.invoke("clipboard:read") ?? "";
  }
}

/**
 * Electron 文件 API 实现
 */
class ElectronFileAPI extends FileAPI {
  private get ipc() {
    return (window as any).electron?.ipcRenderer;
  }

  async selectFile(options?: {
    filters?: Array<{ name: string; extensions: string[] }>;
    multiple?: boolean;
  }): Promise<string[]> {
    return this.ipc?.invoke("file:select", options) ?? [];
  }

  async selectFolder(): Promise<string> {
    return this.ipc?.invoke("folder:select") ?? "";
  }
}

/**
 * Electron 对话框 API 实现
 */
class ElectronDialogAPI extends DialogAPI {
  private get ipc() {
    return (window as any).electron?.ipcRenderer;
  }

  async showMessage(options: {
    title: string;
    message: string;
    type?: "info" | "warning" | "error";
  }): Promise<void> {
    return this.ipc?.invoke("dialog:message", options);
  }

  async showConfirm(options: {
    title: string;
    message: string;
  }): Promise<boolean> {
    return this.ipc?.invoke("dialog:confirm", options) ?? false;
  }
}

/**
 * Electron 平台实现
 */
export class ElectronPlatform extends PlatformAPI {
  readonly name = "electron";
  readonly window: WindowAPI;
  readonly clipboard: ClipboardAPI;
  readonly file: FileAPI;
  readonly dialog: DialogAPI;

  constructor() {
    super();
    this.window = new ElectronWindowAPI();
    this.clipboard = new ElectronClipboardAPI();
    this.file = new ElectronFileAPI();
    this.dialog = new ElectronDialogAPI();
  }

  async init(): Promise<void> {
    console.log("[Platform] Electron platform initialized");
  }
}
