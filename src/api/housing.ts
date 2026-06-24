import { apiFetch } from './client';
import { env } from '../env';
import type {
  HousingListItem,
  HousingDetail,
  NearbyStation,
  SyncLatestResponse,
  SyncHistoryResponse,
} from '../types/housing';

export function fetchHousings(): Promise<HousingListItem[]> {
  return apiFetch<HousingListItem[]>('/api/v1/housings');
}

/** Absolute URL for a housing's stored representative image (served by our API). */
export function housingImageUrl(homeCode: string): string {
  const base = env('VITE_API_BASE_URL');
  return `${base}/api/v1/housings/${encodeURIComponent(homeCode)}/image`;
}

export function fetchHousingDetail(homeCode: string): Promise<HousingDetail> {
  return apiFetch<HousingDetail>(`/api/v1/housings/${encodeURIComponent(homeCode)}`);
}

export function fetchNearbyStations(homeCode: string, distance = 150): Promise<NearbyStation[]> {
  return apiFetch<NearbyStation[]>(
    `/api/v1/housings/${encodeURIComponent(homeCode)}/nearby-stations?distance=${distance}`
  );
}

export function fetchLatestSync(): Promise<SyncLatestResponse> {
  return apiFetch<SyncLatestResponse>('/api/v1/housings/sync/latest');
}

export function fetchSyncHistory(limit = 48): Promise<SyncHistoryResponse> {
  return apiFetch<SyncHistoryResponse>(`/api/v1/housings/sync/history?limit=${limit}`);
}
