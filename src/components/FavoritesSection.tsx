import { Clock, TrendingUp, TrendingDown, Minus, ChevronRight, Droplet, Wind, Thermometer } from 'lucide-react';
import type { FavoriteCragCard } from '../types';

interface FavoritesSectionProps {
  favorites: FavoriteCragCard[];
  onCragClick: (cragId: string) => void;
}

export function FavoritesSection({ favorites, onCragClick }: FavoritesSectionProps) {
  const getTrendIcon = (trend: 'up' | 'same' | 'down') => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} className="text-emerald-600" />;
      case 'down':
        return <TrendingDown size={16} className="text-rose-500" />;
      default:
        return <Minus size={16} className="text-slate-400" />;
    }
  };

  const getFrictionColor = (score: number) => {
    if (score >= 75) return 'text-emerald-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getWetnessColor = (score: number) => {
    if (score <= 30) return 'text-emerald-600';
    if (score <= 60) return 'text-amber-600';
    return 'text-rose-600';
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
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Favoritter</h2>
          <p className="text-sm text-slate-500">Oversikt for neste døgn</p>
        </div>
        <button className="text-blue-700 text-sm font-semibold hover:underline">Se alle</button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory">
        {favorites.map((crag) => {
          const windImpact = calculateWindImpact(crag.windDirection, crag.wallAspect);
          const isWindOnWall = windImpact > 0.5;

          return (
            <button
              key={crag.id}
              onClick={() => onCragClick(crag.id)}
              className="flex-shrink-0 w-72 bg-white p-4 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all snap-start"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-blue-700">{crag.region}</p>
                  <h3 className="text-lg font-semibold text-slate-900 truncate">{crag.name}</h3>
                  <p className="text-sm text-slate-600">{crag.statusNote ?? 'Stabile forhold'}</p>
                  <div className="inline-flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                    <Clock size={14} />
                    <span>{crag.nextWindow ?? 'Nå'}</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-b from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-inner">
                      <span className="text-2xl font-bold">{crag.frictionScore}</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                      {getTrendIcon(crag.trend)}
                    </div>
                  </div>
                  <span className={`text-xs font-semibold ${getWetnessColor(crag.wetnessScore)}`}>
                    {crag.conditionLabel ?? (crag.wetnessScore <= 30 ? 'Tørr' : crag.wetnessScore <= 60 ? 'Fuktig' : 'Våt')}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <Thermometer size={14} className="text-rose-500" />
                  <span>{crag.temperature ? `${crag.temperature}°C` : '—'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Droplet size={14} className={getWetnessColor(crag.wetnessScore)} fill={crag.isWet ? 'currentColor' : 'none'} />
                  <span className={getWetnessColor(crag.wetnessScore)}>
                    {crag.wetnessScore <= 30 ? 'Tørr' : crag.wetnessScore <= 60 ? 'Fuktig' : 'Våt'}
                  </span>
                </div>
                {crag.wallAspect !== null ? (
                  <div className="flex items-center gap-1.5">
                    <Wind size={14} className={isWindOnWall ? 'text-blue-600' : 'text-slate-400'} />
                    <span className={`text-xs font-medium ${isWindOnWall ? 'text-blue-600' : 'text-slate-500'}`}>
                      {crag.windSpeed.toFixed(1)} m/s
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-slate-500">
                    <ChevronRight size={14} />
                    <span>Se mer</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
