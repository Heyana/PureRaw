import request from "./request";
import type { ApiResponse } from "./types";

// 封装常用请求方法
export const api = {
  get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    return request.get(url, { params });
  },

  post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return request.post(url, data);
  },

  put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return request.put(url, data);
  },

  delete<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    return request.delete(url, { params });
  },
};

export * from "./types";
