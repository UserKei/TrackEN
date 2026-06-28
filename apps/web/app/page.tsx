"use client";

import { useEffect, useState } from "react";
import { Brain, MessageCircle, Mic, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hologram } from "@/components/three/hologram";
import { useAuth } from "@/hooks/use-auth";

const stats = [
  { suffix: "+", label: "累计学员", target: 1000000 },
  { suffix: "+", label: "精品课程", target: 500 },
  { suffix: "%", label: "学员满意度", target: 98 },
  { suffix: "+", label: "学习时长(小时)", target: 5000000 },
];

const abouts = [
  {
    icon: MessageCircle,
    title: "AI 情境学习",
    content: "沉浸式场景模拟，让你在真实语境中自然习得英语。",
  },
  {
    icon: Brain,
    title: "智能对话练习",
    content: "AI 实时纠错反馈，个性化对话训练，随时练习口语表达。",
  },
  {
    icon: Mic,
    title: "科学词汇记忆",
    content: "结合拼写练习与课程词库，让单词真正进入长期记忆。",
  },
];

export default function HomePage() {
  const { setLoginOpen } = useAuth();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startedAt = performance.now();
    let frame = 0;
    const tick = () => {
      const elapsed = performance.now() - startedAt;
      setProgress(Math.min(elapsed / 1500, 1));
      if (elapsed < 1500) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-10">
      <section className="relative overflow-hidden rounded-lg bg-[linear-gradient(135deg,oklch(0.18_0.03_260),oklch(0.28_0.07_250),oklch(0.65_0.13_188))] p-8 text-white">
        <div className="grid items-center gap-8 md:grid-cols-[1fr_0.85fr]">
          <div className="relative z-10 py-8">
            <Badge className="rounded-full bg-white/12 text-white hover:bg-white/20">
              坚持 5 天打卡学习
            </Badge>
            <h1 className="mt-8 text-3xl font-black leading-tight tracking-normal md:text-5xl">
              通过跟 AI 对话，提高你的英语水平
            </h1>
            <p className="mt-5 max-w-xl text-base font-semibold text-white/72">
              课程、词库、聊天和拼写练习放在同一个学习动线里，让每天的英语输入和输出都更连贯。
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => setLoginOpen(true)}>
                立即学习
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <a href="/courses/index">查看课程</a>
              </Button>
            </div>
          </div>
          <div className="relative z-10 flex justify-center">
            <Hologram />
          </div>
        </div>
      </section>

      <section className="py-12 text-center">
        <h2 className="text-2xl font-black">为什么选择我们?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          我们把 AI 对话、词汇课程和每日提醒串成一个可持续的学习闭环。
        </p>
      </section>

      <section className="grid gap-4 border-y py-10 md:grid-cols-4">
        {stats.map((item) => (
          <div className="text-center" key={item.label}>
            <div className="text-3xl font-black">
              {Math.round(item.target * progress).toLocaleString()}
              <span className="text-primary">{item.suffix}</span>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">{item.label}</div>
          </div>
        ))}
      </section>

      <section className="py-12 text-center">
        <Badge variant="secondary" className="gap-1">
          <Sparkles data-icon="inline-start" />
          核心优势
        </Badge>
        <h2 className="mt-4 text-3xl font-black">重新定义英语学习方式</h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          融合 AI 技术与语言学习场景，让每一分钟学习都能产生可见反馈。
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {abouts.map((item) => {
          const Icon = item.icon;
          return (
            <Card className="rounded-lg" key={item.title}>
              <CardContent className="p-8">
                <div className="grid size-14 place-items-center rounded-lg bg-accent">
                  <Icon className="size-7 text-primary" />
                </div>
                <h3 className="mt-6 text-xl font-black">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.content}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
