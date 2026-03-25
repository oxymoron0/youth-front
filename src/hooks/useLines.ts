import { useState, useEffect } from 'react';
import { fetchLines } from '../api/client';
import type { Line } from '../types';

export function useLines() {
  const [lines, setLines] = useState<Line[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchLines()
      .then((data) => {
        if (!cancelled) setLines(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to fetch lines');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { lines, loading, error };
}
