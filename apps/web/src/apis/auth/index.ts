import axios from "axios";
import type { Token } from "@en/common/user";
import type { Response } from "..";

const refreshServer = axios.create({
  baseURL: "/api/v1",
  timeout: 50000,
});

// 响应拦截器
refreshServer.interceptors.response.use(
  (response) => {
    // 直接返回响应数据
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 导出刷新token的借口

export const refreshTokenApi = (data: Omit<Token, "accessToken">) =>
  refreshServer.post("/user/refresh-token", data) as Promise<Response<Token>>;
