"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";
import { SocketProvider } from "@/hooks/use-socket";
import { TrackerProvider } from "@/components/providers/tracker-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <AuthProvider>
        <SocketProvider>
          <TrackerProvider>{children}</TrackerProvider>
        </SocketProvider>
        <Toaster richColors position="top-center" />
      </AuthProvider>
    </TooltipProvider>
  );
}
