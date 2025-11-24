import { ChevronRight } from 'lucide-react';
import { ScoreBadge } from './ScoreBadge';

interface CragListItemProps {
  name: string;
  region: string;
  wetnessScore: number;
  frictionScore: number;
  summary: string;
  onClick: () => void;
}

export function CragListItem({
  name,
  region,
  wetnessScore,
  frictionScore,
  summary,
  onClick
}: CragListItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="text-base font-semibold text-gray-900">{name}</h3>
            <span className="text-sm text-gray-500">{region}</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-2">
            <ScoreBadge label="Friction" score={frictionScore} type="friction" />
            <ScoreBadge label="Wetness" score={wetnessScore} type="wetness" />
          </div>

          <p className="text-sm text-gray-600">{summary}</p>
        </div>

        <ChevronRight className="ml-2 text-gray-400 flex-shrink-0" size={20} />
      </div>
    </button>
  );
}
