import { Droplet, Clock } from 'lucide-react';
import { Card } from './Card';
import type { WetnessScore } from '../utils/wetnessCalculator';

interface WetnessIndicatorProps {
  wetness: WetnessScore;
}

function getWetnessColor(level: string): string {
  switch (level) {
    case 'Super Dry':
      return 'text-orange-600';
    case 'Dry':
      return 'text-yellow-600';
    case 'Moist':
      return 'text-blue-400';
    case 'Wet':
      return 'text-blue-600';
    case 'Very Wet':
      return 'text-blue-800';
    default:
      return 'text-gray-600';
  }
}

export function WetnessIndicator({ wetness }: WetnessIndicatorProps) {
  const colorClass = getWetnessColor(wetness.level);

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <Droplet size={18} className="text-blue-500" />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Rock Wetness
        </span>
      </div>

      <div className="mb-4">
        <div className={`text-4xl font-bold ${colorClass} tracking-tight mb-2`}>
          {wetness.level}
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          {wetness.description}
        </p>
      </div>

      <div className="relative h-2 bg-gradient-to-r from-blue-600 via-blue-300 to-orange-400 rounded-full overflow-hidden mb-1">
        <div
          className="absolute top-0 bottom-0 w-1 bg-gray-900 shadow-md transition-all duration-300"
          style={{ left: `${wetness.dryness}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-500 mb-4">
        <span>Very Wet</span>
        <span>Super Dry</span>
      </div>

      {wetness.estimatedDryingHours !== null && (
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
          <Clock size={16} className="text-gray-600 flex-shrink-0" />
          <div className="text-sm">
            <span className="font-medium text-gray-900">
              {wetness.estimatedDryingHours < 1
                ? 'Dry in less than 1 hour'
                : wetness.estimatedDryingHours >= 48
                ? 'Will take 48+ hours to dry'
                : `Dry in ~${Math.round(wetness.estimatedDryingHours)} hours`}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
