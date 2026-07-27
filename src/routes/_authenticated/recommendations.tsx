import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ListChecks } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState, SkeletonBlock } from "@/components/common/empty-state";
import { RecommendationCard } from "@/components/health/recommendation-card";
import { useHealthData } from "@/hooks/use-health-data";
import { analyzeHealth } from "@/services/health-engine";
import { DISCLAIMER } from "@/utils/constants";
import { cn } from "@/lib/utils";
import type { Recommendation } from "@/types/health";

export const Route = createFileRoute("/_authenticated/recommendations")({
  head: () => ({
    meta: [
      { title: "Recommendations — HealthGuard AI" },
      { name: "description", content: "Personalised diet, exercise, hydration, sleep, mind and screening actions based on your latest check." },
      { property: "og:title", content: "Recommendations — HealthGuard AI" },
      { property: "og:description", content: "Your preventive action plan, prioritised by impact." },
    ],
  }),
  component: Recommendations,
});

const CATEGORIES: (Recommendation["category"] | "All")[] = [
  "All",
  "Diet",
  "Exercise",
  "Hydration",
  "Sleep",
  "Mental Wellness",
  "Preventive Checkups",
];

function Recommendations() {
  const { latest, loading } = useHealthData();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");

  const analysis = latest ? analyzeHealth(latest) : null;
  const list = useMemo(() => {
    if (!analysis) return [];
    const order = { high: 0, medium: 1, low: 2 } as const;
    return analysis.recommendations
      .filter((r) => category === "All" || r.category === category)
      .sort((a, b) => order[a.priority] - order[b.priority]);
  }, [analysis, category]);

  if (loading && !latest) return <SkeletonBlock className="h-80" />;

  if (!analysis) {
    return (
      <EmptyState
        icon={ListChecks}
        title="No recommendations yet"
        description="Complete a health check and you'll get a prioritised prevention plan across six areas."
        actionLabel="Start health check"
        actionTo="/health-check"
      />
    );
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Action plan"
        title="Recommendations"
        description="Prioritised by how much each change moves your score."
      />

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-colors",
              category === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {list.map((rec, i) => (
          <RecommendationCard key={rec.title} rec={rec} index={i} />
        ))}
      </div>

      {!list.length && (
        <p className="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Nothing in this category right now.
        </p>
      )}

      <p className="text-xs leading-relaxed text-muted-foreground">{DISCLAIMER}</p>
    </div>
  );
}
