import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4"
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">{eyebrow}</p>
        )}
        <h1 className="mt-1 text-3xl sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </motion.header>
  );
}
