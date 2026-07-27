import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getLocalLogs, syncLogs, getProfile } from "@/services/health-store";
import type { HealthLog } from "@/types/health";
import type { CachedProfile } from "@/database/db";

export function useHealthData() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [profile, setProfile] = useState<CachedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);

    (async () => {
      const local = await getLocalLogs(user.id);
      if (active && local.length) setLogs(local);
      const [synced, prof] = await Promise.all([syncLogs(user.id), getProfile(user.id)]);
      if (!active) return;
      setLogs(synced);
      setProfile(prof);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [user, refreshKey]);

  return {
    logs,
    profile,
    latest: logs[0] ?? null,
    loading,
    refresh: () => setRefreshKey((k) => k + 1),
  };
}
