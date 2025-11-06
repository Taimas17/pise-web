import type { Coordinates } from '../types/geo';

export function isValidLatitude(lat: number): boolean {
  return lat >= -90 && lat <= 90;
}

export function isValidLongitude(lng: number): boolean {
  return lng >= -180 && lng <= 180;
}

export function isValidCoordinates(coords: Coordinates): boolean {
  return isValidLatitude(coords.lat) && isValidLongitude(coords.lng);
}

export function maskCoordinates(coords: Coordinates, publicLocation: boolean): Coordinates {
  const decimals = publicLocation ? 6 : 3;
  return {
    lat: Number(coords.lat.toFixed(decimals)),
    lng: Number(coords.lng.toFixed(decimals))
  };
}

export function formatCoordinates(coords: Coordinates): string {
  return `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
}
