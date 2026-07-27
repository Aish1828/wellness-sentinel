import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function InsightCard({
  icon: Icon,
  title,
  children,
  tone = "plain",
  index = 0,
  className,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  tone?: "warm" | "mint" | "sky" | "plain";
  index?: number;
  className?: string;
}) {
  const toneClass = {
    warm: "gradient-warm",
    mint: "gradient-mint",
    sky: "gradient-sky",
    plain: "bg-card",
  }[tone];

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      className={cn("rounded-3xl border border-border p-6 shadow-[var(--shadow-soft)]", toneClass, className)}
    >
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-card/75">
          <Icon className="size-4.5" aria-hidden />
        </span>
        <h3 className="min-w-0 truncate text-lg">{title}</h3>
      </div>
      <div className="mt-4 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </motion.article>
  );
}
