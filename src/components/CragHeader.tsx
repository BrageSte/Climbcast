import { Star, X, CloudSun } from 'lucide-react';
import type { Crag, HourPoint } from '../types';

interface CragHeaderProps {
  crag: Crag;
  currentWeather: HourPoint | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClose: () => void;
}

export function CragHeader({ crag, currentWeather, isFavorite, onToggleFavorite, onClose }: CragHeaderProps) {
  return (
    <div className="sticky top-0 bg-white z-20 border-b border-gray-100">
      <div className="px-4 py-3 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight truncate">
            {crag.name}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{crag.region}</p>
        </div>

        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
          {currentWeather && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full">
              <CloudSun size={18} className="text-gray-600" />
              <span className="text-base font-semibold text-gray-900">
                {currentWeather.temperature}°
              </span>
            </div>
          )}

          <button
            onClick={onToggleFavorite}
            className={`p-2 rounded-full transition-colors ${
              isFavorite
                ? 'bg-yellow-50 hover:bg-yellow-100'
                : 'hover:bg-gray-100'
            }`}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star
              size={20}
              className={isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}
            />
          </button>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
