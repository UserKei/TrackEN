import type { WordList, WordQuery } from "@en/common/word";
import { serverApi, type Response } from "@/lib/api";

export const getWordBookList = (params: Partial<WordQuery>) =>
  serverApi.get("/word-book", { params }) as Promise<Response<WordList>>;
