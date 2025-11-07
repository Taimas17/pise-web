import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Report } from '@/services/types';

export default function DensityMap({ reports, center = [14.6937, -17.4441], zoom = 12 }: { reports: Report[]; center?: [number, number]; zoom?: number }){
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
      {reports.map((r) => {
        const pos = (r.masked_location || r.location);
        if (!pos) return null;
        const color = r.criticality === 'critical' ? '#ef4444' : r.criticality === 'high' ? '#f59e0b' : r.criticality === 'medium' ? '#22c55e' : '#10b981';
        const radius = r.criticality === 'critical' ? 16 : r.criticality === 'high' ? 12 : r.criticality === 'medium' ? 9 : 6;
        return (
          <CircleMarker key={r.id} center={[pos.lat, pos.lng]} pathOptions={{ color, fillColor: color, fillOpacity: 0.35 }} radius={radius} />
        );
      })}
    </MapContainer>
  );
}
