import axios from "axios";
import { useUserStore } from "@/stores/user";
import router from "@/router";
import { refreshTokenApi } from "./auth";
import { ElMessage } from "element-plus";

export const socketUrl = import.meta.env.DEV ? "ws://127.0.0.1:3000" : "";
export const uploadUrl = import.meta.env.DEV ? "http://127.0.0.1:9000" : "";
export const timeout = 50000;
export const serverApi = axios.create({
  baseURL: "/api/v1",
  timeout,
});

let isRefreshing = false; // 是否正在刷新 token
let requestQueue: ((newAccessToken: string) => void)[] = []; // 刷新 token 期间的请求队列

// 请求拦截器
serverApi.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    const accessToken = userStore.getAccessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
serverApi.interceptors.response.use(
  (res) => {
    return res.data;
  },
  async (error) => {
    if (error.code === "ERR_NETWORK") {
      ElMessage.error("网络异常，请稍后再试");
      return Promise.reject(error);
    }

    if (error.response.status !== 401) {
      ElMessage.error("服务器异常，请稍后再试");
      return Promise.reject(error);
    }
    const userStore = useUserStore();
    const refreshToken = userStore.getRefreshToken;
    const accessToken = userStore.getAccessToken;
    const originalRequest = error.config; //读取原始请求
    if (!accessToken || !refreshToken) {
      userStore.logout();
      ElMessage.error("登录状态已过期，请重新登录");
      router.push("/");
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        requestQueue.push((newAccessToken) => {
          error.config.headers.Authorization = `Bearer ${newAccessToken}`;
          resolve(serverApi(error.config));
        });
      });
    }

    // 刷新 token
    isRefreshing = true;
    try {
      const newToken = await refreshTokenApi({ refreshToken: refreshToken });
      if (newToken.success) {
        userStore.updateToken(newToken.data);
      } else {
        userStore.logout();
        ElMessage.error("登录状态已过期，请重新登录");
        router.push("/");
        return Promise.reject(newToken.message);
      }
      const newAccessToken = newToken.data.accessToken;
      requestQueue.forEach((callback) => callback(newAccessToken));

      return serverApi(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    } finally {
      requestQueue = [];
      isRefreshing = false;
    }
  },
);

export const aiApi = axios.create({
  baseURL: "/ai/v1",
  timeout,
});

aiApi.interceptors.response.use((res) => {
  return res.data;
});

export interface Response<T = any> {
  timestamp: string;
  path: string;
  message: string;
  code: number;
  success: boolean;
  data: T;
}
