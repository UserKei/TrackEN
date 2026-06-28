import type {
  AvatarResult,
  UserLogin,
  UserRegister,
  UserUpdate,
  WebResultUser,
} from "@en/common/user";
import { serverApi, type Response } from "@/lib/api";

export const loginApi = (data: UserLogin) =>
  serverApi.post("/user/login", data) as Promise<Response<WebResultUser>>;

export const registerApi = (data: UserRegister) =>
  serverApi.post("/user/register", data) as Promise<Response<WebResultUser>>;

export const uploadAvatarApi = (file: FormData) =>
  serverApi.post("/user/upload-avatar", file) as Promise<
    Response<AvatarResult>
  >;

export const updateUserApi = (data: UserUpdate) =>
  serverApi.post("/user/update-user", data) as Promise<Response<UserUpdate>>;
