import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, LogOut, Moon, Trash2, WifiOff, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { useHealthData } from "@/hooks/use-health-data";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { clearLocalData } from "@/services/health-store";
import { DISCLAIMER } from "@/utils/constants";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — HealthGuard AI" },
      { name: "description", content: "Control appearance, offline data, exports and your HealthGuard AI session." },
      { property: "og:title", content: "Settings — HealthGuard AI" },
      { property: "og:description", content: "Preferences, data export and privacy controls." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { user } = useAuth();
  const { logs, refresh } = useHealthData();
  const online = useOnlineStatus();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("hg-theme") === "dark";
    setDark(stored);
    document.documentElement.classList.toggle("dark", stored);
  }, []);

  function toggleTheme(next: boolean) {
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("hg-theme", next ? "dark" : "light");
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `healthguard-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export downloaded");
  }

  async function clearOffline() {
    await clearLocalData();
    refresh();
    toast.success("Offline cache cleared");
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <PageHeader eyebrow="Preferences" title="Settings" description="Appearance, data and account controls." />

      <Section title="Appearance" icon={Moon}>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="min-w-0">
            <Label htmlFor="dark-mode">Dark mode</Label>
            <p className="mt-1 text-xs text-muted-foreground">Switch to a low-light palette for evening use.</p>
          </div>
          <Switch id="dark-mode" checked={dark} onCheckedChange={toggleTheme} />
        </div>
      </Section>

      <Section title="Offline & sync" icon={WifiOff}>
        <p className="text-sm text-muted-foreground">
          {online
            ? "You're online — entries sync to your private account automatically."
            : "You're offline. Everything still works and will sync when you reconnect."}
        </p>
        <p className="mt-2 text-sm">
          <span className="text-muted-foreground">Stored locally:</span> {logs.length} health log
          {logs.length === 1 ? "" : "s"}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-full" onClick={exportData} disabled={!logs.length}>
            <Download className="mr-1 size-4" aria-hidden /> Export data
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="rounded-full">
                <Trash2 className="mr-1 size-4" aria-hidden /> Clear offline cache
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear offline cache?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes the copy stored on this device. Logs already synced to your account stay safe and will
                  download again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearOffline}>Clear cache</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Section>

      <Section title="Privacy" icon={ShieldCheck}>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Your health data is scoped to your account ({user?.email}) and stored on this device first. {DISCLAIMER}
        </p>
      </Section>

      <Section title="Account" icon={LogOut}>
        <Button variant="outline" className="rounded-full" onClick={signOut}>
          <LogOut className="mr-1 size-4" aria-hidden /> Sign out
        </Button>
      </Section>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Moon;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
      <div className="mb-4 flex items-center gap-3">
        <span className="gradient-warm grid size-10 place-items-center rounded-2xl">
          <Icon className="size-4.5" aria-hidden />
        </span>
        <h2 className="text-lg">{title}</h2>
      </div>
      {children}
    </section>
  );
}
