/**
 * Coordonnées géographiques WGS84 (EPSG:4326)
 */
export interface Coordinates {
  /** Latitude en degrés décimaux (-90 à 90) */
  lat: number;
  /** Longitude en degrés décimaux (-180 à 180) */
  lng: number;
}

/**
 * Coordonnées avec précision masquée (3 décimales)
 */
export interface MaskedCoordinates extends Coordinates {
  /** Indique si la localisation est publique (6 décimales) ou masquée (3 décimales) */
  public_location: boolean;
}

/**
 * Structure GeoJSON simplifiée pour les chantiers
 */
export interface GeoJsonGeometry {
  type: 'Point' | 'LineString' | 'Polygon';
  coordinates: number[] | number[][] | number[][][];
}

/**
 * Bounds géographiques pour les cartes
 */
export interface GeoBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}
