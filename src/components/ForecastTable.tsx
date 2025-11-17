import { format } from 'date-fns';
import { Cloud, CloudRain, CloudSnow, Sun, CloudDrizzle, Wind } from 'lucide-react';
import type { HourPoint } from '../types';

interface ForecastTableProps {
  hours: HourPoint[];
  wallAspect: number | null;
}

function getWeatherIcon(precipitation: number, cloudCover: number, temperature: number) {
  if (precipitation > 0) {
    if (temperature < 0) return <CloudSnow size={20} className="text-blue-400" />;
    if (precipitation > 2) return <CloudRain size={20} className="text-blue-500" />;
    return <CloudDrizzle size={20} className="text-blue-400" />;
  }
  if (cloudCover > 70) return <Cloud size={20} className="text-gray-500" />;
  if (cloudCover > 30) return <Cloud size={20} className="text-gray-400" />;
  return <Sun size={20} className="text-yellow-500" />;
}

function getWindDirectionArrow(degrees: number): string {
  return `rotate(${degrees}deg)`;
}

export function ForecastTable({ hours, wallAspect }: ForecastTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Time
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Weather
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Temp
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Precip
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Wind
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {hours.map((hour, index) => {
              const time = new Date(hour.time);
              return (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {format(time, 'HH:mm')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getWeatherIcon(hour.precipitation, hour.cloudCover, hour.temperature)}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                    {hour.temperature}°
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    {hour.precipitation > 0 ? `${hour.precipitation}mm` : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm text-gray-900">{hour.windSpeed}</span>
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
  );
}
