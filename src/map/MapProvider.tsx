import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { loadNaverScript } from './loadNaverScript';

const MapContext = createContext<naver.maps.Map | null>(null);

export function useMap(): naver.maps.Map | null {
  return useContext(MapContext);
}

const SEOUL_CENTER: naver.maps.LatLngObjectLiteral = { lat: 37.5665, lng: 126.978 };
const INITIAL_ZOOM = 12;

/** 확대/축소 한계 (수도권 전체 ~ 건물 단위). ZoomControl과 공유한다. */
export const MIN_ZOOM = 9;
export const MAX_ZOOM = 19;

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
          minZoom: MIN_ZOOM,
          maxZoom: MAX_ZOOM,
          mapTypeId: ns.maps.MapTypeId.NORMAL,
          mapTypeControl: false,
          // 기본 확대-축소 Bar 제거 → 커스텀 ZoomControl 사용
          zoomControl: false,
          // 로고/스케일(Naver 오버레이)은 우하단으로 두고, 커스텀 줌 버튼을 그 위에 배치
          logoControl: true,
          logoControlOptions: { position: ns.maps.Position.BOTTOM_RIGHT },
          scaleControl: true,
          scaleControlOptions: { position: ns.maps.Position.BOTTOM_RIGHT },
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
      <div
        ref={containerRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
      {error && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '0.5rem 1rem',
            background: '#fef2f2',
            color: '#b91c1c',
            borderRadius: '0.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,.15)',
            fontSize: '0.875rem',
          }}
        >
          지도를 불러오지 못했습니다: {error}
        </div>
      )}
      {map && children}
    </MapContext.Provider>
  );
}
