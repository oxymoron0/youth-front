import { useState, useCallback, useEffect, useRef } from 'react';
import MetroViewer, { useViewer } from './components/MetroViewer';
import StationLayer from './components/StationLayer';
import ExitLayer from './components/ExitLayer';
import LeftPanel from './components/LeftPanel';
import SearchBar from './components/SearchBar';
import SeoulDistrictLayer from './components/SeoulDistrictLayer';
import HousingList from './components/HousingList';
import HousingDetailView from './components/HousingDetailView';
import HousingLayer from './components/HousingLayer';
import NearStationHighlight from './components/NearStationHighlight';
import { useStations } from './hooks/useStations';
import { useLines } from './hooks/useLines';
import { useSeoulDistricts } from './hooks/useSeoulDistricts';
import { useHousings } from './hooks/useHousings';
import { fetchStationDetail } from './api/client';
import type { StationDetail } from './types';
import type { NearbyStation } from './types/housing';
import { AUTO_CHECK_STATUSES } from './types/housing';
import { Cartesian3 } from 'cesium';

function AppContent() {
  const viewer = useViewer();
  const { data: stationsGeo } = useStations();
  const { lines, loading: linesLoading } = useLines();
  const seoulDistricts = useSeoulDistricts();

  const [activeTab, setActiveTab] = useState<'housing' | 'lines'>('housing');
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
  const housingInitRef = useRef(false);

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

  const handleSearchSelect = useCallback(
    (stationId: number, lon: number, lat: number) => {
      if (viewer) {
        viewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(lon, lat, 3000),
          duration: 1.5,
        });
      }
      handleStationClick(stationId);
    },
    [viewer, handleStationClick],
  );

  const handleToggleHomeCheck = useCallback((homeCode: string) => {
    setCheckedHomes((prev) => {
      const next = new Set(prev);
      if (next.has(homeCode)) next.delete(homeCode);
      else next.add(homeCode);
      return next;
    });
  }, []);

  const handleSelectHousing = useCallback((homeCode: string) => {
    setSelectedHomeCode(homeCode);
    const housing = housings.find((h) => h.home_code === homeCode);
    if (housing?.longitude != null && housing?.latitude != null && viewer) {
      const height = viewer.camera.positionCartographic.height;
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(housing.longitude, housing.latitude, height),
        duration: 1.5,
      });
    }
  }, [housings, viewer]);

  const handleBackToHousingList = useCallback(() => {
    setSelectedHomeCode(null);
    setNearbyStations([]);
  }, []);

  const handleNearbyStationsLoaded = useCallback((stations: NearbyStation[]) => {
    setNearbyStations(stations);
  }, []);

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
      <SearchBar onSelect={handleSearchSelect} />
      <LeftPanel
        activeTab={activeTab}
        onTabChange={setActiveTab}
        lines={lines}
        visibleLines={visibleLines}
        onToggle={handleToggleLine}
        linesLoading={linesLoading}
      >
        {selectedHomeCode ? (
          <HousingDetailView
            homeCode={selectedHomeCode}
            onBack={handleBackToHousingList}
            onNearbyStationsLoaded={handleNearbyStationsLoaded}
          />
        ) : (
          <HousingList
            housings={housings}
            checkedHomes={checkedHomes}
            onToggleCheck={handleToggleHomeCheck}
            onSelectHousing={handleSelectHousing}
            page={housingPage}
            onPageChange={setHousingPage}
          />
        )}
      </LeftPanel>
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
    </>
  );
}

export default function App() {
  return (
    <div className="relative h-screen w-screen">
      <MetroViewer>
        <AppContent />
      </MetroViewer>
    </div>
  );
}
