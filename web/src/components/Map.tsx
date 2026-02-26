import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25,41], iconAnchor: [12,41]
});

export default function Map({ lat, lng, onPick, className }: { lat: number; lng: number; onPick?: (lat:number, lng:number)=>void; className?: string }){
  return (
    <MapContainer center={[lat,lng]} zoom={15} className={className || "h-[250px] md:h-[350px] w-full"} style={{height: '100%', width: '100%'}}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
      <Marker position={[lat,lng]} icon={icon} />
      {onPick && <PickMarker onPick={onPick} />}
    </MapContainer>
  );
}

function PickMarker({ onPick }: { onPick: (lat:number, lng:number)=>void }){
  useMapEvents({
    click(e){ onPick(e.latlng.lat, e.latlng.lng); }
  });
  return null;
}
