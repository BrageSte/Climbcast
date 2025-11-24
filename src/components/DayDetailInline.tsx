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

  const baseScore = day.bestWindow?.avgScore ?? (day.rating === 'Perfect' ? 0.82 : day.rating === 'OK' ? 0.6 : 0.35);
  const score = Math.round(baseScore * 100);

  const formatTime = (isoString: string | null) => {
    if (!isoString) return 'N/A';
    const time = new Date(isoString);
    return format(time, 'HH:mm');
  };

  useEffect(() => {
    if (firstDaylightRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const element = firstDaylightRef.current;
      const offset = element.offsetLeft - container.offsetLeft - 16;
      container.scrollLeft = offset;
    }
  }, []);

  return (
    <div className="w-full bg-white border border-slate-100 rounded-3xl shadow-xl p-4 sm:p-5 animate-slide-down">
      <div className="flex items-start gap-3 sm:gap-4">
        <div
          className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl text-white font-semibold bg-gradient-to-br ${
            day.rating === 'Perfect' ? 'from-emerald-500 to-teal-500' :
            day.rating === 'OK' ? 'from-amber-500 to-orange-500' :
            'from-rose-500 to-red-500'
          }`}
        >
          <span className="text-2xl leading-none">{score}</span>
          <span className="text-[10px] uppercase tracking-[0.08em]">score</span>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Expanded day</p>
              <h3 className="text-xl font-semibold text-slate-900">{formattedDate}</h3>
            </div>
            <button
              onClick={onCollapse}
              className="p-2 hover:bg-slate-50 rounded-full border border-slate-200 transition"
              aria-label="Collapse"
            >
              <ChevronUp size={22} className="text-slate-600" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-white ${getRatingColor(day.rating)}`}>
              <span className="w-2 h-2 rounded-full bg-white" /> {day.rating} day
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 text-slate-800 font-medium">
              <Thermometer size={16} className="text-orange-500" /> {day.minTemp}°C - {day.maxTemp}°C
            </span>
            {day.sunrise && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700">
                <Sunrise size={16} /> {formatTime(day.sunrise)}
              </span>
            )}
            {day.sunset && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-700">
                <Sunset size={16} /> {formatTime(day.sunset)}
              </span>
            )}
          </div>

          {day.bestWindow && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 shadow-sm">
              <div className="flex items-center justify-between text-sm text-slate-700">
                <span className="inline-flex items-center gap-2 font-semibold text-slate-900">
                  <Sunrise size={16} className="text-indigo-500" /> Best daylight window
                </span>
                <span className="text-base font-semibold text-indigo-700">
                  {String(day.bestWindow.startHour).padStart(2, '0')}:00 - {String(day.bestWindow.endHour).padStart(2, '0')}:00
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">Average friction score {day.bestWindow.avgScore.toFixed(2)}</p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex gap-[2px] h-3 rounded-full bg-slate-100 overflow-hidden">
              {day.heatbar.map((bar) => (
                <div
                  key={bar.hour}
                  className={`flex-1 ${getHeatbarColor(bar.quality, bar.isDaylight)}`}
                  title={`${bar.hour}:00 - ${bar.quality}${!bar.isDaylight ? ' (night)' : ''}`}
                />
              ))}
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>00:00</span>
              <span>12:00</span>
              <span>23:00</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-slate-900">Hourly quality</h4>
              <span className="text-[11px] text-slate-500">Scroll to explore</span>
            </div>
            <div ref={scrollContainerRef} className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {hours.map((hour, index) => {
                const friction = computeFriction(hour, wallAspect);
                const isDaylight = day.heatbar[index]?.isDaylight ?? false;
                const isFirstDaylight = isDaylight && (index === 0 || !(day.heatbar[index - 1]?.isDaylight ?? false));
                const scoreColor =
                  friction.score >= 0.7 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                  friction.score >= 0.4 ? 'bg-amber-50 text-amber-700 border-amber-100' :
                  'bg-rose-50 text-rose-700 border-rose-100';

                return (
                  <div
                    key={hour.time}
                    ref={isFirstDaylight ? firstDaylightRef : null}
                    className={`min-w-[150px] rounded-2xl border ${isDaylight ? 'bg-white' : 'bg-slate-50'} p-3 shadow-sm flex flex-col gap-2`}
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-slate-900">{String(index).padStart(2, '0')}:00</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] border ${scoreColor}`}>
                        <span className={`w-2 h-2 rounded-full ${getHeatbarColor(day.heatbar[index]?.quality ?? 'unknown', isDaylight)}`} />
                        {Math.round(friction.score * 100)}
                        {!friction.hasAspectData && (
                          <span className="text-amber-600" title="Estimated score">~</span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <Thermometer size={14} className="text-orange-500" />
                        {hour.temperature}°C
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Droplets size={14} className="text-blue-500" />
                        {hour.humidity}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <Wind size={14} className="text-emerald-500" />
                        {hour.windSpeed} m/s
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Cloud size={14} className="text-slate-500" />
                        {hour.precipitation}mm
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {day.totalPrecipitation > 0 && (
            <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sky-800 font-medium">
              Expected precipitation: {day.totalPrecipitation}mm
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
