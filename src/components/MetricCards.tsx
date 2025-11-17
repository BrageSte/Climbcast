import { Thermometer, Droplets, Wind, Cloud } from 'lucide-react';
import { Card } from './Card';

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
}

function MetricCard({ icon, label, value, unit }: MetricCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="text-3xl font-bold text-gray-900 tracking-tight">
        {value}
        {unit && <span className="text-lg text-gray-600 ml-1">{unit}</span>}
      </div>
    </Card>
  );
}

interface MetricCardsGridProps {
  temperature: number;
  humidity: number;
  windSpeed: number;
  cloudCover: number;
}

export function MetricCardsGrid({ temperature, humidity, windSpeed, cloudCover }: MetricCardsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <MetricCard
        icon={<Thermometer size={16} className="text-orange-500" />}
        label="Temperature"
        value={temperature}
        unit="°C"
      />
      <MetricCard
        icon={<Droplets size={16} className="text-blue-500" />}
        label="Humidity"
        value={humidity}
        unit="%"
      />
      <MetricCard
        icon={<Wind size={16} className="text-cyan-500" />}
        label="Wind Speed"
        value={windSpeed}
        unit="m/s"
      />
      <MetricCard
        icon={<Cloud size={16} className="text-gray-500" />}
        label="Cloud Cover"
        value={cloudCover}
        unit="%"
      />
    </div>
  );
}
