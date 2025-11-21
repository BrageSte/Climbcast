import { Edit3, Calendar } from 'lucide-react';
import { useState } from 'react';
import type { Crag, HourPoint } from '../types';
import { computeFriction } from '../utils/frictionCalculator';
import { calculateWetnessScore } from '../utils/wetnessCalculator';
import { RockTypeInfo } from './RockTypeInfo';
import { WindDirectionIndicator } from './WindDirectionIndicator';
import { FrictionScoreDisplay } from './FrictionScoreDisplay';
import { WetnessIndicator } from './WetnessIndicator';
import { MetricCardsGrid } from './MetricCards';
import { EditCragModal } from './EditCragModal';
import { CragHeader } from './CragHeader';
import { TabNavigation, type CragTabType } from './TabNavigation';
import { useFavorites } from '../hooks/useFavorites';
import { useSubmitChangeRequest } from '../hooks/useChangeRequests';

interface CragDetailSheetProps {
  crag: Crag;
  currentWeather: HourPoint | null;
  weatherHistory: HourPoint[];
  onClose: () => void;
  onExpand: () => void;
}


export function CragDetailSheet({ crag, currentWeather, weatherHistory, onClose, onExpand }: CragDetailSheetProps) {
  const friction = currentWeather ? computeFriction(currentWeather, crag.aspect) : null;
  const wetness = currentWeather && weatherHistory.length > 0
    ? calculateWetnessScore(currentWeather, weatherHistory)
    : null;
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<CragTabType>('live');
  const submitChangeRequest = useSubmitChangeRequest();

  const isFav = isFavorite(crag.id);

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

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 border border-gray-200"
                    >
                      <Edit3 size={18} />
                      <span>Suggest Edit</span>
                    </button>
                    <button
                      onClick={onExpand}
                      className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-2xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                    >
                      <Calendar size={18} />
                      <span>7-Day Forecast</span>
                    </button>
                  </div>
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
            <div className="text-center text-gray-500 py-12">
              Forecast view - Click 7-Day Forecast button for detailed forecast
            </div>
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
