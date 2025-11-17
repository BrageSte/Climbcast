import { X, Check } from 'lucide-react';
import { useState } from 'react';
import type { Crag } from '../types';
import { CompassSelector } from './CompassSelector';

interface EditCragModalProps {
  crag: Crag;
  onClose: () => void;
  onSubmit: (changes: Record<string, unknown>, comment: string, latitude?: number, longitude?: number) => Promise<void>;
}

const ROCK_TYPES = [
  'granite',
  'gneiss',
  'limestone',
  'sandstone',
  'quartzite',
  'basalt',
  'conglomerate',
  'other'
];

const CLIMBING_TYPES = [
  'sport',
  'boulder',
  'trad',
  'multipitch',
  'ice',
  'mixed'
];

export function EditCragModal({ crag, onClose, onSubmit }: EditCragModalProps) {
  const [aspect, setAspect] = useState<number | null>(crag.aspect);
  const [rockType, setRockType] = useState(crag.rock_type || '');
  const [climbingTypes, setClimbingTypes] = useState<string[]>(crag.climbing_types);
  const [description, setDescription] = useState(crag.description || '');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClimbingTypeToggle = (type: string) => {
    setClimbingTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const changes: Record<string, unknown> = {};

    if (aspect !== crag.aspect) changes.aspect = aspect;
    if (rockType !== (crag.rock_type || '')) changes.rock_type = rockType;
    if (JSON.stringify(climbingTypes.sort()) !== JSON.stringify([...crag.climbing_types].sort())) {
      changes.climbing_types = climbingTypes;
    }
    if (description !== (crag.description || '')) changes.description = description;

    try {
      await onSubmit(changes, comment, crag.latitude, crag.longitude);
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to submit change request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChanges =
    aspect !== crag.aspect ||
    rockType !== (crag.rock_type || '') ||
    JSON.stringify(climbingTypes.sort()) !== JSON.stringify([...crag.climbing_types].sort()) ||
    description !== (crag.description || '');

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center animate-scale-in">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Takk for din tilbakemelding!</h3>
          <p className="text-gray-600">Din endringsforespørsel er mottatt og vil bli vurdert.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8 animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Foreslå endringer</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm text-gray-700">
              <strong>{crag.name}</strong> - {crag.region}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Veggretning
            </label>
            <div className="flex justify-center">
              <CompassSelector
                value={aspect}
                onChange={setAspect}
                size={200}
              />
            </div>
            {crag.aspect !== null && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Nåværende: {crag.aspect}°
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Steintype
            </label>
            <select
              value={rockType}
              onChange={(e) => setRockType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Velg steintype</option>
              {ROCK_TYPES.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            {crag.rock_type && (
              <p className="text-xs text-gray-500 mt-1">
                Nåværende: {crag.rock_type}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Klatretyper
            </label>
            <div className="flex flex-wrap gap-2">
              {CLIMBING_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleClimbingTypeToggle(type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    climbingTypes.includes(type)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Nåværende: {crag.climbing_types.join(', ')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Beskrivelse
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Beskrivelse av feltet, tilkomst, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Kommentar (valgfritt)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Forklar hvorfor du foreslår disse endringene..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={!hasChanges || isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Sender...' : 'Send inn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
