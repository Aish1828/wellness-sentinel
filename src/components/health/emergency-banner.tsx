import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { EMERGENCY_MESSAGE } from "@/utils/constants";

export function EmergencyBanner() {
  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="flex items-start gap-4 rounded-3xl border border-destructive/30 bg-destructive/10 p-5"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-destructive/15 text-destructive">
        <AlertTriangle className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <h3 className="text-base text-destructive">Urgent attention advised</h3>
        <p className="mt-1 text-sm leading-relaxed text-foreground">{EMERGENCY_MESSAGE}</p>
      </div>
    </motion.div>
  );
}
