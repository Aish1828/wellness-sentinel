import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { History as HistoryIcon, ChevronDown, Search } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState, SkeletonBlock } from "@/components/common/empty-state";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHealthData } from "@/hooks/use-health-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({
    meta: [
      { title: "History — HealthGuard AI" },
      { name: "description", content: "Every past health check with score, risk level, BMI and the factors behind it." },
      { property: "og:title", content: "History — HealthGuard AI" },
      { property: "og:description", content: "Your full preventive health timeline." },
    ],
  }),
  component: HistoryPage,
});

const RISKS = ["All", "Low", "Moderate", "Elevated", "High"];

function HistoryPage() {
  const { logs, loading } = useHealthData();
  const [query, setQuery] = useState("");
  const [risk, setRisk] = useState("All");
  const [open, setOpen] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      logs.filter((l) => {
        const matchesRisk = risk === "All" || l.risk_level === risk;
        const haystack = `${l.log_date} ${l.risk_level} ${l.symptoms.join(" ")}`.toLowerCase();
        return matchesRisk && haystack.includes(query.toLowerCase());
      }),
    [logs, query, risk],
  );

  if (loading && !logs.length) return <SkeletonBlock className="h-80" />;

  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Timeline" title="Health history" description="Every check-in you've logged, online or offline." />

      {!logs.length ? (
        <EmptyState
          icon={HistoryIcon}
          title="No history yet"
          description="Your logged health checks will appear here as a searchable timeline."
          actionLabel="Start health check"
          actionTo="/health-check"
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
            <div className="relative min-w-0">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by date or symptom"
                aria-label="Search health history"
                className="pl-9"
              />
            </div>
            <Select value={risk} onValueChange={setRisk}>
              <SelectTrigger aria-label="Filter by risk level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RISKS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r === "All" ? "All risk levels" : `${r} risk`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ul className="space-y-3">
            {filtered.map((l, i) => {
              const expanded = open === l.id;
              return (
                <motion.li
                  key={l.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  className="overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-soft)]"
                >
                  <button
                    type="button"
                    onClick={() => setOpen(expanded ? null : l.id)}
                    aria-expanded={expanded}
                    className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 text-left"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{new Date(l.log_date).toDateString()}</span>
                      <span className="block text-xs text-muted-foreground">
                        {l.risk_level} risk · BMI {l.bmi ?? "—"} · {l.symptoms.length} symptom
                        {l.symptoms.length === 1 ? "" : "s"}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="font-serif text-3xl">{l.health_score}</span>
                      <ChevronDown className={cn("size-4 transition-transform", expanded && "rotate-180")} aria-hidden />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border"
                      >
                        <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
                          <div>
                            <h3 className="text-sm font-medium">Score factors</h3>
                            <ul className="mt-2 space-y-1.5">
                              {l.breakdown.map((b) => (
                                <li key={b.label} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 text-sm">
                                  <span className="truncate text-muted-foreground">{b.label}</span>
                                  <span className={b.points >= 0 ? "text-success" : "text-destructive"}>
                                    {b.points > 0 ? `+${b.points}` : b.points}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-3 text-sm">
                            <p>
                              <span className="text-muted-foreground">Sleep:</span> {l.sleep_hours ?? "—"}h ·{" "}
                              <span className="text-muted-foreground">Water:</span> {l.water_liters ?? "—"}L
                            </p>
                            <p>
                              <span className="text-muted-foreground">Activity:</span> {l.exercise_minutes ?? "—"} min ·{" "}
                              <span className="text-muted-foreground">Stress:</span> {l.stress_level ?? "—"}/10
                            </p>
                            {l.symptoms.length > 0 && (
                              <p>
                                <span className="text-muted-foreground">Symptoms:</span> {l.symptoms.join(", ")}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </ul>

          {!filtered.length && (
            <p className="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              No entries match this filter.
            </p>
          )}
        </>
      )}
    </div>
  );
}
