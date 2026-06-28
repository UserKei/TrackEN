"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import type { Word } from "@en/common/word";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getWordBookList } from "@/lib/word-api";

export function CommandSearch() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [wordList, setWordList] = useState<Word[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "f" && event.ctrlKey) {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setWordList([]);
      return;
    }
    window.setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  useEffect(() => {
    if (!search.trim()) {
      setWordList([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      const res = await getWordBookList({ word: search, page: 1, pageSize: 20 });
      if (res.success) {
        setWordList(res.data.list);
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [search]);

  const copyWord = async (word: string) => {
    try {
      await navigator.clipboard.writeText(word);
      toast.success("复制成功");
    } catch {
      toast.error("复制失败");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="top-[18%] max-w-2xl translate-y-0 p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>搜索单词</DialogTitle>
          <DialogDescription>搜索并复制词库中的单词。</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 border-b p-4">
          <Search className="size-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={search}
            placeholder="搜索"
            className="border-0 shadow-none focus-visible:ring-0"
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="max-h-[520px] overflow-y-auto">
          {wordList.map((item) => (
            <button
              key={item.id}
              className="block w-full border-b p-4 text-left transition-colors hover:bg-accent"
              type="button"
              onClick={() => void copyWord(item.word)}
            >
              <div className="text-sm font-black text-primary">{item.word}</div>
              <div
                className="mt-1 line-clamp-2 text-sm text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: item.translation ?? "" }}
              />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
