import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { isValidLatitude, isValidLongitude } from '../lib/geo-utils';

const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapProps {
  lat: number;
  lng: number;
  /** Callback déclenché au clic sur la carte, retourne les nouvelles coordonnées */
  onPick?: (lat: number, lng: number) => void;
  className?: string;
  /** Zoom initial (par défaut 15) */
  zoom?: number;
  /** Markers supplémentaires à afficher */
  markers?: Array<{ lat: number; lng: number; tooltip?: string }>;
}

export default function Map({ lat, lng, onPick, className, zoom = 15, markers }: MapProps) {
  if (!isValidLatitude(lat) || !isValidLongitude(lng)) {
    console.error('Coordonnées invalides:', { lat, lng });
    return <div>Coordonnées invalides</div>;
  }

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={zoom}
      className={className || 'h-[250px] md:h-[350px] w-full'}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
      <Marker position={[lat, lng]} icon={icon} />
      {markers?.map((m, i) => (
        <Marker key={i} position={[m.lat, m.lng]} icon={icon} />
      ))}
      {onPick && <PickMarker onPick={onPick} />}
    </MapContainer>
  );
}

function PickMarker({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e: L.LeafletMouseEvent) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}
