import { format } from 'date-fns';
import { Sunrise, Sunset, SunMedium, Wind } from 'lucide-react';
import type { DayAggregate } from '../types';

interface DayCardProps {
  day: DayAggregate;
  onClick: () => void;
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

export function DayCard({ day, onClick }: DayCardProps) {
  const date = new Date(day.date);
  const weekday = format(date, 'EEE');
  const dayMonth = format(date, 'MMM d');

  const baseScore = day.bestWindow?.avgScore ?? (day.rating === 'Perfect' ? 0.82 : day.rating === 'OK' ? 0.6 : 0.35);
  const score = Math.round(baseScore * 100);

  const bestWindowWidth = day.bestWindow ? ((day.bestWindow.endHour - day.bestWindow.startHour) / 24) * 100 : 0;
  const bestWindowOffset = day.bestWindow ? (day.bestWindow.startHour / 24) * 100 : 0;

  const formatTime = (isoString: string | null) => {
    if (!isoString) return 'N/A';
    const time = new Date(isoString);
    return format(time, 'HH:mm');
  };

  return (
    <div
      onClick={onClick}
      className="min-w-[260px] bg-white border border-slate-100 rounded-2xl shadow-sm p-3 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg transition-all snap-start"
    >
      <div className="flex items-start gap-3">
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

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div>
              <div className="text-sm font-semibold text-slate-900">{weekday}</div>
              <div className="text-xs text-slate-500">{dayMonth}</div>
            </div>
            <span className={`ml-auto px-2 py-1 rounded-full text-[11px] font-semibold ${getRatingColor(day.rating)} text-white`}>
              {day.rating}
            </span>
          </div>

          {day.bestWindow && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                  <SunMedium size={14} className="text-amber-500" /> Best window
                </span>
                <span className="font-semibold text-slate-900">
                  {String(day.bestWindow.startHour).padStart(2, '0')}:00 - {String(day.bestWindow.endHour).padStart(2, '0')}:00
                </span>
              </div>
              <div className="relative h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="absolute inset-y-0 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500"
                  style={{ left: `${bestWindowOffset}%`, width: `${bestWindowWidth}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 text-[11px] text-slate-600 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Sunrise size={14} className="text-amber-500" />
              {formatTime(day.sunrise)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Sunset size={14} className="text-orange-500" />
              {formatTime(day.sunset)}
            </span>
            <span className="inline-flex items-center gap-1 font-medium text-slate-800">
              <Wind size={14} className="text-sky-500" />
              Steady breeze
            </span>
          </div>

          <div className="flex gap-[2px] h-3">
            {day.heatbar.map((bar) => (
              <div
                key={bar.hour}
                className={`flex-1 ${getHeatbarColor(bar.quality, bar.isDaylight)} rounded-sm`}
                title={`${bar.hour}:00 - ${bar.quality}${!bar.isDaylight ? ' (night)' : ''}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-700">
            <span className="font-medium">{day.minTemp}°C - {day.maxTemp}°C</span>
            {day.totalPrecipitation > 0 && (
              <span className="text-sky-600 font-medium">{day.totalPrecipitation}mm rain</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
