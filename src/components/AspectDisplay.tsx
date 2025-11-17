import { Compass } from 'lucide-react';

interface AspectDisplayProps {
  aspect: number | null;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

function getCardinalDirection(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360;
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(normalized / 45) % 8;
  return directions[index];
}

export function AspectDisplay({ aspect, size = 'medium', showLabel = true }: AspectDisplayProps) {
  if (aspect === null) {
    return (
      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
        <Compass size={18} className="text-gray-400" />
        <span className="text-sm text-gray-500">Aspect unknown</span>
      </div>
    );
  }

  const cardinal = getCardinalDirection(aspect);

  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-24 h-24',
  };

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`relative ${sizeClasses[size]}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="aspectGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
          </defs>

          <circle
            cx="50"
            cy="50"
            r="48"
            fill="white"
            stroke="#e5e7eb"
            strokeWidth="2"
          />

          <text
            x="50"
            y="20"
            textAnchor="middle"
            className="text-[10px] fill-gray-400 font-medium"
          >
            N
          </text>
          <text
            x="80"
            y="55"
            textAnchor="middle"
            className="text-[10px] fill-gray-400 font-medium"
          >
            E
          </text>
          <text
            x="50"
            y="90"
            textAnchor="middle"
            className="text-[10px] fill-gray-400 font-medium"
          >
            S
          </text>
          <text
            x="20"
            y="55"
            textAnchor="middle"
            className="text-[10px] fill-gray-400 font-medium"
          >
            W
          </text>

          <line
            x1="50"
            y1="50"
            x2="50"
            y2="15"
            stroke="url(#aspectGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            transform={`rotate(${aspect} 50 50)`}
          />

          <polygon
            points="50,10 45,20 55,20"
            fill="#3b82f6"
            transform={`rotate(${aspect} 50 50)`}
          />

          <circle cx="50" cy="50" r="8" fill="white" stroke="#3b82f6" strokeWidth="2" />
          <circle cx="50" cy="50" r="3" fill="#3b82f6" />
        </svg>
      </div>

      {showLabel && (
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className={`font-bold text-gray-900 ${textSizeClasses[size]}`}>
              {cardinal}
            </span>
            <span className={`text-gray-600 ${textSizeClasses[size]}`}>
              {aspect}°
            </span>
          </div>
          <span className="text-xs text-gray-500">Wall aspect</span>
        </div>
      )}
    </div>
  );
}
