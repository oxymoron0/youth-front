import { useState, useEffect } from 'react';
import { fetchLatestSync, fetchSyncHistory } from '../api/housing';
import type { SyncResult } from '../types/housing';

interface LatestSyncState {
  data: SyncResult | null;
  loading: boolean;
  error: string | null;
}

interface SyncHistoryState {
  data: SyncResult[];
  loading: boolean;
  error: string | null;
}

function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export function useLatestSync(intervalMs = 30_000): LatestSyncState {
  const [data, setData] = useState<SyncResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchOnce = async () => {
      try {
        const res = await fetchLatestSync();
        if (cancelled) return;
        setData(res.result);
        setError(res.status === 'ok' ? null : 'sync failed');
      } catch (err: unknown) {
        if (cancelled) return;
        setError(getErrorMessage(err, 'Failed to fetch latest sync'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOnce();
    const id = setInterval(fetchOnce, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [intervalMs]);

  return { data, loading, error };
}

export function useSyncHistory(enabled: boolean, limit = 48, intervalMs = 60_000): SyncHistoryState {
  const [data, setData] = useState<SyncResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    setLoading(true);

    const fetchOnce = async () => {
      try {
        const res = await fetchSyncHistory(limit);
        if (cancelled) return;
        setData(res.results);
        setError(res.status === 'ok' ? null : 'sync history failed');
      } catch (err: unknown) {
        if (cancelled) return;
        setError(getErrorMessage(err, 'Failed to fetch sync history'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOnce();
    const id = setInterval(fetchOnce, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [enabled, limit, intervalMs]);

  return { data, loading, error };
}
