import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { useHealthData } from "@/hooks/use-health-data";
import { saveAssessment } from "@/services/health-store";
import { calculateBmi, bmiLabel } from "@/services/health-engine";
import {
  ALCOHOL_OPTIONS,
  BLOOD_GROUPS,
  FAMILY_HISTORY_OPTIONS,
  GENDERS,
  MEDICAL_HISTORY_OPTIONS,
  SMOKING_OPTIONS,
  SYMPTOM_OPTIONS,
  DISCLAIMER,
} from "@/utils/constants";
import type { AssessmentInput } from "@/types/health";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/health-check")({
  head: () => ({
    meta: [
      { title: "Health Check — HealthGuard AI" },
      { name: "description", content: "A two-minute guided health check that scores your day and explains every factor." },
      { property: "og:title", content: "Health Check — HealthGuard AI" },
      { property: "og:description", content: "Guided daily health assessment with instant BMI and scoring." },
    ],
  }),
  component: HealthCheck,
});

const STEPS = ["Basics", "Body", "Lifestyle", "Symptoms", "History"] as const;

function HealthCheck() {
  const { user } = useAuth();
  const { profile, latest, refresh } = useHealthData();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<AssessmentInput>(() => ({
    age: latest?.age ?? profile?.age ?? null,
    gender: latest?.gender ?? profile?.gender ?? null,
    height_cm: latest?.height_cm ?? profile?.height_cm ?? null,
    weight_kg: latest?.weight_kg ?? null,
    blood_group: latest?.blood_group ?? profile?.blood_group ?? null,
    sleep_hours: latest?.sleep_hours ?? 7,
    stress_level: latest?.stress_level ?? 4,
    exercise_minutes: latest?.exercise_minutes ?? 30,
    water_liters: latest?.water_liters ?? 2,
    smoking: latest?.smoking ?? "Never",
    alcohol: latest?.alcohol ?? "None",
    symptoms: [],
    medical_history: latest?.medical_history ?? [],
    family_history: latest?.family_history ?? [],
  }));

  const bmi = useMemo(() => calculateBmi(form.height_cm, form.weight_kg), [form.height_cm, form.weight_kg]);

  function set<K extends keyof AssessmentInput>(key: K, value: AssessmentInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggle(key: "symptoms" | "medical_history" | "family_history", value: string) {
    setForm((f) => {
      const list = f[key];
      return { ...f, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] };
    });
  }

  async function submit() {
    if (!user) return;
    setSaving(true);
    try {
      await saveAssessment(user.id, form);
      refresh();
      toast.success("Health check saved", { description: "Your score and insights are updated." });
      navigate({ to: "/insights" });
    } catch {
      toast.error("Could not save", { description: "Your entry stays on this device and will sync later." });
    } finally {
      setSaving(false);
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <PageHeader
        eyebrow="Daily assessment"
        title="Health check"
        description="Answer honestly — every field feeds a transparent, explainable score."
      />

      <div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="h-2 min-w-0 overflow-hidden rounded-full bg-muted">
            <motion.div animate={{ width: `${progress}%` }} className="h-full rounded-full bg-primary" />
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            Step {step + 1} of {STEPS.length} · {STEPS[step]}
          </span>
        </div>
      </div>

      <div className="rounded-[2rem] border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {step === 0 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Age">
                  <Input
                    type="number"
                    min={1}
                    max={120}
                    value={form.age ?? ""}
                    onChange={(e) => set("age", e.target.value ? Number(e.target.value) : null)}
                  />
                </Field>
                <Field label="Gender">
                  <Picker value={form.gender} options={GENDERS} onChange={(v) => set("gender", v)} placeholder="Select gender" />
                </Field>
                <Field label="Blood group">
                  <Picker value={form.blood_group} options={BLOOD_GROUPS} onChange={(v) => set("blood_group", v)} placeholder="Select blood group" />
                </Field>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Height (cm)">
                    <Input
                      type="number"
                      value={form.height_cm ?? ""}
                      onChange={(e) => set("height_cm", e.target.value ? Number(e.target.value) : null)}
                    />
                  </Field>
                  <Field label="Weight (kg)">
                    <Input
                      type="number"
                      value={form.weight_kg ?? ""}
                      onChange={(e) => set("weight_kg", e.target.value ? Number(e.target.value) : null)}
                    />
                  </Field>
                </div>
                <div className="gradient-mint rounded-3xl p-6 text-center">
                  <p className="text-xs tracking-wide text-muted-foreground uppercase">Live BMI</p>
                  <p className="mt-2 font-serif text-5xl">{bmi ?? "—"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{bmiLabel(bmi)}</p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-7">
                <SliderField
                  label="Sleep last night"
                  value={form.sleep_hours ?? 7}
                  min={0}
                  max={12}
                  step={0.5}
                  suffix="h"
                  onChange={(v) => set("sleep_hours", v)}
                />
                <SliderField
                  label="Active minutes today"
                  value={form.exercise_minutes ?? 0}
                  min={0}
                  max={180}
                  step={5}
                  suffix=" min"
                  onChange={(v) => set("exercise_minutes", v)}
                />
                <SliderField
                  label="Water intake"
                  value={form.water_liters ?? 0}
                  min={0}
                  max={6}
                  step={0.25}
                  suffix="L"
                  onChange={(v) => set("water_liters", v)}
                />
                <SliderField
                  label="Stress level"
                  value={form.stress_level ?? 0}
                  min={0}
                  max={10}
                  step={1}
                  suffix="/10"
                  onChange={(v) => set("stress_level", v)}
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Smoking">
                    <Picker value={form.smoking} options={SMOKING_OPTIONS} onChange={(v) => set("smoking", v)} placeholder="Select" />
                  </Field>
                  <Field label="Alcohol">
                    <Picker value={form.alcohol} options={ALCOHOL_OPTIONS} onChange={(v) => set("alcohol", v)} placeholder="Select" />
                  </Field>
                </div>
              </div>
            )}

            {step === 3 && (
              <ChipGroup
                label="Any symptoms in the last 24 hours?"
                options={SYMPTOM_OPTIONS}
                selected={form.symptoms}
                onToggle={(v) => toggle("symptoms", v)}
              />
            )}

            {step === 4 && (
              <div className="space-y-7">
                <ChipGroup
                  label="Existing conditions"
                  options={MEDICAL_HISTORY_OPTIONS}
                  selected={form.medical_history}
                  onToggle={(v) => toggle("medical_history", v)}
                />
                <ChipGroup
                  label="Family history"
                  options={FAMILY_HISTORY_OPTIONS}
                  selected={form.family_history}
                  onToggle={(v) => toggle("family_history", v)}
                />
                <p className="text-xs leading-relaxed text-muted-foreground">{DISCLAIMER}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="ghost"
            className="rounded-full"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ArrowLeft className="mr-1 size-4" aria-hidden /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button className="rounded-full px-6" onClick={() => setStep((s) => s + 1)}>
              Continue <ArrowRight className="ml-1 size-4" aria-hidden />
            </Button>
          ) : (
            <Button className="rounded-full px-6" onClick={submit} disabled={saving}>
              {saving ? <Loader2 className="mr-1 size-4 animate-spin" aria-hidden /> : <Check className="mr-1 size-4" aria-hidden />}
              Generate my analysis
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Picker({
  value,
  options,
  onChange,
  placeholder,
}: {
  value?: string | null;
  options: string[];
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <Select value={value ?? undefined} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <Label className="min-w-0 truncate">{label}</Label>
        <span className="shrink-0 font-serif text-xl">
          {value}
          {suffix}
        </span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0])} />
    </div>
  );
}

function ChipGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = selected.includes(o);
          return (
            <button
              key={o}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(o)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-muted",
              )}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
