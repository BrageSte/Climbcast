import { X } from 'lucide-react';
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
    <div className="fixed inset-0 bg-white z-[1001] overflow-y-auto pb-16">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">7-Day Forecast: {cragName}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide">
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

        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Understanding the Forecast</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-semibold">Perfect:</span> 4+ hours of excellent friction conditions or 8+ hours of good conditions
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-semibold">OK:</span> 2+ hours of decent climbing conditions
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-semibold">Poor:</span> Limited good climbing windows
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-600">
            Best Window shows the optimal 3-hour climbing period during daylight hours only, based on temperature, humidity, wind direction, and cloud cover. Gray bars in the heatmap indicate nighttime hours.
          </p>
        </div>
      </div>
    </div>
  );
}
