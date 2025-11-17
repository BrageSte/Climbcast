import { Wind } from 'lucide-react';
import { Card } from './Card';

interface WindDirectionIndicatorProps {
  windDirection: number;
  wallAspect: number | null;
  windSpeed: number;
}

function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

function getCardinalDirection(degrees: number): string {
  const normalized = normalizeAngle(degrees);
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(normalized / 45) % 8;
  return directions[index];
}

function getWindConditionColor(minDiff: number): string {
  if (minDiff >= 75 && minDiff <= 105) {
    return 'text-green-600';
  } else if (minDiff >= 45 && minDiff <= 135) {
    return 'text-yellow-600';
  } else if (minDiff >= 135 && minDiff <= 180) {
    return 'text-orange-600';
  } else {
    return 'text-red-600';
  }
}

function getWindConditionLabel(minDiff: number): string {
  if (minDiff >= 75 && minDiff <= 105) {
    return 'Optimal drying';
  } else if (minDiff >= 45 && minDiff <= 135) {
    return 'Good drying';
  } else if (minDiff >= 135 && minDiff <= 180) {
    return 'Poor drying';
  } else {
    return 'No drying effect';
  }
}

export function WindDirectionIndicator({ windDirection, wallAspect, windSpeed }: WindDirectionIndicatorProps) {
  if (wallAspect === null) {
    return (
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Wind size={18} className="text-blue-500" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Wind
          </span>
        </div>
        <div className="text-4xl font-bold text-gray-900 tracking-tight mb-2">
          {windSpeed}
          <span className="text-2xl text-gray-600 ml-2">m/s</span>
        </div>
        <div className="text-sm text-gray-600">
          {getCardinalDirection(windDirection)} ({windDirection}°)
        </div>
        <div className="text-xs text-gray-500 mt-2">Wall direction unknown</div>
      </Card>
    );
  }

  const aspectDiff = Math.abs(normalizeAngle(windDirection - wallAspect));
  const minDiff = Math.min(aspectDiff, 360 - aspectDiff);
  const conditionColor = getWindConditionColor(minDiff);
  const conditionLabel = getWindConditionLabel(minDiff);

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Wind size={18} className="text-blue-500" />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Wind
        </span>
      </div>

      <div className="flex items-start gap-4">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1.5"
            />

            <text x="50" y="12" textAnchor="middle" fontSize="10" fill="#9ca3af" fontWeight="600">N</text>
            <text x="88" y="54" textAnchor="middle" fontSize="10" fill="#9ca3af" fontWeight="600">E</text>
            <text x="50" y="92" textAnchor="middle" fontSize="10" fill="#9ca3af" fontWeight="600">S</text>
            <text x="12" y="54" textAnchor="middle" fontSize="10" fill="#9ca3af" fontWeight="600">W</text>

            <line
              x1="30"
              y1="50"
              x2="70"
              y2="50"
              stroke="#1f2937"
              strokeWidth="4"
              strokeLinecap="round"
              transform={`rotate(${wallAspect + 90} 50 50)`}
            />

            <line
              x1="50"
              y1="50"
              x2="50"
              y2="15"
              stroke={conditionColor.replace('text-', '')}
              strokeWidth="3"
              strokeLinecap="round"
              transform={`rotate(${windDirection} 50 50)`}
            />

            <polygon
              points="50,10 47,18 53,18"
              fill={conditionColor.replace('text-', '')}
              transform={`rotate(${windDirection} 50 50)`}
            />

            <circle cx="50" cy="50" r="5" fill="#1f2937" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-4xl font-bold text-gray-900 tracking-tight mb-1">
            {windSpeed}
            <span className="text-2xl text-gray-600 ml-2">m/s</span>
          </div>
          <div className="text-base font-medium text-gray-700 mb-1">
            {getCardinalDirection(windDirection)} ({windDirection}°)
          </div>
          <div className="text-xs text-gray-500 mb-2">
            Wall: {getCardinalDirection(wallAspect)} ({wallAspect}°)
          </div>
          <div className={`text-sm font-semibold ${conditionColor}`}>
            {conditionLabel}
          </div>
        </div>
      </div>
    </Card>
  );
}
