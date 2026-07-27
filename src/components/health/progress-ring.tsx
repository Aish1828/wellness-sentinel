import { cn } from "@/lib/utils";
import { useCountUp } from "@/hooks/use-count-up";

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  className?: string;
  tone?: "primary" | "success" | "warning" | "destructive";
}

const toneVar: Record<string, string> = {
  primary: "var(--primary)",
  success: "var(--success)",
  warning: "var(--warning)",
  destructive: "var(--destructive)",
};

export function ProgressRing({
  value,
  max = 100,
  size = 180,
  strokeWidth = 14,
  label,
  sublabel,
  className,
  tone = "primary",
}: ProgressRingProps) {
  const animated = useCountUp(value);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, animated / max));

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`${value} out of ${max}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={toneVar[tone]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
          style={{ transition: "stroke-dashoffset 120ms linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-4xl font-semibold text-foreground">{label ?? animated}</span>
        {sublabel && <span className="mt-1 text-xs tracking-wide text-muted-foreground uppercase">{sublabel}</span>}
      </div>
    </div>
  );
}
