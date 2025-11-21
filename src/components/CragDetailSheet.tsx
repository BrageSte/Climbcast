import { Edit3 } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { Crag, HourPoint } from '../types';
import { computeFriction } from '../utils/frictionCalculator';
import { calculateWetnessScore } from '../utils/wetnessCalculator';
import { groupHoursByDay, aggregateDay } from '../utils/dayAggregator';
import { RockTypeInfo } from './RockTypeInfo';
import { WindDirectionIndicator } from './WindDirectionIndicator';
import { FrictionScoreDisplay } from './FrictionScoreDisplay';
import { WetnessIndicator } from './WetnessIndicator';
import { MetricCardsGrid } from './MetricCards';
import { VerticalDayForecast } from './VerticalDayForecast';
import { EditCragModal } from './EditCragModal';
import { CragHeader } from './CragHeader';
import { TabNavigation, type CragTabType } from './TabNavigation';
import { useFavorites } from '../hooks/useFavorites';
import { useSubmitChangeRequest } from '../hooks/useChangeRequests';
import { format } from 'date-fns';

interface CragDetailSheetProps {
  crag: Crag;
  currentWeather: HourPoint | null;
  weatherHistory: HourPoint[];
  onClose: () => void;
  onExpand: () => void;
  allWeatherHours?: HourPoint[];
  sunriseSunsetData?: Map<string, { sunrise: string | null; sunset: string | null }>;
}


export function CragDetailSheet({ crag, currentWeather, weatherHistory, onClose, onExpand, allWeatherHours = [], sunriseSunsetData }: CragDetailSheetProps) {
  const friction = currentWeather ? computeFriction(currentWeather, crag.aspect) : null;
  const wetness = currentWeather && weatherHistory.length > 0
    ? calculateWetnessScore(currentWeather, weatherHistory)
    : null;
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<CragTabType>('live');
  const submitChangeRequest = useSubmitChangeRequest();

  const isFav = isFavorite(crag.id);

  const dayAggregates = useMemo(() => {
    if (!allWeatherHours || allWeatherHours.length === 0) return [];

    const dayGroups = groupHoursByDay(allWeatherHours);
    return dayGroups.map(hours => {
      const date = format(new Date(hours[0].time), 'yyyy-MM-dd');
      const sunData = sunriseSunsetData?.get(date);
      return aggregateDay(
        hours,
        crag.aspect,
        sunData?.sunrise ?? null,
        sunData?.sunset ?? null
      );
    });
  }, [allWeatherHours, crag.aspect, sunriseSunsetData]);

  const hoursByDay = useMemo(() => {
    if (!allWeatherHours || allWeatherHours.length === 0) return new Map();

    const dayGroups = groupHoursByDay(allWeatherHours);
    const map = new Map<string, HourPoint[]>();

    dayGroups.forEach(hours => {
      const date = format(new Date(hours[0].time), 'yyyy-MM-dd');
      map.set(date, hours);
    });

    return map;
  }, [allWeatherHours]);

  const handleSubmitEdit = async (changes: Record<string, unknown>, comment: string, latitude?: number, longitude?: number) => {
    await submitChangeRequest.mutateAsync({
      cragId: crag.id,
      requestedChanges: changes,
      userComment: comment,
      cragLatitude: latitude,
      cragLongitude: longitude,
    });
  };


  return (
    <div className="fixed inset-0 bg-white z-[1000] flex flex-col overflow-hidden">
      <CragHeader
        crag={crag}
        currentWeather={currentWeather}
        isFavorite={isFav}
        onToggleFavorite={() => toggleFavorite(crag.id)}
        onClose={onClose}
      />

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
          {activeTab === 'live' && (
            <>
              {crag.description && (
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">{crag.description}</p>
              )}

              {currentWeather && friction && (
                <div className="space-y-4">
                  <FrictionScoreDisplay
                    score={friction.score}
                    label={friction.label}
                    hasAspectData={friction.hasAspectData}
                  />

                  {wetness && <WetnessIndicator wetness={wetness} />}

                  <WindDirectionIndicator
                    windDirection={currentWeather.windDirection}
                    wallAspect={crag.aspect}
                    windSpeed={currentWeather.windSpeed}
                  />

                  <MetricCardsGrid
                    temperature={currentWeather.temperature}
                    humidity={currentWeather.humidity}
                    windSpeed={currentWeather.windSpeed}
                    cloudCover={currentWeather.cloudCover}
                  />

                  <RockTypeInfo
                    rockType={crag.rock_type}
                    rockSource={crag.rock_source}
                    rockConfidence={crag.rock_confidence}
                  />

                  <button
                    onClick={() => setShowEditModal(true)}
                    className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 border border-gray-200 mt-6"
                  >
                    <Edit3 size={18} />
                    <span>Suggest Edit</span>
                  </button>
                </div>
              )}

              {!currentWeather && (
                <div className="text-center text-gray-500 py-12">
                  Loading weather data...
                </div>
              )}
            </>
          )}

          {activeTab === 'forecast' && (
            <>
              {dayAggregates.length > 0 ? (
                <VerticalDayForecast days={dayAggregates} hoursByDay={hoursByDay} />
              ) : (
                <div className="text-center text-gray-500 py-12">
                  Loading forecast data...
                </div>
              )}
            </>
          )}

          {activeTab === 'analysis' && (
            <div className="text-center text-gray-500 py-12">
              Analysis view - Coming soon
            </div>
          )}
        </div>
      </div>

      {showEditModal && (
        <EditCragModal
          crag={crag}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleSubmitEdit}
        />
      )}
    </div>
  );
}
