import { X } from 'lucide-react';
import { Card } from './Card';
import { DayCard } from './DayCard';
import { DayDetailInline } from './DayDetailInline';
import type { DayAggregate, HourPoint } from '../types';

interface SevenDayForecastProps {
  days: DayAggregate[];
  cragName: string;
  onClose: () => void;
  onDaySelect: (day: DayAggregate) => void;
  selectedDay: DayAggregate | null;
  selectedDayHours: HourPoint[];
  wallAspect: number | null;
}

export function SevenDayForecast({ days, cragName, onClose, onDaySelect, selectedDay, selectedDayHours, wallAspect }: SevenDayForecastProps) {
  return (
    <div className="fixed inset-0 bg-gray-50 z-[1001] overflow-y-auto pb-20">
      <div className="sticky top-0 bg-white border-b border-gray-100 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{cragName}</h1>
            <p className="text-sm text-gray-500 mt-0.5">7-Day Forecast</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={22} className="text-gray-400" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4">
          {days.slice(0, 7).map((day) => (
            <DayCard
              key={day.date}
              day={day}
              onClick={() => onDaySelect(day)}
            />
          ))}
        </div>

        {selectedDay && selectedDayHours.length > 0 && (
          <DayDetailInline
            day={selectedDay}
            hours={selectedDayHours}
            wallAspect={wallAspect}
            onCollapse={() => onDaySelect(null as any)}
          />
        )}

        <Card className="p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Understanding the Forecast</h3>
          <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
              <div>
                <span className="font-semibold text-gray-900">Perfect:</span> 4+ hours of excellent friction or 8+ hours of good conditions
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0" />
              <div>
                <span className="font-semibold text-gray-900">OK:</span> 2+ hours of decent climbing conditions
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
              <div>
                <span className="font-semibold text-gray-900">Poor:</span> Limited good climbing windows
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-500 leading-relaxed">
            Best Window shows the optimal 3-hour climbing period during daylight. Based on temperature, humidity, wind direction, and cloud cover.
          </p>
        </Card>
      </div>
    </div>
  );
}
