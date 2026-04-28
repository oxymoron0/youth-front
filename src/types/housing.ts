export interface HousingListItem {
  home_code: string;
  home_name: string;
  supply_status: string;
  address_gu: string | null;
  longitude: number | null;
  latitude: number | null;
}

export interface HousingDetail {
  housing_id: number;
  home_code: string;
  home_name: string;
  address: string | null;
  address_gu: string | null;
  option_subway: string | null;
  supply_status: string;
  deposit_low: number | null;
  rental_low: number | null;
  homepage_url: string | null;
  phone: string | null;
  first_recruit_date: string | null;
  move_in_date: string | null;
  total_units: string | null;
  developer: string | null;
  constructor: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface NearbyStation {
  station_id: number;
  station_name: string;
  line_names: string;
  distance_m: number;
  latitude: number | null;
  longitude: number | null;
}

export const SUPPLY_STATUS_LABELS: Record<string, string> = {
  '01': '청약예정',
  '02': '청약중',
  '03': '추가모집',
  '04': '입주가능',
  '05': '공급완료',
  '06': '공급예정',
  '07': '청약마감',
};

export const AUTO_CHECK_STATUSES = ['01', '02', '03', '06'];

export interface SyncResult {
  fetched_count: number;
  updated_count: number;
  new_count: number;
  duration_ms: number;
  started_at: string;
  completed_at: string;
  error?: string | null;
}

export interface SyncLatestResponse {
  status: 'ok' | 'error';
  result: SyncResult;
}

export interface SyncHistoryResponse {
  status: 'ok' | 'error';
  count: number;
  results: SyncResult[];
}
