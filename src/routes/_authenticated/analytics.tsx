import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LineChart as LineChartIcon } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState, SkeletonBlock } from "@/components/common/empty-state";
import { ChartCard } from "@/components/health/chart-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHealthData } from "@/hooks/use-health-data";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — HealthGuard AI" },
      { name: "description", content: "Long-term charts for health score, weight, BMI, sleep, hydration and stress." },
      { property: "og:title", content: "Analytics — HealthGuard AI" },
      { property: "og:description", content: "Visualise your health trends over weeks, months and years." },
    ],
  }),
  component: Analytics,
});

const RANGES = { "7": "7 days", "30": "30 days", "90": "3 months", "365": "1 year" } as const;
type RangeKey = keyof typeof RANGES;

const tooltipStyle = {
  borderRadius: 16,
  border: "1px solid var(--border)",
  background: "var(--card)",
  fontSize: 13,
};

function Analytics() {
  const { logs, loading } = useHealthData();
  const [range, setRange] = useState<RangeKey>("30");

  const data = useMemo(() => {
    const days = Number(range);
    const cutoff = Date.now() - days * 864e5;
    return [...logs]
      .filter((l) => new Date(l.log_date).getTime() >= cutoff)
      .sort((a, b) => (a.log_date < b.log_date ? -1 : 1))
      .map((l) => ({
        date: l.log_date.slice(5),
        score: l.health_score ?? 0,
        weight: l.weight_kg ?? null,
        bmi: l.bmi ?? null,
        sleep: l.sleep_hours ?? 0,
        water: l.water_liters ?? 0,
        stress: l.stress_level ?? 0,
        activity: l.exercise_minutes ?? 0,
      }));
  }, [logs, range]);

  const riskSplit = useMemo(() => {
    const counts: Record<string, number> = {};
    logs.forEach((l) => {
      const k = l.risk_level ?? "Unknown";
      counts[k] = (counts[k] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [logs]);

  const pieColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

  if (loading && !logs.length) return <SkeletonBlock className="h-96" />;

  if (!logs.length) {
    return (
      <EmptyState
        icon={LineChartIcon}
        title="No data to chart yet"
        description="Log a few health checks and your trends will appear here."
        actionLabel="Start health check"
        actionTo="/health-check"
      />
    );
  }

  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Trends" title="Analytics" description="How your metrics move across time." />

      <Tabs value={range} onValueChange={(v) => setRange(v as RangeKey)}>
        <TabsList className="rounded-full">
          {(Object.keys(RANGES) as RangeKey[]).map((k) => (
            <TabsTrigger key={k} value={k} className="rounded-full">
              {RANGES[k]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <ChartCard title="Health score" description="The composite score across the selected range.">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="aScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 6" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
            <YAxis domain={[0, 100]} tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="score" stroke="var(--chart-1)" strokeWidth={3} fill="url(#aScore)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Weight & BMI" description="Body composition over time.">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="4 6" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="weight" name="Weight (kg)" stroke="var(--chart-2)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="bmi" name="BMI" stroke="var(--chart-4)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Sleep & stress" description="Recovery versus load.">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="4 6" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="sleep" name="Sleep (h)" stroke="var(--chart-3)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="stress" name="Stress (/10)" stroke="var(--chart-5)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Activity & hydration" description="Daily movement minutes and litres of water.">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="4 6" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="activity" name="Active minutes" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="water" name="Water (L)" fill="var(--chart-2)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Risk distribution" description="How often each risk band appeared.">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={riskSplit} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {riskSplit.map((entry, i) => (
                  <Cell key={entry.name} fill={pieColors[i % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
