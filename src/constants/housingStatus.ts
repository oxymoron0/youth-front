/**
 * 청년주택 공급상태를 지도 아이콘 색/레이어를 위한 3개 범주로 묶는다.
 *  - active   청약중·추가모집      → 붉은색
 *  - upcoming 청약예정·공급예정     → 초록색
 *  - done     입주가능·공급완료·마감 → 회색
 */
export type HousingStatusCategory = 'active' | 'upcoming' | 'done';

export function housingStatusCategory(status: string): HousingStatusCategory {
  switch (status) {
    case '02': // 청약중
    case '03': // 추가모집
      return 'active';
    case '01': // 청약예정
    case '06': // 공급예정
      return 'upcoming';
    default: // 04 입주가능, 05 공급완료, 07 청약마감, 그 외
      return 'done';
  }
}

export const HOUSING_MARKER_COLOR: Record<HousingStatusCategory, string> = {
  active: '#dc2626', // 청약중 — 붉은색
  upcoming: '#16a34a', // 청약예정 — 초록색
  done: '#9ca3af', // 공급완료 — 회색
};

/** 선택된 마커 — 파란색 (선택 해제 시 원래 범주색으로 복귀) */
export const HOUSING_SELECTED_COLOR = '#2563eb';

/**
 * 겹칠 때 쌓임 순서(zIndex). 청약중 > 청약예정 > 공급완료,
 * 선택된 마커는 항상 최상단.
 */
export const HOUSING_MARKER_Z: Record<HousingStatusCategory, number> = {
  active: 300,
  upcoming: 200,
  done: 100,
};

export const HOUSING_SELECTED_Z = 1000;
