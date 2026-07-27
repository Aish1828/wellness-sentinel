import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ChartCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className={cn("rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6", className)}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <div className="min-w-0">
          <h3 className="text-lg">{title}</h3>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </motion.section>
  );
}
