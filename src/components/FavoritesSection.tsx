import { TrendingUp, TrendingDown, Minus, ChevronRight, Droplet } from 'lucide-react';
import type { FavoriteCragCard } from '../types';

interface FavoritesSectionProps {
  favorites: FavoriteCragCard[];
  onCragClick: (cragId: string) => void;
}

export function FavoritesSection({ favorites, onCragClick }: FavoritesSectionProps) {
  const getTrendIcon = (trend: 'up' | 'same' | 'down') => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} className="text-green-600" />;
      case 'down':
        return <TrendingDown size={16} className="text-red-600" />;
      default:
        return <Minus size={16} className="text-gray-400" />;
    }
  };

  const getFrictionColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getWetnessColor = (score: number) => {
    if (score <= 30) return 'text-green-600';
    if (score <= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const calculateWindImpact = (windDir: number, wallAspect: number | null) => {
    if (wallAspect === null) return 0;
    const diff = Math.abs(windDir - wallAspect);
    const normalizedDiff = diff > 180 ? 360 - diff : diff;
    return Math.cos((normalizedDiff * Math.PI) / 180);
  };

  if (favorites.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Your Favorites</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory">
        {favorites.map((crag) => {
          const windImpact = calculateWindImpact(crag.windDirection, crag.wallAspect);
          const isWindOnWall = windImpact > 0.5;

          return (
            <button
              key={crag.id}
              onClick={() => onCragClick(crag.id)}
              className="flex-shrink-0 w-64 bg-white p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all snap-start"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 truncate">
                    {crag.name}
                  </h3>
                </div>
                <ChevronRight className="text-gray-400 flex-shrink-0 ml-2" size={20} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Friction</div>
                    <div className={`text-2xl font-bold ${getFrictionColor(crag.frictionScore)}`}>
                      {crag.frictionScore}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(crag.trend)}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <Droplet
                      size={16}
                      className={getWetnessColor(crag.wetnessScore)}
                      fill={crag.isWet ? 'currentColor' : 'none'}
                    />
                    <span className={`text-xs font-medium ${getWetnessColor(crag.wetnessScore)}`}>
                      {crag.wetnessScore <= 30 ? 'Dry' : crag.wetnessScore <= 60 ? 'Damp' : 'Wet'}
                    </span>
                  </div>

                  {crag.wallAspect !== null && (
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`${isWindOnWall ? 'text-blue-600' : 'text-gray-400'}`}
                        style={{ transform: `rotate(${crag.windDirection}deg)` }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 19V5M5 12l7-7 7 7" />
                        </svg>
                      </div>
                      <span className={`text-xs font-medium ${isWindOnWall ? 'text-blue-600' : 'text-gray-400'}`}>
                        {crag.windSpeed.toFixed(1)} m/s
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
