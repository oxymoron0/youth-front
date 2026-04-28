import { apiFetch } from './client';
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
