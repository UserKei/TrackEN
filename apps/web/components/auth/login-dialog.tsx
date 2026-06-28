"use client";

import { useState } from "react";
import md5 from "md5";
import { Lock, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { LoginModelViewer } from "@/components/three/login-model-viewer";
import { useAuth } from "@/hooks/use-auth";
import { loginApi, registerApi } from "@/lib/user-api";

type LoginType = "login" | "register";

export function LoginDialog() {
  const { loginOpen, setLoginOpen, setUser } = useAuth();
  const [type, setType] = useState<LoginType>("login");
  const [loginForm, setLoginForm] = useState({ phone: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const submitLogin = async () => {
    if (!/^1[3-9]\d{9}$/.test(loginForm.phone)) {
      toast.error("请输入正确的手机号");
      return;
    }
    if (!loginForm.password) {
      toast.error("请输入密码");
      return;
    }
    setLoading(true);
    try {
      const res = await loginApi({
        phone: loginForm.phone,
        password: md5(loginForm.password),
      });
      if (res.code === 200) {
        setUser(res.data);
        toast.success("登录成功");
      } else {
        toast.error(res.message || "登录失败");
      }
    } finally {
      setLoading(false);
    }
  };

  const submitRegister = async () => {
    if (registerForm.name.length < 2 || registerForm.name.length > 10) {
      toast.error("用户名长度为 2-10 位");
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(registerForm.phone)) {
      toast.error("请输入正确的手机号");
      return;
    }
    if (registerForm.password.length < 6 || registerForm.password.length > 16) {
      toast.error("密码长度为 6-16 位");
      return;
    }
    setLoading(true);
    try {
      const res = await registerApi({
        ...registerForm,
        password: md5(registerForm.password),
      });
      if (res.code === 200) {
        setUser(res.data);
        toast.success("注册成功");
      } else {
        toast.error(res.message || "注册失败");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
      <DialogContent className="max-h-[86vh] overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="sr-only">
          <DialogTitle>登录或注册</DialogTitle>
          <DialogDescription>登录 English App 以同步学习进度。</DialogDescription>
        </DialogHeader>
        <div className="grid min-h-[680px] md:grid-cols-[1.15fr_0.85fr]">
          <LoginModelViewer type={type} onChangeType={setType} />
          <div className="flex items-center bg-card p-8">
            {type === "login" ? (
              <div className="w-full">
                <div className="mb-8">
                  <h2 className="text-3xl font-black">欢迎回来</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    请登录您的账户以继续
                  </p>
                </div>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="login-phone">手机号</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <User />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="login-phone"
                        maxLength={11}
                        value={loginForm.phone}
                        placeholder="请输入手机号"
                        onChange={(event) =>
                          setLoginForm((value) => ({
                            ...value,
                            phone: event.target.value,
                          }))
                        }
                      />
                    </InputGroup>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="login-password">密码</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <Lock />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="login-password"
                        type="password"
                        value={loginForm.password}
                        placeholder="请输入密码"
                        onChange={(event) =>
                          setLoginForm((value) => ({
                            ...value,
                            password: event.target.value,
                          }))
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") void submitLogin();
                        }}
                      />
                    </InputGroup>
                  </Field>
                  <Button className="h-11 w-full" disabled={loading} onClick={submitLogin}>
                    {loading ? "登录中..." : "登录"}
                  </Button>
                </FieldGroup>
              </div>
            ) : (
              <div className="w-full">
                <div className="mb-8">
                  <h2 className="text-3xl font-black">欢迎注册</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    请填写以下信息以完成注册
                  </p>
                </div>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="register-name">用户名</FieldLabel>
                    <Input
                      id="register-name"
                      value={registerForm.name}
                      placeholder="请输入用户名"
                      onChange={(event) =>
                        setRegisterForm((value) => ({
                          ...value,
                          name: event.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="register-phone">手机号</FieldLabel>
                    <Input
                      id="register-phone"
                      maxLength={11}
                      value={registerForm.phone}
                      placeholder="请输入手机号"
                      onChange={(event) =>
                        setRegisterForm((value) => ({
                          ...value,
                          phone: event.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="register-email">邮箱</FieldLabel>
                    <Input
                      id="register-email"
                      value={registerForm.email}
                      placeholder="请输入邮箱，可选"
                      onChange={(event) =>
                        setRegisterForm((value) => ({
                          ...value,
                          email: event.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="register-password">密码</FieldLabel>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerForm.password}
                      placeholder="请输入密码"
                      onChange={(event) =>
                        setRegisterForm((value) => ({
                          ...value,
                          password: event.target.value,
                        }))
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") void submitRegister();
                      }}
                    />
                  </Field>
                  <Button className="h-11 w-full" disabled={loading} onClick={submitRegister}>
                    {loading ? "注册中..." : "注册"}
                  </Button>
                </FieldGroup>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
