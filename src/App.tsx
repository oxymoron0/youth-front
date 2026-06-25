import { useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
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
import LineSelector from './components/LineSelector';
import SyncStatusPanel from './components/SyncStatusPanel';
import { useLines } from './hooks/useLines';
import { useHousings } from './hooks/useHousings';
import { useStations } from './hooks/useStations';
import { useSeoulDistricts } from './hooks/useSeoulDistricts';
import { useRecentSearches, type RecentSearch } from './hooks/useRecentSearches';
import { fetchStationDetail } from './api/client';
import type { StationDetail } from './types';
import type { NearbyStation } from './types/housing';
import { AUTO_CHECK_STATUSES } from './types/housing';

type TabKey = 'housing' | 'lines';

function AppContent() {
  const map = useMap();
  const { lines, loading: linesLoading } = useLines();
  const { data: stationsGeo } = useStations();
  const seoulDistricts = useSeoulDistricts();

  const [visibleLines, setVisibleLines] = useState<Set<number>>(new Set());
  const [selectedStation, setSelectedStation] = useState<StationDetail | null>(null);
  const [districtEnabled, _setDistrictEnabled] = useState(false);
  const [visibleDistricts, setVisibleDistricts] = useState<Set<string>>(new Set());
  const initRef = useRef(false);
  const districtInitRef = useRef(false);

  const { housings } = useHousings();
  const [checkedHomes, setCheckedHomes] = useState<Set<string>>(new Set());
  const [selectedHomeCode, setSelectedHomeCode] = useState<string | null>(null);
  const [nearbyStations, setNearbyStations] = useState<NearbyStation[]>([]);
  const [housingPage, setHousingPage] = useState(1);
  const [searchPage, setSearchPage] = useState(1);
  const housingInitRef = useRef(false);

  // 좌측 표면 상태: 레일 탭 + 검색어
  const [active, setActive] = useState<TabKey | null>('housing');
  const [searchQuery, setSearchQuery] = useState('');
  const { recents, add: addRecent, clear: clearRecents } = useRecentSearches();

  useEffect(() => {
    if (lines.length > 0 && !initRef.current) {
      initRef.current = true;
      setVisibleLines(new Set(lines.map((l) => l.line_id)));
    }
  }, [lines]);

  useEffect(() => {
    if (seoulDistricts && !districtInitRef.current) {
      districtInitRef.current = true;
      setVisibleDistricts(new Set(seoulDistricts.features.map((f) => f.properties.code)));
    }
  }, [seoulDistricts]);

  useEffect(() => {
    if (housings.length > 0 && !housingInitRef.current) {
      housingInitRef.current = true;
      setCheckedHomes(new Set(
        housings
          .filter((h) => AUTO_CHECK_STATUSES.includes(h.supply_status))
          .map((h) => h.home_code)
      ));
    }
  }, [housings]);

  const handleToggleLine = useCallback((lineId: number) => {
    setVisibleLines((prev) => {
      const next = new Set(prev);
      if (next.has(lineId)) next.delete(lineId);
      else next.add(lineId);
      return next;
    });
  }, []);

  const handleStationClick = useCallback((stationId: number) => {
    fetchStationDetail(stationId)
      .then((detail) => setSelectedStation(detail))
      .catch(() => setSelectedStation(null));
  }, []);

  const handleToggleHomeCheck = useCallback((homeCode: string) => {
    setCheckedHomes((prev) => {
      const next = new Set(prev);
      if (next.has(homeCode)) next.delete(homeCode);
      else next.add(homeCode);
      return next;
    });
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
  const searchResults = trimmed
    ? housings.filter((h) => h.home_name.toLowerCase().includes(trimmed))
    : [];
  const panelOpen = selectedHomeCode != null || trimmed !== '' || active != null;

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
              checkedHomes={checkedHomes}
              onToggleCheck={handleToggleHomeCheck}
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
  } else if (active === 'lines') {
    panelContent = (
      <div className="h-full overflow-y-auto p-3">
        <LineSelector
          lines={lines}
          visibleLines={visibleLines}
          onToggle={handleToggleLine}
          loading={linesLoading}
          embedded
        />
      </div>
    );
  } else if (active === 'housing') {
    panelContent = (
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex-1 overflow-y-auto p-3">
          <HousingList
            housings={housings}
            checkedHomes={checkedHomes}
            onToggleCheck={handleToggleHomeCheck}
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
        housings={housings}
        checkedHomes={checkedHomes}
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
