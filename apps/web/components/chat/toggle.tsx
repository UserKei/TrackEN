"use client";

import { cn } from "@/lib/utils";

export function Toggle({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-bold transition-colors",
        active
          ? "border-primary/45 bg-primary/10 text-primary"
          : "border-border bg-secondary text-muted-foreground hover:bg-accent",
      )}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
