export interface Station {
  station_id: number;
  station_code: string;
  station_name: string;
  station_name_en?: string;
  latitude: number;
  longitude: number;
  is_transfer: boolean;
  lines: LineBrief[];
}

export interface LineBrief {
  line_id: number;
  line_name: string;
  line_color?: string;
}

export interface StationDetail extends Station {
  station_name_cn?: string;
  address?: string;
  phone?: string;
  exits: ExitInfo[];
  transfers: TransferInfo[];
}

export interface ExitInfo {
  exit_id: number;
  exit_number: string;
  exit_name?: string;
  latitude?: number;
  longitude?: number;
}

export interface TransferInfo {
  transfer_id: number;
  to_station_id: number;
  to_station_name: string;
  from_line_id: number;
  from_line_name: string;
  to_line_id: number;
  to_line_name: string;
  transfer_time?: number;
}

export interface Line {
  line_id: number;
  line_code: string;
  line_name: string;
  line_color?: string;
  operator_name?: string;
  station_count?: number;
  start_station?: string;
  end_station?: string;
}

export interface SearchResult {
  station_id: number;
  station_name: string;
  station_name_en?: string;
  latitude: number;
  longitude: number;
  similarity_score?: number;
  lines: LineBrief[];
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: number[];
  };
  properties: Record<string, unknown>;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}
