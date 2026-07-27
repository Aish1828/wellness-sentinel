import { motion } from "framer-motion";
import { ProgressRing } from "./progress-ring";
import { cn } from "@/lib/utils";
import type { RiskLevel, ScoreFactor } from "@/types/health";

interface Props {
  score: number;
  riskLevel: RiskLevel;
  breakdown: ScoreFactor[];
  className?: string;
  compact?: boolean;
}

const tone: Record<RiskLevel, "success" | "warning" | "destructive" | "primary"> = {
  Low: "success",
  Moderate: "primary",
  Elevated: "warning",
  High: "destructive",
};

export function HealthScoreCard({ score, riskLevel, breakdown, className, compact }: Props) {
  const items = compact ? breakdown.slice(0, 5) : breakdown;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("gradient-sunrise rounded-[2.5rem] border border-border p-6 shadow-[var(--shadow-float)] sm:p-8", className)}
      aria-label="Health score"
    >
      <div className="grid gap-8 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
        <div className="flex flex-col items-center">
          <ProgressRing value={score} tone={tone[riskLevel]} sublabel="Health score" />
          <span className="mt-3 rounded-full bg-card/80 px-4 py-1.5 text-sm font-medium">{riskLevel} risk</span>
        </div>

        <div className="min-w-0">
          <h2 className="text-2xl">Why this score?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Every point is explained — no black box.
          </p>
          <ul className="mt-5 space-y-2.5">
            {items.map((f) => (
              <li
                key={f.label}
                className="flex items-start justify-between gap-4 rounded-2xl bg-card/80 px-4 py-3"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{f.label}</span>
                  <span className="block text-xs text-muted-foreground">{f.detail}</span>
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-sm font-semibold tabular-nums",
                    f.points >= 0 ? "bg-success/15 text-success" : "bg-destructive/12 text-destructive",
                  )}
                >
                  {f.points >= 0 ? "+" : ""}
                  {f.points}
                </span>
              </li>
            ))}
            {!items.length && (
              <li className="rounded-2xl bg-card/80 px-4 py-3 text-sm text-muted-foreground">
                Complete a health check to see your score breakdown.
              </li>
            )}
          </ul>
        </div>
      </div>
    </motion.section>
  );
}
