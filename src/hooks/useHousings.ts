import { useState, useEffect } from 'react';
import { fetchHousings } from '../api/housing';
import type { HousingListItem } from '../types/housing';

export function useHousings() {
  const [housings, setHousings] = useState<HousingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchHousings()
      .then((data) => {
        if (!cancelled) setHousings(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to fetch housings');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { housings, loading, error };
}
