import { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Report, InfrastructureType } from '@/services/types';
import {
  MAP_DEFAULT_LAT,
  MAP_DEFAULT_LNG,
  MAP_ZOOM_COMMUNE,
  MAP_BOUNDS,
} from '@/lib/mapConfig';

/* ─── Palette & Config ──────────────────────────────────────────────────── */

const TYPE_PALETTE = [
  '#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1',
];

type CriticalityKey = 'haute' | 'moyenne' | 'faible';
type StatusKey      = 'draft' | 'pending_review' | 'assigned' | 'resolved' | 'rejected';

const CRITICALITY_CONFIG: Record<CriticalityKey, { border: string; size: number; label: string }> = {
  haute:   { border: '#dc2626', size: 30, label: 'Haute'   },
  moyenne: { border: '#d97706', size: 22, label: 'Moyenne' },
  faible:  { border: '#16a34a', size: 16, label: 'Faible'  },
};

const STATUS_CONFIG: Record<StatusKey, { color: string; label: string }> = {
  draft:          { color: '#9ca3af', label: 'Brouillon'    },
  pending_review: { color: '#6b7280', label: 'En attente'   },
  assigned:       { color: '#8b5cf6', label: 'Assigné'      },
  resolved:       { color: '#10b981', label: 'Résolu'       },
  rejected:       { color: '#ef4444', label: 'Rejeté'       },
};

function isValidCriticality(s: string): s is CriticalityKey {
  return s in CRITICALITY_CONFIG;
}
function isValidStatus(s: string): s is StatusKey {
  return s in STATUS_CONFIG;
}

/* ─── Custom marker icon ────────────────────────────────────────────────── */

function createMarkerIcon(color: string, criticality: string): L.DivIcon {
  const cfg = isValidCriticality(criticality)
    ? CRITICALITY_CONFIG[criticality]
    : CRITICALITY_CONFIG.medium;
  const s = cfg.size;
  const half = Math.round(s / 2);

  return L.divIcon({
    html: `
      <div style="
        width:${s}px;height:${s}px;
        background:${color};
        border:3px solid ${cfg.border};
        border-radius:50%;
        box-shadow:0 2px 10px rgba(0,0,0,0.32),0 0 0 2px rgba(255,255,255,0.6);
        transition:transform .15s;
      "></div>`,
    className: '',
    iconSize:    [s, s]      as [number, number],
    iconAnchor:  [half, half] as [number, number],
    popupAnchor: [0, -half]   as [number, number],
  });
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export interface InfraMapProps {
  reports:      Report[];
  infraTypes?:  InfrastructureType[];
  height?:      string;
  showFilters?: boolean;
}

export default function InfraMap({
  reports,
  infraTypes   = [],
  height       = '460px',
  showFilters  = true,
}: InfraMapProps) {

  const [filterType,   setFilterType]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCrit,   setFilterCrit]   = useState('');

  /* type → color map */
  const typeColorMap = useMemo(() => {
    const m: Record<number, string> = {};
    infraTypes.forEach((t, i) => { m[t.id] = t.color ?? TYPE_PALETTE[i % TYPE_PALETTE.length]; });
    return m;
  }, [infraTypes]);

  /* filtered reports */
  const filtered = useMemo(() =>
    reports.filter(r => {
      if (filterType   && r.infrastructure_type_id !== Number(filterType)) return false;
      if (filterStatus && r.status      !== filterStatus) return false;
      if (filterCrit   && r.criticality !== filterCrit)   return false;
      return true;
    }),
  [reports, filterType, filterStatus, filterCrit]);

  /* legend: only types visible on map */
  const legendTypes = useMemo(() => {
    const ids = new Set(filtered.map(r => r.infrastructure_type_id));
    return infraTypes.filter(t => ids.has(t.id));
  }, [infraTypes, filtered]);

  const defaultCenter: [number, number] = [MAP_DEFAULT_LAT, MAP_DEFAULT_LNG];

  /* ── Render ── */
  return (
    <div className="flex flex-col gap-2">

      {/* ── Filter bar ─────────────────────────────────────────────────── */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-2">

          <select
            className="text-xs border border-input rounded-md px-2 py-1.5 bg-background text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="">Tous les types</option>
            {infraTypes.map(t => (
              <option key={t.id} value={String(t.id)}>{t.name}</option>
            ))}
          </select>

          <select
            className="text-xs border border-input rounded-md px-2 py-1.5 bg-background text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            {(Object.entries(STATUS_CONFIG) as [StatusKey, { color: string; label: string }][]).map(
              ([key, val]) => <option key={key} value={key}>{val.label}</option>
            )}
          </select>

          <select
            className="text-xs border border-input rounded-md px-2 py-1.5 bg-background text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            value={filterCrit}
            onChange={e => setFilterCrit(e.target.value)}
          >
            <option value="">Toutes les criticités</option>
            {(Object.entries(CRITICALITY_CONFIG) as [CriticalityKey, { border: string; size: number; label: string }][]).map(
              ([key, val]) => <option key={key} value={key}>{val.label}</option>
            )}
          </select>

          <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
            <span className="size-2 rounded-full bg-sky-500 animate-pulse inline-block" />
            {filtered.length} signalement{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* ── Map ────────────────────────────────────────────────────────── */}
      <div style={{ height, position: 'relative', borderRadius: '10px', overflow: 'hidden' }}>

        <MapContainer
          center={defaultCenter}
          zoom={MAP_ZOOM_COMMUNE}
          maxBounds={MAP_BOUNDS}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {filtered.map(r => {
            const lat = r.lat_masked ?? r.latitude;
            const lng = r.lng_masked ?? r.longitude;
            if (lat == null || lng == null) return null;

            const color    = typeColorMap[r.infrastructure_type_id] ?? TYPE_PALETTE[0];
            const icon     = createMarkerIcon(color, r.criticality);
            const statusCfg = isValidStatus(r.status)
              ? STATUS_CONFIG[r.status]
              : STATUS_CONFIG.pending_review;
            const critCfg   = isValidCriticality(r.criticality)
              ? CRITICALITY_CONFIG[r.criticality]
              : CRITICALITY_CONFIG.moyenne;
            const typeName  = r.infrastructure_type?.name ?? `Type ${r.infrastructure_type_id}`;

            return (
              <Marker
                key={r.id}
                position={[lat, lng] as [number, number]}
                icon={icon}
              >
                <Popup minWidth={210}>
                  {/* Popup content — inline styles required (outside Tailwind scope) */}
                  <div style={{ fontFamily: 'system-ui,-apple-system,sans-serif', padding: '2px' }}>

                    {/* Type header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{
                        width: 12, height: 12, borderRadius: '50%',
                        background: color,
                        border: `2px solid ${critCfg.border}`,
                        flexShrink: 0,
                      }} />
                      <strong style={{ fontSize: 13, color: '#111827' }}>{typeName}</strong>
                    </div>

                    {/* Status + criticality badges */}
                    <div style={{ display: 'flex', gap: 5, marginBottom: 10, flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '2px 9px', borderRadius: 9999,
                        background: statusCfg.color, color: '#fff',
                        fontSize: 11, fontWeight: 700, letterSpacing: '0.02em',
                      }}>
                        {statusCfg.label}
                      </span>
                      <span style={{
                        padding: '2px 9px', borderRadius: 9999,
                        background: critCfg.border, color: '#fff',
                        fontSize: 11, fontWeight: 700, letterSpacing: '0.02em',
                      }}>
                        {critCfg.label}
                      </span>
                    </div>

                    {/* Description */}
                    {r.description && (
                      <p style={{
                        fontSize: 12, color: '#374151',
                        margin: '0 0 8px', lineHeight: 1.5,
                      }}>
                        {r.description.length > 120
                          ? `${r.description.slice(0, 120)}…`
                          : r.description}
                      </p>
                    )}

                    {/* Zone */}
                    {r.zone?.name && (
                      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
                        📍 {r.zone.name}
                      </div>
                    )}

                    {/* Footer */}
                    <div style={{
                      fontSize: 11, color: '#9ca3af',
                      borderTop: '1px solid #f3f4f6',
                      paddingTop: 6, marginTop: 4,
                    }}>
                      Signalement&nbsp;#{r.id}&nbsp;·&nbsp;
                      {new Date(r.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* ── Legend overlay ─────────────────────────────────────────── */}
        {legendTypes.length > 0 && (
          <div style={{
            position: 'absolute', bottom: 24, left: 8,
            zIndex: 1000,
            background: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(6px)',
            borderRadius: 10,
            padding: '10px 14px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.14)',
            maxWidth: 195,
            pointerEvents: 'none',
          }}>
            {/* Types */}
            <p style={{ fontWeight: 700, fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 7px' }}>
              Infrastructures
            </p>
            {legendTypes.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: typeColorMap[t.id] ?? TYPE_PALETTE[0], flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: '#374151' }}>{t.name}</span>
              </div>
            ))}

            {/* Criticality guide */}
            <div style={{ borderTop: '1px solid #f3f4f6', marginTop: 9, paddingTop: 9 }}>
              <p style={{ fontWeight: 700, fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>
                Criticité
              </p>
              {(Object.entries(CRITICALITY_CONFIG) as [CriticalityKey, { border: string; size: number; label: string }][]).map(([key, cfg]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                  <div style={{
                    width:  Math.round(cfg.size * 0.44),
                    height: Math.round(cfg.size * 0.44),
                    borderRadius: '50%',
                    border: `2px solid ${cfg.border}`,
                    background: 'rgba(0,0,0,0.05)',
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 11, color: '#374151' }}>{cfg.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Empty state ─────────────────────────────────────────────── */}
        {filtered.length === 0 && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(2px)',
            zIndex: 900,
            gap: 8,
            pointerEvents: 'none',
          }}>
            <span style={{ fontSize: 32 }}>🗺️</span>
            <p style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>
              Aucun signalement correspondant
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
