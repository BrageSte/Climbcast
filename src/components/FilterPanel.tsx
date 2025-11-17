import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { useState } from 'react';

export interface FilterOptions {
  minScore: 'all' | 'perfect' | 'ok';
  regions: string[];
  rockTypes: string[];
  climbingTypes: string[];
}

interface FilterPanelProps {
  filters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
  availableRegions: string[];
  availableRockTypes: string[];
  availableClimbingTypes: string[];
}

const SCORE_OPTIONS = [
  { value: 'all', label: 'Alle', color: 'bg-gray-100 text-gray-700' },
  { value: 'ok', label: 'OK eller bedre', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'perfect', label: 'Kun perfekt', color: 'bg-green-100 text-green-700' },
] as const;

export function FilterPanel({
  filters,
  onChange,
  availableRegions,
  availableRockTypes,
  availableClimbingTypes,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleScoreChange = (score: FilterOptions['minScore']) => {
    onChange({ ...filters, minScore: score });
  };

  const handleRegionToggle = (region: string) => {
    const newRegions = filters.regions.includes(region)
      ? filters.regions.filter(r => r !== region)
      : [...filters.regions, region];
    onChange({ ...filters, regions: newRegions });
  };

  const handleRockTypeToggle = (rockType: string) => {
    const newRockTypes = filters.rockTypes.includes(rockType)
      ? filters.rockTypes.filter(r => r !== rockType)
      : [...filters.rockTypes, rockType];
    onChange({ ...filters, rockTypes: newRockTypes });
  };

  const handleClimbingTypeToggle = (climbingType: string) => {
    const newClimbingTypes = filters.climbingTypes.includes(climbingType)
      ? filters.climbingTypes.filter(c => c !== climbingType)
      : [...filters.climbingTypes, climbingType];
    onChange({ ...filters, climbingTypes: newClimbingTypes });
  };

  const handleClearFilters = () => {
    onChange({
      minScore: 'all',
      regions: [],
      rockTypes: [],
      climbingTypes: [],
    });
  };

  const activeFilterCount =
    (filters.minScore !== 'all' ? 1 : 0) +
    filters.regions.length +
    filters.rockTypes.length +
    filters.climbingTypes.length;

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">Filtrer</span>
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp size={20} className="text-gray-600" />
          ) : (
            <ChevronDown size={20} className="text-gray-600" />
          )}
        </button>

        {isExpanded && (
          <div className="mt-4 space-y-4 animate-slide-down">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Minimum kvalitet
              </label>
              <div className="flex gap-2">
                {SCORE_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleScoreChange(option.value)}
                    className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      filters.minScore === option.value
                        ? option.color + ' ring-2 ring-offset-2 ring-blue-500'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {availableRegions.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Regioner
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableRegions.map(region => (
                    <button
                      key={region}
                      onClick={() => handleRegionToggle(region)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        filters.regions.includes(region)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {availableRockTypes.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Steintype
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableRockTypes.map(rockType => (
                    <button
                      key={rockType}
                      onClick={() => handleRockTypeToggle(rockType)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
                        filters.rockTypes.includes(rockType)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {rockType}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {availableClimbingTypes.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Klatretype
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableClimbingTypes.map(climbingType => (
                    <button
                      key={climbingType}
                      onClick={() => handleClimbingTypeToggle(climbingType)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
                        filters.climbingTypes.includes(climbingType)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {climbingType}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeFilterCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <X size={16} />
                <span>Fjern alle filtre</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
