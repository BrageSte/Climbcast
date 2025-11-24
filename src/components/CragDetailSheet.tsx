import { X, Wind, Droplets, Thermometer, Cloud, ChevronUp, Star, Edit3 } from 'lucide-react';
import { useState, useRef } from 'react';
import type { Crag, HourPoint } from '../types';
import { computeFriction } from '../utils/frictionCalculator';
import { calculateWetnessScore } from '../utils/wetnessCalculator';
import { RockTypeInfo } from './RockTypeInfo';
import { WindDirectionIndicator } from './WindDirectionIndicator';
import { FrictionScoreDisplay } from './FrictionScoreDisplay';
import { WetnessIndicator } from './WetnessIndicator';
import { EditCragModal } from './EditCragModal';
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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const submitChangeRequest = useSubmitChangeRequest();

  const isFav = isFavorite(crag.id);

  const minSwipeDistance = 50;

  const handleSubmitEdit = async (changes: Record<string, unknown>, comment: string, latitude?: number, longitude?: number) => {
    await submitChangeRequest.mutateAsync({
      cragId: crag.id,
      requestedChanges: changes,
      userComment: comment,
      cragLatitude: latitude,
      cragLongitude: longitude,
    });
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > minSwipeDistance;
    if (isUpSwipe) {
      onExpand();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div
      ref={sheetRef}
      className="fixed bottom-16 left-0 right-0 bg-white/95 backdrop-blur-md rounded-t-3xl shadow-2xl z-[1000] animate-slide-up max-h-[85vh] flex flex-col"
    >
      <div
        className="flex-shrink-0 pt-4 cursor-grab active:cursor-grabbing"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="w-12 h-1 bg-gray-400 rounded-full mx-auto mb-4" />
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4 max-w-2xl mx-auto w-full"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth'
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-4">
            <h2 className="text-xl font-bold text-gray-900">{crag.name}</h2>
            <p className="text-sm text-gray-500">{crag.region}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => toggleFavorite(crag.id)}
              className={`p-2.5 rounded-full transition-all ${
                isFav
                  ? 'bg-yellow-100 hover:bg-yellow-200'
                  : 'hover:bg-gray-100'
              }`}
              aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star
                size={20}
                className={isFav ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}
              />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        {crag.description && (
          <p className="text-sm text-gray-700 mb-4">{crag.description}</p>
        )}

        {currentWeather && friction && (
          <div className="space-y-3 mt-3">
            {wetness && <WetnessIndicator wetness={wetness} />}

            <FrictionScoreDisplay score={friction.score} label={friction.label} hasAspectData={friction.hasAspectData} />

            <WindDirectionIndicator
              windDirection={currentWeather.windDirection}
              wallAspect={crag.aspect}
              windSpeed={currentWeather.windSpeed}
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Thermometer size={18} className="text-gray-600" />
                <span className="text-sm text-gray-700">{currentWeather.temperature}°C</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets size={18} className="text-gray-600" />
                <span className="text-sm text-gray-700">{currentWeather.humidity}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind size={18} className="text-gray-600" />
                <span className="text-sm text-gray-700">{currentWeather.windSpeed} m/s</span>
              </div>
              <div className="flex items-center gap-2">
                <Cloud size={18} className="text-gray-600" />
                <span className="text-sm text-gray-700">{currentWeather.cloudCover}%</span>
              </div>
            </div>

            <RockTypeInfo
              rockType={crag.rock_type}
              rockSource={crag.rock_source}
              rockConfidence={crag.rock_confidence}
            />

            <div className="flex gap-3 mt-3">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                <Edit3 size={18} />
                <span>Foreslå endring</span>
              </button>
              <button
                onClick={onExpand}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                <span>7-dagers</span>
                <ChevronUp size={20} />
              </button>
            </div>
          </div>
        )}

        {showEditModal && (
          <EditCragModal
            crag={crag}
            onClose={() => setShowEditModal(false)}
            onSubmit={handleSubmitEdit}
          />
        )}

        {!currentWeather && (
          <div className="text-center text-gray-500 py-4">
            Loading weather data...
          </div>
        )}
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
