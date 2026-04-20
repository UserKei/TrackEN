import { serverApi, type Response } from "..";
import type { WordQuery, WordList } from "@en/common/word";

export const getWordBookList = (
  params: WordQuery,
): Promise<Response<WordList>> => {
  // return serverApi.get<Response<{ total: number; list: WordList }>>(
  //   "/word-book",
  //   {
  //     params,
  //   },
  // );
  return serverApi.get("/word-book", {
    params,
  }) as Promise<Response<WordList>>;
};
