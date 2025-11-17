import { Star, Mountain, Thermometer } from 'lucide-react';
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
      return 'bg-green-100 text-green-700';
    case 'OK':
      return 'bg-yellow-100 text-yellow-700';
    case 'Poor':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export function FavoritesView({ crags, weatherData, onCragSelect }: FavoritesViewProps) {
  const { favorites } = useFavorites();

  const favoriteCrags = crags.filter(crag => favorites.includes(crag.id));

  return (
    <div className="h-screen overflow-y-auto bg-gray-50 md:pt-14 pb-20 md:pb-6">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Favoritter</h1>
          <p className="text-gray-600">Dine favoritt klatrefelt</p>
        </div>

        {favoriteCrags.length === 0 && (
          <div className="text-center py-12">
            <Star size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Ingen favoritter ennå</p>
            <p className="text-sm text-gray-400">Legg til flere favoritter fra kartvisningen</p>
          </div>
        )}

        <div className="space-y-3">
          {favoriteCrags.map(crag => {
            const weather = weatherData.get(crag.id);
            const friction = weather ? computeFriction(weather, crag.aspect) : null;

            return (
              <button
                key={crag.id}
                onClick={() => onCragSelect(crag)}
                className="w-full bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-left"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{crag.name}</h3>
                    <p className="text-sm text-gray-600">{crag.region}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {friction && (
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getFrictionColor(friction.label)}`}>
                        {friction.label}
                        {!friction.hasAspectData && (
                          <span className="ml-1 text-current opacity-70" title="Estimated score">~</span>
                        )}
                      </span>
                    )}
                    <Star size={20} className="text-yellow-500 fill-yellow-500" />
                  </div>
                </div>

                {weather && (
                  <div className="flex items-center gap-4 text-sm text-gray-700">
                    <div className="flex items-center gap-1.5">
                      <Thermometer size={16} className="text-orange-500" />
                      <span>{weather.temperature}°</span>
                    </div>
                    {crag.rock_type && (
                      <div className="flex items-center gap-1.5">
                        <Mountain size={16} className="text-gray-500" />
                        <span className="capitalize">{crag.rock_type}</span>
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
