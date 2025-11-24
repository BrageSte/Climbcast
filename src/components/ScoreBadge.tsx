interface ScoreBadgeProps {
  label: string;
  score: number;
  type?: 'wetness' | 'friction';
}

export function ScoreBadge({ label, score, type = 'friction' }: ScoreBadgeProps) {
  const getColorClass = () => {
    if (type === 'wetness') {
      if (score <= 30) return 'bg-green-50 text-green-700 border-green-200';
      if (score <= 60) return 'bg-amber-50 text-amber-700 border-amber-200';
      return 'bg-red-50 text-red-700 border-red-200';
    }

    if (score >= 85) return 'bg-green-50 text-green-700 border-green-200';
    if (score >= 60) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getColorClass()}`}>
      {label}: {score}
    </span>
  );
}
