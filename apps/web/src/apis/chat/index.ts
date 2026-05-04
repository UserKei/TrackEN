import { aiApi, type Response } from "..";
import type { ChatMessageList, ChatModeList } from "@en/common/chat";

export const getChatMode = () =>
  aiApi.get("/prompt/list") as Promise<Response<ChatModeList>>;

export const getChatHistory = (userId: string, role: string) =>
  aiApi.get(`/chat/history?userId=${userId}&role=${role}`) as Promise<
    Response<ChatMessageList>
  >;
