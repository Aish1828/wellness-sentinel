import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, Save, User as UserIcon } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth, displayName } from "@/contexts/auth-context";
import { useHealthData } from "@/hooks/use-health-data";
import { saveProfile } from "@/services/health-store";
import { BLOOD_GROUPS, GENDERS } from "@/utils/constants";
import type { CachedProfile } from "@/database/db";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile — HealthGuard AI" },
      { name: "description", content: "Manage the personal details that personalise your health scoring." },
      { property: "og:title", content: "Profile — HealthGuard AI" },
      { property: "og:description", content: "Your HealthGuard AI personal details." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { user } = useAuth();
  const { profile, logs, refresh } = useHealthData();
  const [form, setForm] = useState<CachedProfile>({ id: user?.id ?? "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setForm(profile);
    else if (user) setForm({ id: user.id, email: user.email, full_name: displayName(user) });
  }, [profile, user]);

  async function submit() {
    if (!user) return;
    setSaving(true);
    try {
      await saveProfile({ ...form, id: user.id, email: user.email ?? form.email });
      refresh();
      toast.success("Profile saved");
    } catch {
      toast.error("Saved locally", { description: "It will sync as soon as you're back online." });
    } finally {
      setSaving(false);
    }
  }

  const best = logs.reduce((m, l) => Math.max(m, l.health_score ?? 0), 0);

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <PageHeader eyebrow="Account" title="Profile" description="These details personalise your scoring and recommendations." />

      <div className="gradient-sunrise grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-3xl border border-border p-6 shadow-[var(--shadow-soft)]">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-card/80">
          <UserIcon className="size-6" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-medium">{form.full_name || displayName(user)}</p>
          <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Check-ins logged" value={String(logs.length)} />
        <Stat label="Best score" value={best ? String(best) : "—"} />
        <Stat label="Latest score" value={logs[0]?.health_score ? String(logs[0].health_score) : "—"} />
      </div>

      <div className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              value={form.full_name ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={form.age ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, age: e.target.value ? Number(e.target.value) : null }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select value={form.gender ?? undefined} onValueChange={(v) => setForm((f) => ({ ...f, gender: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {GENDERS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Blood group</Label>
            <Select value={form.blood_group ?? undefined} onValueChange={(v) => setForm((f) => ({ ...f, blood_group: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent>
                {BLOOD_GROUPS.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              value={form.height_cm ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, height_cm: e.target.value ? Number(e.target.value) : null }))}
            />
          </div>
        </div>

        <Button className="rounded-full px-6" onClick={submit} disabled={saving}>
          {saving ? <Loader2 className="mr-1 size-4 animate-spin" aria-hidden /> : <Save className="mr-1 size-4" aria-hidden />}
          Save profile
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 text-center shadow-[var(--shadow-soft)]">
      <p className="font-serif text-3xl">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
