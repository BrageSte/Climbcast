import { Star, Mountain, Thermometer } from 'lucide-react';
import { Card } from './Card';
import type { Crag, HourPoint } from '../types';
import { useFavorites } from '../hooks/useFavorites';
import { computeFriction } from '../utils/frictionCalculator';

interface FavoritesViewProps {
  crags: Crag[];
  weatherData: Map<string, HourPoint>;
  onCragSelect: (crag: Crag) => void;
}

function getFrictionColor(label: string): string {
  switch (label) {
    case 'Perfect':
      return 'bg-green-50 text-green-700 border border-green-200';
    case 'OK':
      return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
    case 'Poor':
      return 'bg-red-50 text-red-700 border border-red-200';
    default:
      return 'bg-gray-50 text-gray-700 border border-gray-200';
  }
}

export function FavoritesView({ crags, weatherData, onCragSelect }: FavoritesViewProps) {
  const { favorites } = useFavorites();

  const favoriteCrags = crags.filter(crag => favorites.includes(crag.id));

  return (
    <div className="h-screen overflow-y-auto bg-gray-50 pb-20">
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Favorites</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your favorite climbing crags</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {favoriteCrags.length === 0 && (
          <div className="text-center py-16">
            <Star size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-1">No favorites yet</p>
            <p className="text-sm text-gray-500">Add favorites from the map view</p>
          </div>
        )}

        <div className="space-y-3">
          {favoriteCrags.map(crag => {
            const weather = weatherData.get(crag.id);
            const friction = weather ? computeFriction(weather, crag.aspect) : null;

            return (
              <Card
                key={crag.id}
                onClick={() => onCragSelect(crag)}
                className="p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-0.5 truncate">{crag.name}</h3>
                    <p className="text-sm text-gray-500">{crag.region}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {friction && (
                      <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${getFrictionColor(friction.label)}`}>
                        {friction.label}
                        {!friction.hasAspectData && (
                          <span className="ml-1 text-current opacity-70" title="Estimated score">~</span>
                        )}
                      </span>
                    )}
                    <Star size={18} className="text-yellow-500 fill-yellow-500" />
                  </div>
                </div>

                {weather && (
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Thermometer size={16} className="text-orange-500" />
                      <span className="font-medium">{weather.temperature}°</span>
                    </div>
                    {crag.rock_type && (
                      <div className="flex items-center gap-1.5">
                        <Mountain size={16} className="text-gray-500" />
                        <span className="capitalize font-medium">{crag.rock_type}</span>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
