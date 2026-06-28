"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Bot,
  GraduationCap,
  Home,
  Settings,
  Sparkles,
  Star,
  Sun,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { avatarSrc } from "@/hooks/use-avatar";
import { cn } from "@/lib/utils";

const routes = [
  { path: "/", name: "主页", icon: Home, isAuth: false },
  { path: "/chat/index", name: "聊天", icon: Bot, isAuth: true },
  { path: "/word-book/index", name: "词库", icon: BookOpen, isAuth: false },
  { path: "/courses/index", name: "课程", icon: GraduationCap, isAuth: false },
  { path: "/setting/index", name: "设置", icon: Settings, isAuth: true },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, requireAuth, logout, setLoginOpen } = useAuth();

  const go = (path: string, isAuth: boolean) => {
    if (isAuth && !requireAuth()) return;
    router.push(path);
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background/92 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link className="flex items-center gap-3" href="/">
          <div className="grid size-10 place-items-center rounded-lg bg-primary text-xl font-black text-primary-foreground">
            E
          </div>
          <div className="hidden text-xl font-black tracking-normal text-foreground sm:block">
            English App
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {routes.map((route) => {
            const Icon = route.icon;
            const active = pathname === route.path;
            return (
              <Button
                key={route.path}
                variant={active ? "secondary" : "ghost"}
                size="sm"
                className={cn(active && "text-primary")}
                onClick={() => go(route.path, route.isAuth)}
              >
                <Icon data-icon="inline-start" />
                {route.name}
              </Button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="hidden gap-1 sm:flex">
            <Sun data-icon="inline-start" />
            {user?.wordNumber ?? 0}
          </Badge>
          <Badge variant="outline" className="hidden gap-1 sm:flex">
            <Star data-icon="inline-start" />
            {user?.dayNumber ?? 0}
          </Badge>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="h-11 gap-3 px-2">
                <Avatar className="size-9">
                  <AvatarImage src={avatarSrc(user?.avatar)} alt={user?.name ?? "游客"} />
                  <AvatarFallback>{user?.name?.slice(0, 1) ?? "E"}</AvatarFallback>
                </Avatar>
                <span className="hidden max-w-20 truncate text-sm font-bold sm:block">
                  {user?.name ?? "游客"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <section className="overflow-hidden rounded-lg">
                <div className="flex items-center gap-3 p-4">
                  <Avatar className="size-12">
                    <AvatarImage src={avatarSrc(user?.avatar)} alt={user?.name ?? "游客"} />
                    <AvatarFallback>{user?.name?.slice(0, 1) ?? "E"}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-black">
                      {user?.name ?? "游客"}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {user?.bio || "登录后同步词库进度与打卡数据"}
                    </p>
                  </div>
                </div>
                {user ? (
                  <div className="grid grid-cols-2 gap-2 px-4 pb-4">
                    <div className="rounded-lg border bg-secondary/50 p-3">
                      <div className="text-xs text-muted-foreground">单词数量</div>
                      <div className="text-lg font-black">{user.wordNumber}</div>
                    </div>
                    <div className="rounded-lg border bg-accent/50 p-3">
                      <div className="text-xs text-muted-foreground">打卡天数</div>
                      <div className="text-lg font-black">{user.dayNumber}</div>
                    </div>
                  </div>
                ) : null}
                <Separator />
                <div className="flex gap-2 p-4">
                  {user ? (
                    <>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.push("/setting/index")}
                      >
                        <Sparkles data-icon="inline-start" />
                        个人资料
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => {
                          if (window.confirm("确定要退出登录吗？")) {
                            logout();
                            router.push("/");
                          }
                        }}
                      >
                        退出
                      </Button>
                    </>
                  ) : (
                    <Button className="flex-1" onClick={() => setLoginOpen(true)}>
                      去登录
                    </Button>
                  )}
                </div>
              </section>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
