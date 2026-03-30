import type { StationDetail, Line, SearchResult, GeoJSONFeatureCollection } from '../types';
import { env } from '../env';

const BASE_URL = env('VITE_API_BASE_URL');

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Accept': 'application/json',
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const err: Record<string, unknown> = await res.json().catch(() => ({}));
    const msg = (err?.['error'] as Record<string, unknown>)?.['message'];
    throw new Error(typeof msg === 'string' ? msg : res.statusText);
  }
  return res.json() as Promise<T>;
}

export function fetchStationsGeoJSON(): Promise<GeoJSONFeatureCollection> {
  return apiFetch<GeoJSONFeatureCollection>('/api/v1/stations?format=geojson');
}

export function fetchStationDetail(id: number): Promise<StationDetail> {
  return apiFetch<StationDetail>(`/api/v1/stations/${id}`);
}

export function searchStations(query: string): Promise<SearchResult[]> {
  return apiFetch<SearchResult[]>(`/api/v1/stations/search?q=${encodeURIComponent(query)}`);
}

export function fetchNearbyStations(lon: number, lat: number, radius: number): Promise<GeoJSONFeatureCollection> {
  return apiFetch<GeoJSONFeatureCollection>(
    `/api/v1/stations/nearby?lon=${lon}&lat=${lat}&radius=${radius}`
  );
}

export function fetchLines(): Promise<Line[]> {
  return apiFetch<Line[]>('/api/v1/lines');
}

export function fetchLineStations(lineId: number): Promise<GeoJSONFeatureCollection> {
  return apiFetch<GeoJSONFeatureCollection>(`/api/v1/lines/${lineId}/stations`);
}

export function fetchLineGeometry(lineId: number): Promise<GeoJSONFeatureCollection> {
  return apiFetch<GeoJSONFeatureCollection>(`/api/v1/lines/${lineId}/geometry`);
}

export function fetchTransfers(stationId: number): Promise<unknown> {
  return apiFetch<unknown>(`/api/v1/transfers/${stationId}`);
}
