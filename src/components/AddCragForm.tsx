import { X, Check, MapPin } from 'lucide-react';
import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { CompassSelector } from './CompassSelector';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface AddCragFormProps {
  onClose: () => void;
  onSubmit: (cragData: NewCragData) => Promise<void>;
  initialLat?: number;
  initialLng?: number;
}

export interface NewCragData {
  name: string;
  latitude: number;
  longitude: number;
  aspect: number | null;
  climbing_types: string[];
  region: string;
  description: string;
  rock_type: string;
}

const ROCK_TYPES = [
  { value: 'granitt', label: 'Granitt' },
  { value: 'gneis', label: 'Gneis' },
  { value: 'kalkstein', label: 'Kalkstein' },
  { value: 'sandstein', label: 'Sandstein' },
  { value: 'skifer', label: 'Skifer' },
  { value: 'basalt', label: 'Basalt' },
  { value: 'konglomerat', label: 'Konglomerat' },
  { value: 'annet', label: 'Annet' }
];

const CLIMBING_TYPES = [
  'sport',
  'boulder',
  'trad',
  'multipitch',
  'ice',
  'mixed'
];

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function AddCragForm({ onClose, onSubmit, initialLat, initialLng }: AddCragFormProps) {
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState(initialLat?.toString() || '');
  const [longitude, setLongitude] = useState(initialLng?.toString() || '');
  const [aspect, setAspect] = useState<number | null>(null);
  const [rockType, setRockType] = useState('');
  const [climbingTypes, setClimbingTypes] = useState<string[]>([]);
  const [region, setRegion] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleMapClick = (lat: number, lng: number) => {
    setLatitude(lat.toFixed(6));
    setLongitude(lng.toFixed(6));
  };

  const markerPosition: [number, number] | null =
    latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude))
      ? [parseFloat(latitude), parseFloat(longitude)]
      : null;

  const mapCenter: [number, number] = markerPosition ?? [initialLat || 60.035226, initialLng || 11.048964];

  const handleClimbingTypeToggle = (type: string) => {
    setClimbingTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (!name.trim()) {
      setError('Navn er påkrevd');
      return;
    }

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setError('Ugyldig breddegrad (må være mellom -90 og 90)');
      return;
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      setError('Ugyldig lengdegrad (må være mellom -180 og 180)');
      return;
    }

    if (!region.trim()) {
      setError('Region er påkrevd');
      return;
    }

    if (climbingTypes.length === 0) {
      setError('Velg minst én klatretype');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        name: name.trim(),
        latitude: lat,
        longitude: lng,
        aspect,
        climbing_types: climbingTypes,
        region: region.trim(),
        description: description.trim(),
        rock_type: rockType,
      });
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kunne ikke legge til felt. Prøv igjen.';
      setError(errorMessage);
      console.error('Failed to add crag:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center animate-scale-in">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Klatrefelt lagt til!</h3>
          <p className="text-gray-600">Feltet er nå tilgjengelig i kartet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">Legg til klatrefelt</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Navn *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Navn på klatrefeltet"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Plassering *
            </label>
            <div className="bg-blue-50 rounded-xl p-3 mb-3 text-sm text-gray-700 flex items-start gap-2">
              <MapPin size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <p>Klikk på kartet for å velge plassering</p>
            </div>
            <div className="w-full h-64 rounded-xl overflow-hidden border border-gray-300 mb-3">
              <MapContainer
                center={mapCenter}
                zoom={10}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onLocationSelect={handleMapClick} />
                {markerPosition && <Marker position={markerPosition} icon={markerIcon} />}
              </MapContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Breddegrad *
              </label>
              <input
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="60.035226"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Lengdegrad *
              </label>
              <input
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="11.048964"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Region *
            </label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="F.eks. Akershus, Oslo, Telemark"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Veggretning (valgfritt)
            </label>
            <div className="flex justify-center">
              <CompassSelector
                value={aspect}
                onChange={setAspect}
                size={200}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Steintype (valgfritt)
            </label>
            <select
              value={rockType}
              onChange={(e) => setRockType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Velg steintype</option>
              {ROCK_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Klatretyper *
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
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Beskrivelse (valgfritt)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Beskrivelse av feltet, tilkomst, parkering, etc."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Legger til...' : 'Legg til felt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
