import { env } from "@/utils/env";
import axios, { type AxiosInstance, type AxiosResponse } from "axios";

// 创建 axios 实例
const instance: AxiosInstance = axios.create({
  baseURL: env.getEnvValue<string>("VITE_API_BASE_URL"),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 可以在这里添加 token
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error) => {
    // 统一错误处理
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权，跳转登录
          break;
        case 403:
          // 无权限
          break;
        case 404:
          // 资源不存在
          break;
        case 500:
          // 服务器错误
          break;
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
