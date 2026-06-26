import { useState, useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import MapProvider, { useMap } from './map/MapProvider';
import Sidebar from './components/Sidebar';
import ZoomControl from './components/ZoomControl';
import HousingList from './components/HousingList';
import HousingDetailView from './components/HousingDetailView';
import HousingLayer from './components/HousingLayer';
import StationLayer from './components/StationLayer';
import ExitLayer from './components/ExitLayer';
import NearStationHighlight from './components/NearStationHighlight';
import SeoulDistrictLayer from './components/SeoulDistrictLayer';
import FinancePanel from './components/FinancePanel';
import SyncStatusPanel from './components/SyncStatusPanel';
import { useHousings } from './hooks/useHousings';
import { useStations } from './hooks/useStations';
import { useSeoulDistricts } from './hooks/useSeoulDistricts';
import { useRecentSearches, type RecentSearch } from './hooks/useRecentSearches';
import { filterHousings } from './utils/housingSearch';
import { fetchStationDetail } from './api/client';
import type { StationDetail } from './types';
import type { NearbyStation } from './types/housing';

type TabKey = 'housing' | 'finance';

function AppContent() {
  const map = useMap();
  const { data: stationsGeo } = useStations();
  const seoulDistricts = useSeoulDistricts();

  // 지하철 노선은 렌더링하지 않는다 (노선 탭 제거). StationLayer는 빈 셋이라 미표시.
  const [visibleLines] = useState<Set<number>>(new Set());
  const [selectedStation, setSelectedStation] = useState<StationDetail | null>(null);
  const [districtEnabled, _setDistrictEnabled] = useState(false);
  const [visibleDistricts, setVisibleDistricts] = useState<Set<string>>(new Set());
  const districtInitRef = useRef(false);

  const { housings } = useHousings();
  const [selectedHomeCode, setSelectedHomeCode] = useState<string | null>(null);
  const [nearbyStations, setNearbyStations] = useState<NearbyStation[]>([]);
  const [housingPage, setHousingPage] = useState(1);
  const [searchPage, setSearchPage] = useState(1);

  // 추후 종류별 필터링용 변수. null = 전체 표시(현재 기본값).
  // 향후 Set<supply_status> 등을 지정하면 지도 마커를 해당 종류만 렌더하도록 확장한다.
  const [housingStatusFilter, _setHousingStatusFilter] = useState<Set<string> | null>(null);
  const visibleHousings = housingStatusFilter
    ? housings.filter((h) => housingStatusFilter.has(h.supply_status))
    : housings;

  // 좌측 표면 상태: 레일 탭 + 검색어
  const [active, setActive] = useState<TabKey | null>('housing');
  const [searchQuery, setSearchQuery] = useState('');
  const { recents, add: addRecent, clear: clearRecents } = useRecentSearches();

  useEffect(() => {
    if (seoulDistricts && !districtInitRef.current) {
      districtInitRef.current = true;
      setVisibleDistricts(new Set(seoulDistricts.features.map((f) => f.properties.code)));
    }
  }, [seoulDistricts]);

  const handleStationClick = useCallback((stationId: number) => {
    fetchStationDetail(stationId)
      .then((detail) => setSelectedStation(detail))
      .catch(() => setSelectedStation(null));
  }, []);

  const panToHousing = useCallback((homeCode: string) => {
    const housing = housings.find((h) => h.home_code === homeCode);
    if (housing?.longitude != null && housing?.latitude != null && map) {
      map.panTo(new naver.maps.LatLng(housing.latitude, housing.longitude), {
        duration: 1500,
        easing: 'easeOutCubic',
      });
    }
    return housing;
  }, [housings, map]);

  const handleSelectHousing = useCallback((homeCode: string) => {
    setSelectedHomeCode(homeCode);
    setActive('housing');
    const housing = panToHousing(homeCode);
    if (housing) addRecent({ homeCode, name: housing.home_name });
  }, [panToHousing, addRecent]);

  const handlePickRecent = useCallback((item: RecentSearch) => {
    setSelectedHomeCode(item.homeCode);
    setActive('housing');
    const housing = panToHousing(item.homeCode);
    addRecent({ homeCode: item.homeCode, name: housing?.home_name ?? item.name });
  }, [panToHousing, addRecent]);

  const handleBackToHousingList = useCallback(() => {
    setSelectedHomeCode(null);
    setNearbyStations([]);
  }, []);

  const handleNearbyStationsLoaded = useCallback((stations: NearbyStation[]) => {
    setNearbyStations(stations);
  }, []);

  // 레일 탭: 같은 탭 재클릭 시 닫힘. 탭 전환 시 검색/상세는 초기화한다.
  const handleSelectTab = useCallback((key: TabKey) => {
    setSelectedHomeCode(null);
    setNearbyStations([]);
    setSearchQuery('');
    setActive((prev) => (prev === key ? null : key));
  }, []);

  // 검색어 입력: 타이핑하면 상세에서 빠져나와 결과 목록으로.
  const handleSearchChange = useCallback((q: string) => {
    setSearchQuery(q);
    setSearchPage(1);
    setSelectedHomeCode((prev) => (prev ? null : prev));
  }, []);

  // 검색창 X: 검색어 지우기 + 패널 닫기 (단일 출구)
  const handleSearchExit = useCallback(() => {
    setSearchQuery('');
    setSelectedHomeCode(null);
    setNearbyStations([]);
    setActive(null);
  }, []);

  const trimmed = searchQuery.trim().toLowerCase();
  const searchResults = useMemo(
    () => filterHousings(housings, searchQuery),
    [housings, searchQuery],
  );
  const panelOpen = selectedHomeCode != null || trimmed !== '' || active != null;

  // 검색 결과가 바뀌면 결과 마커가 모두 보이도록 지도를 맞춘다.
  // 좌측 패널(레일 72 + 패널 408)에 가리지 않도록 left margin을 크게 둔다.
  useEffect(() => {
    if (!map || trimmed === '') return;
    const coords = searchResults
      .filter((h) => h.latitude != null && h.longitude != null)
      .map((h) => new naver.maps.LatLng(h.latitude as number, h.longitude as number));
    const [first] = coords;
    if (!first) return;
    if (coords.length === 1) {
      map.panTo(first, { duration: 600 });
      return;
    }
    map.fitBounds(coords, { top: 80, right: 80, bottom: 80, left: 500, maxZoom: 16 });
  }, [map, trimmed, searchResults]);

  let panelContent: ReactNode = null;
  if (selectedHomeCode) {
    panelContent = (
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex-1 overflow-y-auto p-3">
          <HousingDetailView
            homeCode={selectedHomeCode}
            onBack={handleBackToHousingList}
            onNearbyStationsLoaded={handleNearbyStationsLoaded}
          />
        </div>
      </div>
    );
  } else if (trimmed !== '') {
    panelContent = (
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex-1 overflow-y-auto p-3">
          {searchResults.length > 0 ? (
            <HousingList
              housings={searchResults}
              onSelectHousing={handleSelectHousing}
              page={searchPage}
              onPageChange={setSearchPage}
            />
          ) : (
            <p className="py-6 text-center text-sm text-gray-400">검색 결과 없음</p>
          )}
        </div>
      </div>
    );
  } else if (active === 'finance') {
    panelContent = <FinancePanel />;
  } else if (active === 'housing') {
    panelContent = (
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex-1 overflow-y-auto p-3">
          <HousingList
            housings={housings}
            onSelectHousing={handleSelectHousing}
            page={housingPage}
            onPageChange={setHousingPage}
          />
        </div>
        <SyncStatusPanel />
      </div>
    );
  }

  return (
    <>
      <StationLayer
        data={stationsGeo}
        visibleLines={visibleLines}
        onStationClick={handleStationClick}
      />
      <ExitLayer
        exits={selectedStation?.exits ?? []}
        stationId={selectedStation?.station_id ?? null}
      />
      <HousingLayer
        housings={visibleHousings}
        selectedHomeCode={selectedHomeCode}
        onHousingClick={handleSelectHousing}
      />
      <NearStationHighlight nearbyStations={nearbyStations} />
      <SeoulDistrictLayer
        data={seoulDistricts}
        visible={districtEnabled}
        visibleDistricts={districtEnabled ? visibleDistricts : null}
      />
      <Sidebar
        active={active}
        onSelectTab={handleSelectTab}
        panelOpen={panelOpen}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearchExit={handleSearchExit}
        recents={recents}
        onPickRecent={handlePickRecent}
        onClearRecents={clearRecents}
      >
        {panelContent}
      </Sidebar>
      <ZoomControl />
    </>
  );
}

export default function App() {
  return (
    <div className="relative h-screen w-screen">
      <MapProvider>
        <AppContent />
      </MapProvider>
    </div>
  );
}
