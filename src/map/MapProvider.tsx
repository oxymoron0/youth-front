import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { loadNaverScript } from './loadNaverScript';

const MapContext = createContext<naver.maps.Map | null>(null);

export function useMap(): naver.maps.Map | null {
  return useContext(MapContext);
}

const SEOUL_CENTER: naver.maps.LatLngObjectLiteral = { lat: 37.5665, lng: 126.978 };
const INITIAL_ZOOM = 12;

export default function MapProvider({ children }: { children?: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<naver.maps.Map | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let instance: naver.maps.Map | null = null;

    loadNaverScript()
      .then((ns) => {
        if (cancelled || !containerRef.current) return;
        instance = new ns.maps.Map(containerRef.current, {
          center: new ns.maps.LatLng(SEOUL_CENTER.lat, SEOUL_CENTER.lng),
          zoom: INITIAL_ZOOM,
          mapTypeId: ns.maps.MapTypeId.NORMAL,
          mapTypeControl: false,
          zoomControl: true,
          scaleControl: true,
          logoControl: true,
        });
        setMap(instance);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Failed to initialize Naver Map';
        console.error('[MapProvider]', message);
        setError(message);
      });

    return () => {
      cancelled = true;
      if (instance) {
        instance.destroy();
        instance = null;
      }
      setMap(null);
    };
  }, []);

  return (
    <MapContext.Provider value={map}>
      <div ref={containerRef} className="absolute inset-0" />
      {error && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-red-50 px-4 py-2 text-sm text-red-700 shadow">
          지도를 불러오지 못했습니다: {error}
        </div>
      )}
      {map && children}
    </MapContext.Provider>
  );
}
