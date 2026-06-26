import { useEffect, useRef } from 'react';
import { useMap } from '../map/MapProvider';
import { SUPPLY_STATUS_LABELS } from '../types/housing';
import type { HousingListItem } from '../types/housing';
import { housingImageUrl } from '../api/housing';
import {
  housingStatusCategory,
  HOUSING_MARKER_COLOR,
  HOUSING_MARKER_Z,
  HOUSING_SELECTED_COLOR,
  HOUSING_SELECTED_Z,
} from '../constants/housingStatus';

interface HousingLayerProps {
  housings: HousingListItem[];
  selectedHomeCode: string | null;
  onHousingClick: (homeCode: string) => void;
}

interface HousingMeta {
  marker: naver.maps.Marker;
  homeCode: string;
  status: string;
  handles: naver.maps.MapEventListener[];
}

const SIZE = 32;
const ANCHOR = SIZE / 2;

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string,
  );
}

function formatWon(v: number | null): string {
  return v == null ? '-' : `${v.toLocaleString()}원`;
}

/** 마커 hover 시 보여줄 미니 팝업(이름·상태·임대료·썸네일) HTML. */
function infoContent(h: HousingListItem): string {
  const label = SUPPLY_STATUS_LABELS[h.supply_status] ?? h.supply_status;
  const color = HOUSING_MARKER_COLOR[housingStatusCategory(h.supply_status)];
  const img = housingImageUrl(h.home_code);
  return (
    `<div style="width:210px;overflow:hidden;border-radius:10px;background:#fff;border:1px solid #e5e7eb;box-shadow:0 4px 14px rgba(0,0,0,.18);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">` +
    `<img src="${img}" onerror="this.style.display='none'" alt="" style="display:block;width:100%;height:104px;object-fit:cover;"/>` +
    `<div style="padding:8px 10px;">` +
    `<div style="font-size:13px;font-weight:700;color:#1f2937;line-height:1.35;">${escapeHtml(h.home_name)}</div>` +
    `<div style="margin-top:5px;"><span style="display:inline-block;background:${color};color:#fff;border-radius:9999px;padding:1px 8px;font-size:10px;font-weight:600;">${escapeHtml(label)}</span></div>` +
    `<div style="margin-top:6px;font-size:11px;color:#374151;">보증금 ${formatWon(h.deposit_low)} · 월 ${formatWon(h.rental_low)}</div>` +
    `</div></div>`
  );
}

const HOUSE_PATH_1 =
  'M487.083,225.514l-75.08-75.08V63.704c0-15.682-12.708-28.391-28.413-28.391c-15.669,0-28.377,12.709-28.377,28.391v29.941L299.31,37.74c-27.639-27.624-75.694-27.575-103.27,0.05L8.312,225.514c-11.082,11.104-11.082,29.071,0,40.158c11.087,11.101,29.089,11.101,40.172,0l187.71-187.729c6.115-6.083,16.893-6.083,22.976-0.018l187.742,187.747c5.567,5.551,12.825,8.312,20.081,8.312c7.271,0,14.541-2.764,20.091-8.312C498.17,254.586,498.17,236.619,487.083,225.514z';
const HOUSE_PATH_2 =
  'M257.561,131.836c-5.454-5.451-14.285-5.451-19.723,0L72.712,296.913c-2.607,2.606-4.085,6.164-4.085,9.877v120.401c0,28.253,22.908,51.16,51.16,51.16h81.754v-126.61h92.299v126.61h81.755c28.251,0,51.159-22.907,51.159-51.159V306.79c0-3.713-1.465-7.271-4.085-9.877L257.561,131.836z';

// 색/강조 조합별 아이콘을 캐시한다 (선택 토글 시 문자열 재생성 방지).
const iconCache = new Map<string, naver.maps.HtmlIcon>();

function getIcon(color: string, emphasized: boolean): naver.maps.HtmlIcon {
  const key = `${color}|${emphasized}`;
  let icon = iconCache.get(key);
  if (!icon) {
    const stroke = emphasized ? 3 : 2;
    const content =
      `<div style="position:relative;width:${SIZE}px;height:${SIZE}px;cursor:pointer;">` +
      `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 32 32">` +
      `<circle cx="16" cy="16" r="14" fill="white" stroke="${color}" stroke-width="${stroke}"/>` +
      `<g transform="translate(6, 7) scale(0.04)">` +
      `<path fill="${color}" d="${HOUSE_PATH_1}"/>` +
      `<path fill="${color}" d="${HOUSE_PATH_2}"/>` +
      `</g>` +
      `</svg></div>`;
    icon = { content, anchor: new naver.maps.Point(ANCHOR, ANCHOR) };
    iconCache.set(key, icon);
  }
  return icon;
}

function styleFor(status: string, selected: boolean): { icon: naver.maps.HtmlIcon; z: number } {
  if (selected) {
    return { icon: getIcon(HOUSING_SELECTED_COLOR, true), z: HOUSING_SELECTED_Z };
  }
  const category = housingStatusCategory(status);
  return { icon: getIcon(HOUSING_MARKER_COLOR[category], false), z: HOUSING_MARKER_Z[category] };
}

export default function HousingLayer({
  housings,
  selectedHomeCode,
  onHousingClick,
}: HousingLayerProps) {
  const map = useMap();
  const metasRef = useRef<HousingMeta[]>([]);
  // 마커 재생성 시 현재 선택 상태를 반영하되, 선택 변경만으로 재생성하지 않도록 ref로 참조.
  const selectedRef = useRef(selectedHomeCode);
  selectedRef.current = selectedHomeCode;

  useEffect(() => {
    if (!map) return;

    const infoWindow = new naver.maps.InfoWindow({
      content: '',
      backgroundColor: 'transparent',
      borderWidth: 0,
      disableAnchor: true,
      pixelOffset: new naver.maps.Point(0, -14),
      maxWidth: 230,
    });

    const metas: HousingMeta[] = [];
    for (const h of housings) {
      if (h.longitude == null || h.latitude == null) continue;

      const { icon, z } = styleFor(h.supply_status, h.home_code === selectedRef.current);
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(h.latitude, h.longitude),
        icon,
        title: h.home_name,
        zIndex: z,
        map,
      });

      const handles = [
        naver.maps.Event.addListener(marker, 'click', () => onHousingClick(h.home_code)),
        naver.maps.Event.addListener(marker, 'mouseover', () => {
          infoWindow.setContent(infoContent(h));
          infoWindow.open(map, marker);
        }),
        naver.maps.Event.addListener(marker, 'mouseout', () => infoWindow.close()),
      ];

      metas.push({ marker, homeCode: h.home_code, status: h.supply_status, handles });
    }

    metasRef.current = metas;

    return () => {
      infoWindow.close();
      for (const m of metas) {
        for (const handle of m.handles) naver.maps.Event.removeListener(handle);
        m.marker.setMap(null);
      }
      metasRef.current = [];
    };
  }, [map, housings, onHousingClick]);

  // 선택 변경 시: 선택 마커는 파랑+최상단, 나머지는 상태별 색/레이어로 복귀.
  useEffect(() => {
    for (const m of metasRef.current) {
      const { icon, z } = styleFor(m.status, m.homeCode === selectedHomeCode);
      m.marker.setIcon(icon);
      m.marker.setZIndex(z);
    }
  }, [selectedHomeCode]);

  return null;
}
