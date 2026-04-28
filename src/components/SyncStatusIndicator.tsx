import { useEffect, useRef, useState } from 'react';
import { useLatestSync, useSyncHistory } from '../hooks/useSyncStatus';
import type { SyncResult } from '../types/housing';

function formatRelativeTime(iso: string, nowMs: number): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '—';
  const diffSec = Math.max(0, Math.round((nowMs - then) / 1000));
  if (diffSec < 5) return '방금';
  if (diffSec < 60) return `${diffSec}초 전`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}시간 전`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}일 전`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('ko-KR', { hour12: false });
}

function isSuccess(result: SyncResult): boolean {
  return !result.error;
}

export default function SyncStatusIndicator() {
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data: latest, loading, error: latestError } = useLatestSync();
  const { data: history } = useSyncHistory(open);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const status: 'success' | 'error' | 'loading' = latestError
    ? 'error'
    : loading && !latest
      ? 'loading'
      : latest && isSuccess(latest)
        ? 'success'
        : 'error';

  const dotColor =
    status === 'success' ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : 'bg-yellow-500';

  const label = latest
    ? `${formatRelativeTime(latest.completed_at, now)} 동기화`
    : loading
      ? '동기화 정보 로딩…'
      : '동기화 정보 없음';

  const count = latest ? latest.fetched_count : 0;

  return (
    <div ref={wrapperRef} className="absolute bottom-3 right-3 z-10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-gray-200 bg-white/95 px-3 py-1.5 text-xs shadow-lg backdrop-blur hover:bg-white"
        aria-label="동기화 상태"
      >
        <span className={`inline-block h-2 w-2 rounded-full ${dotColor}`} />
        <span className="text-gray-700">{label}</span>
        {latest && (
          <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
            {count}건
          </span>
        )}
      </button>

      {open && (
        <div className="absolute bottom-10 right-0 w-80 rounded-lg border border-gray-200 bg-white p-3 text-xs shadow-xl">
          <div className="mb-2 font-medium text-gray-700">동기화 상태</div>

          {latest ? (
            <div className="mb-3 space-y-1 text-gray-600">
              <div className="flex justify-between">
                <span>완료 시각</span>
                <span className="text-gray-800">{formatTime(latest.completed_at)}</span>
              </div>
              <div className="flex justify-between">
                <span>소요 시간</span>
                <span className="text-gray-800">{latest.duration_ms}ms</span>
              </div>
              <div className="flex justify-between">
                <span>가져옴 / 갱신 / 신규</span>
                <span className="text-gray-800">
                  {latest.fetched_count} / {latest.updated_count} / {latest.new_count}
                </span>
              </div>
              {latest.error && (
                <div className="mt-1 rounded bg-red-50 p-2 text-red-700">
                  에러: {latest.error}
                </div>
              )}
            </div>
          ) : (
            <div className="mb-3 text-gray-500">데이터 없음</div>
          )}

          <div className="mb-1 text-gray-500">최근 이력 ({history.length}회)</div>
          {history.length > 0 ? (
            <div className="flex h-12 items-end gap-0.5 rounded bg-gray-50 p-1">
              {history.map((h, i) => {
                const success = isSuccess(h);
                const heightPct = Math.min(
                  100,
                  Math.max(8, Math.round((h.duration_ms / 1000) * 50)),
                );
                return (
                  <div
                    key={`${h.started_at}-${i}`}
                    className={`flex-1 rounded-sm ${success ? 'bg-green-400' : 'bg-red-400'}`}
                    style={{ height: `${heightPct}%` }}
                    title={`${formatTime(h.completed_at)} · ${h.duration_ms}ms · ${h.fetched_count}건${
                      h.error ? ` · 에러: ${h.error}` : ''
                    }`}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-gray-400">이력 로딩…</div>
          )}
        </div>
      )}
    </div>
  );
}
