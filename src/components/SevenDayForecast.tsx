import { X } from 'lucide-react';
import { DayCard } from './DayCard';
import { DayDetailInline } from './DayDetailInline';
import type { DayAggregate, HourPoint } from '../types';

interface SevenDayForecastProps {
  days: DayAggregate[];
  cragName: string;
  onClose: () => void;
  onDaySelect: (day: DayAggregate | null) => void;
  selectedDay: DayAggregate | null;
  selectedDayHours: HourPoint[];
  wallAspect: number | null;
}

export function SevenDayForecast({ days, cragName, onClose, onDaySelect, selectedDay, selectedDayHours, wallAspect }: SevenDayForecastProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[1001] overflow-y-auto">
      <div className="min-h-full py-6 px-4">
        <div className="max-w-5xl mx-auto bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Seven day outlook</p>
              <h2 className="text-2xl font-semibold text-slate-900">{cragName}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-full border border-slate-200 shadow-sm transition"
              aria-label="Close"
            >
              <X size={22} className="text-slate-600" />
            </button>
          </div>

          <div className="px-3 sm:px-6 py-4 space-y-4">
            <div className="space-y-3">
              {days.slice(0, 7).map((day) => (
                <DayCard
                  key={day.date}
                  day={day}
                  onClick={() => onDaySelect(day)}
                  isSelected={selectedDay?.date === day.date}
                />
              ))}
            </div>

            {selectedDay && selectedDayHours.length > 0 && (
              <DayDetailInline
                day={selectedDay}
                hours={selectedDayHours}
                wallAspect={wallAspect}
                onCollapse={() => onDaySelect(null)}
              />
            )}

            <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 border-t border-slate-100 pt-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />Perfect hours cluster
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-500" />OK conditions
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1">
                <span className="w-2 h-2 rounded-full bg-slate-300" />Nighttime segments
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">
                Best window highlights daylight hours optimized for temp, humidity, wind, and cloud cover
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
