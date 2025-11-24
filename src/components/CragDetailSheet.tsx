import { X, Wind, Droplets, Thermometer, Cloud, Star, Edit3, MapPin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Crag, DayAggregate, HourPoint } from '../types';
import { computeFriction } from '../utils/frictionCalculator';
import { calculateWetnessScore } from '../utils/wetnessCalculator';
import { RockTypeInfo } from './RockTypeInfo';
import { WindDirectionIndicator } from './WindDirectionIndicator';
import { EditCragModal } from './EditCragModal';
import { useFavorites } from '../hooks/useFavorites';
import { useSubmitChangeRequest } from '../hooks/useChangeRequests';
import { DayCard } from './DayCard';
import { DayDetailInline } from './DayDetailInline';

interface CragDetailSheetProps {
  crag: Crag;
  currentWeather: HourPoint | null;
  weatherHistory: HourPoint[];
  dayAggregates: DayAggregate[];
  dayHoursMap: Record<string, HourPoint[]>;
  onClose: () => void;
}

export function CragDetailSheet({ crag, currentWeather, weatherHistory, dayAggregates, dayHoursMap, onClose }: CragDetailSheetProps) {
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
  const [selectedDay, setSelectedDay] = useState<DayAggregate | null>(null);
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
      setActiveTab('week');
      if (dayAggregates.length > 0) {
        setSelectedDay(dayAggregates[0]);
      }
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleTabSelect = (tab: 'today' | 'week' | 'analyze') => {
    setActiveTab(tab);

    if (tab === 'week' && dayAggregates.length > 0) {
      setSelectedDay(prev => prev ?? dayAggregates[0]);
    } else {
      setSelectedDay(null);
    }
  };

  const selectedDayHours = selectedDay ? dayHoursMap[selectedDay.date] ?? [] : [];

  useEffect(() => {
    if (activeTab === 'week' && dayAggregates.length > 0 && !selectedDay) {
      setSelectedDay(dayAggregates[0]);
    }
  }, [activeTab, dayAggregates, selectedDay]);

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
          <div className="flex-1 pr-4 space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              <MapPin size={14} />
              <span>{crag.region}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{crag.name}</h2>
            <div
              role="tablist"
              aria-label="Vis værinnhold for craget"
              className="inline-flex bg-slate-100 rounded-full p-1 gap-1 mt-1"
            >
              <button
                id="today-tab"
                role="tab"
                aria-controls="today-panel"
                aria-selected={activeTab === 'today'}
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
                id="week-tab"
                role="tab"
                aria-controls="week-panel"
                aria-selected={activeTab === 'week'}
                type="button"
                onClick={() => handleTabSelect('week')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${
                  activeTab === 'week'
                    ? 'bg-white shadow-sm text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                aria-label="Se 7-dagers utsikt"
              >
                Uke
              </button>
              <button
                id="analyze-tab"
                role="tab"
                aria-controls="analyze-panel"
                aria-selected={activeTab === 'analyze'}
                type="button"
                onClick={() => handleTabSelect('analyze')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${
                  activeTab === 'analyze'
                    ? 'bg-white shadow-sm text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                aria-label="Åpne Analyze Pro fanen"
              >
                Analyze Pro
              </button>
            </div>
            {crag.description && (
              <p className="text-sm text-slate-600">{crag.description}</p>
            )}
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

        {activeTab === 'today' && currentWeather && friction && (
          <div
            id="today-panel"
            role="tabpanel"
            aria-labelledby="today-tab"
            className="space-y-4 mt-2"
          >
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

          </div>
        )}

        {activeTab === 'week' && (
          <div
            id="week-panel"
            role="tabpanel"
            aria-labelledby="week-tab"
            className="space-y-4 mt-2"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">7-dagers utsikt</h3>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-1">Planlegg turen</span>
            </div>

            {dayAggregates.length === 0 && (
              <p className="text-sm text-slate-600">Langtidsvarsler er ikke tilgjengelige for dette craget akkurat nå.</p>
            )}

            {dayAggregates.length > 0 && (
              <>
                <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide">
                  {dayAggregates.slice(0, 7).map(day => (
                    <DayCard
                      key={day.date}
                      day={day}
                      onClick={() => setSelectedDay(day)}
                      isActive={selectedDay?.date === day.date}
                    />
                  ))}
                </div>

                {selectedDay && selectedDayHours.length > 0 && (
                  <DayDetailInline
                    day={selectedDay}
                    hours={selectedDayHours}
                    wallAspect={crag.aspect}
                    onCollapse={() => setSelectedDay(null)}
                  />
                )}
              </>
            )}

            <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 border-t border-slate-100 pt-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />Perfect hours cluster
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-500" />OK conditions
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1">
                <span className="w-2 h-2 rounded-full bg-slate-300" />Nighttime segments
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">
                Best window highlights daylight hours optimert for temperatur, fuktighet, vind og skydekke
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analyze' && (
          <div
            id="analyze-panel"
            role="tabpanel"
            aria-labelledby="analyze-tab"
            className="space-y-4 mt-2"
          >
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">Analyze Pro</h3>
              <p className="text-sm text-slate-700 mt-2">
                Avansert analyse er på vei. Snart kan du sammenligne friksjonstrender, få varsel om best mulige vinduer og eksportere data direkte fra Climbcast.
              </p>
              <p className="text-sm text-slate-600 mt-2">Hold utkikk – vi bygger dette nå!</p>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => setShowEditModal(true)}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 px-6 rounded-2xl transition-all flex items-center justify-center gap-2"
            aria-label="Foreslå en endring for craget"
          >
            <Edit3 size={18} />
            <span>Foreslå endring</span>
          </button>
        </div>

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
