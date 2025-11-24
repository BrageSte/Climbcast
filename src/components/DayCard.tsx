import { format } from 'date-fns';
import { CloudRain, Sunrise, Sunset, SunMedium, Thermometer, Wind } from 'lucide-react';
import type { DayAggregate } from '../types';

interface DayCardProps {
  day: DayAggregate;
  onClick: () => void;
  isSelected?: boolean;
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

function getRatingStyles(rating: string): { gradient: string; badge: string } {
  switch (rating) {
    case 'Perfect':
      return {
        gradient: 'from-emerald-500 to-teal-500',
        badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
      };
    case 'OK':
      return {
        gradient: 'from-amber-500 to-orange-500',
        badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
      };
    case 'Poor':
    default:
      return {
        gradient: 'from-rose-500 to-red-500',
        badge: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
      };
  }
}

export function DayCard({ day, onClick, isSelected }: DayCardProps) {
  const date = new Date(day.date);
  const weekday = format(date, 'EEE');
  const dayMonth = format(date, 'MMM d');

  const baseScore = day.bestWindow?.avgScore ?? (day.rating === 'Perfect' ? 0.82 : day.rating === 'OK' ? 0.6 : 0.35);
  const score = Math.round(baseScore * 100);

  const bestWindowWidth = day.bestWindow ? ((day.bestWindow.endHour - day.bestWindow.startHour) / 24) * 100 : 0;
  const bestWindowOffset = day.bestWindow ? (day.bestWindow.startHour / 24) * 100 : 0;

  const ratingStyles = getRatingStyles(day.rating);

  const formatTime = (isoString: string | null) => {
    if (!isoString) return 'N/A';
    const time = new Date(isoString);
    return format(time, 'HH:mm');
  };

  return (
    <div
      onClick={onClick}
      className={`group w-full bg-white border border-slate-100 rounded-2xl shadow-sm p-4 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg ${
        isSelected ? 'ring-2 ring-indigo-100 shadow-lg' : ''
      }`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4 min-w-0">
          <div
            className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl text-white font-semibold bg-gradient-to-br ${ratingStyles.gradient}`}
          >
            <span className="text-2xl leading-none">{score}</span>
            <span className="text-[10px] uppercase tracking-[0.08em]">score</span>
            <div className="absolute -bottom-2 flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-white text-slate-700 shadow-sm border border-slate-100">
              <Wind size={12} className="text-slate-400" />
              <span className="font-medium">{day.rating}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1 min-w-[120px]">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <span>{weekday}</span>
              <span className="text-xs text-slate-500 font-normal">{dayMonth}</span>
            </div>
            <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold ${ratingStyles.badge}`}>
              <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${ratingStyles.gradient}`} />
              {day.rating} conditions
            </span>
            {day.bestWindow && (
              <div className="text-[12px] text-slate-600 inline-flex items-center gap-1">
                <SunMedium size={14} className="text-amber-500" />
                <span className="font-medium text-slate-800">Best window</span>
                <span>
                  {String(day.bestWindow.startHour).padStart(2, '0')}:00 - {String(day.bestWindow.endHour).padStart(2, '0')}:00
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            {day.bestWindow && (
              <div className="space-y-1">
                <div className="relative h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="absolute inset-y-0 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500"
                    style={{ left: `${bestWindowOffset}%`, width: `${bestWindowWidth}%` }}
                  />
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <Sunrise size={14} className="text-amber-500" />
                    {formatTime(day.sunrise)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Sunset size={14} className="text-orange-500" />
                    {formatTime(day.sunset)}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 text-[12px] text-slate-600">
              <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
                <Thermometer size={14} className="text-rose-500" />
                {day.minTemp}°C / {day.maxTemp}°C
              </span>
              <span className="inline-flex items-center gap-1">
                <CloudRain size={14} className="text-sky-500" />
                {day.totalPrecipitation > 0 ? `${day.totalPrecipitation}mm rain` : 'No rain expected'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-[2px] h-3 rounded-md overflow-hidden bg-slate-100">
          {day.heatbar.map((bar) => (
            <div
              key={bar.hour}
              className={`flex-1 ${getHeatbarColor(bar.quality, bar.isDaylight)}`}
              title={`${bar.hour}:00 - ${bar.quality}${!bar.isDaylight ? ' (night)' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
