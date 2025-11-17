import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import { Plus, Minus } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import type { Crag } from '../types';

const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapProps {
  crags: Crag[];
  onCragSelect: (crag: Crag) => void;
  selectedCrag?: Crag | null;
}

function FitBounds({ crags }: { crags: Crag[] }) {
  const map = useMap();

  useEffect(() => {
    if (crags.length === 0) return;

    if (crags.length === 1) {
      map.setView([crags[0].latitude, crags[0].longitude], 12);
      return;
    }

    const bounds = new LatLngBounds(
      crags.map(crag => [crag.latitude, crag.longitude])
    );
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [crags, map]);

  return null;
}

function CenterOnCrag({ crag }: { crag: Crag | null }) {
  const map = useMap();

  useEffect(() => {
    if (crag) {
      map.setView([crag.latitude, crag.longitude], 13, {
        animate: true,
      });
    }
  }, [crag, map]);

  return null;
}

function ZoomControls() {
  const map = useMap();

  return (
    <div className="absolute bottom-20 right-4 z-[999] flex flex-col gap-2">
      <div className="flex flex-col bg-white/80 hover:bg-white backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
        <button
          onClick={() => map.zoomIn()}
          className="p-2.5 hover:bg-gray-100 transition-colors border-b border-gray-200"
          title="Zoom in"
        >
          <Plus size={20} className="text-gray-700" />
        </button>
        <button
          onClick={() => map.zoomOut()}
          className="p-2.5 hover:bg-gray-100 transition-colors"
          title="Zoom out"
        >
          <Minus size={20} className="text-gray-700" />
        </button>
      </div>
    </div>
  );
}

export function Map({ crags, onCragSelect, selectedCrag }: MapProps) {
  const center: [number, number] = crags.length > 0
    ? [crags[0].latitude, crags[0].longitude]
    : [60.035226, 11.048964];

  return (
    <>
      <MapContainer
        center={center}
        zoom={8}
        className="w-full h-full"
        zoomControl={false}
      >
        <FitBounds crags={crags} />
        <CenterOnCrag crag={selectedCrag ?? null} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {crags.map((crag) => (
          <Marker
            key={crag.id}
            position={[crag.latitude, crag.longitude]}
            icon={customIcon}
            eventHandlers={{
              click: () => onCragSelect(crag),
            }}
          >
            <Popup>
              <div className="text-sm">
                <h3 className="font-semibold">{crag.name}</h3>
                <p className="text-gray-600">{crag.region}</p>
              </div>
            </Popup>
          </Marker>
        ))}
        <ZoomControls />
      </MapContainer>
    </>
  );
}
