import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Report } from '@/services/types';
import { MAP_DEFAULT_LAT, MAP_DEFAULT_LNG, MAP_ZOOM_COMMUNE } from '@/lib/mapConfig';

export default function DensityMap({ reports, center = [MAP_DEFAULT_LAT, MAP_DEFAULT_LNG], zoom = MAP_ZOOM_COMMUNE }: { reports: Report[]; center?: [number, number]; zoom?: number }){
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
      {reports.map((r) => {
        const lat = r.lat_masked ?? r.latitude;
        const lng = r.lng_masked ?? r.longitude;
        if (lat == null || lng == null) return null;
        const color  = r.criticality === 'haute'   ? '#ef4444' : r.criticality === 'moyenne' ? '#f59e0b' : '#22c55e';
        const radius = r.criticality === 'haute'   ? 16        : r.criticality === 'moyenne' ? 10       : 6;
        return (
          <CircleMarker key={r.id} center={[lat, lng]} pathOptions={{ color, fillColor: color, fillOpacity: 0.35 }} radius={radius} />
        );
      })}
    </MapContainer>
  );
}
