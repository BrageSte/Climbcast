import { useState, useMemo } from 'react';
import { Map as MapComponent } from './Map';
import { SearchBar } from './SearchBar';
import { FilterPanel, type FilterOptions } from './FilterPanel';
import type { Crag } from '../types';

interface ExploreViewProps {
  crags: Crag[];
  selectedCrag: Crag | null;
  onCragSelect: (crag: Crag) => void;
}

export function ExploreView({ crags, selectedCrag, onCragSelect }: ExploreViewProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    minScore: 'all',
    regions: [],
    rockTypes: [],
    climbingTypes: [],
  });

  const availableRegions = useMemo(() => {
    const regions = new Set(crags.map(c => c.region));
    return Array.from(regions).sort();
  }, [crags]);

  const availableRockTypes = useMemo(() => {
    const rockTypes = new Set(
      crags.map(c => c.rock_type).filter((rt): rt is string => rt !== null)
    );
    return Array.from(rockTypes).sort();
  }, [crags]);

  const availableClimbingTypes = useMemo(() => {
    const climbingTypes = new Set(
      crags.flatMap(c => c.climbing_types)
    );
    return Array.from(climbingTypes).sort();
  }, [crags]);

  const filteredCrags = useMemo(() => {
    return crags.filter(crag => {
      if (filters.regions.length > 0 && !filters.regions.includes(crag.region)) {
        return false;
      }

      if (filters.rockTypes.length > 0) {
        if (!crag.rock_type || !filters.rockTypes.includes(crag.rock_type)) {
          return false;
        }
      }

      if (filters.climbingTypes.length > 0) {
        if (!crag.climbing_types.some(ct => filters.climbingTypes.includes(ct))) {
          return false;
        }
      }

      return true;
    });
  }, [crags, filters]);

  return (
    <div className="h-full relative">
      <FilterPanel
        filters={filters}
        onChange={setFilters}
        availableRegions={availableRegions}
        availableRockTypes={availableRockTypes}
        availableClimbingTypes={availableClimbingTypes}
      />

      <div className="h-full w-full">
        <MapComponent
          crags={filteredCrags}
          onCragSelect={onCragSelect}
          selectedCrag={selectedCrag}
        />
      </div>

      <SearchBar
        crags={filteredCrags}
        onCragSelect={onCragSelect}
      />
    </div>
  );
}
