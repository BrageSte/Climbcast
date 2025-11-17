import { Wind, Droplets, Thermometer, Cloud, ChevronUp, Sunrise, Sunset } from 'lucide-react';
import { format } from 'date-fns';
import { useEffect, useRef } from 'react';
import type { DayAggregate, HourPoint } from '../types';
import { computeFriction } from '../utils/frictionCalculator';

interface DayDetailInlineProps {
  day: DayAggregate;
  hours: HourPoint[];
  wallAspect: number | null;
  onCollapse: () => void;
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

export function DayDetailInline({ day, hours, wallAspect, onCollapse }: DayDetailInlineProps) {
  const date = new Date(day.date);
  const formattedDate = format(date, 'EEEE, MMMM d');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const firstDaylightRef = useRef<HTMLDivElement>(null);

  const formatTime = (isoString: string | null) => {
    if (!isoString) return 'N/A';
    const time = new Date(isoString);
    return format(time, 'HH:mm');
  };

  useEffect(() => {
    if (firstDaylightRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const element = firstDaylightRef.current;
      const offset = element.offsetTop - container.offsetTop - 20;
      container.scrollTop = offset;
    }
  }, []);

  return (
    <div className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-4 animate-slide-down">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900">{formattedDate}</h3>
        <button
          onClick={onCollapse}
          className="p-2 hover:bg-white/50 rounded-full transition-colors"
          aria-label="Collapse"
        >
          <ChevronUp size={24} className="text-gray-600" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 bg-white/70 rounded-lg p-3">
          <div className={`w-4 h-4 rounded-full ${getRatingColor(day.rating)}`} />
          <span className="text-lg font-semibold text-gray-900">{day.rating} Day</span>
          <span className="text-sm text-gray-600 ml-auto">
            {day.minTemp}°C - {day.maxTemp}°C
          </span>
        </div>

        {(day.sunrise || day.sunset) && (
          <div className="flex justify-around bg-white/70 rounded-lg p-3">
            {day.sunrise && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Sunrise size={16} className="text-amber-600" />
                  <span className="text-xs font-medium text-gray-600">Sunrise</span>
                </div>
                <div className="text-lg font-bold text-gray-900">{formatTime(day.sunrise)}</div>
              </div>
            )}
            {day.sunset && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Sunset size={16} className="text-orange-600" />
                  <span className="text-xs font-medium text-gray-600">Sunset</span>
                </div>
                <div className="text-lg font-bold text-gray-900">{formatTime(day.sunset)}</div>
              </div>
            )}
          </div>
        )}

        {day.bestWindow && (
          <div className="bg-white/70 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Best Climbing Window (Daylight)</h4>
            <div className="text-2xl font-bold text-blue-600">
              {String(day.bestWindow.startHour).padStart(2, '0')}:00 - {String(day.bestWindow.endHour).padStart(2, '0')}:00
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Average friction score: {day.bestWindow.avgScore.toFixed(2)}
            </p>
          </div>
        )}

        <div className="bg-white/70 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">24-Hour Friction Quality</h4>
          <div className="flex gap-[2px] h-5">
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
        </div>

        <div className="bg-white/70 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Timeoversikt (24 timer)</h4>
          <div ref={scrollContainerRef} className="space-y-2 max-h-96 overflow-y-auto">
            {hours.map((hour, index) => {
              const friction = computeFriction(hour, wallAspect);
              const isDaylight = day.heatbar[index]?.isDaylight ?? false;
              const isFirstDaylight = isDaylight && (index === 0 || !(day.heatbar[index - 1]?.isDaylight ?? false));

              return (
                <div
                  key={hour.time}
                  ref={isFirstDaylight ? firstDaylightRef : null}
                  className={`flex items-center justify-between rounded-lg p-2 ${
                    isDaylight ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-gray-900 w-16">
                      {String(index).padStart(2, '0')}:00
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getHeatbarColor(day.heatbar[index]?.quality ?? 'unknown', isDaylight)}`} />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Thermometer size={14} className="text-orange-600" />
                      <span className="text-sm font-medium">{hour.temperature}°C</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Droplets size={14} className="text-blue-600" />
                      <span className="text-sm font-medium">{hour.humidity}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Wind size={14} className="text-green-600" />
                      <span className="text-sm font-medium">{hour.windSpeed} m/s</span>
                    </div>
                    <div className={`text-base font-bold ${
                      friction.score >= 0.7 ? 'text-green-600' :
                      friction.score >= 0.4 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {Math.round(friction.score * 100)}
                      {!friction.hasAspectData && (
                        <span className="text-amber-600 ml-0.5" title="Estimated score">~</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {day.totalPrecipitation > 0 && (
          <div className="bg-blue-100 border border-blue-200 rounded-lg p-3">
            <div className="text-sm font-medium text-blue-900">
              Expected precipitation: {day.totalPrecipitation}mm
            </div>
          </div>
        )}

        <div className="bg-white/70 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Symbolforklaring</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Thermometer size={14} className="text-orange-600" />
              <span className="text-gray-700">Temperatur</span>
            </div>
            <div className="flex items-center gap-2">
              <Droplets size={14} className="text-blue-600" />
              <span className="text-gray-700">Luftfuktighet</span>
            </div>
            <div className="flex items-center gap-2">
              <Wind size={14} className="text-green-600" />
              <span className="text-gray-700">Vindhastighet</span>
            </div>
            <div className="flex items-center gap-2">
              <Cloud size={14} className="text-gray-600" />
              <span className="text-gray-700">Nedbør</span>
            </div>
            <div className="flex items-center gap-2">
              <Sunrise size={14} className="text-amber-600" />
              <span className="text-gray-700">Soloppgang</span>
            </div>
            <div className="flex items-center gap-2">
              <Sunset size={14} className="text-orange-600" />
              <span className="text-gray-700">Solnedgang</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs font-medium text-gray-700 mb-2">Friksjonscore (0-100):</div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-700">70-100: Perfekt (grønn)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span className="text-xs text-gray-700">40-69: OK (gul)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <span className="text-xs text-gray-700">0-39: Dårlig (rød)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                <span className="text-xs text-gray-700">Mørk (grå)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
