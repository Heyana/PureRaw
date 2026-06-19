/**
 * 平台 API 接口定义
 * 所有平台适配器都必须实现这个接口
 */

export interface IWindowAPI {
  minimize(): void;
  maximize(): void;
  close(): void;
  isMaximized(): Promise<boolean>;
  toggleMaximize(): void;
}

export interface IClipboardAPI {
  writeText(text: string): Promise<void>;
  readText(): Promise<string>;
}

export interface IFileAPI {
  selectFile(options?: {
    filters?: Array<{ name: string; extensions: string[] }>;
    multiple?: boolean;
  }): Promise<string[]>;
  selectFolder(): Promise<string>;
}

export interface IDialogAPI {
  showMessage(options: {
    title: string;
    message: string;
    type?: "info" | "warning" | "error";
  }): Promise<void>;
  showConfirm(options: { title: string; message: string }): Promise<boolean>;
}

// LTW 服务相关类型
export interface TabInfo {
  id: string;
  file_path: string;
  file_name: string;
  file_count: number;
  created_at: string;
}

export interface HistoryItem {
  id: number;
  file_path: string;
  file_name: string;
  file_size: number;
  file_count: number;
  opened_at: string;
}

export interface ILTWServiceAPI {
  openLTW(filePath: string): Promise<TabInfo>;
  closeLTW(tabId: string): Promise<void>;
  listTabs(): Promise<TabInfo[]>;
  getHistory(): Promise<HistoryItem[]>;
  removeHistory(filePath: string): Promise<void>;
  clearHistory(): Promise<void>;
  getServerURL(tabId: string): Promise<string>;
  packFolder(folderPath: string, outputPath: string): Promise<void>;
}

/**
 * 窗口 API 抽象基类
 * 默认所有方法抛出"不支持"错误，子类按需实现
 */
export class WindowAPI {
  minimize(): void {
    throw new Error("Window.minimize() not supported on this platform");
  }

  maximize(): void {
    throw new Error("Window.maximize() not supported on this platform");
  }

  close(): void {
    throw new Error("Window.close() not supported on this platform");
  }

  async isMaximized(): Promise<boolean> {
    throw new Error("Window.isMaximized() not supported on this platform");
  }

  async toggleMaximize(): Promise<void> {
    const isMax = await this.isMaximized();
    if (isMax) {
      this.maximize();
    } else {
      this.maximize();
    }
  }
}

/**
 * 剪贴板 API 抽象基类
 * 默认所有方法抛出"不支持"错误，子类按需实现
 */
export class ClipboardAPI {
  async writeText(_text: string): Promise<void> {
    throw new Error("Clipboard.writeText() not supported on this platform");
  }

  async readText(): Promise<string> {
    throw new Error("Clipboard.readText() not supported on this platform");
  }
}

/**
 * 文件 API 抽象基类
 * 默认所有方法抛出"不支持"错误，子类按需实现
 */
export class FileAPI {
  async selectFile(_options?: {
    filters?: Array<{ name: string; extensions: string[] }>;
    multiple?: boolean;
  }): Promise<string[]> {
    throw new Error("File.selectFile() not supported on this platform");
  }

  async selectFolder(): Promise<string> {
    throw new Error("File.selectFolder() not supported on this platform");
  }
}

/**
 * 对话框 API 抽象基类
 * 默认所有方法抛出"不支持"错误，子类按需实现
 */
export class DialogAPI {
  async showMessage(_options: {
    title: string;
    message: string;
    type?: "info" | "warning" | "error";
  }): Promise<void> {
    throw new Error("Dialog.showMessage() not supported on this platform");
  }

  async showConfirm(_options: {
    title: string;
    message: string;
  }): Promise<boolean> {
    throw new Error("Dialog.showConfirm() not supported on this platform");
  }
}

/**
 * LTW 服务 API 抽象基类
 * 默认所有方法抛出"不支持"错误，子类按需实现
 */
export class LTWServiceAPI {
  async openLTW(_filePath: string): Promise<TabInfo> {
    throw new Error("LTWService.openLTW() not supported on this platform");
  }

  async closeLTW(_tabId: string): Promise<void> {
    throw new Error("LTWService.closeLTW() not supported on this platform");
  }

  async listTabs(): Promise<TabInfo[]> {
    throw new Error("LTWService.listTabs() not supported on this platform");
  }

  async getHistory(): Promise<HistoryItem[]> {
    throw new Error("LTWService.getHistory() not supported on this platform");
  }

  async removeHistory(_filePath: string): Promise<void> {
    throw new Error(
      "LTWService.removeHistory() not supported on this platform",
    );
  }

  async clearHistory(): Promise<void> {
    throw new Error("LTWService.clearHistory() not supported on this platform");
  }

  async getServerURL(_tabId: string): Promise<string> {
    throw new Error("LTWService.getServerURL() not supported on this platform");
  }

  async packFolder(_folderPath: string, _outputPath: string): Promise<void> {
    throw new Error("LTWService.packFolder() not supported on this platform");
  }
}

/**
 * 平台 API 抽象基类
 * 所有平台适配器都必须继承此类
 */
export class PlatformAPI {
  readonly name: string = "unknown";
  readonly window: WindowAPI = new WindowAPI();
  readonly clipboard: ClipboardAPI = new ClipboardAPI();
  readonly file: FileAPI = new FileAPI();
  readonly dialog: DialogAPI = new DialogAPI();
  readonly ltwService: LTWServiceAPI = new LTWServiceAPI();

  /**
   * 平台初始化（可选）
   */
  async init(): Promise<void> {
    // 默认空实现，子类可以重写
  }

  /**
   * 平台清理（可选）
   */
  async destroy(): Promise<void> {
    // 默认空实现，子类可以重写
  }
}

/**
 * 平台类型
 */
export type PlatformType = "wails" | "electron" | "web" | "unknown";
