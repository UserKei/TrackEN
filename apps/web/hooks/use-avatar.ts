"use client";

import { uploadUrl } from "@/lib/api";

export const defaultAvatar = "/images/default-avatar.png";

export const avatarSrc = (avatar?: string | null) => {
  if (!avatar) return defaultAvatar;
  if (avatar.startsWith("http")) return avatar;
  return `${uploadUrl}${avatar}`;
};
