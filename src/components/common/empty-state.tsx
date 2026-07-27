import type { LucideIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionTo,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
      <span className="gradient-warm grid size-16 place-items-center rounded-3xl">
        <Icon className="size-7" aria-hidden />
      </span>
      <h3 className="mt-5 text-xl">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {actionLabel && actionTo && (
        <Button asChild className="mt-6 rounded-full px-6">
          <Link to={actionTo}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}

export function SkeletonBlock({ className = "h-32" }: { className?: string }) {
  return <div className={`animate-pulse rounded-3xl bg-muted ${className}`} />;
}
