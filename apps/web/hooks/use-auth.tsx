"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { UserUpdate, WebResultUser } from "@en/common/user";
import {
  hydrateCurrentUser,
  setCurrentUser,
  subscribeCurrentUser,
  updateCurrentUserInfo,
  updateCurrentWordNumber,
} from "@/lib/auth-session";

interface AuthContextValue {
  user: WebResultUser | null;
  loginOpen: boolean;
  setLoginOpen: (open: boolean) => void;
  requireAuth: () => boolean;
  setUser: (user: WebResultUser) => void;
  logout: () => void;
  updateUser: (user: UserUpdate) => void;
  updateWordNumber: (wordNumber: number) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<WebResultUser | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    setUserState(hydrateCurrentUser());
    return subscribeCurrentUser(setUserState);
  }, []);

  const setUser = useCallback((nextUser: WebResultUser) => {
    setCurrentUser(nextUser);
    setLoginOpen(false);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const requireAuth = useCallback(() => {
    if (user) return true;
    setLoginOpen(true);
    return false;
  }, [user]);

  const updateUser = useCallback((update: UserUpdate) => {
    updateCurrentUserInfo(update);
  }, []);

  const updateWordNumber = useCallback((wordNumber: number) => {
    updateCurrentWordNumber(wordNumber);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loginOpen,
      setLoginOpen,
      requireAuth,
      setUser,
      logout,
      updateUser,
      updateWordNumber,
    }),
    [loginOpen, logout, requireAuth, setUser, updateUser, updateWordNumber, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
