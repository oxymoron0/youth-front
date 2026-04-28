import { useState, type ReactNode } from 'react';
import LineSelector from './LineSelector';
import SearchBar from './SearchBar';
import type { Line } from '../types';

interface LeftPanelProps {
  activeTab: 'housing' | 'lines';
  onTabChange: (tab: 'housing' | 'lines') => void;
  lines: Line[];
  visibleLines: Set<number>;
  onToggle: (lineId: number) => void;
  linesLoading: boolean;
  onSearchSelect: (stationId: number, lon: number, lat: number) => void;
  children?: ReactNode;
}

const DESKTOP_CLASSES =
  'md:absolute md:left-[52px] md:top-3 md:bottom-auto md:right-auto md:h-auto md:max-h-[calc(100vh-1.5rem)] md:w-72 md:rounded-lg md:translate-y-0';
const MOBILE_BASE =
  'fixed inset-x-0 bottom-0 z-10 flex flex-col rounded-t-2xl bg-white/95 shadow-2xl backdrop-blur transition-transform duration-200 ease-out';
const MOBILE_HEIGHT = 'h-[55vh]';
const MOBILE_COLLAPSED = 'translate-y-[calc(100%-3.25rem)]';

export default function LeftPanel({
  activeTab,
  onTabChange,
  lines,
  visibleLines,
  onToggle,
  linesLoading,
  onSearchSelect,
  children,
}: LeftPanelProps) {
  const [expanded, setExpanded] = useState(true);

  const containerClasses = [
    MOBILE_BASE,
    MOBILE_HEIGHT,
    expanded ? 'translate-y-0' : MOBILE_COLLAPSED,
    DESKTOP_CLASSES,
  ].join(' ');

  return (
    <div className={containerClasses}>
      {/* Drag handle (mobile only) — click to toggle expand/collapse */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-label={expanded ? '패널 접기' : '패널 펼치기'}
        className="md:hidden mx-auto mt-2 mb-1 h-1.5 w-12 shrink-0 rounded-full bg-gray-300 hover:bg-gray-400"
      />

      {/* Tab bar */}
      <div className="flex border-b border-gray-200 px-1 pt-1">
        <button
          onClick={() => {
            onTabChange('housing');
            setExpanded(true);
          }}
          className={`flex-1 rounded-t-lg px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === 'housing'
              ? 'border-b-2 border-blue-600 bg-white text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          청년 주택
        </button>
        <button
          onClick={() => {
            onTabChange('lines');
            setExpanded(true);
          }}
          className={`flex-1 rounded-t-lg px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === 'lines'
              ? 'border-b-2 border-blue-600 bg-white text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          지하철 노선
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className={activeTab === 'housing' ? '' : 'hidden'}>{children}</div>
        <div className={activeTab === 'lines' ? 'space-y-3' : 'hidden'}>
          <SearchBar onSelect={onSearchSelect} embedded />
          <LineSelector
            lines={lines}
            visibleLines={visibleLines}
            onToggle={onToggle}
            loading={linesLoading}
            embedded
          />
        </div>
      </div>
    </div>
  );
}
