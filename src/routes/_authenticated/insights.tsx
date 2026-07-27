import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Brain, TrendingUp, TriangleAlert, Sparkles, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState, SkeletonBlock } from "@/components/common/empty-state";
import { HealthScoreCard } from "@/components/health/health-score-card";
import { EmergencyBanner } from "@/components/health/emergency-banner";
import { InsightCard } from "@/components/health/insight-card";
import { useHealthData } from "@/hooks/use-health-data";
import { analyzeHealth } from "@/services/health-engine";
import { DISCLAIMER } from "@/utils/constants";
import type { RiskLevel } from "@/types/health";

export const Route = createFileRoute("/_authenticated/insights")({
  head: () => ({
    meta: [
      { title: "AI Insights — HealthGuard AI" },
      { name: "description", content: "An explainable AI health summary with score attribution and future risk analysis." },
      { property: "og:title", content: "AI Insights — HealthGuard AI" },
      { property: "og:description", content: "Explainable health summary, strengths, weak points and future risks." },
    ],
  }),
  component: Insights,
});

const riskTone: Record<RiskLevel, string> = {
  Low: "text-success",
  Moderate: "text-warning",
  Elevated: "text-warning",
  High: "text-destructive",
};

function Insights() {
  const { latest, loading } = useHealthData();

  if (loading && !latest) return <SkeletonBlock className="h-96" />;

  if (!latest) {
    return (
      <EmptyState
        icon={Brain}
        title="No analysis yet"
        description="Complete a health check and the intelligence engine will explain your score, strengths and future risks."
        actionLabel="Start health check"
        actionTo="/health-check"
      />
    );
  }

  const a = analyzeHealth(latest);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="AI health intelligence"
        title="Your health analysis"
        description={`Generated from your check-in on ${new Date(latest.log_date).toDateString()}.`}
      />

      {a.emergency && <EmergencyBanner />}

      <HealthScoreCard score={a.score} riskLevel={a.riskLevel} breakdown={a.breakdown} />

      <InsightCard icon={Sparkles} title="Summary" tone="warm">
        <p className="leading-relaxed">{a.summary}</p>
      </InsightCard>

      <div className="grid gap-5 lg:grid-cols-2">
        <InsightCard icon={ShieldCheck} title="What's working" tone="mint" index={1}>
          <ul className="space-y-3">
            {a.strengths.length ? (
              a.strengths.map((s) => (
                <li key={s.label} className="rounded-2xl bg-card/70 px-4 py-3">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <span className="truncate text-sm font-medium">{s.label}</span>
                    <span className="shrink-0 text-sm font-semibold text-success">+{s.points}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{s.detail}</p>
                </li>
              ))
            ) : (
              <li className="text-sm text-muted-foreground">No positive contributors yet — start with sleep and movement.</li>
            )}
          </ul>
        </InsightCard>

        <InsightCard icon={TriangleAlert} title="What needs attention" tone="sky" index={2}>
          <ul className="space-y-3">
            {a.improvements.length ? (
              a.improvements.map((s) => (
                <li key={s.label} className="rounded-2xl bg-card/70 px-4 py-3">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <span className="truncate text-sm font-medium">{s.label}</span>
                    <span className="shrink-0 text-sm font-semibold text-destructive">{s.points}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{s.detail}</p>
                </li>
              ))
            ) : (
              <li className="text-sm text-muted-foreground">Nothing is dragging your score down right now.</li>
            )}
          </ul>
        </InsightCard>
      </div>

      <section aria-label="Future risk analysis">
        <h2 className="mb-4 text-xl">Future risk analysis</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {a.futureRisks.map((r, i) => (
            <motion.article
              key={r.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]"
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <h3 className="min-w-0 text-lg">{r.label}</h3>
                <span className={`shrink-0 text-sm font-semibold ${riskTone[r.level]}`}>{r.level}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.reason}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <InsightCard icon={TrendingUp} title="Where to start" tone="plain" index={3}>
        <ol className="space-y-3">
          {a.recommendations
            .filter((r) => r.priority === "high")
            .slice(0, 3)
            .map((r, i) => (
              <li key={r.title} className="flex gap-3 rounded-2xl bg-muted px-4 py-3">
                <span className="font-serif text-lg text-muted-foreground">{i + 1}</span>
                <span>
                  <span className="block text-sm font-medium">{r.title}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{r.detail}</span>
                </span>
              </li>
            ))}
          {!a.recommendations.some((r) => r.priority === "high") && (
            <li className="text-sm text-muted-foreground">
              No high-priority actions today. Maintain your routine and re-check tomorrow.
            </li>
          )}
        </ol>
      </InsightCard>

      <p className="text-xs leading-relaxed text-muted-foreground">{DISCLAIMER}</p>
    </div>
  );
}
