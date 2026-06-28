import type { ChatMessageList, ChatModeList } from "@en/common/chat";
import { aiApi, type Response } from "@/lib/api";

export const CHAT_URL = "/ai/v1/chat";

export const getChatMode = () =>
  aiApi.get("/prompt/list") as Promise<Response<ChatModeList>>;

export const getChatHistory = (userId: string, role: string) =>
  aiApi.get(`/chat/history?userId=${userId}&role=${role}`) as Promise<
    Response<ChatMessageList>
  >;
