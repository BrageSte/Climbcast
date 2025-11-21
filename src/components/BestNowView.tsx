import { Thermometer, Droplets, Mountain } from 'lucide-react';
import { useMemo } from 'react';
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
      return 'bg-green-100 text-green-700';
    case 'OK':
      return 'bg-yellow-100 text-yellow-700';
    case 'Poor':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
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
    <div className="h-screen overflow-y-auto bg-gray-50 md:pt-14 pb-20 md:pb-6">
      <FilterPanel
        filters={filters}
        onChange={setFilters}
        availableRegions={availableRegions}
        availableRockTypes={availableRockTypes}
        availableClimbingTypes={availableClimbingTypes}
      />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Best nå</h1>
          <p className="text-gray-600">
            {filteredCrags.length === cragsWithScores.length
              ? 'Klatrefelt med beste forhold akkurat nå'
              : `${filteredCrags.length} av ${cragsWithScores.length} felt`}
          </p>
        </div>

        <div className="space-y-3">
          {filteredCrags.map(({ crag, weather, label, hasAspectData }) => (
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
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getFrictionColor(label)}`}>
                  {label}
                  {!hasAspectData && (
                    <span className="ml-1 text-current opacity-70" title="Estimated score">~</span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-700">
                <div className="flex items-center gap-1.5">
                  <Thermometer size={16} className="text-orange-500" />
                  <span>{weather.temperature}°</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Droplets size={16} className="text-blue-500" />
                  <span>{weather.humidity}%</span>
                </div>
                {crag.rock_type && (
                  <div className="flex items-center gap-1.5">
                    <Mountain size={16} className="text-gray-500" />
                    <span className="capitalize">{crag.rock_type}</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {cragsWithScores.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Ingen værdata tilgjengelig for øyeblikket</p>
          </div>
        )}

        {cragsWithScores.length > 0 && filteredCrags.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 font-medium mb-2">Ingen felt matcher filtrene</p>
            <p className="text-gray-500 text-sm">Prøv å justere filtrene for å se flere felt</p>
          </div>
        )}
      </div>
    </div>
  );
}
