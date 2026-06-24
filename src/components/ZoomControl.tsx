import { useMap } from '../map/MapProvider';

/**
 * Google Maps 스타일의 커스텀 확대/축소 컨트롤.
 * Naver 기본 zoomControl(Bar)을 대체하며, 우하단에 + / − 버튼만 둔다.
 * 좌하단의 Naver 로고/스케일과 겹치지 않도록 우측에 배치한다.
 */
export default function ZoomControl() {
  const map = useMap();

  const zoom = (delta: number) => {
    if (!map) return;
    map.setZoom(map.getZoom() + delta, true);
  };

  return (
    <div className="absolute bottom-6 right-3 z-10 flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
      <button
        type="button"
        onClick={() => zoom(1)}
        aria-label="확대"
        className="flex h-10 w-10 items-center justify-center text-xl leading-none text-gray-700 hover:bg-gray-100"
      >
        +
      </button>
      <span className="mx-2 h-px bg-gray-200" />
      <button
        type="button"
        onClick={() => zoom(-1)}
        aria-label="축소"
        className="flex h-10 w-10 items-center justify-center text-xl leading-none text-gray-700 hover:bg-gray-100"
      >
        −
      </button>
    </div>
  );
}
