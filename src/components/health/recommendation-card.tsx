import { motion } from "framer-motion";
import { Apple, Dumbbell, Droplets, Moon, Brain, Stethoscope } from "lucide-react";
import type { Recommendation } from "@/types/health";
import { cn } from "@/lib/utils";

const icons = {
  Diet: Apple,
  Exercise: Dumbbell,
  Hydration: Droplets,
  Sleep: Moon,
  "Mental Wellness": Brain,
  "Preventive Checkups": Stethoscope,
} as const;

const priorityClass = {
  high: "bg-destructive/12 text-destructive",
  medium: "bg-warning/18 text-warning-foreground",
  low: "bg-success/15 text-success",
} as const;

export function RecommendationCard({ rec, index = 0 }: { rec: Recommendation; index?: number }) {
  const Icon = icons[rec.category];
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="flex h-full flex-col rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-float)]"
    >
      <div className="flex items-center gap-3">
        <span className="gradient-warm grid size-11 shrink-0 place-items-center rounded-2xl">
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{rec.category}</p>
          <span className={cn("mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase", priorityClass[rec.priority])}>
            {rec.priority} priority
          </span>
        </div>
      </div>
      <h3 className="mt-4 text-lg leading-snug">{rec.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{rec.detail}</p>
    </motion.article>
  );
}
