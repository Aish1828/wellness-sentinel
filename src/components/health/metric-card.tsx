import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type CardTone = "warm" | "mint" | "sky" | "plain";

const toneClass: Record<CardTone, string> = {
  warm: "gradient-warm",
  mint: "gradient-mint",
  sky: "gradient-sky",
  plain: "bg-card",
};

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  tone?: CardTone;
  delay?: number;
}

export function MetricCard({ icon: Icon, label, value, unit, hint, tone = "plain", delay = 0 }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -4 }}
      className={cn(
        "rounded-3xl border border-border p-5 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-float)]",
        toneClass[tone],
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-card/70 text-foreground">
          <Icon className="size-4" aria-hidden />
        </span>
      </div>
      <p className="mt-4 font-serif text-3xl text-foreground">
        {value}
        {unit && <span className="ml-1 font-sans text-sm text-muted-foreground">{unit}</span>}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </motion.div>
  );
}
