import { ArrowUp } from 'lucide-react';

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
      <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
        <div className="relative w-16 h-16">
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ transform: `rotate(${windDirection}deg)` }}
          >
            <ArrowUp size={32} className="text-gray-600" strokeWidth={2.5} />
          </div>
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-900">
            Wind: {getCardinalDirection(windDirection)} ({windDirection}°)
          </div>
          <div className="text-xs text-gray-600">{windSpeed} m/s</div>
          <div className="text-xs text-gray-500 mt-1">Wall aspect unknown</div>
        </div>
      </div>
    );
  }

  const aspectDiff = Math.abs(normalizeAngle(windDirection - wallAspect));
  const minDiff = Math.min(aspectDiff, 360 - aspectDiff);
  const conditionColor = getWindConditionColor(minDiff);
  const conditionLabel = getWindConditionLabel(minDiff);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="white"
              stroke="#cbd5e1"
              strokeWidth="2"
            />

            <line
              x1="50"
              y1="50"
              x2="50"
              y2="10"
              stroke="#94a3b8"
              strokeWidth="3"
              strokeDasharray="4 2"
            />

            <polygon
              points="50,5 45,15 55,15"
              fill="#64748b"
            />

            <line
              x1="50"
              y1="50"
              x2="50"
              y2="10"
              stroke={conditionColor.replace('text-', '')}
              strokeWidth="4"
              strokeLinecap="round"
              transform={`rotate(${windDirection - wallAspect} 50 50)`}
            />

            <polygon
              points="50,5 45,15 55,15"
              fill={conditionColor.replace('text-', '')}
              transform={`rotate(${windDirection - wallAspect} 50 50)`}
            />

            <circle cx="50" cy="50" r="6" fill="#1e293b" />
          </svg>
        </div>

        <div className="flex-1">
          <div className="text-xs text-gray-600 uppercase tracking-wide mb-1">Wind Direction</div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-lg font-bold text-gray-900">
              {getCardinalDirection(windDirection)}
            </span>
            <span className="text-sm text-gray-600">
              {windDirection}°
            </span>
            <span className="text-sm text-gray-600">
              · {windSpeed} m/s
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-gray-600">Wall:</span>
            <span className="text-sm font-medium text-gray-700">
              {getCardinalDirection(wallAspect)} ({wallAspect}°)
            </span>
          </div>
          <div className={`text-sm font-semibold ${conditionColor} mt-1`}>
            {conditionLabel}
          </div>
        </div>
      </div>
    </div>
  );
}
