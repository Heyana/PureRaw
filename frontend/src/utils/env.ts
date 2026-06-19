// 定义环境模式类型
export type EnvMode = "development" | "production";

// 定义输出目录类型
export type OutDir = "dist/dev" | "dist/prod";

// 定义环境变量接口
export interface ImportMetaEnv {
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly PROD: boolean;
  readonly DEV: boolean;
  readonly SSR: boolean;
  // 自定义环境变量（根据需要扩展）
  readonly VITE_APP_TITLE?: string;
  readonly VITE_API_BASE_URL?: string;
  [key: string]: any;
}

// 环境工具类
class EnvUtil {
  private readonly outDirMap: Record<EnvMode, OutDir> = {
    development: "dist/dev",
    production: "dist/prod",
  };

  /**
   * 获取当前模式
   */
  getMode(): EnvMode {
    return import.meta.env.MODE as EnvMode;
  }

  /**
   * 判断是否为开发环境
   */
  isDev(): boolean {
    return import.meta.env.DEV;
  }

  /**
   * 判断是否为生产环境
   */
  isProd(): boolean {
    return import.meta.env.PROD;
  }

  /**
   * 判断是否为SSR模式
   */
  isSSR(): boolean {
    return import.meta.env.SSR;
  }

  /**
   * 获取基础URL
   */
  getBaseUrl(): string {
    return import.meta.env.BASE_URL;
  }

  /**
   * 获取所有环境变量
   */
  getEnv(): ImportMetaEnv {
    return import.meta.env as ImportMetaEnv;
  }

  /**
   * 获取指定的环境变量
   */
  getEnvValue<T = any>(key: string): T | undefined {
    return import.meta.env[key] as T | undefined;
  }

  /**
   * 获取构建输出目录名称
   */
  getOutDir(): OutDir {
    const mode = this.getMode();
    return this.outDirMap[mode] || "dist/prod";
  }

  /**
   * 判断是否为指定模式
   */
  isMode(mode: EnvMode): boolean {
    return this.getMode() === mode;
  }
}

export const env = new EnvUtil();
