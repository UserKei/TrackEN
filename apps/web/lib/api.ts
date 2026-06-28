import axios from "axios";
import { toast } from "sonner";
import type { Token } from "@en/common/user";
import {
  getAccessToken,
  getRefreshToken,
  setCurrentUser,
  updateCurrentToken,
} from "@/lib/auth-session";

export const socketUrl =
  process.env.NEXT_PUBLIC_SOCKET_URL ??
  (process.env.NODE_ENV === "development" ? "ws://127.0.0.1:3000" : "");
export const uploadUrl =
  process.env.NEXT_PUBLIC_UPLOAD_URL ??
  (process.env.NODE_ENV === "development" ? "http://127.0.0.1:9000" : "");

export const timeout = 50000;

export interface Response<T = unknown> {
  timestamp: string;
  path: string;
  message: string;
  code: number;
  success: boolean;
  data: T;
}

const refreshServer = axios.create({
  baseURL: "/api/v1",
  timeout,
});

refreshServer.interceptors.response.use((response) => response.data);

export const refreshTokenApi = (data: Omit<Token, "accessToken">) =>
  refreshServer.post("/user/refresh-token", data) as Promise<Response<Token>>;

export const serverApi = axios.create({
  baseURL: "/api/v1",
  timeout,
});

let isRefreshing = false;
let requestQueue: ((newAccessToken: string) => void)[] = [];

serverApi.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

serverApi.interceptors.response.use(
  (res) => res.data,
  async (error) => {
    if (error.code === "ERR_NETWORK") {
      toast.error("网络异常，请稍后再试");
      return Promise.reject(error);
    }

    if (error.response?.status !== 401) {
      toast.error(error.response?.data?.message ?? "服务器异常，请稍后再试");
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    const accessToken = getAccessToken();
    const originalRequest = error.config;

    if (!accessToken || !refreshToken) {
      setCurrentUser(null);
      toast.error("登录状态已过期，请重新登录");
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

    isRefreshing = true;
    try {
      const newToken = await refreshTokenApi({ refreshToken });
      if (!newToken.success) {
        setCurrentUser(null);
        toast.error("登录状态已过期，请重新登录");
        return Promise.reject(newToken.message);
      }

      updateCurrentToken(newToken.data);
      const newAccessToken = newToken.data.accessToken;
      requestQueue.forEach((callback) => callback(newAccessToken));
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return serverApi(originalRequest);
    } catch (refreshError) {
      setCurrentUser(null);
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

aiApi.interceptors.response.use((res) => res.data);
