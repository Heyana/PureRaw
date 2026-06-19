/**
 * 平台抽象层入口
 * 自动检测当前平台并提供统一的 API
 */

import { PlatformAPI, PlatformType } from "./base";
import { WailsPlatform } from "./wails";
import { ElectronPlatform } from "./electron";
import { WebPlatform } from "./web";

// 尝试导入 Wails Runtime 用于平台检测
let WailsWindow: any = null;
try {
  const runtime = require("@wailsio/runtime");
  WailsWindow = runtime.Window;
} catch (e) {
  // 不是 Wails 环境
}

/**
 * 检测当前运行平台
 */
function detectPlatform(): PlatformType {
  // 检测 Wails - 尝试多种方法
  // 方法1: 检查全局变量
  if ((window as any).__WAILS__ || (window as any).wails) {
    return "wails";
  }

  // 方法2: 检查是否可以导入 Wails Runtime
  if (WailsWindow !== null) {
    return "wails";
  }

  // 方法3: 检查 URL 协议（Wails 使用 wails:// 或特殊的 localhost）
  if (
    window.location.protocol === "wails:" ||
    window.location.hostname === "wails.localhost"
  ) {
    return "wails";
  }

  // 检测 Electron
  if ((window as any).electron || (window as any).require) {
    return "electron";
  }

  // 默认为 Web
  return "web";
}

/**
 * 创建平台实例
 */
function createPlatform(): PlatformAPI {
  const type = detectPlatform();

  switch (type) {
    case "wails":
      return new WailsPlatform();
    case "electron":
      return new ElectronPlatform();
    case "web":
      return new WebPlatform();
    default:
      console.warn(`[Platform] Unknown platform, using web fallback`);
      return new WebPlatform();
  }
}

/**
 * 全局平台实例
 * 应用中所有地方都使用这个实例
 */
export const platform: PlatformAPI = createPlatform();

// 初始化平台
platform.init().catch((err) => {
  console.error("[Platform] Initialization failed:", err);
});

// 导出类型和基类（供扩展使用）
export * from "./base";
export { WailsPlatform } from "./wails";
export { ElectronPlatform } from "./electron";
export { WebPlatform } from "./web";
