import { ShieldPlus } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <span className="gradient-warm grid size-9 shrink-0 place-items-center rounded-2xl shadow-[var(--shadow-soft)]">
        <ShieldPlus className="size-4.5" aria-hidden />
      </span>
      {!compact && (
        <span className="truncate font-serif text-lg font-semibold tracking-tight">HealthGuard AI</span>
      )}
    </span>
  );
}
