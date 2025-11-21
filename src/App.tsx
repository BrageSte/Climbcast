import { useState, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navigation, type TabType } from './components/Navigation';
import { HomeView } from './components/HomeView';
import { ExploreView } from './components/ExploreView';
import { AnalyzeView } from './components/AnalyzeView';
import { ProfileView } from './components/ProfileView';
import { CragDetailSheet } from './components/CragDetailSheet';
import { SevenDayForecast } from './components/SevenDayForecast';
import { useCrags } from './hooks/useCrags';
import { useWeather } from './hooks/useWeather';
import { useAllCragsWeather } from './hooks/useAllCragsWeather';
import { groupHoursByDay, aggregateDay } from './utils/dayAggregator';
import type { Crag, DayAggregate } from './types';
import { format } from 'date-fns';

const queryClient = new QueryClient();

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedCrag, setSelectedCrag] = useState<Crag | null>(null);
  const [showForecast, setShowForecast] = useState(false);
  const [selectedForecastDay, setSelectedForecastDay] = useState<DayAggregate | null>(null);

  const { data: crags, isLoading: cragsLoading, error: cragsError } = useCrags();
  const { data: allCragsWeatherData } = useAllCragsWeather(crags);

  const { data: weatherData } = useWeather(
    selectedCrag?.latitude ?? 60.035226,
    selectedCrag?.longitude ?? 11.048964
  );

  const weatherMap = useMemo(() => {
    return allCragsWeatherData?.weatherMap ?? new Map();
  }, [allCragsWeatherData]);

  const dayAggregates = useMemo(() => {
    if (!weatherData || !selectedCrag) return [];

    const dayGroups = groupHoursByDay(weatherData.hours);
    return dayGroups.map(hours => {
      const date = format(new Date(hours[0].time), 'yyyy-MM-dd');
      const sunData = weatherData.sunriseSunset.get(date);
      return aggregateDay(
        hours,
        selectedCrag.aspect,
        sunData?.sunrise ?? null,
        sunData?.sunset ?? null
      );
    });
  }, [weatherData, selectedCrag]);

  const currentWeather = weatherData?.hours[0] ?? null;

  const selectedForecastDayHours = useMemo(() => {
    if (!selectedForecastDay || !weatherData) return [];

    const dayGroups = groupHoursByDay(weatherData.hours);
    const dayGroup = dayGroups.find(hours => {
      const firstHour = new Date(hours[0].time);
      return firstHour.toISOString().split('T')[0] === selectedForecastDay.date;
    });

    return dayGroup ?? [];
  }, [selectedForecastDay, weatherData]);

  if (cragsLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading crags...</p>
        </div>
      </div>
    );
  }

  if (cragsError) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6">
          <p className="text-red-600 font-semibold mb-2">Error loading crags</p>
          <p className="text-gray-600 text-sm">{cragsError.message}</p>
        </div>
      </div>
    );
  }

  const handleCragSelect = (crag: Crag) => {
    setSelectedCrag(crag);
    setShowForecast(false);
    setSelectedForecastDay(null);
    setActiveTab('map');
  };

  const handleDaySelect = (day: DayAggregate | null) => {
    setSelectedForecastDay(day);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab !== 'explore') {
      setSelectedCrag(null);
      setShowForecast(false);
      setSelectedForecastDay(null);
    }
  };


  return (
    <div className="h-screen relative overflow-hidden">
      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />

      {activeTab === 'home' && (
        <HomeView
          crags={crags ?? []}
          weatherData={weatherMap}
          onCragSelect={(crag) => {
            handleCragSelect(crag);
            setActiveTab('explore');
          }}
        />
      )}

      {activeTab === 'explore' && (
        <>
          <ExploreView
            crags={crags ?? []}
            selectedCrag={selectedCrag}
            onCragSelect={handleCragSelect}
          />

          {selectedCrag && !showForecast && (
            <CragDetailSheet
              crag={selectedCrag}
              currentWeather={currentWeather}
              weatherHistory={weatherData?.hours ?? []}
              allWeatherHours={weatherData?.hours ?? []}
              sunriseSunsetData={weatherData?.sunriseSunset}
              onClose={() => setSelectedCrag(null)}
              onExpand={() => setShowForecast(true)}
            />
          )}

          {selectedCrag && showForecast && (
            <SevenDayForecast
              days={dayAggregates}
              cragName={selectedCrag.name}
              onClose={() => {
                setShowForecast(false);
                setSelectedForecastDay(null);
              }}
              onDaySelect={handleDaySelect}
              selectedDay={selectedForecastDay}
              selectedDayHours={selectedForecastDayHours}
              wallAspect={selectedCrag?.aspect ?? null}
            />
          )}
        </>
      )}

      {activeTab === 'analyze' && (
        <AnalyzeView
          crags={crags ?? []}
          weatherData={weatherMap}
          onCragSelect={(crag) => {
            handleCragSelect(crag);
            setActiveTab('explore');
          }}
        />
      )}

      {activeTab === 'profile' && <ProfileView />}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
