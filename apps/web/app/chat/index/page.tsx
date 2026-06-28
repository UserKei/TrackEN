"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { marked } from "marked";
import { Mic, Pause, SendHorizontal } from "lucide-react";
import type {
  ChatDto,
  ChatMessage,
  ChatMessageList,
  ChatMode,
  ChatModeList,
  ChatRoleType,
} from "@en/common/chat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/chat/toggle";
import { CHAT_URL, getChatHistory, getChatMode } from "@/lib/chat-api";
import { sse } from "@/lib/sse";
import { useAuth } from "@/hooks/use-auth";
import { useVoiceToText } from "@/hooks/use-voice-to-text";

export default function ChatPage() {
  const { user, requireAuth } = useAuth();
  const [chatMode, setChatMode] = useState<ChatModeList>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [role, setRole] = useState<ChatRoleType>("normal");
  const [list, setList] = useState<ChatMessageList>([]);
  const [message, setMessage] = useState("");
  const [deepThink, setDeepThink] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { start, stop, isRecording } = useVoiceToText({
    lang: "zh-CN",
    continuous: true,
  });

  useEffect(() => {
    if (!requireAuth()) return;
    void getChatMode().then((res) => {
      setChatMode(res.data);
      const first = res.data[0];
      if (first) {
        setActiveId(first.id);
        setRole(first.role);
      }
    });
  }, [requireAuth]);

  useEffect(() => {
    if (!user?.id || !role) return;
    void getChatHistory(user.id, role).then((res) => {
      setList(res.data);
    });
  }, [role, user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [list]);

  const rendered = useMemo(
    () =>
      list.map((item) => ({
        ...item,
        html:
          item.role === "ai" && item.content
            ? (marked.parse(item.content, { async: false }) as string)
            : "",
      })),
    [list],
  );

  const changeRole = (mode: ChatMode) => {
    setActiveId(mode.id);
    setRole(mode.role);
  };

  const sendMessage = () => {
    if (!user?.id || !message.trim()) return;
    const content = message.trim();
    setMessage("");
    setList((value) => [
      ...value,
      { role: "human", content, type: "chat" },
      { role: "ai", content: "", reasoning: "", type: "chat" },
    ]);
    sse<ChatMessage, ChatDto>(
      CHAT_URL,
      "POST",
      {
        role,
        content,
        userId: user.id,
        deepThink,
        webSearch,
      },
      (data) => {
        setList((value) => {
          const next = [...value];
          const last = next[next.length - 1];
          if (!last || last.role !== "ai") return value;
          if (data.type === "reasoning") {
            last.reasoning = `${last.reasoning ?? ""}${data.content}`;
          }
          if (data.type === "chat") {
            last.content = `${last.content}${data.content}`;
          }
          return next;
        });
      },
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl gap-4 px-4 py-10">
      <aside className="hidden w-64 shrink-0 rounded-lg border bg-secondary/35 p-4 md:block">
        <div className="mb-3 text-sm font-black text-muted-foreground">对话模式</div>
        <div className="flex flex-col gap-2">
          {chatMode.map((mode) => (
            <Button
              key={mode.id}
              variant={activeId === mode.id ? "secondary" : "ghost"}
              className="justify-start"
              onClick={() => changeRole(mode)}
            >
              {mode.label}
            </Button>
          ))}
        </div>
      </aside>

      <section className="flex min-h-[740px] flex-1 flex-col rounded-lg border bg-accent/30">
        <ScrollArea className="flex-1 p-5">
          <div className="flex flex-col gap-5">
            {rendered.map((item, index) =>
              item.role === "human" ? (
                <div className="flex justify-end gap-3" key={`${item.role}-${index}`}>
                  <div className="max-w-[80%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
                    {item.content}
                  </div>
                  <Avatar className="size-9">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </div>
              ) : (
                <div className="flex justify-start gap-3" key={`${item.role}-${index}`}>
                  <Avatar className="size-9">
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 max-w-[85%]">
                    {item.reasoning ? (
                      <div className="mb-2 rounded-lg border bg-background/70 p-3 text-xs leading-5 text-muted-foreground">
                        {item.reasoning}
                      </div>
                    ) : null}
                    {item.html ? (
                      <div
                        className="deepseek-markdown rounded-lg bg-background p-3"
                        dangerouslySetInnerHTML={{ __html: item.html }}
                      />
                    ) : null}
                  </div>
                </div>
              ),
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        <div className="border-t bg-background/80 p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            <Toggle active={deepThink} onClick={() => setDeepThink((value) => !value)}>
              深度思考
            </Toggle>
            <Toggle active={webSearch} onClick={() => setWebSearch((value) => !value)}>
              联网搜索
            </Toggle>
          </div>
          <div className="flex gap-2">
            <Textarea
              value={message}
              rows={2}
              placeholder="请输入内容"
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button size="icon" onClick={sendMessage} title="发送">
              <SendHorizontal />
            </Button>
            <Button
              size="icon"
              variant={isRecording ? "secondary" : "default"}
              title={isRecording ? "停止录音" : "开始录音"}
              onClick={() => {
                if (isRecording) {
                  stop();
                  sendMessage();
                } else {
                  start(setMessage);
                }
              }}
            >
              {isRecording ? <Pause /> : <Mic />}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
