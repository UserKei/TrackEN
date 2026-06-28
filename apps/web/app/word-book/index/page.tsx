"use client";

import { useEffect, useState } from "react";
import { BookOpen, Volume2 } from "lucide-react";
import type { Word, WordList, WordQuery } from "@en/common/word";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getWordBookList } from "@/lib/word-api";
import { useAudio } from "@/hooks/use-audio";

const filters: Array<keyof Pick<WordQuery, "gk" | "zk" | "gre" | "toefl" | "ielts" | "cet6" | "cet4" | "ky">> = [
  "gk",
  "zk",
  "gre",
  "toefl",
  "ielts",
  "cet6",
  "cet4",
  "ky",
];

const filterLabels: Record<(typeof filters)[number], string> = {
  gk: "高考",
  zk: "中考",
  gre: "GRE",
  toefl: "TOEFL",
  ielts: "IELTS",
  cet6: "六级",
  cet4: "四级",
  ky: "考研",
};

export default function WordBookPage() {
  const [query, setQuery] = useState<WordQuery>({
    page: 1,
    pageSize: 12,
    word: "",
    gk: false,
    zk: false,
    gre: false,
    toefl: false,
    ielts: false,
    cet6: false,
    cet4: false,
    ky: false,
  });
  const [total, setTotal] = useState<WordList["total"]>(0);
  const [list, setList] = useState<Word[]>([]);
  const { playAudio } = useAudio();

  const getList = async (nextQuery = query) => {
    const res = await getWordBookList(nextQuery);
    if (res.success) {
      setTotal(res.data.total);
      setList(res.data.list);
    }
  };

  useEffect(() => {
    void getList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.page, query.pageSize]);

  const searchWord = () => {
    const nextQuery = { ...query, page: 1 };
    setQuery(nextQuery);
    void getList(nextQuery);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <section className="rounded-lg bg-[linear-gradient(135deg,oklch(0.96_0.04_225),oklch(0.95_0.05_270))] p-8">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <BookOpen className="size-6 text-primary" />
            <h1 className="text-2xl font-black">词库列表</h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            词典来源：牛津、柯林斯、BNC、FRQ、高考、中考、GRE、TOEFL、IELTS、四六级、考研
          </p>
        </div>

        <div className="mb-8 flex flex-wrap items-center gap-4">
          <Input
            className="max-w-xs bg-background"
            value={query.word}
            placeholder="请输入单词"
            onChange={(event) =>
              setQuery((value) => ({ ...value, word: event.target.value }))
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") searchWord();
            }}
          />
          {filters.map((filter) => (
            <Label className="flex items-center gap-2" key={filter}>
              <Checkbox
                checked={!!query[filter]}
                onCheckedChange={(checked) =>
                  setQuery((value) => ({
                    ...value,
                    [filter]: checked === true,
                  }))
                }
              />
              {filterLabels[filter]}
            </Label>
          ))}
          <Button onClick={searchWord}>搜索</Button>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {list.map((item) => (
            <Card className="h-[220px] rounded-lg bg-background" key={item.id}>
              <CardContent className="p-4">
                <div className="text-sm font-black text-primary">{item.word}</div>
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  {item.phonetic}
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => playAudio(item.word)}
                    title="发音"
                  >
                    <Volume2 />
                  </Button>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-foreground/75">
                  {item.definition}
                </p>
                <div
                  className="mt-2 line-clamp-2 text-sm text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: item.translation ?? "" }}
                />
                <div className="mt-3 flex flex-wrap gap-1">
                  {filters.map((filter) =>
                    item[filter] ? (
                      <Badge variant="secondary" key={filter}>
                        {filterLabels[filter]}
                      </Badge>
                    ) : null,
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between text-sm text-muted-foreground">
          <span>共 {total} 个单词</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={query.page <= 1}
              onClick={() => setQuery((value) => ({ ...value, page: value.page - 1 }))}
            >
              上一页
            </Button>
            <Button
              variant="outline"
              disabled={query.page * query.pageSize >= total}
              onClick={() => setQuery((value) => ({ ...value, page: value.page + 1 }))}
            >
              下一页
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
