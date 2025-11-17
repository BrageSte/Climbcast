import { Thermometer, Droplets, Mountain } from 'lucide-react';
import { useMemo } from 'react';
import { Card } from './Card';
import type { Crag, HourPoint } from '../types';
import { computeFriction } from '../utils/frictionCalculator';
import { FilterPanel, type FilterOptions } from './FilterPanel';
import { useBestNowFilters } from '../hooks/useBestNowFilters';

interface BestNowViewProps {
  crags: Crag[];
  weatherData: Map<string, HourPoint>;
  onCragSelect: (crag: Crag) => void;
}

interface CragWithScore {
  crag: Crag;
  weather: HourPoint;
  score: number;
  label: 'Perfect' | 'OK' | 'Poor';
  hasAspectData: boolean;
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

export function BestNowView({ crags, weatherData, onCragSelect }: BestNowViewProps) {
  const { filters, setFilters } = useBestNowFilters();

  const cragsWithScores: CragWithScore[] = useMemo(() => {
    return crags
      .map(crag => {
        const weather = weatherData.get(crag.id);
        if (!weather) return null;

        const friction = computeFriction(weather, crag.aspect);
        return {
          crag,
          weather,
          score: friction.score,
          label: friction.label,
          hasAspectData: friction.hasAspectData,
        };
      })
      .filter((item): item is CragWithScore => item !== null)
      .sort((a, b) => {
        if (a.label === 'Perfect' && b.label !== 'Perfect') return -1;
        if (a.label !== 'Perfect' && b.label === 'Perfect') return 1;
        if (a.label === 'OK' && b.label === 'Poor') return -1;
        if (a.label === 'Poor' && b.label === 'OK') return 1;
        return b.score - a.score;
      });
  }, [crags, weatherData]);

  const filteredCrags = useMemo(() => {
    return cragsWithScores.filter(({ crag, label }) => {
      if (filters.minScore === 'perfect' && label !== 'Perfect') return false;
      if (filters.minScore === 'ok' && label === 'Poor') return false;

      if (filters.regions.length > 0 && !filters.regions.includes(crag.region)) return false;

      if (filters.rockTypes.length > 0) {
        if (!crag.rock_type || !filters.rockTypes.includes(crag.rock_type)) return false;
      }

      if (filters.climbingTypes.length > 0) {
        const hasMatchingType = filters.climbingTypes.some(type =>
          crag.climbing_types.includes(type)
        );
        if (!hasMatchingType) return false;
      }

      return true;
    });
  }, [cragsWithScores, filters]);

  const availableRegions = useMemo(() => {
    return Array.from(new Set(crags.map(c => c.region))).sort();
  }, [crags]);

  const availableRockTypes = useMemo(() => {
    return Array.from(new Set(crags.map(c => c.rock_type).filter((t): t is string => t !== null))).sort();
  }, [crags]);

  const availableClimbingTypes = useMemo(() => {
    const types = new Set<string>();
    crags.forEach(c => c.climbing_types.forEach(t => types.add(t)));
    return Array.from(types).sort();
  }, [crags]);

  return (
    <div className="h-screen overflow-y-auto bg-gray-50 pb-20">
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Best Right Now</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filteredCrags.length === cragsWithScores.length
              ? 'Crags with best conditions'
              : `${filteredCrags.length} of ${cragsWithScores.length} crags`}
          </p>
        </div>
      </div>

      <FilterPanel
        filters={filters}
        onChange={setFilters}
        availableRegions={availableRegions}
        availableRockTypes={availableRockTypes}
        availableClimbingTypes={availableClimbingTypes}
      />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-3">
          {filteredCrags.map(({ crag, weather, label, hasAspectData }) => (
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
                <span className={`px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 ${getFrictionColor(label)}`}>
                  {label}
                  {!hasAspectData && (
                    <span className="ml-1 text-current opacity-70" title="Estimated score">~</span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Thermometer size={16} className="text-orange-500" />
                  <span className="font-medium">{weather.temperature}°</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Droplets size={16} className="text-blue-500" />
                  <span className="font-medium">{weather.humidity}%</span>
                </div>
                {crag.rock_type && (
                  <div className="flex items-center gap-1.5">
                    <Mountain size={16} className="text-gray-500" />
                    <span className="capitalize font-medium">{crag.rock_type}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {cragsWithScores.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">No weather data available</p>
          </div>
        )}

        {cragsWithScores.length > 0 && filteredCrags.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-700 font-semibold mb-1">No crags match filters</p>
            <p className="text-gray-500 text-sm">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
