import type { Token, UserUpdate, WebResultUser } from "@en/common/user";

const STORAGE_KEY = "tracken:user";

let currentUser: WebResultUser | null = null;
const listeners = new Set<(user: WebResultUser | null) => void>();

export function getCurrentUser() {
  return currentUser;
}

export function getAccessToken() {
  return currentUser?.token.accessToken;
}

export function getRefreshToken() {
  return currentUser?.token.refreshToken;
}

export function setCurrentUser(user: WebResultUser | null) {
  currentUser = user;
  if (typeof window !== "undefined") {
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }
  listeners.forEach((listener) => listener(currentUser));
}

export function hydrateCurrentUser() {
  if (typeof window === "undefined") return currentUser;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    currentUser = null;
    return currentUser;
  }

  try {
    currentUser = JSON.parse(raw) as WebResultUser;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    currentUser = null;
  }
  return currentUser;
}

export function updateCurrentToken(token: Token) {
  if (!currentUser) return;
  setCurrentUser({ ...currentUser, token });
}

export function updateCurrentUserInfo(update: UserUpdate) {
  if (!currentUser) return;
  setCurrentUser({ ...currentUser, ...update });
}

export function updateCurrentWordNumber(wordNumber: number) {
  if (!currentUser) return;
  setCurrentUser({ ...currentUser, wordNumber });
}

export function subscribeCurrentUser(listener: (user: WebResultUser | null) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
