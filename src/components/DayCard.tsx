import { format } from 'date-fns';
import { Card } from './Card';
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
    <Card
      onClick={onClick}
      className="flex-shrink-0 w-36 p-4 snap-center"
    >
      <div className="space-y-3">
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-900">{weekday}</div>
          <div className="text-xs text-gray-500 mt-0.5">{dayMonth}</div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getRatingColor(day.rating)}`} />
          <span className="text-xs font-semibold text-gray-700">{day.rating}</span>
        </div>

        <div className="flex gap-0.5 h-2 rounded-full overflow-hidden">
          {day.heatbar.map((bar) => (
            <div
              key={bar.hour}
              className={`flex-1 ${getHeatbarColor(bar.quality, bar.isDaylight)}`}
              title={`${bar.hour}:00 - ${bar.quality}${!bar.isDaylight ? ' (night)' : ''}`}
            />
          ))}
        </div>

        {day.bestWindow && (
          <div className="text-center bg-gray-50 rounded-lg py-2 px-2">
            <div className="text-xs text-gray-500 mb-0.5">Best</div>
            <div className="text-xs font-semibold text-gray-900">
              {String(day.bestWindow.startHour).padStart(2, '0')}:00-{String(day.bestWindow.endHour).padStart(2, '0')}:00
            </div>
          </div>
        )}

        <div className="text-center">
          <div className="text-sm font-semibold text-gray-900">
            {day.minTemp}° / {day.maxTemp}°
          </div>
          {day.totalPrecipitation > 0 && (
            <div className="text-xs text-blue-600 mt-1">{day.totalPrecipitation}mm</div>
          )}
        </div>
      </div>
    </Card>
  );
}
