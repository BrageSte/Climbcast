import { format } from 'date-fns';
import { Cloud, CloudRain, CloudSnow, Sun, CloudDrizzle, Wind, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Card } from './Card';
import type { DayAggregate, HourPoint } from '../types';

interface VerticalDayForecastProps {
  days: DayAggregate[];
  hoursByDay: Map<string, HourPoint[]>;
}

function getWeatherIcon(precipitation: number, cloudCover: number, temperature: number, size: number = 24) {
  if (precipitation > 0) {
    if (temperature < 0) return <CloudSnow size={size} className="text-blue-400" />;
    if (precipitation > 2) return <CloudRain size={size} className="text-blue-500" />;
    return <CloudDrizzle size={size} className="text-blue-400" />;
  }
  if (cloudCover > 70) return <Cloud size={size} className="text-gray-500" />;
  if (cloudCover > 30) return <Cloud size={size} className="text-gray-400" />;
  return <Sun size={size} className="text-yellow-500" />;
}

function getWindDirectionArrow(degrees: number): string {
  return `rotate(${degrees}deg)`;
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

export function VerticalDayForecast({ days, hoursByDay }: VerticalDayForecastProps) {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const toggleDay = (date: string) => {
    setExpandedDay(expandedDay === date ? null : date);
  };

  return (
    <div className="space-y-3">
      {days.slice(0, 7).map((day) => {
        const date = new Date(day.date);
        const weekday = format(date, 'EEEE');
        const dayMonth = format(date, 'd MMMM');
        const isExpanded = expandedDay === day.date;
        const hours = hoursByDay.get(day.date) || [];

        const weatherIcons = hours
          .filter((_, index) => index % 3 === 0)
          .slice(0, 4)
          .map((hour, index) => (
            <div key={index}>
              {getWeatherIcon(hour.precipitation, hour.cloudCover, hour.temperature, 20)}
            </div>
          ));

        return (
          <Card key={day.date} className="overflow-hidden">
            <button
              onClick={() => toggleDay(day.date)}
              className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">{weekday}</div>
                  <div className="text-xs text-gray-500">{dayMonth}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${getRatingColor(day.rating)}`} />
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={20} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-gray-900">
                    {day.minTemp}° / {day.maxTemp}°
                  </span>
                  <span className="text-sm text-gray-500">
                    {day.totalPrecipitation > 0 && `${day.totalPrecipitation}mm`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {weatherIcons}
                </div>
              </div>
            </button>

            {isExpanded && hours.length > 0 && (
              <div className="border-t border-gray-100">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Time</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">Weather</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">Temp</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">Rain</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">Wind</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {hours.map((hour, index) => {
                        const time = new Date(hour.time);
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-900 font-medium">
                              {format(time, 'HH:mm')}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {getWeatherIcon(hour.precipitation, hour.cloudCover, hour.temperature, 20)}
                            </td>
                            <td className="px-3 py-2 text-center text-gray-900 font-medium">
                              {hour.temperature}°
                            </td>
                            <td className="px-3 py-2 text-center text-gray-600">
                              {hour.precipitation > 0 ? `${hour.precipitation}mm` : '-'}
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center justify-center gap-1.5">
                                <span className="text-gray-900 font-medium">{hour.windSpeed}</span>
                                <div
                                  className="inline-block"
                                  style={{ transform: getWindDirectionArrow(hour.windDirection) }}
                                >
                                  <Wind size={14} className="text-gray-600" />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
