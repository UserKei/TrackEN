import { uploadUrl } from "@/apis"; // 头像上传地址前追剧
import defaultAvater from "@/assets/images/avatar/default-avatar.png"; // 默认头像
import { useUserStore } from "@/stores/user";
import { computed } from "vue";

export const useAvatar = () => {
  const userStore = useUserStore();
  const avatar = computed(() => {
    if (userStore.getUser?.avatar) {
      return uploadUrl + userStore.getUser.avatar;
    } else {
      return defaultAvater;
    }
  });

  const customAvatar = (avatar: string) => {
    if (avatar) {
      return uploadUrl + avatar;
    } else {
      return defaultAvater;
    }
  };

  return {
    avatar,
    customAvatar,
  };
};
