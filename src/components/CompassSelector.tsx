interface CompassSelectorProps {
  value: number | null;
  onChange: (aspect: number) => void;
  size?: number;
}

const DIRECTIONS = [
  { label: 'N', value: 0, angle: 0 },
  { label: 'NE', value: 45, angle: 45 },
  { label: 'E', value: 90, angle: 90 },
  { label: 'SE', value: 135, angle: 135 },
  { label: 'S', value: 180, angle: 180 },
  { label: 'SW', value: 225, angle: 225 },
  { label: 'W', value: 270, angle: 270 },
  { label: 'NW', value: 315, angle: 315 },
];

function getCardinalDirection(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360;
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(normalized / 45) % 8;
  return directions[index];
}

export function CompassSelector({ value, onChange, size = 200 }: CompassSelectorProps) {
  const radius = size / 2;
  const buttonRadius = 28;
  const circleRadius = radius - buttonRadius - 10;

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-full shadow-inner"
        style={{ width: size, height: size }}
      >
        <svg
          className="absolute inset-0"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          <circle
            cx={radius}
            cy={radius}
            r={circleRadius + 15}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const rad = ((angle - 90) * Math.PI) / 180;
            const innerRadius = circleRadius - 5;
            const outerRadius = circleRadius + 10;
            const x1 = radius + innerRadius * Math.cos(rad);
            const y1 = radius + innerRadius * Math.sin(rad);
            const x2 = radius + outerRadius * Math.cos(rad);
            const y2 = radius + outerRadius * Math.sin(rad);

            return (
              <line
                key={angle}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#d1d5db"
                strokeWidth="2"
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-md" />
        </div>

        {DIRECTIONS.map((dir) => {
          const angleRad = (dir.angle - 90) * (Math.PI / 180);
          const x = radius + circleRadius * Math.cos(angleRad) - buttonRadius;
          const y = radius + circleRadius * Math.sin(angleRad) - buttonRadius;
          const isSelected = value === dir.value;

          return (
            <button
              key={dir.value}
              onClick={() => onChange(dir.value)}
              className={`absolute w-14 h-14 rounded-full font-bold text-sm transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-lg scale-110 ring-4 ring-blue-200'
                  : 'bg-white text-gray-700 hover:bg-blue-50 hover:scale-105 shadow-md'
              }`}
              style={{
                left: x,
                top: y,
              }}
              type="button"
            >
              {dir.label}
            </button>
          );
        })}

        {value !== null && (
          <>
            <div
              className="absolute w-1.5 bg-gradient-to-t from-blue-600 to-blue-400 origin-bottom transition-all shadow-lg"
              style={{
                height: circleRadius - 15,
                left: radius - 0.75,
                bottom: radius,
                transform: `rotate(${value}deg)`,
              }}
            />
            <div
              className="absolute"
              style={{
                left: radius - 8,
                bottom: radius + circleRadius - 23,
                transform: `rotate(${value}deg)`,
                transformOrigin: `8px ${-circleRadius + 23}px`,
              }}
            >
              <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-blue-600" />
            </div>
          </>
        )}
      </div>

      <div className="text-center bg-white rounded-xl px-6 py-3 shadow-sm border border-gray-200">
        {value !== null ? (
          <>
            <div className="flex items-baseline gap-2 justify-center">
              <p className="text-2xl font-bold text-gray-900">{getCardinalDirection(value)}</p>
              <p className="text-lg font-semibold text-gray-600">{value}°</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">Wall aspect</p>
          </>
        ) : (
          <p className="text-sm text-gray-500">Select wall direction</p>
        )}
      </div>
    </div>
  );
}
