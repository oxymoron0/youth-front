import { useState, useEffect } from 'react';
import { fetchHousingDetail, fetchNearbyStations } from '../api/housing';
import { SUPPLY_STATUS_LABELS } from '../types/housing';
import type { HousingDetail, NearbyStation } from '../types/housing';

interface HousingDetailViewProps {
  homeCode: string;
  onBack: () => void;
  onNearbyStationsLoaded: (stations: NearbyStation[]) => void;
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case '01':
    case '06':
      return 'bg-emerald-100 text-emerald-700';
    case '02':
    case '03':
      return 'bg-red-100 text-red-700';
    case '04':
      return 'bg-blue-100 text-blue-700';
    case '05':
    case '07':
      return 'bg-gray-100 text-gray-500';
    default:
      return 'bg-gray-100 text-gray-500';
  }
}

function formatWon(value: number | null): string {
  if (value == null) return '-';
  return `${value.toLocaleString()}원`;
}

export default function HousingDetailView({
  homeCode,
  onBack,
  onNearbyStationsLoaded,
}: HousingDetailViewProps) {
  const [detail, setDetail] = useState<HousingDetail | null>(null);
  const [nearbyStations, setNearbyStations] = useState<NearbyStation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      fetchHousingDetail(homeCode),
      fetchNearbyStations(homeCode),
    ])
      .then(([d, ns]) => {
        if (cancelled) return;
        setDetail(d);
        setNearbyStations(ns);
        onNearbyStationsLoaded(ns);
      })
      .catch(() => {
        if (!cancelled) {
          setDetail(null);
          setNearbyStations([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [homeCode, onNearbyStationsLoaded]);

  if (loading) {
    return <p className="py-6 text-center text-sm text-gray-400">불러오는 중...</p>;
  }

  if (!detail) {
    return <p className="py-6 text-center text-sm text-red-400">정보를 불러올 수 없습니다</p>;
  }

  return (
    <div className="flex flex-col gap-3 text-sm">
      {/* Back button */}
      <button
        onClick={onBack}
        className="self-start text-xs text-blue-600 hover:underline"
      >
        &lt; 목록으로
      </button>

      {/* Header */}
      <div>
        <h3 className="text-base font-bold text-gray-900">{detail.home_name}</h3>
        <span
          className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none ${statusBadgeClass(detail.supply_status)}`}
        >
          {SUPPLY_STATUS_LABELS[detail.supply_status] ?? detail.supply_status}
        </span>
      </div>

      {/* Info rows */}
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
        {detail.address && (
          <>
            <dt className="font-medium text-gray-500">주소</dt>
            <dd className="text-gray-800">{detail.address}</dd>
          </>
        )}
        {(detail.deposit_low != null || detail.rental_low != null) && (
          <>
            <dt className="font-medium text-gray-500">보증금/임대</dt>
            <dd className="text-gray-800">
              {formatWon(detail.deposit_low)} / {formatWon(detail.rental_low)}
            </dd>
          </>
        )}
        {detail.total_units && (
          <>
            <dt className="font-medium text-gray-500">총 세대</dt>
            <dd className="text-gray-800">{detail.total_units}</dd>
          </>
        )}
        {detail.first_recruit_date && (
          <>
            <dt className="font-medium text-gray-500">최초 모집</dt>
            <dd className="text-gray-800">{detail.first_recruit_date}</dd>
          </>
        )}
        {detail.move_in_date && (
          <>
            <dt className="font-medium text-gray-500">입주 예정</dt>
            <dd className="text-gray-800">{detail.move_in_date}</dd>
          </>
        )}
        {detail.developer && (
          <>
            <dt className="font-medium text-gray-500">시행사</dt>
            <dd className="text-gray-800">{detail.developer}</dd>
          </>
        )}
        {detail.constructor && (
          <>
            <dt className="font-medium text-gray-500">시공사</dt>
            <dd className="text-gray-800">{detail.constructor}</dd>
          </>
        )}
        {detail.phone && (
          <>
            <dt className="font-medium text-gray-500">전화</dt>
            <dd className="text-gray-800">{detail.phone}</dd>
          </>
        )}
        {detail.option_subway && (
          <>
            <dt className="font-medium text-gray-500">지하철</dt>
            <dd className="text-gray-800">{detail.option_subway}</dd>
          </>
        )}
      </dl>

      {/* Homepage link */}
      {detail.homepage_url && (
        <a
          href={detail.homepage_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline"
        >
          홈페이지 바로가기
        </a>
      )}

      {/* Nearby stations */}
      <div className="mt-1 border-t border-gray-200 pt-2">
        <h4 className="mb-1 text-xs font-semibold text-gray-700">근처 지하철역 (150m)</h4>
        {nearbyStations.length === 0 ? (
          <p className="text-xs text-gray-400">근처역 없음 (150m 이내)</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {nearbyStations.map((s) => (
              <li
                key={s.station_id}
                className="rounded bg-orange-50 px-2 py-1 text-xs"
              >
                <span className="font-medium text-gray-800">{s.station_name}</span>
                <span className="ml-1 text-gray-500">({s.line_names})</span>
                <span className="ml-1 text-orange-600">{Math.round(s.distance_m)}m</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
