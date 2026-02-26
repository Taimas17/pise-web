/**
 * Configuration géographique par défaut — Commune de Nikki, Bénin
 *
 * Centre : ville de Nikki           ≈ 9.9448°N, 3.2117°E
 * Bbox commune (approx) :
 *   Sud  : 9.6000°N   Nord : 10.2000°N
 *   Ouest: 2.7900°E   Est  : 3.3900°E
 */

export const MAP_DEFAULT_LAT   = 9.9448;
export const MAP_DEFAULT_LNG   = 3.2117;

/** Zoom "vue commune" — affiche l'ensemble du territoire */
export const MAP_ZOOM_COMMUNE  = 11;

/** Zoom "vue ville" — centré sur la localité */
export const MAP_ZOOM_CITY     = 13;

/** Zoom "vue détail" — niveau rue */
export const MAP_ZOOM_STREET   = 15;

/** Bounds de la Commune de Nikki — pour contraindre la carte */
export const MAP_BOUNDS: [[number, number], [number, number]] = [
  [9.60,  2.79],  // [sud-ouest] lat_min, lng_min
  [10.20, 3.39],  // [nord-est]  lat_max, lng_max
];
