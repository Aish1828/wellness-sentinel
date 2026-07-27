import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/types/health";

const config: Record<RiskLevel, { pct: number; text: string; dot: string; blurb: string }> = {
  Low: { pct: 18, text: "text-success", dot: "bg-success", blurb: "Your current signals look protective." },
  Moderate: { pct: 44, text: "text-warning", dot: "bg-warning", blurb: "A few habits are worth tightening." },
  Elevated: { pct: 70, text: "text-warning", dot: "bg-warning", blurb: "Several factors are stacking up." },
  High: { pct: 92, text: "text-destructive", dot: "bg-destructive", blurb: "Prioritise the flagged areas soon." },
};

export function RiskMeter({ level, className }: { level: RiskLevel; className?: string }) {
  const c = config[level];
  return (
    <div className={cn("rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-base">Risk meter</h3>
        <span className={cn("flex items-center gap-2 text-sm font-medium", c.text)}>
          <span className={cn("size-2 rounded-full", c.dot)} aria-hidden />
          {level} risk
        </span>
      </div>

      <div className="relative mt-6 h-3 overflow-hidden rounded-full bg-muted">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-success via-warning to-destructive opacity-35" />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${c.pct}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-success via-warning to-destructive"
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>Low</span>
        <span>Moderate</span>
        <span>Elevated</span>
        <span>High</span>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{c.blurb}</p>
    </div>
  );
}
