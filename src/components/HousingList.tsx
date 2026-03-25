import { SUPPLY_STATUS_LABELS } from '../types/housing';
import type { HousingListItem } from '../types/housing';

interface HousingListProps {
  housings: HousingListItem[];
  checkedHomes: Set<string>;
  onToggleCheck: (homeCode: string) => void;
  onSelectHousing: (homeCode: string) => void;
  page: number;
  onPageChange: (page: number) => void;
}

const PAGE_SIZE = 8;

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

export default function HousingList({
  housings,
  checkedHomes,
  onToggleCheck,
  onSelectHousing,
  page,
  onPageChange,
}: HousingListProps) {
  const totalPages = Math.max(1, Math.ceil(housings.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = housings.slice(start, start + PAGE_SIZE);

  return (
    <div className="flex flex-col gap-1">
      {housings.length === 0 && (
        <p className="py-4 text-center text-sm text-gray-400">데이터 없음</p>
      )}
      {pageItems.map((h) => (
        <div
          key={h.home_code}
          className="flex items-start gap-2 rounded-md border border-gray-100 px-2 py-1.5 hover:bg-blue-50/50"
        >
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 shrink-0 accent-blue-600"
            checked={checkedHomes.has(h.home_code)}
            onChange={() => onToggleCheck(h.home_code)}
          />
          <div className="min-w-0 flex-1">
            <button
              onClick={() => onSelectHousing(h.home_code)}
              className="text-left text-sm font-medium text-gray-800 hover:text-blue-600 hover:underline"
            >
              {h.home_name}
            </button>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span
                className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${statusBadgeClass(h.supply_status)}`}
              >
                {SUPPLY_STATUS_LABELS[h.supply_status] ?? h.supply_status}
              </span>
              {h.address_gu && (
                <span className="text-[11px] text-gray-400">{h.address_gu}</span>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Pagination */}
      {housings.length > PAGE_SIZE && (
        <div className="mt-1 flex items-center justify-center gap-3">
          <button
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-30"
          >
            &lt; 이전
          </button>
          <span className="text-xs text-gray-500">
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-30"
          >
            다음 &gt;
          </button>
        </div>
      )}
    </div>
  );
}
