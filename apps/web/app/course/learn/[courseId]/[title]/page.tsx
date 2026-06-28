"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Eye, EyeOff, Volume2 } from "lucide-react";
import { toast } from "sonner";
import type { Word } from "@en/common/word";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SkeletonBlock } from "@/components/course/skeleton-block";
import { getWordList, saveWordMasterApi } from "@/lib/learn-api";
import { useAudio } from "@/hooks/use-audio";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface WordItem {
  word: string;
  input: string;
  isTrue: boolean | undefined;
}

export default function LearnPage() {
  const params = useParams<{ courseId: string; title: string }>();
  const title = decodeURIComponent(params.title ?? "我的课程");
  const [isLoading, setIsLoading] = useState(false);
  const [list, setList] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isWordBlurred, setIsWordBlurred] = useState(true);
  const [wordList, setWordList] = useState<WordItem[]>([]);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const { playAudio } = useAudio();
  const { updateWordNumber, requireAuth } = useAuth();

  const currentWord = useMemo(() => list[currentIndex], [currentIndex, list]);

  useEffect(() => {
    if (!requireAuth()) return;
    const getWordListData = async () => {
      setIsLoading(true);
      const res = await getWordList(params.courseId);
      setIsLoading(false);
      if (res.success) {
        setList(res.data);
      } else {
        toast.error(res.message);
      }
    };
    void getWordListData();
  }, [params.courseId, requireAuth]);

  useEffect(() => {
    setIsWordBlurred(true);
    const current = currentWord?.word ?? "";
    setWordList(
      Array.from(current).map((item) => ({
        word: item,
        input: "",
        isTrue: undefined,
      })),
    );
  }, [currentWord?.word]);

  const pagePrev = () => {
    if (currentIndex <= 0) return;
    setCurrentIndex((value) => value - 1);
  };

  const pageNext = () => {
    if (wordList.some((item) => !item.isTrue)) {
      toast.error("请先完成拼写");
      return;
    }
    setCurrentIndex((value) => value + 1);
  };

  const saveWordMaster = async () => {
    const wordIds = list.map((item) => item.id);
    const res = await saveWordMasterApi(wordIds);
    if (res.success) {
      setCurrentIndex(0);
      updateWordNumber(res.data.wordNumber);
      toast.success(res.message);
      const next = await getWordList(params.courseId);
      if (next.success) setList(next.data);
    } else {
      toast.error(res.message);
    }
  };

  const onInput = (index: number, input: string) => {
    const char = input.slice(-1);
    setWordList((value) =>
      value.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, input: char, isTrue: item.word === char }
          : item,
      ),
    );
    if (char && index < wordList.length - 1) {
      window.setTimeout(() => inputRefs.current[index + 1]?.focus(), 0);
    }
  };

  const onKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      setWordList((value) =>
        value.map((item, itemIndex) =>
          itemIndex === index ? { ...item, input: "", isTrue: undefined } : item,
        ),
      );
      window.setTimeout(() => inputRefs.current[index - 1]?.focus(), 0);
    }
  };

  return (
    <div className="min-h-[60vh] bg-secondary/35">
      <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-12">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-black">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            请根据释义和翻译拼写单词
          </p>
        </header>

        {isLoading ? <SkeletonBlock /> : null}

        {!isLoading && list.length === 0 ? (
          <div className="flex justify-center py-20 text-sm text-muted-foreground">
            暂无单词或您尚未购买该课程
          </div>
        ) : null}

        {list.length > 0 && currentIndex >= list.length ? (
          <Card className="rounded-lg">
            <CardContent className="p-10 text-center">
              <p className="mb-6 text-muted-foreground">本组 10 个词已学完</p>
              <Button size="lg" onClick={saveWordMaster}>
                再练一组
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {currentWord && currentIndex < list.length ? (
          <div>
            <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                第 {currentIndex + 1} / {list.length} 个
              </span>
            </div>
            <Card className="rounded-lg">
              <CardContent className="p-8">
                <div className="relative mb-6 flex justify-center">
                  <div
                    className={cn(
                      "flex min-h-10 flex-col items-center text-center transition-all",
                      isWordBlurred && "select-none blur-md",
                    )}
                  >
                    <div className="text-3xl font-black text-primary">
                      {currentWord.word}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-mono text-muted-foreground">
                        {currentWord.phonetic}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="发音"
                        onClick={() => playAudio(currentWord.word)}
                      >
                        <Volume2 />
                      </Button>
                    </div>
                  </div>
                  <Button
                    className="absolute right-0 top-0"
                    variant="ghost"
                    size="icon"
                    title={isWordBlurred ? "显示单词" : "隐藏单词"}
                    onClick={() => setIsWordBlurred((value) => !value)}
                  >
                    {isWordBlurred ? <Eye /> : <EyeOff />}
                  </Button>
                </div>

                <div className="grid gap-4">
                  <InfoBlock title="释义" html={currentWord.definition ?? ""} />
                  <InfoBlock title="翻译" html={currentWord.translation ?? ""} />
                  <div className="rounded-lg border bg-secondary/35 p-4">
                    <p className="mb-4 text-xs font-bold uppercase tracking-normal text-muted-foreground">
                      拼写
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {wordList.map((item, index) => (
                        <input
                          key={`${item.word}-${index}`}
                          ref={(node) => {
                            inputRefs.current[index] = node;
                          }}
                          maxLength={1}
                          value={item.input}
                          onChange={(event) => onInput(index, event.target.value)}
                          onKeyDown={(event) => onKeyDown(index, event)}
                          className={cn(
                            "w-10 border-0 border-b-2 bg-transparent text-center text-2xl font-black outline-none",
                            item.isTrue === true && "border-primary",
                            item.isTrue === false && "border-destructive",
                            item.isTrue === undefined && "border-border",
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="outline" onClick={pagePrev}>
                    上一个
                  </Button>
                  <Button onClick={pageNext}>下一个</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function InfoBlock({ title, html }: { title: string; html: string }) {
  return (
    <div className="rounded-lg border bg-secondary/35 p-4">
      <p className="mb-2 text-xs font-bold uppercase tracking-normal text-muted-foreground">
        {title}
      </p>
      <div
        className="text-sm leading-6 text-foreground/75"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
