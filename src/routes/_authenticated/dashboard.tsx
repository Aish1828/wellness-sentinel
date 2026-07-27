import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Activity,
  Droplets,
  Moon,
  Brain,
  Scale,
  HeartPulse,
  Sparkles,
  Plus,
  Target,
  ArrowRight,
  CalendarClock,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth, displayName } from "@/contexts/auth-context";
import { useHealthData } from "@/hooks/use-health-data";
import { analyzeHealth } from "@/services/health-engine";
import { HealthScoreCard } from "@/components/health/health-score-card";
import { RiskMeter } from "@/components/health/risk-meter";
import { MetricCard } from "@/components/health/metric-card";
import { ChartCard } from "@/components/health/chart-card";
import { RecommendationCard } from "@/components/health/recommendation-card";
import { EmergencyBanner } from "@/components/health/emergency-banner";
import { EmptyState, SkeletonBlock } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import type { RiskLevel } from "@/types/health";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — HealthGuard AI" },
      { name: "description", content: "Your health score, risk meter, daily summary and AI insights in one place." },
      { property: "og:title", content: "Dashboard — HealthGuard AI" },
      { property: "og:description", content: "Your health score, risk meter, daily summary and AI insights." },
    ],
  }),
  component: Dashboard,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const { user } = useAuth();
  const { logs, latest, loading } = useHealthData();

  if (loading && !latest) {
    return (
      <div className="space-y-5">
        <SkeletonBlock className="h-24" />
        <SkeletonBlock className="h-72" />
        <SkeletonBlock className="h-48" />
      </div>
    );
  }

  if (!latest) {
    return (
      <div className="space-y-8">
        <Greeting name={displayName(user)} />
        <EmptyState
          icon={HeartPulse}
          title="Your dashboard is waiting for its first health check"
          description="Two minutes of input gives you an explainable score, a risk breakdown and a personalised prevention plan."
          actionLabel="Start health check"
          actionTo="/health-check"
        />
      </div>
    );
  }

  const analysis = analyzeHealth(latest);
  const trend = [...logs]
    .slice(0, 14)
    .reverse()
    .map((l) => ({
      date: l.log_date.slice(5),
      score: l.health_score ?? 0,
      sleep: l.sleep_hours ?? 0,
    }));

  return (
    <div className="space-y-8">
      <Greeting name={displayName(user)} />

      {analysis.emergency && <EmergencyBanner />}

      <HealthScoreCard score={analysis.score} riskLevel={analysis.riskLevel} breakdown={analysis.breakdown} compact />

      <section aria-label="Today's summary">
        <h2 className="mb-4 text-xl">Today's summary</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard icon={Scale} label="BMI" value={analysis.bmi?.toString() ?? "—"} hint={analysis.bmiLabel} tone="warm" delay={0} />
          <MetricCard icon={Moon} label="Sleep" value={latest.sleep_hours?.toString() ?? "—"} unit="h" hint="Target 7–9h" tone="sky" delay={0.05} />
          <MetricCard icon={Droplets} label="Water" value={latest.water_liters?.toString() ?? "—"} unit="L" hint="Target 2.5L" tone="mint" delay={0.1} />
          <MetricCard icon={Activity} label="Activity" value={latest.exercise_minutes?.toString() ?? "—"} unit="min" hint="Target 30 min" tone="plain" delay={0.15} />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <RiskMeter level={analysis.riskLevel as RiskLevel} />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="gradient-sky rounded-3xl border border-border p-6 shadow-[var(--shadow-soft)]"
        >
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-card/75">
              <Sparkles className="size-4.5" aria-hidden />
            </span>
            <h3 className="text-lg">AI insight</h3>
          </div>
          <p className="mt-4 text-sm leading-relaxed">{analysis.summary}</p>
          <Button asChild variant="ghost" className="mt-4 rounded-full px-4">
            <Link to="/insights">
              Open AI insights <ArrowRight className="ml-1 size-4" aria-hidden />
            </Link>
          </Button>
        </motion.div>
      </div>

      <ChartCard title="Health trends" description="Score and sleep across your recent check-ins.">
        {trend.length > 1 ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trend} margin={{ left: -20, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 6" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  borderRadius: 16,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  fontSize: 13,
                }}
              />
              <Area type="monotone" dataKey="score" stroke="var(--chart-1)" strokeWidth={3} fill="url(#scoreFill)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Log a few more days to unlock your trend curve.
          </p>
        )}
      </ChartCard>

      <section aria-label="Recommendations">
        <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <h2 className="min-w-0 text-xl">Top recommendations</h2>
          <Button asChild variant="ghost" className="rounded-full">
            <Link to="/recommendations">See all</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {analysis.recommendations.slice(0, 3).map((rec, i) => (
            <RecommendationCard key={rec.title} rec={rec} index={i} />
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-3">
            <span className="gradient-mint grid size-10 place-items-center rounded-2xl">
              <Target className="size-4.5" aria-hidden />
            </span>
            <h3 className="text-lg">Upcoming goals</h3>
          </div>
          <ul className="mt-5 space-y-3">
            {buildGoals(analysis.improvements.map((i) => i.category)).map((g) => (
              <li key={g.label} className="rounded-2xl bg-muted px-4 py-3">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <span className="truncate text-sm font-medium">{g.label}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{g.due}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-card">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${g.progress}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-3">
            <span className="gradient-warm grid size-10 place-items-center rounded-2xl">
              <CalendarClock className="size-4.5" aria-hidden />
            </span>
            <h3 className="text-lg">Recent health logs</h3>
          </div>
          <ul className="mt-5 space-y-2.5">
            {logs.slice(0, 5).map((l) => (
              <li key={l.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-muted px-4 py-3">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{new Date(l.log_date).toDateString()}</span>
                  <span className="block text-xs text-muted-foreground">
                    {l.risk_level} risk · BMI {l.bmi ?? "—"}
                  </span>
                </span>
                <span className="shrink-0 font-serif text-2xl">{l.health_score}</span>
              </li>
            ))}
          </ul>
          <Button asChild variant="ghost" className="mt-4 rounded-full">
            <Link to="/history">Open full history</Link>
          </Button>
        </section>
      </div>

      <section aria-label="Quick actions" className="grid gap-4 sm:grid-cols-3">
        <QuickAction to="/health-check" icon={Plus} label="New health check" />
        <QuickAction to="/analytics" icon={Activity} label="View analytics" />
        <QuickAction to="/insights" icon={Brain} label="AI insights" />
      </section>
    </div>
  );
}

function Greeting({ name }: { name: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="min-w-0">
      <p className="text-sm text-muted-foreground">{new Date().toDateString()}</p>
      <h1 className="mt-1 text-3xl sm:text-4xl">
        {greeting()}, {name}
      </h1>
    </motion.div>
  );
}

function QuickAction({ to, icon: Icon, label }: { to: string; icon: typeof Plus; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-3xl border border-border bg-card px-5 py-4 shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-1"
    >
      <span className="gradient-warm grid size-10 shrink-0 place-items-center rounded-2xl">
        <Icon className="size-4.5" aria-hidden />
      </span>
      <span className="min-w-0 truncate text-sm font-medium">{label}</span>
    </Link>
  );
}

function buildGoals(weakCategories: string[]) {
  const pool = [
    { label: "Sleep 7+ hours for 5 nights", due: "This week", progress: 55, cat: "Sleep" },
    { label: "Reach 2.5L water daily", due: "This week", progress: 40, cat: "Hydration" },
    { label: "30 active minutes, 5 days", due: "This week", progress: 62, cat: "Activity" },
    { label: "Two calm-down sessions", due: "This week", progress: 30, cat: "Mind" },
    { label: "Book a preventive screening", due: "This month", progress: 15, cat: "History" },
  ];
  const prioritised = pool.filter((g) => weakCategories.includes(g.cat));
  return (prioritised.length ? prioritised : pool).slice(0, 4);
}
