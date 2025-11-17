import { Info } from 'lucide-react';
import {
  getRockTypeDisplayName,
  getRockTypeFrictionCharacteristics,
  type NormalizedRockType,
} from '../utils/rockTypeNormalizer';
import { needsMoreData } from '../utils/regionalInference';

interface RockTypeInfoProps {
  rockType: string | null;
  rockSource: string | null;
  rockConfidence: number | null;
}

function getConfidenceColor(confidence: number | null): string {
  if (confidence === null) return 'text-gray-400';
  if (confidence >= 80) return 'text-green-600';
  if (confidence >= 60) return 'text-yellow-600';
  if (confidence >= 40) return 'text-orange-600';
  return 'text-red-600';
}

function getConfidenceIcon(confidence: number | null): string {
  if (confidence === null) return '?';
  if (confidence >= 80) return '●';
  if (confidence >= 60) return '◐';
  if (confidence >= 40) return '◔';
  return '○';
}

export function RockTypeInfo({ rockType, rockSource, rockConfidence }: RockTypeInfoProps) {
  if (!rockType) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Info size={20} className="text-gray-500" />
          <h3 className="font-semibold text-gray-800">Bergtype</h3>
        </div>
        <p className="text-sm text-gray-600">
          Bergtype ikke tilgjengelig. Vi mangler data for dette feltet.
        </p>
        <p className="text-xs text-gray-500 italic">
          Bidra med informasjon hvis du kjenner berggrunnen her.
        </p>
      </div>
    );
  }

  const showMoreDataNeeded = needsMoreData(rockConfidence);
  const displayName = getRockTypeDisplayName(rockType as NormalizedRockType);
  const characteristics = getRockTypeFrictionCharacteristics(rockType as NormalizedRockType);
  const confidenceColor = getConfidenceColor(rockConfidence);
  const confidenceIcon = getConfidenceIcon(rockConfidence);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info size={20} className="text-blue-600" />
          <h3 className="font-semibold text-gray-800">Bergtype</h3>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-lg ${confidenceColor}`} title={`Konfidens: ${rockConfidence}%`}>
            {confidenceIcon}
          </span>
          {rockSource && (
            <span className="text-xs text-gray-500">({rockSource})</span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <span className="font-medium text-gray-800">{displayName}</span>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed">
          {characteristics}
        </p>

        {showMoreDataNeeded && (
          <div className="mt-2 pt-2 border-t border-blue-300">
            <p className="text-xs text-blue-700 italic">
              Mer data trengs for å bekrefte bergtypen. Bidra med informasjon hvis du kan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
