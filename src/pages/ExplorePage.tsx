import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Map as MapComponent } from '../components/Map';
import { SearchBar } from '../components/SearchBar';
import { CragDetailSheet } from '../components/CragDetailSheet';
import { SevenDayForecast } from '../components/SevenDayForecast';
import { AddCragForm } from '../components/AddCragForm';
import { useCrags } from '../hooks/useCrags';
import { useWeather } from '../hooks/useWeather';
import { useAddCrag } from '../hooks/useAddCrag';
import { groupHoursByDay, aggregateDay } from '../utils/dayAggregator';
import type { Crag, DayAggregate } from '../types';
import { format } from 'date-fns';

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const cragIdFromUrl = searchParams.get('crag');

  const { data: crags, isLoading: cragsLoading } = useCrags();
  const addCragMutation = useAddCrag();

  const selectedCrag = useMemo(() => {
    if (!cragIdFromUrl || !crags) return null;
    return crags.find(c => c.id === cragIdFromUrl) || null;
  }, [cragIdFromUrl, crags]);

  const [showForecast, setShowForecast] = useState(false);
  const [selectedForecastDay, setSelectedForecastDay] = useState<DayAggregate | null>(null);
  const [showAddCragForm, setShowAddCragForm] = useState(false);

  const { data: weatherData } = useWeather(
    selectedCrag?.latitude ?? 60.035226,
    selectedCrag?.longitude ?? 11.048964
  );

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

  const handleCragSelect = (crag: Crag) => {
    setSearchParams({ crag: crag.id });
    setShowForecast(false);
    setSelectedForecastDay(null);
  };

  const handleClose = () => {
    setSearchParams({});
    setShowForecast(false);
    setSelectedForecastDay(null);
  };

  const handleDaySelect = (day: DayAggregate | null) => {
    setSelectedForecastDay(day);
  };

  const handleAddCrag = async (cragData: Parameters<typeof addCragMutation.mutateAsync>[0]) => {
    await addCragMutation.mutateAsync(cragData);
  };

  if (cragsLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading crags...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] relative">
      <MapComponent
        crags={crags ?? []}
        onCragSelect={handleCragSelect}
        selectedCrag={selectedCrag}
      />

      <SearchBar
        crags={crags ?? []}
        onCragSelect={handleCragSelect}
      />

      {selectedCrag && !showForecast && (
        <CragDetailSheet
          crag={selectedCrag}
          currentWeather={currentWeather}
          weatherHistory={weatherData?.hours ?? []}
          onClose={handleClose}
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

      {showAddCragForm && (
        <AddCragForm
          onClose={() => setShowAddCragForm(false)}
          onSubmit={handleAddCrag}
        />
      )}
    </div>
  );
}
