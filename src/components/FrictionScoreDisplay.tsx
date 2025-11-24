interface FrictionScoreDisplayProps {
  score: number;
  label: string;
  hasAspectData: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 85) return 'from-green-500 to-green-600';
  if (score >= 60) return 'from-yellow-500 to-yellow-600';
  return 'from-red-500 to-red-600';
}

function getScoreTextColor(score: number): string {
  if (score >= 85) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

export function FrictionScoreDisplay({ score, label, hasAspectData }: FrictionScoreDisplayProps) {
  const percentage = Math.round(score * 100);
  const scoreColor = getScoreColor(percentage);
  const textColor = getScoreTextColor(percentage);

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-xs text-gray-600 uppercase tracking-wide mb-1">
            Friction Quality
            {!hasAspectData && (
              <span className="ml-1 text-amber-600" title="Estimated score (wall direction unknown)">
                ~
              </span>
            )}
          </div>
          <div className={`text-xl font-bold ${textColor}`}>{label}</div>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-bold ${textColor}`}>{percentage}</div>
          <div className="text-sm text-gray-600 font-medium">/ 100</div>
        </div>
      </div>

      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full bg-gradient-to-r ${scoreColor} transition-all duration-700 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />
        </div>
      </div>

      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>Poor</span>
        <span>OK</span>
        <span>Perfect</span>
      </div>
    </div>
  );
}
