"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io, type Socket } from "socket.io-client";
import { socketUrl } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

interface SocketContextValue {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!user?.id) {
      socketRef.current?.disconnect();
      socketRef.current?.removeAllListeners();
      socketRef.current = null;
      setSocket(null);
      return;
    }

    if (socketRef.current) return;

    socketRef.current = io(socketUrl, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      query: {
        userId: user.id,
      },
    });
    setSocket(socketRef.current);

    return () => {
      socketRef.current?.disconnect();
      socketRef.current?.removeAllListeners();
      socketRef.current = null;
      setSocket(null);
    };
  }, [user?.id]);

  const value = useMemo(() => ({ socket }), [socket]);

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used inside SocketProvider");
  }
  return context;
}
