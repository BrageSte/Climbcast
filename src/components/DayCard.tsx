import { format } from 'date-fns';
import { Sunrise, Sunset } from 'lucide-react';
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

  const formatTime = (isoString: string | null) => {
    if (!isoString) return 'N/A';
    const time = new Date(isoString);
    return format(time, 'HH:mm');
  };

  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 w-32 bg-white rounded-xl shadow-md p-3 cursor-pointer hover:shadow-lg transition-shadow snap-center"
    >
      <div className="space-y-2">
        <div className="text-center">
          <div className="text-xs font-semibold text-gray-900">{weekday}</div>
          <div className="text-xs text-gray-600">{dayMonth}</div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${getRatingColor(day.rating)}`} />
          <span className="text-xs font-medium text-gray-700">{day.rating}</span>
        </div>

        {day.bestWindow && (
          <div className="text-center">
            <div className="text-xs text-gray-500">Best Window</div>
            <div className="text-xs font-semibold text-gray-900">
              {String(day.bestWindow.startHour).padStart(2, '0')}:00 - {String(day.bestWindow.endHour).padStart(2, '0')}:00
            </div>
          </div>
        )}

        {(day.sunrise || day.sunset) && (
          <div className="flex justify-around text-xs">
            {day.sunrise && (
              <div className="flex items-center gap-1 text-amber-600">
                <Sunrise size={12} />
                <span>{formatTime(day.sunrise)}</span>
              </div>
            )}
            {day.sunset && (
              <div className="flex items-center gap-1 text-orange-600">
                <Sunset size={12} />
                <span>{formatTime(day.sunset)}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-[1px] h-3">
          {day.heatbar.map((bar) => (
            <div
              key={bar.hour}
              className={`flex-1 ${getHeatbarColor(bar.quality, bar.isDaylight)} rounded-[1px]`}
              title={`${bar.hour}:00 - ${bar.quality}${!bar.isDaylight ? ' (night)' : ''}`}
            />
          ))}
        </div>

        <div className="text-xs text-gray-600 text-center space-y-1">
          <div>{day.minTemp}°C - {day.maxTemp}°C</div>
          {day.totalPrecipitation > 0 && (
            <div className="text-blue-600">{day.totalPrecipitation}mm rain</div>
          )}
        </div>
      </div>
    </div>
  );
}
