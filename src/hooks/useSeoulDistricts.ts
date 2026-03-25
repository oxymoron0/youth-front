import { useState, useEffect } from 'react';

export interface SeoulDistrictFeature {
  type: 'Feature';
  properties: {
    code: string;
    name: string;
    name_eng: string;
    base_year: string;
  };
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export interface SeoulDistrictCollection {
  type: 'FeatureCollection';
  features: SeoulDistrictFeature[];
}

export function useSeoulDistricts() {
  const [data, setData] = useState<SeoulDistrictCollection | null>(null);

  useEffect(() => {
    fetch('/seoul_districts.geojson')
      .then((res) => res.json())
      .then((json: SeoulDistrictCollection) => setData(json))
      .catch((err) => console.warn('Failed to load Seoul districts:', err));
  }, []);

  return data;
}
