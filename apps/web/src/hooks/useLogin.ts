import { IS_SHOW_LOGIN } from "@/components/Login/type";
import { log } from "three";
import { inject, ref } from "vue";
import { useUserStore } from "@/stores/user";

export const useLogin = () => {
  const isShowLogin = inject(IS_SHOW_LOGIN, ref(false)); // 注入登录框显示状态
  const userStore = useUserStore(); // 获取用户状态管理
  const login = () => {
    return new Promise((resolve, reject) => {
      if (userStore.getUser) {
        resolve(true); // 已经登录，直接返回成功
      } else {
        isShowLogin.value = true; // 显示登录框
        reject(false);
      }
    });
  };

  const hide = () => {
    isShowLogin.value = false; // 隐藏登录框
  };

  return {
    login,
    hide,
  };
};
