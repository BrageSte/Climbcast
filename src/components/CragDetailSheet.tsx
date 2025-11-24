import { X, Wind, Droplets, Thermometer, Cloud, Star, Edit3, MapPin } from 'lucide-react';
import { useState, useRef } from 'react';
import type { Crag, HourPoint } from '../types';
import { computeFriction } from '../utils/frictionCalculator';
import { calculateWetnessScore } from '../utils/wetnessCalculator';
import { RockTypeInfo } from './RockTypeInfo';
import { WindDirectionIndicator } from './WindDirectionIndicator';
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
  const conditionLabel = wetness
    ? wetness.score <= 30
      ? 'Tørr'
      : wetness.score <= 60
        ? 'Fuktig'
        : 'Våt'
    : 'Oppdateres';
  const { isFavorite, toggleFavorite } = useFavorites();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'analyze'>('today');
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
      setActiveTab('week');
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleTabSelect = (tab: 'today' | 'week' | 'analyze') => {
    setActiveTab(tab);

    if (tab === 'week') {
      onExpand();
      return;
    }

    if (tab === 'analyze') {
      window.alert('Analyze Pro kommer snart! Hold utkikk for avansert innsikt.');
    }
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
          <div className="flex-1 pr-4 space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              <MapPin size={14} />
              <span>{crag.region}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{crag.name}</h2>
            {crag.description && (
              <p className="text-sm text-slate-600">{crag.description}</p>
            )}
            <div className="mt-3 inline-flex bg-slate-100 rounded-full p-1 gap-1">
              <button
                type="button"
                onClick={() => handleTabSelect('today')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${
                  activeTab === 'today'
                    ? 'bg-white shadow-sm text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                I dag
              </button>
              <button
                type="button"
                onClick={() => handleTabSelect('week')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${
                  activeTab === 'week'
                    ? 'bg-white shadow-sm text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Uke
              </button>
              <button
                type="button"
                onClick={() => handleTabSelect('analyze')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${
                  activeTab === 'analyze'
                    ? 'bg-white shadow-sm text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Analyze Pro
              </button>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => toggleFavorite(crag.id)}
              className={`p-2.5 rounded-full transition-all ${
                isFav
                  ? 'bg-yellow-100 hover:bg-yellow-200'
                  : 'hover:bg-slate-100'
              }`}
              aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star
                size={20}
                className={isFav ? 'text-yellow-500 fill-yellow-500' : 'text-slate-400'}
              />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>
        </div>

        {!currentWeather && (
          <div className="text-center text-slate-500 py-4">
            Laster værdata...
          </div>
        )}

        {currentWeather && friction && (
          <div className="space-y-4 mt-2">
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {conditionLabel}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                    {friction.hasAspectData ? 'Høy pålitelighet' : 'Estimert aspekt'}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  Oppdatert nå · {currentWeather.temperature}°C · {currentWeather.windSpeed} m/s vind
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-24 h-24 rounded-full bg-gradient-to-b from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-inner">
                  <span className="text-3xl font-bold">{friction.score}</span>
                </div>
                <span className="text-xs text-slate-500">Friction score</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-3">
                <Thermometer size={18} className="text-rose-500" />
                <div>
                  <p className="text-xs text-slate-500">Temperatur</p>
                  <p className="text-sm font-semibold text-slate-800">{currentWeather.temperature}°C</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-3">
                <Droplets size={18} className="text-sky-600" />
                <div>
                  <p className="text-xs text-slate-500">Luftfuktighet</p>
                  <p className="text-sm font-semibold text-slate-800">{currentWeather.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-3">
                <Wind size={18} className="text-blue-600" />
                <div>
                  <p className="text-xs text-slate-500">Vind</p>
                  <p className="text-sm font-semibold text-slate-800">{currentWeather.windSpeed} m/s</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-3">
                <Cloud size={18} className="text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Skydekke</p>
                  <p className="text-sm font-semibold text-slate-800">{currentWeather.cloudCover}%</p>
                </div>
              </div>
            </div>

            <WindDirectionIndicator
              windDirection={currentWeather.windDirection}
              wallAspect={crag.aspect}
              windSpeed={currentWeather.windSpeed}
            />

            <RockTypeInfo
              rockType={crag.rock_type}
              rockSource={crag.rock_source}
              rockConfidence={crag.rock_confidence}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">Hva skjer fremover</h3>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-1">Nærmeste timer</span>
              </div>
              <div className="space-y-2">
                {weatherHistory.slice(0, 4).map((hour) => {
                  const hourFriction = computeFriction(hour, crag.aspect);
                  const timeLabel = new Date(hour.time).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={hour.time} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{timeLabel}</p>
                        <p className="text-xs text-slate-500">{hourFriction.label} forhold</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-b from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-inner">
                          <span className="text-lg font-bold">{hourFriction.score}</span>
                        </div>
                        <div className="text-sm text-slate-600 flex items-center gap-1">
                          <Thermometer size={14} className="text-rose-500" />
                          <span>{hour.temperature}°C</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 px-6 rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                <Edit3 size={18} />
                <span>Foreslå endring</span>
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
      </div>
    </div>
  );
}
