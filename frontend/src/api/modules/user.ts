import { api } from "../index";
import type { ApiResponse } from "../types";

// 用户信息类型
export interface UserInfo {
  id: number;
  username: string;
  email: string;
}

// 登录参数
export interface LoginParams {
  username: string;
  password: string;
}

// 用户相关 API
export const userApi = {
  // 登录
  login(params: LoginParams): Promise<ApiResponse<{ token: string }>> {
    return api.post("/user/login", params);
  },

  // 获取用户信息
  getUserInfo(): Promise<ApiResponse<UserInfo>> {
    return api.get("/user/info");
  },

  // 登出
  logout(): Promise<ApiResponse<null>> {
    return api.post("/user/logout");
  },
};
