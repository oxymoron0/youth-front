import { type ReactNode } from 'react';
import HousingSearchBar from './HousingSearchBar';
import type { RecentSearch } from '../hooks/useRecentSearches';

type TabKey = 'housing' | 'finance';

interface SidebarProps {
  active: TabKey | null;
  onSelectTab: (key: TabKey) => void;
  /** 패널 본문(검색결과/목록/상세/금융)이 펼쳐져 있는지 */
  panelOpen: boolean;
  /** 상세(히어로 이미지) 모드 — true면 이미지가 최상단까지 차고 검색바가 그 위에 오버레이된다 */
  heroOverlay: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchExit: () => void;
  recents: RecentSearch[];
  onPickRecent: (item: RecentSearch) => void;
  onClearRecents: () => void;
  /** 패널 본문 콘텐츠 (App이 상태에 따라 계산) */
  children?: ReactNode;
}

const RAIL_WIDTH = 72;
const PANEL_WIDTH = 408;

function HamburgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function HouseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  );
}

function FinanceIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="13" rx="2" />
      <path d="M2 10h20" />
      <path d="M6 15h4" />
    </svg>
  );
}

const TABS: { key: TabKey; label: string; icon: ReactNode }[] = [
  { key: 'housing', label: '청년주택', icon: <HouseIcon /> },
  { key: 'finance', label: '금융', icon: <FinanceIcon /> },
];

export default function Sidebar({
  active,
  onSelectTab,
  panelOpen,
  heroOverlay,
  searchQuery,
  onSearchChange,
  onSearchExit,
  recents,
  onPickRecent,
  onClearRecents,
  children,
}: SidebarProps) {
  const searchBar = (
    <HousingSearchBar
      query={searchQuery}
      onChange={onSearchChange}
      onExit={onSearchExit}
      showExit={panelOpen}
      recents={recents}
      onPickRecent={onPickRecent}
      onClearRecents={onClearRecents}
    />
  );

  const railItems = (vertical: boolean) => (
    <>
      {/* 햄버거 (메뉴 placeholder — 동작 추후구현) */}
      <button
        type="button"
        aria-label="메뉴"
        title="메뉴 (준비 중)"
        className={
          vertical
            ? 'flex flex-col items-center gap-0.5 py-3 text-[11px] font-medium text-gray-500'
            : 'flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-gray-500'
        }
      >
        <span className={vertical ? 'flex h-10 w-10 items-center justify-center rounded-lg' : ''}>
          <HamburgerIcon />
        </span>
      </button>
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        const color = isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700';
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onSelectTab(tab.key)}
            aria-pressed={isActive}
            className={
              vertical
                ? `flex flex-col items-center gap-0.5 py-3 text-[11px] font-medium transition-colors ${color}`
                : `flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${color}`
            }
          >
            <span className={vertical ? `flex h-10 w-10 items-center justify-center rounded-lg ${isActive ? 'bg-blue-50' : ''}` : ''}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        );
      })}
    </>
  );

  return (
    <>
      {/* ===== Desktop: 좌측 레일 + 검색 표면 ===== */}
      <nav
        className="absolute left-0 top-0 bottom-0 z-20 hidden flex-col border-r border-gray-200 bg-white md:flex"
        style={{ width: RAIL_WIDTH }}
      >
        {railItems(true)}
      </nav>

      {/* 검색 표면 컬럼 — 검색바가 패널 최상단에 오버레이된다(Google Maps).
          상세(heroOverlay)면 이미지가 최상단까지 차서 검색바가 이미지 위에 떠 보인다. */}
      <div
        className="pointer-events-none absolute top-0 bottom-0 z-10 hidden md:block"
        style={{ left: RAIL_WIDTH, width: PANEL_WIDTH }}
      >
        <div className="relative h-full">
          {/* 흰 배경 (패널 열렸을 때) */}
          {panelOpen && (
            <div className="pointer-events-auto absolute inset-0 border-r border-gray-200 bg-white shadow-xl" />
          )}
          {/* 본문 — 패널 전체를 채움. 상세가 아니면 검색바 높이만큼 내려서 시작한다. */}
          {panelOpen && (
            <div
              className={`pointer-events-auto absolute inset-0 overflow-hidden ${
                heroOverlay ? '' : 'pt-[60px]'
              }`}
            >
              {children}
            </div>
          )}
          {/* 검색바 — 항상 최상단에 오버레이 (이미지 위에 뜸) */}
          <div className="pointer-events-auto absolute inset-x-0 top-0 z-30 px-3 pt-3">{searchBar}</div>
        </div>
      </div>

      {/* ===== Mobile: 상단 검색바 + 하단 바 + 바텀시트 ===== */}
      <div className="pointer-events-none fixed inset-x-2 top-2 z-40 md:hidden">
        {searchBar}
      </div>

      <div
        className={`fixed inset-x-0 bottom-0 z-30 flex h-[70vh] flex-col rounded-t-2xl bg-white pb-16 shadow-2xl transition-transform duration-200 ease-out md:hidden ${
          panelOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <button
          type="button"
          onClick={onSearchExit}
          aria-label="패널 닫기"
          className="mx-auto mt-2 mb-1 h-1.5 w-12 shrink-0 rounded-full bg-gray-300"
        />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 border-t border-gray-200 bg-white md:hidden">
        {railItems(false)}
      </nav>
    </>
  );
}
