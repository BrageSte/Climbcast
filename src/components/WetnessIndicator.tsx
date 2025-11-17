import { Sun, Clock } from 'lucide-react';
import type { WetnessScore } from '../utils/wetnessCalculator';

interface WetnessIndicatorProps {
  wetness: WetnessScore;
}

export function WetnessIndicator({ wetness }: WetnessIndicatorProps) {
  const levels = [
    { name: 'Very Wet', color: '#1e40af', min: 70 },
    { name: 'Wet', color: '#3b82f6', min: 45 },
    { name: 'Moist', color: '#60a5fa', min: 25 },
    { name: 'Dry', color: '#fbbf24', min: 10 },
    { name: 'Super Dry', color: '#f59e0b', min: 0 },
  ];

  const getPositionPercent = (dryness: number) => {
    return dryness;
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-gray-50 rounded-xl p-3 border border-amber-100">
      <div className="flex items-center gap-2 mb-2">
        <Sun size={16} className="text-amber-600" />
        <h3 className="font-semibold text-gray-900">Rock Dryness</h3>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xl font-bold" style={{ color: wetness.color }}>
            {wetness.level}
          </span>
          <span className="text-sm text-gray-600">
            Score: {wetness.dryness.toFixed(0)}
          </span>
        </div>

        <div className="relative h-6 bg-gradient-to-r from-blue-800 via-blue-300 to-amber-400 rounded-lg overflow-hidden mb-2">
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-lg transition-all duration-300"
            style={{ left: `${getPositionPercent(wetness.dryness)}%` }}
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              Current
            </div>
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-600 mb-2">
          <span>Very Wet</span>
          <span>Wet</span>
          <span>Moist</span>
          <span>Dry</span>
          <span>Super Dry</span>
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-2">
        {wetness.description}
      </p>

      {wetness.estimatedDryingHours !== null && (
        <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-gray-200">
          <Clock size={14} className="text-blue-600 flex-shrink-0" />
          <div className="text-sm">
            <span className="font-medium text-gray-900">Estimated drying time: </span>
            <span className="text-gray-700">
              {wetness.estimatedDryingHours < 1
                ? 'Less than 1 hour'
                : wetness.estimatedDryingHours >= 48
                ? '48+ hours'
                : `~${Math.round(wetness.estimatedDryingHours)} hours`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
