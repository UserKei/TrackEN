import { serverApi, type Response } from "..";
import type { UserLogin, UserRegister, WebResultUser } from "@en/common/user";

export const login = (data: UserLogin) =>
  serverApi.post("/user/login", data) as Promise<Response<WebResultUser>>;

export const register = (data: UserRegister) =>
  serverApi.post("/user/register", data) as Promise<Response<WebResultUser>>;
