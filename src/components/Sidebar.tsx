import { useState, type ReactNode } from 'react';
import LineSelector from './LineSelector';
import SyncStatusPanel from './SyncStatusPanel';
import type { Line } from '../types';

interface SidebarProps {
  lines: Line[];
  visibleLines: Set<number>;
  onToggle: (lineId: number) => void;
  linesLoading: boolean;
  /** 청년주택 탭 콘텐츠 (HousingList / HousingDetailView) */
  children?: ReactNode;
}

type TabKey = 'housing' | 'lines';

const RAIL_WIDTH = 72;
const PANEL_WIDTH = 408;

function HouseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  );
}

function SubwayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="3" width="12" height="14" rx="3" />
      <path d="M6 11h12" />
      <circle cx="9" cy="14" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="15" cy="14" r="0.8" fill="currentColor" stroke="none" />
      <path d="M8 17l-2 4M16 17l2 4" />
    </svg>
  );
}

const TABS: { key: TabKey; label: string; icon: ReactNode }[] = [
  { key: 'housing', label: '청년주택', icon: <HouseIcon /> },
  { key: 'lines', label: '노선', icon: <SubwayIcon /> },
];

export default function Sidebar({
  lines,
  visibleLines,
  onToggle,
  linesLoading,
  children,
}: SidebarProps) {
  const [active, setActive] = useState<TabKey | null>('housing');

  const toggle = (key: TabKey) => setActive((prev) => (prev === key ? null : key));

  const housingPanel = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 overflow-y-auto p-3">{children}</div>
      <SyncStatusPanel />
    </div>
  );

  const linesPanel = (
    <div className="h-full overflow-y-auto p-3">
      <LineSelector
        lines={lines}
        visibleLines={visibleLines}
        onToggle={onToggle}
        loading={linesLoading}
        embedded
      />
    </div>
  );

  const panelBody = (
    <>
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
        <span className="text-sm font-semibold text-gray-800">
          {active === 'housing' ? '청년주택' : '지하철 노선'}
        </span>
        <button
          type="button"
          onClick={() => setActive(null)}
          aria-label="패널 닫기"
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <div className="min-h-0 flex-1">
        <div className={active === 'housing' ? 'h-full' : 'hidden'}>{housingPanel}</div>
        <div className={active === 'lines' ? 'h-full' : 'hidden'}>{linesPanel}</div>
      </div>
    </>
  );

  return (
    <>
      {/* ===== Desktop: 좌측 세로 레일 + 사이드 패널 ===== */}
      {/* 레일 */}
      <nav
        className="absolute left-0 top-0 bottom-0 z-20 hidden flex-col border-r border-gray-200 bg-white md:flex"
        style={{ width: RAIL_WIDTH }}
      >
        {TABS.map((tab) => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => toggle(tab.key)}
              aria-pressed={isActive}
              className={`flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  isActive ? 'bg-blue-50' : ''
                }`}
              >
                {tab.icon}
              </span>
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* 패널 (지도 위 오버레이 — 지도 크기는 변하지 않음) */}
      <div
        className={`absolute top-0 bottom-0 z-10 hidden flex-col border-r border-gray-200 bg-white shadow-xl transition-transform duration-200 ease-out md:flex ${
          active ? 'translate-x-0' : 'pointer-events-none -translate-x-[480px]'
        }`}
        style={{ left: RAIL_WIDTH, width: PANEL_WIDTH }}
      >
        {panelBody}
      </div>

      {/* ===== Mobile: 하단 아이콘 바 + 바텀시트 ===== */}
      {/* 바텀시트 (하단 바보다 아래 z, 하단 16(=64px)은 바 영역으로 패딩) */}
      <div
        className={`fixed inset-x-0 bottom-0 z-30 flex h-[70vh] flex-col rounded-t-2xl bg-white pb-16 shadow-2xl transition-transform duration-200 ease-out md:hidden ${
          active ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <button
          type="button"
          onClick={() => setActive(null)}
          aria-label="패널 닫기"
          className="mx-auto mt-2 mb-1 h-1.5 w-12 shrink-0 rounded-full bg-gray-300"
        />
        {panelBody}
      </div>

      {/* 하단 아이콘 바 (시트보다 위 z로 항상 탭 가능) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 border-t border-gray-200 bg-white md:hidden">
        {TABS.map((tab) => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => toggle(tab.key)}
              aria-pressed={isActive}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </nav>
    </>
  );
}
