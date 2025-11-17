import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import type { Crag } from '../types';

interface SearchBarProps {
  crags: Crag[];
  onCragSelect: (crag: Crag) => void;
}

export function SearchBar({ crags, onCragSelect }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCrags, setFilteredCrags] = useState<Crag[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCrags([]);
      setIsOpen(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = crags.filter(crag =>
      crag.name.toLowerCase().includes(query) ||
      crag.region.toLowerCase().includes(query)
    );

    setFilteredCrags(filtered);
    setIsOpen(true);
  }, [searchQuery, crags]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCragSelect = (crag: Crag) => {
    onCragSelect(crag);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="absolute top-4 left-4 right-4 z-[1000] max-w-md mx-auto">
      <div className="relative">
        <div className="flex items-center bg-white/80 backdrop-blur-md rounded-2xl shadow-lg">
          <Search className="absolute left-4 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Søk etter klatrefelt..."
            className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-400/50"
          />
          {searchQuery && (
            <button
              onClick={handleClear}
              className="absolute right-3 p-1.5 hover:bg-gray-100/50 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>

        {isOpen && filteredCrags.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-xl max-h-80 overflow-y-auto">
            {filteredCrags.map((crag) => (
              <button
                key={crag.id}
                onClick={() => handleCragSelect(crag)}
                className="w-full px-5 py-3.5 text-left hover:bg-gray-50/70 transition-colors border-b border-gray-100/50 last:border-b-0 first:rounded-t-2xl last:rounded-b-2xl"
              >
                <div className="font-semibold text-gray-900">{crag.name}</div>
                <div className="text-sm text-gray-600 mt-0.5">
                  {crag.region} • {crag.climbing_types.join(', ')}
                </div>
              </button>
            ))}
          </div>
        )}

        {isOpen && searchQuery && filteredCrags.length === 0 && (
          <div className="absolute top-full mt-2 w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-xl px-5 py-4">
            <p className="text-gray-500 text-sm">Ingen klatrefelt funnet</p>
          </div>
        )}
      </div>
    </div>
  );
}
