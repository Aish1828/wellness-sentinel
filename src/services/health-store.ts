import { supabase } from "@/integrations/supabase/client";
import { getDb, type CachedProfile } from "@/database/db";
import type { AssessmentInput, HealthLog, ScoreFactor, Recommendation } from "@/types/health";
import { analyzeHealth } from "./health-engine";

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** Reads logs from IndexedDB first so the app works with no connection. */
export async function getLocalLogs(userId: string): Promise<HealthLog[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db.logs.where("user_id").equals(userId).toArray();
  return rows.sort((a, b) => (a.log_date < b.log_date ? 1 : -1));
}

export async function saveAssessment(userId: string, input: AssessmentInput): Promise<HealthLog> {
  const analysis = analyzeHealth(input);
  const db = getDb();
  const date = todayISO();
  const existing = db ? (await db.logs.where("user_id").equals(userId).toArray()).find((l) => l.log_date === date) : undefined;

  const log: HealthLog = {
    id: existing?.id ?? uuid(),
    user_id: userId,
    log_date: date,
    ...input,
    bmi: analysis.bmi,
    health_score: analysis.score,
    risk_level: analysis.riskLevel,
    breakdown: analysis.breakdown,
    recommendations: analysis.recommendations,
    created_at: existing?.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
    synced: 0,
  };

  if (db) await db.logs.put(log);
  void pushLog(log);
  return log;
}

async function pushLog(log: HealthLog) {
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  const db = getDb();
  try {
    const { error } = await supabase.from("health_logs").upsert(
      {
        id: log.id,
        user_id: log.user_id,
        log_date: log.log_date,
        age: log.age ?? null,
        gender: log.gender ?? null,
        height_cm: log.height_cm ?? null,
        weight_kg: log.weight_kg ?? null,
        blood_group: log.blood_group ?? null,
        sleep_hours: log.sleep_hours ?? null,
        stress_level: log.stress_level ?? null,
        exercise_minutes: log.exercise_minutes ?? null,
        water_liters: log.water_liters ?? null,
        smoking: log.smoking ?? null,
        alcohol: log.alcohol ?? null,
        symptoms: log.symptoms,
        medical_history: log.medical_history,
        family_history: log.family_history,
        bmi: log.bmi,
        health_score: log.health_score,
        risk_level: log.risk_level,
        breakdown: log.breakdown as unknown as never,
        recommendations: log.recommendations as unknown as never,
        updated_at: log.updated_at,
      },
      { onConflict: "user_id,log_date" },
    );
    if (error) throw error;
    if (db) await db.logs.update(log.id, { synced: 1 });
  } catch {
    /* stays queued in IndexedDB until the next sync */
  }
}

/** Pull remote logs into IndexedDB and push anything queued offline. */
export async function syncLogs(userId: string): Promise<HealthLog[]> {
  const db = getDb();
  if (!db) return [];

  const pending = (await db.logs.where("user_id").equals(userId).toArray()).filter((l) => l.synced !== 1);
  for (const log of pending) await pushLog(log);

  try {
    const { data, error } = await supabase
      .from("health_logs")
      .select("*")
      .eq("user_id", userId)
      .order("log_date", { ascending: false });
    if (error) throw error;

    const remote: HealthLog[] = (data ?? []).map((row) => ({
      id: row.id,
      user_id: row.user_id,
      log_date: row.log_date,
      age: row.age,
      gender: row.gender,
      height_cm: row.height_cm ? Number(row.height_cm) : null,
      weight_kg: row.weight_kg ? Number(row.weight_kg) : null,
      blood_group: row.blood_group,
      sleep_hours: row.sleep_hours ? Number(row.sleep_hours) : null,
      stress_level: row.stress_level,
      exercise_minutes: row.exercise_minutes,
      water_liters: row.water_liters ? Number(row.water_liters) : null,
      smoking: row.smoking,
      alcohol: row.alcohol,
      symptoms: row.symptoms ?? [],
      medical_history: row.medical_history ?? [],
      family_history: row.family_history ?? [],
      bmi: row.bmi ? Number(row.bmi) : null,
      health_score: row.health_score,
      risk_level: row.risk_level,
      breakdown: (row.breakdown ?? []) as unknown as ScoreFactor[],
      recommendations: (row.recommendations ?? []) as unknown as Recommendation[],
      created_at: row.created_at,
      updated_at: row.updated_at,
      synced: 1,
    }));

    if (remote.length) await db.logs.bulkPut(remote);
  } catch {
    /* offline — local cache remains the source of truth */
  }

  return getLocalLogs(userId);
}

export async function getProfile(userId: string): Promise<CachedProfile | null> {
  const db = getDb();
  const cached = db ? ((await db.profile.get(userId)) ?? null) : null;
  try {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (data) {
      const profile: CachedProfile = {
        id: data.id,
        full_name: data.full_name,
        email: data.email,
        age: data.age,
        gender: data.gender,
        height_cm: data.height_cm ? Number(data.height_cm) : null,
        blood_group: data.blood_group,
        updated_at: data.updated_at,
        synced: 1,
      };
      if (db) await db.profile.put(profile);
      return profile;
    }
  } catch {
    /* offline */
  }
  return cached;
}

export async function saveProfile(profile: CachedProfile): Promise<void> {
  const db = getDb();
  if (db) await db.profile.put({ ...profile, synced: 0 });
  try {
    const { error } = await supabase.from("profiles").upsert({
      id: profile.id,
      full_name: profile.full_name ?? null,
      email: profile.email ?? null,
      age: profile.age ?? null,
      gender: profile.gender ?? null,
      height_cm: profile.height_cm ?? null,
      blood_group: profile.blood_group ?? null,
    });
    if (error) throw error;
    if (db) await db.profile.update(profile.id, { synced: 1 });
  } catch {
    /* queued until next sync */
  }
}

export async function clearLocalData() {
  const db = getDb();
  if (!db) return;
  await Promise.all([db.logs.clear(), db.profile.clear(), db.settings.clear()]);
}
