import { Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { FavoritesSection } from '../components/FavoritesSection';
import { useBestCragsLaterToday } from '../hooks/useBestCragsLaterToday';
import { useHomeData } from '../hooks/useHomeData';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const navigate = useNavigate();
  const { data: laterToday, isLoading: loadingLater } = useBestCragsLaterToday();
  const { heroCards, favoriteCragCards } = useHomeData();

  const handleCragClick = (cragId: string) => {
    navigate(`/explore?crag=${cragId}`);
  };

  const getHeroCardIcon = (type: string) => {
    switch (type) {
      case 'best-now':
        return <TrendingUp className="text-green-600" size={24} />;
      case 'project-update':
        return <Clock className="text-blue-600" size={24} />;
      case 'alert':
        return <AlertCircle className="text-amber-600" size={24} />;
      default:
        return null;
    }
  };

  const getHeroCardColor = (type: string) => {
    switch (type) {
      case 'best-now':
        return 'from-green-50 to-green-100 border-green-200';
      case 'project-update':
        return 'from-blue-50 to-blue-100 border-blue-200';
      case 'alert':
        return 'from-amber-50 to-amber-100 border-amber-200';
      default:
        return 'from-gray-50 to-gray-100 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="px-4 py-6 max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Your climbing conditions</h1>
          <p className="text-gray-600">Today</p>
        </div>

        <section className="space-y-3">
          {heroCards.map((card) => (
            <button
              key={card.id}
              onClick={() => card.cragId && handleCragClick(card.cragId)}
              className={`w-full text-left bg-gradient-to-br ${getHeroCardColor(card.type)} p-5 rounded-xl border hover:shadow-md transition-all`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getHeroCardIcon(card.type)}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    {card.title}
                  </h3>
                  {card.subtitle && (
                    <p className="text-sm text-gray-700">{card.subtitle}</p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </section>

        <FavoritesSection
          favorites={favoriteCragCards}
          onCragClick={handleCragClick}
        />

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
      </div>
    </div>
  );
}
