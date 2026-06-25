import { useEffect, useState } from 'react';
import { useMap, MIN_ZOOM, MAX_ZOOM } from '../map/MapProvider';

/**
 * Google Maps 스타일의 커스텀 확대/축소 컨트롤.
 * Naver 기본 zoomControl(Bar)을 대체하며, 우하단에 + / − 버튼만 둔다.
 * 우하단 Naver 오버레이(로고/스케일) 바로 위에 배치한다.
 * 확대/축소 한계(MIN_ZOOM~MAX_ZOOM) 도달 시 해당 버튼을 비활성·반투명 처리한다.
 */
export default function ZoomControl() {
  const map = useMap();
  const [zoomLevel, setZoomLevel] = useState<number | null>(null);

  useEffect(() => {
    if (!map) return;
    setZoomLevel(map.getZoom());
    const listener = naver.maps.Event.addListener(map, 'zoom_changed', () => {
      setZoomLevel(map.getZoom());
    });
    return () => naver.maps.Event.removeListener(listener);
  }, [map]);

  const changeZoom = (delta: number) => {
    if (!map) return;
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, map.getZoom() + delta));
    if (next !== map.getZoom()) map.setZoom(next, true);
  };

  const atMax = zoomLevel != null && zoomLevel >= MAX_ZOOM;
  const atMin = zoomLevel != null && zoomLevel <= MIN_ZOOM;

  const buttonClass =
    'flex h-10 w-10 items-center justify-center text-xl leading-none text-gray-700 transition-opacity enabled:hover:bg-gray-100 disabled:cursor-default disabled:opacity-30';

  return (
    <div className="absolute bottom-16 right-3 z-10 flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
      <button
        type="button"
        onClick={() => changeZoom(1)}
        disabled={atMax}
        aria-label="확대"
        className={buttonClass}
      >
        +
      </button>
      <span className="mx-2 h-px bg-gray-200" />
      <button
        type="button"
        onClick={() => changeZoom(-1)}
        disabled={atMin}
        aria-label="축소"
        className={buttonClass}
      >
        −
      </button>
    </div>
  );
}
