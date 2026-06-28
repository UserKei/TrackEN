"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { UserUpdate } from "@en/common/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { avatarSrc } from "@/hooks/use-avatar";
import { useAuth } from "@/hooks/use-auth";
import { updateUserApi, uploadAvatarApi } from "@/lib/user-api";

const emptyForm: UserUpdate = {
  name: "",
  email: "",
  address: "",
  avatar: "",
  bio: "",
  isTimingTask: false,
  timingTaskTime: "00:00:00",
};

export default function SettingPage() {
  const router = useRouter();
  const { user, requireAuth, updateUser, logout } = useAuth();
  const [form, setForm] = useState<UserUpdate>(emptyForm);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!requireAuth()) return;
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        address: user.address,
        avatar: user.avatar,
        bio: user.bio,
        isTimingTask: user.isTimingTask,
        timingTaskTime: user.timingTaskTime,
      });
      setPreviewUrl(avatarSrc(user.avatar));
    }
  }, [requireAuth, user]);

  const onAvatarSelect = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await uploadAvatarApi(formData);
    if (res.success && res.data) {
      setForm((value) => ({ ...value, avatar: res.data.databaseUrl }));
      setPreviewUrl(res.data.previewUrl);
    } else {
      toast.error("上传头像失败");
    }
  };

  const onSave = async () => {
    if (!form.name.trim()) {
      toast.error("请输入用户名");
      return;
    }
    if (form.email && !/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(form.email)) {
      toast.error("请输入正确的邮箱");
      return;
    }
    const res = await updateUserApi(form);
    if (res.success && res.data) {
      updateUser(res.data);
      toast.success("更新成功");
    } else {
      toast.error(res.message);
    }
  };

  const reset = () => {
    if (!user) return;
    setForm({
      name: user.name,
      email: user.email,
      address: user.address,
      avatar: user.avatar,
      bio: user.bio,
      isTimingTask: user.isTimingTask,
      timingTaskTime: user.timingTaskTime,
    });
    setPreviewUrl(avatarSrc(user.avatar));
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">设置</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            在这里修改你的个人信息与头像
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={reset}>
            重置
          </Button>
          <Button onClick={onSave}>保存</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.4fr]">
        <div className="flex flex-col gap-4">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>头像</CardTitle>
              <CardDescription>支持 png、jpg、webp</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Avatar className="size-20 border">
                <AvatarImage src={previewUrl || avatarSrc(user?.avatar)} />
                <AvatarFallback>{user?.name?.slice(0, 1) ?? "E"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <Input
                  accept="image/*"
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void onAvatarSelect(file);
                  }}
                />
                <p className="text-xs text-muted-foreground">建议小于 2MB</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>账号</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">登录状态</span>
              <span className="font-bold text-primary">已登录</span>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>个人信息</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">用户名</FieldLabel>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(event) =>
                      setForm((value) => ({ ...value, name: event.target.value }))
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">邮箱</FieldLabel>
                  <Input
                    id="email"
                    value={form.email ?? ""}
                    onChange={(event) =>
                      setForm((value) => ({ ...value, email: event.target.value }))
                    }
                  />
                </Field>
                <Field orientation="horizontal">
                  <FieldLabel htmlFor="timing">定时任务</FieldLabel>
                  <Switch
                    id="timing"
                    checked={form.isTimingTask}
                    onCheckedChange={(checked) =>
                      setForm((value) => ({ ...value, isTimingTask: checked }))
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="time">定时任务时间</FieldLabel>
                  <Input
                    id="time"
                    type="time"
                    step="1"
                    value={form.timingTaskTime}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        timingTaskTime: event.target.value,
                      }))
                    }
                  />
                  <FieldDescription>
                    只有填写邮箱并且开启定时任务，才能收到每日打卡提醒
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="address">地址</FieldLabel>
                  <Input
                    id="address"
                    value={form.address ?? ""}
                    onChange={(event) =>
                      setForm((value) => ({ ...value, address: event.target.value }))
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="bio">签名</FieldLabel>
                  <Textarea
                    id="bio"
                    rows={4}
                    maxLength={120}
                    value={form.bio ?? ""}
                    onChange={(event) =>
                      setForm((value) => ({ ...value, bio: event.target.value }))
                    }
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>危险操作</CardTitle>
              <CardDescription>清除本地登录状态</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <div className="font-black">退出登录</div>
                <p className="text-sm text-muted-foreground">清除本地登录状态</p>
              </div>
              <Button
                variant="destructive"
                onClick={() => {
                  if (window.confirm("确定要退出登录吗？")) {
                    logout();
                    router.push("/");
                  }
                }}
              >
                退出
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
