"use client";

import { useEffect, useRef } from "react";
import { Tracker } from "@en/tracker";
import { useAuth } from "@/hooks/use-auth";

export function TrackerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const trackerRef = useRef<Tracker | null>(null);

  useEffect(() => {
    trackerRef.current = new Tracker({
      baseUrl: "/api/v1",
      uv: {
        api: "/tracker/uv",
        updateApi: "/tracker/update-uv",
      },
      pv: {
        api: "/tracker/pv",
      },
      event: {
        api: "/tracker/event",
      },
      error: {
        api: "/tracker/error",
      },
      performance: {
        api: "/tracker/performance",
      },
    });
  }, []);

  useEffect(() => {
    if (user?.id) {
      void trackerRef.current?.setUserId(user.id);
    }
  }, [user?.id]);

  return children;
}
