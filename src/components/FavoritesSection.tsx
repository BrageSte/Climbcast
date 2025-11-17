import { Star, ChevronRight } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import type { Crag } from '../types';

interface FavoritesSectionProps {
  crags: Crag[];
  onCragSelect: (crag: Crag) => void;
}

export function FavoritesSection({ crags, onCragSelect }: FavoritesSectionProps) {
  const { favorites, isLoading } = useFavorites();

  const favoriteCrags = crags.filter(crag => favorites.includes(crag.id));

  if (isLoading || favoriteCrags.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-4 left-4 right-4 z-[999] pointer-events-none">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 pointer-events-auto max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-3">
          <Star size={18} className="text-yellow-500 fill-yellow-500" />
          <h3 className="font-semibold text-gray-900">Favorites</h3>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          {favoriteCrags.map((crag) => (
            <button
              key={crag.id}
              onClick={() => onCragSelect(crag)}
              className="flex-shrink-0 snap-start bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl p-3 transition-all border border-blue-200 hover:border-blue-300 min-w-[200px] group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                    {crag.name}
                  </h4>
                  <p className="text-xs text-gray-600 line-clamp-1">{crag.region}</p>
                </div>
                <ChevronRight size={16} className="text-blue-600 flex-shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
