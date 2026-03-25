import { useState, useEffect } from 'react';
import { fetchStationsGeoJSON } from '../api/client';
import type { GeoJSONFeatureCollection } from '../types';

export function useStations() {
  const [data, setData] = useState<GeoJSONFeatureCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchStationsGeoJSON()
      .then((fc) => {
        if (!cancelled) setData(fc);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to fetch stations');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}
