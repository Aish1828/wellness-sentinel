import Dexie, { type Table } from "dexie";
import type { HealthLog } from "@/types/health";

export interface SettingRow {
  key: string;
  value: unknown;
}

export interface CachedProfile {
  id: string;
  full_name?: string | null;
  email?: string | null;
  age?: number | null;
  gender?: string | null;
  height_cm?: number | null;
  blood_group?: string | null;
  updated_at?: string;
  synced?: number;
}

class HealthGuardDB extends Dexie {
  logs!: Table<HealthLog, string>;
  profile!: Table<CachedProfile, string>;
  settings!: Table<SettingRow, string>;

  constructor() {
    super("healthguard-ai");
    this.version(1).stores({
      logs: "id, user_id, log_date, synced",
      profile: "id",
      settings: "key",
    });
  }
}

let _db: HealthGuardDB | null = null;

/** Dexie touches IndexedDB, so it must only ever be created in the browser. */
export function getDb(): HealthGuardDB | null {
  if (typeof window === "undefined") return null;
  if (!_db) _db = new HealthGuardDB();
  return _db;
}
