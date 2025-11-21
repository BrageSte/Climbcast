import { Card } from './Card';

interface FrictionScoreDisplayProps {
  score: number;
  label: string;
  hasAspectData: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-green-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-600';
}

function getBarColor(score: number): string {
  if (score >= 70) return 'bg-green-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function FrictionScoreDisplay({ score, label, hasAspectData }: FrictionScoreDisplayProps) {
  const percentage = Math.round(score * 100);
  const textColor = getScoreColor(percentage);
  const barColor = getBarColor(percentage);

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Friction Score
            {!hasAspectData && (
              <span className="ml-1 text-amber-600" title="Estimated score (wall direction unknown)">
                ~
              </span>
            )}
          </div>
          <div className={`text-5xl font-bold ${textColor} tracking-tight mb-2`}>
            {percentage}
          </div>
          <div className="text-sm text-gray-600 mb-4">
            {label} conditions for climbing
          </div>
        </div>
      </div>

      <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </Card>
  );
}
