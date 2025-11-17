import { ArrowLeft, Wind, Droplets, Thermometer, Cloud, ChevronDown, Sunrise, Sunset } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import type { DayAggregate, HourPoint } from '../types';
import { computeFriction } from '../utils/frictionCalculator';

interface DayDetailViewProps {
  day: DayAggregate;
  hours: HourPoint[];
  onBack: () => void;
}

function getRatingColor(rating: string): string {
  switch (rating) {
    case 'Perfect':
      return 'bg-green-500';
    case 'OK':
      return 'bg-yellow-500';
    case 'Poor':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

function getHeatbarColor(quality: string, isDaylight: boolean): string {
  if (!isDaylight) {
    return 'bg-gray-200';
  }
  switch (quality) {
    case 'perfect':
      return 'bg-green-500';
    case 'ok':
      return 'bg-yellow-400';
    case 'poor':
      return 'bg-red-400';
    default:
      return 'bg-gray-300';
  }
}

interface DayDetailViewPropsWithAspect extends DayDetailViewProps {
  wallAspect: number | null;
}

export function DayDetailView({ day, hours, onBack, wallAspect }: DayDetailViewPropsWithAspect) {
  const date = new Date(day.date);
  const formattedDate = format(date, 'EEEE, MMMM d, yyyy');
  const [expandedHour, setExpandedHour] = useState<number | null>(null);

  const formatTime = (isoString: string | null) => {
    if (!isoString) return 'N/A';
    const time = new Date(isoString);
    return format(time, 'HH:mm');
  };

  const toggleHour = (index: number) => {
    setExpandedHour(expandedHour === index ? null : index);
  };

  return (
    <div className="fixed inset-0 bg-gray-50 z-[1002] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">{formattedDate}</h2>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${getRatingColor(day.rating)}`} />
              <span className="text-lg font-semibold text-gray-900">{day.rating} Day</span>
            </div>
            <div className="text-sm text-gray-600">
              {day.minTemp}°C - {day.maxTemp}°C
            </div>
          </div>

          {(day.sunrise || day.sunset) && (
            <div className="flex justify-around bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 mb-4">
              {day.sunrise && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Sunrise size={20} className="text-amber-600" />
                    <span className="text-xs font-medium text-gray-600">Sunrise</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">{formatTime(day.sunrise)}</div>
                </div>
              )}
              {day.sunset && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Sunset size={20} className="text-orange-600" />
                    <span className="text-xs font-medium text-gray-600">Sunset</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">{formatTime(day.sunset)}</div>
                </div>
              )}
            </div>
          )}

          {day.bestWindow && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Best Climbing Window (Daylight Only)</h3>
              <div className="text-2xl font-bold text-blue-600">
                {String(day.bestWindow.startHour).padStart(2, '0')}:00 - {String(day.bestWindow.endHour).padStart(2, '0')}:00
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Average friction score: {day.bestWindow.avgScore.toFixed(2)}
              </p>
            </div>
          )}

          <div className="mb-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">24-Hour Friction Quality</h3>
            <div className="flex gap-[2px] h-8">
              {day.heatbar.map((bar) => (
                <div
                  key={bar.hour}
                  className={`flex-1 ${getHeatbarColor(bar.quality, bar.isDaylight)} rounded-sm`}
                  title={`${bar.hour}:00 - ${bar.quality}${!bar.isDaylight ? ' (night)' : ''}`}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>00:00</span>
              <span>12:00</span>
              <span>23:00</span>
            </div>
            <div className="text-xs text-gray-500 mt-2 italic">
              Gray bars indicate nighttime hours
            </div>
          </div>

          {day.totalPrecipitation > 0 && (
            <div className="mt-4 text-sm text-blue-600">
              Expected precipitation: {day.totalPrecipitation}mm
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 px-2">Hourly Timeline</h3>
          {hours.map((hour, index) => {
            const friction = computeFriction(hour, wallAspect);
            const hourNum = index;
            const isExpanded = expandedHour === index;

            return (
              <div
                key={hour.time}
                className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all cursor-pointer ${
                  isExpanded ? 'shadow-md' : 'hover:shadow-md'
                }`}
                onClick={() => toggleHour(index)}
              >
                <div className={`px-4 ${isExpanded ? 'py-4' : 'py-3'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-xl font-bold text-gray-900">
                        {String(hourNum).padStart(2, '0')}:00
                      </div>
                      <div className={`w-3 h-3 rounded-full ${getHeatbarColor(day.heatbar[index].quality)}`} />
                      <div className="text-base text-gray-700">{hour.temperature}°C</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          friction.score >= 0.7 ? 'text-green-600' :
                          friction.score >= 0.4 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {Math.round(friction.score * 100)}
                          {!friction.hasAspectData && (
                            <span className="text-amber-600 ml-0.5" title="Estimated score">~</span>
                          )}
                        </div>
                      </div>
                      <ChevronDown
                        size={20}
                        className={`text-gray-400 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Thermometer size={18} className="text-orange-600" />
                            <span className="text-xs text-gray-600 font-medium">Temperature</span>
                          </div>
                          <div className="text-xl font-bold text-gray-900">{hour.temperature}°C</div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Droplets size={18} className="text-blue-600" />
                            <span className="text-xs text-gray-600 font-medium">Humidity</span>
                          </div>
                          <div className="text-xl font-bold text-gray-900">{hour.humidity}%</div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Wind size={18} className="text-green-600" />
                            <span className="text-xs text-gray-600 font-medium">Wind</span>
                          </div>
                          <div className="text-xl font-bold text-gray-900">{hour.windSpeed} m/s</div>
                          <div className="text-xs text-gray-600 mt-1">{hour.windDirection}°</div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Cloud size={18} className="text-gray-600" />
                            <span className="text-xs text-gray-600 font-medium">Cloud Cover</span>
                          </div>
                          <div className="text-xl font-bold text-gray-900">{hour.cloudCover}%</div>
                        </div>
                      </div>

                      {hour.precipitation > 0 && (
                        <div className="bg-blue-100 border border-blue-200 rounded-lg p-2">
                          <div className="text-sm font-medium text-blue-900">
                            Precipitation: {hour.precipitation}mm
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
