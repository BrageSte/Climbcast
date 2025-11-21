import { useMemo } from 'react';
import { MapPin, TrendingUp, Clock, Droplets } from 'lucide-react';
import { format } from 'date-fns';
import type { Crag, HourPoint } from '../types';
import { getBestCragsNow, getBestCragsLaterToday } from '../utils/cragRanking';
import { useFavorites } from '../hooks/useFavorites';
import { Card } from './Card';
import { FrictionScoreDisplay } from './FrictionScoreDisplay';

interface HomeViewProps {
  crags: Crag[];
  weatherData: Map<string, HourPoint[]>;
  onCragSelect: (crag: Crag) => void;
}

export function HomeView({ crags, weatherData, onCragSelect }: HomeViewProps) {
  const { data: favorites = [] } = useFavorites();

  const bestNow = useMemo(() => {
    return getBestCragsNow(crags, weatherData, {
      minWetnessThreshold: 40,
      excludeHeavyRain: true,
    }).slice(0, 5);
  }, [crags, weatherData]);

  const bestLater = useMemo(() => {
    return getBestCragsLaterToday(crags, weatherData).slice(0, 3);
  }, [crags, weatherData]);

  const favoriteCrags = useMemo(() => {
    const favoriteIds = new Set(favorites.map(f => f.crag_id));
    return crags.filter(c => favoriteIds.has(c.id));
  }, [crags, favorites]);

  const favoriteWithMetrics = useMemo(() => {
    return getBestCragsNow(favoriteCrags, weatherData, {
      minWetnessThreshold: 0,
      excludeHeavyRain: false,
    }).slice(0, 4);
  }, [favoriteCrags, weatherData]);

  return (
    <div className="h-full overflow-y-auto pb-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Your Conditions Today</h1>
          <p className="text-sm text-gray-600">
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </div>

        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold mb-1">Best Right Now</h2>
              {bestNow.length > 0 ? (
                <>
                  <p className="text-sm text-white/80 mb-3">
                    {bestNow[0].name} has excellent conditions
                  </p>
                  <button
                    onClick={() => onCragSelect(bestNow[0])}
                    className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium text-sm hover:bg-white/90 transition-colors"
                  >
                    View Details
                  </button>
                </>
              ) : (
                <p className="text-sm text-white/80">
                  No crags currently have good conditions
                </p>
              )}
            </div>
          </div>
        </Card>

        {favoriteWithMetrics.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Your Favorites</h2>
            <div className="space-y-3">
              {favoriteWithMetrics.map((crag) => {
                const metrics = crag.currentMetrics;
                return (
                  <Card
                    key={crag.id}
                    onClick={() => onCragSelect(crag)}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{crag.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin size={14} className="text-gray-500 flex-shrink-0" />
                          <span className="text-sm text-gray-600 truncate">{crag.region}</span>
                        </div>
                      </div>
                      {metrics && (
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <FrictionScoreDisplay
                            score={metrics.frictionScore}
                            size="sm"
                          />
                          <div className="flex items-center gap-1">
                            <Droplets size={14} className="text-blue-600" />
                            <span className="text-xs font-medium text-gray-700">
                              {Math.round(metrics.wetnessScore)}% dry
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {bestNow.length > 1 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Best Conditions Now</h2>
            <div className="space-y-3">
              {bestNow.slice(1, 5).map((crag, index) => {
                const metrics = crag.currentMetrics;
                return (
                  <Card
                    key={crag.id}
                    onClick={() => onCragSelect(crag)}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-gray-700">{index + 2}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{crag.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin size={14} className="text-gray-500 flex-shrink-0" />
                          <span className="text-sm text-gray-600 truncate">{crag.region}</span>
                        </div>
                      </div>
                      {metrics && (
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <FrictionScoreDisplay
                            score={metrics.frictionScore}
                            size="sm"
                          />
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {bestLater.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Best Later Today</h2>
            <div className="space-y-3">
              {bestLater.map((crag) => {
                const metrics = crag.currentMetrics;
                const weather = weatherData.get(crag.id);
                const bestHour = weather?.[crag.bestHourIndex];
                return (
                  <Card
                    key={crag.id}
                    onClick={() => onCragSelect(crag)}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{crag.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock size={14} className="text-gray-500 flex-shrink-0" />
                          <span className="text-sm text-gray-600">
                            {bestHour ? format(new Date(bestHour.time), 'HH:mm') : 'Later'}
                          </span>
                        </div>
                      </div>
                      {metrics && (
                        <FrictionScoreDisplay
                          score={metrics.frictionScore}
                          size="sm"
                        />
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {bestNow.length === 0 && bestLater.length === 0 && (
          <Card className="text-center py-8">
            <p className="text-gray-600">
              Weather conditions are currently not ideal for climbing.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Check back later or explore the map for more options.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
