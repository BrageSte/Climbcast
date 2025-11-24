import { Clock } from 'lucide-react';
import { CragListItem } from '../components/CragListItem';
import { useBestCragsNow } from '../hooks/useBestCragsNow';
import { useBestCragsLaterToday } from '../hooks/useBestCragsLaterToday';
import { useFavorites } from '../hooks/useFavorites';
import { useCrags } from '../hooks/useCrags';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const navigate = useNavigate();
  const { data: bestNow, isLoading: loadingBestNow } = useBestCragsNow();
  const { data: laterToday, isLoading: loadingLater } = useBestCragsLaterToday();
  const { data: favoriteCragIds, isLoading: loadingFavorites } = useFavorites();
  const { data: allCrags } = useCrags();

  const favoriteCrags = allCrags?.filter(crag => favoriteCragIds?.includes(crag.id)) ?? [];

  const handleCragClick = (cragId: string) => {
    navigate(`/explore?crag=${cragId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="px-4 py-6 max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Today's climbing conditions</h1>
          <p className="text-gray-600">Near you</p>
        </div>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Best right now near you</h2>
          <div className="space-y-2">
            {loadingBestNow ? (
              <div className="bg-white p-8 rounded-lg border border-gray-200">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ) : bestNow && bestNow.length > 0 ? (
              bestNow.map(crag => (
                <CragListItem
                  key={crag.id}
                  name={crag.name}
                  region={crag.region}
                  wetnessScore={crag.wetnessScore}
                  frictionScore={crag.frictionScore}
                  summary={crag.summary}
                  onClick={() => handleCragClick(crag.id)}
                />
              ))
            ) : (
              <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
                <p className="text-gray-500">No data available</p>
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Best time windows today</h2>
          <div className="space-y-2">
            {loadingLater ? (
              <div className="bg-white p-8 rounded-lg border border-gray-200">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ) : laterToday && laterToday.length > 0 ? (
              laterToday.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCragClick(suggestion.cragId)}
                  className="w-full text-left bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Clock className="text-blue-600" size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <h3 className="text-base font-semibold text-gray-900">{suggestion.cragName}</h3>
                        <span className="text-sm font-medium text-blue-600">{suggestion.timeWindow}</span>
                      </div>
                      <p className="text-sm text-gray-600">{suggestion.summary}</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
                <p className="text-gray-500">No suggestions available</p>
              </div>
            )}
          </div>
        </section>

        {favoriteCrags.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Your favorites</h2>
            <div className="space-y-2">
              {loadingFavorites ? (
                <div className="bg-white p-8 rounded-lg border border-gray-200">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ) : (
                favoriteCrags.map(crag => (
                  <button
                    key={crag.id}
                    onClick={() => handleCragClick(crag.id)}
                    className="w-full text-left bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-baseline gap-2 mb-1">
                      <h3 className="text-base font-semibold text-gray-900">{crag.name}</h3>
                      <span className="text-sm text-gray-500">{crag.region}</span>
                    </div>
                    <p className="text-sm text-gray-600">{crag.description || 'Tap to view details'}</p>
                  </button>
                ))
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
