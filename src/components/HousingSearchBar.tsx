import { useState } from 'react';
import type { RecentSearch } from '../hooks/useRecentSearches';

interface HousingSearchBarProps {
  query: string;
  onChange: (q: string) => void;
  /** X 버튼: 검색어 지우기 + 패널 닫기(단일 출구) */
  onExit: () => void;
  /** X 표시 여부 (검색어가 있거나 패널이 열려 있을 때) */
  showExit: boolean;
  recents: RecentSearch[];
  onPickRecent: (item: RecentSearch) => void;
  onClearRecents: () => void;
}

/**
 * Google Maps 스타일의 검색 표면 상단 바.
 * 항상 보이며, 입력 시 좌측 패널이 결과로 확장된다(위치 불변).
 * 포커스 + 빈 검색어일 때 최근 검색(localStorage)을 드롭다운으로 보여준다.
 */
export default function HousingSearchBar({
  query,
  onChange,
  onExit,
  showExit,
  recents,
  onPickRecent,
  onClearRecents,
}: HousingSearchBarProps) {
  const [focused, setFocused] = useState(false);
  const showRecents = focused && query === '' && recents.length > 0;

  return (
    <div className="pointer-events-auto relative">
      <div className="flex h-12 items-center gap-2 rounded-lg bg-white px-3 shadow-md ring-1 ring-black/5">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-gray-400"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="청년주택 검색"
          aria-label="청년주택 검색"
          className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
        />
        {showExit && (
          <button
            type="button"
            onClick={onExit}
            aria-label="검색 지우기 및 닫기"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
      </div>

      {showRecents && (
        <div className="absolute left-0 right-0 top-full mt-1 overflow-hidden rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5">
          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-[11px] font-medium text-gray-400">최근 검색</span>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={onClearRecents}
              className="text-[11px] text-gray-400 hover:text-gray-600"
            >
              기록 지우기
            </button>
          </div>
          <ul>
            {recents.map((r) => (
              <li key={r.homeCode}>
                <button
                  type="button"
                  // 입력 blur 전에 클릭이 처리되도록 mousedown 기본동작 차단
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onPickRecent(r)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-gray-400">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                  <span className="truncate">{r.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
