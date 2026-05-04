import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { WebResultUser, Token, UpdateUser } from "@en/common/user";

export const useUserStore = defineStore(
  "user",
  () => {
    const user = ref<WebResultUser | null>(null); // 用户信息
    const setUser = (params: WebResultUser) => {
      user.value = params;
    };

    // 获取 accessToken
    const getAccessToken = computed(() => user.value?.token.accessToken);
    // 获取 refreshToken
    const getRefreshToken = computed(() => user.value?.token.refreshToken);
    // 更新 token 信息
    const updateToken = (newToken: Token) => {
      user.value!.token = newToken;
    };
    // 更新用户信息
    const updateUser = (params: UpdateUser) => {
      user.value!.name = params.name;
      user.value!.email = params.email;
      user.value!.address = params.address;
      user.value!.avatar = params.avatar;
      user.value!.bio = params.bio;
      user.value!.isTimingTask = params.isTimingTask;
      user.value!.timingTaskTime = params.timingTaskTime;
    };

    const getUpdateUserInfo = computed<UpdateUser>(() => {
      return {
        name: user.value!.name,
        email: user.value!.email,
        address: user.value!.address,
        avatar: user.value!.avatar,
        bio: user.value!.bio,
        isTimingTask: user.value!.isTimingTask,
        timingTaskTime: user.value!.timingTaskTime,
      };
    });

    const getUser = computed(() => user.value); // 获取用户信息
    const logout = () => {
      user.value = null; // 退出登录，清除用户信息
    };
    return {
      user,
      setUser,
      getUser,
      logout,
      getAccessToken,
      getRefreshToken,
      updateToken,
      updateUser,
      getUpdateUserInfo,
    };
  },
  { persist: true },
); // 开启持久化，数据将保存在 localStorage 中
