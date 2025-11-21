import { useMemo, useState } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import type { Crag, HourPoint } from '../types';
import { getBestCragsNow } from '../utils/cragRanking';
import { Card } from './Card';
import { FrictionScoreDisplay } from './FrictionScoreDisplay';

interface AnalyzeViewProps {
  crags: Crag[];
  weatherData: Map<string, HourPoint[]>;
  onCragSelect: (crag: Crag) => void;
}

export function AnalyzeView({ crags, weatherData, onCragSelect }: AnalyzeViewProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  const regions = useMemo(() => {
    const uniqueRegions = new Set(crags.map(c => c.region));
    return ['all', ...Array.from(uniqueRegions).sort()];
  }, [crags]);

  const filteredCrags = useMemo(() => {
    if (selectedRegion === 'all') return crags;
    return crags.filter(c => c.region === selectedRegion);
  }, [crags, selectedRegion]);

  const topCrags = useMemo(() => {
    return getBestCragsNow(filteredCrags, weatherData, {
      minWetnessThreshold: 0,
      excludeHeavyRain: false,
    }).slice(0, 20);
  }, [filteredCrags, weatherData]);

  const stats = useMemo(() => {
    const withGoodConditions = topCrags.filter(
      c => (c.currentMetrics?.frictionScore ?? 0) >= 70
    ).length;
    const withDecentConditions = topCrags.filter(
      c =>
        (c.currentMetrics?.frictionScore ?? 0) >= 40 &&
        (c.currentMetrics?.frictionScore ?? 0) < 70
    ).length;

    return {
      total: filteredCrags.length,
      good: withGoodConditions,
      decent: withDecentConditions,
      poor: topCrags.length - withGoodConditions - withDecentConditions,
    };
  }, [filteredCrags, topCrags]);

  return (
    <div className="h-full overflow-y-auto pb-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={24} className="text-gray-900" />
            <h1 className="text-2xl font-bold text-gray-900">Analyze</h1>
          </div>
          <p className="text-sm text-gray-600">
            Compare conditions across multiple crags
          </p>
        </div>

        <Card>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Region
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region === 'all' ? 'All Regions' : region}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{stats.good}</div>
                <div className="text-xs text-green-600 mt-1">Excellent</div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-700">{stats.decent}</div>
                <div className="text-xs text-yellow-600 mt-1">Good</div>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <div className="text-2xl font-bold text-gray-700">{stats.poor}</div>
                <div className="text-xs text-gray-600 mt-1">Fair</div>
              </div>
            </div>
          </div>
        </Card>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">
              Rankings {selectedRegion !== 'all' && `- ${selectedRegion}`}
            </h2>
          </div>
          <div className="space-y-2">
            {topCrags.map((crag, index) => {
              const metrics = crag.currentMetrics;
              const score = metrics?.frictionScore ?? 0;

              let bgColor = 'bg-white';
              if (score >= 70) bgColor = 'bg-green-50';
              else if (score >= 40) bgColor = 'bg-yellow-50';

              return (
                <Card
                  key={crag.id}
                  onClick={() => onCragSelect(crag)}
                  className={`cursor-pointer hover:shadow-md transition-all ${bgColor}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{crag.name}</h3>
                      <p className="text-sm text-gray-600 truncate">{crag.region}</p>
                    </div>
                    {metrics && (
                      <div className="flex flex-col items-end gap-1">
                        <FrictionScoreDisplay score={score} size="sm" />
                        <span className="text-xs text-gray-500">
                          {Math.round(metrics.wetnessScore)}% dry
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {topCrags.length === 0 && (
          <Card className="text-center py-8">
            <p className="text-gray-600">No crags found in this region</p>
          </Card>
        )}
      </div>
    </div>
  );
}
