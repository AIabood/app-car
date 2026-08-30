/**
 * Places Service
 * Provider-agnostic place search. UI depends only on AppLocation results.
 * Uses Photon (OpenStreetMap) — free, no API key, no paid map provider.
 */

import { AppLocation } from '@/types/navigation';

const PHOTON_ENDPOINT = 'https://photon.komoot.io/api/';
const SEARCH_LIMIT = 10;

type PhotonFeature = {
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: {
    osm_id?: number;
    osm_type?: string;
    osm_key?: string;
    name?: string;
    street?: string;
    housenumber?: string;
    district?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
};

type PhotonResponse = {
  features?: PhotonFeature[];
};

export type PlaceSearchOptions = {
  latitude?: number;
  longitude?: number;
  signal?: AbortSignal;
};

function buildAddress(props: NonNullable<PhotonFeature['properties']>): string | undefined {
  const parts = [
    [props.housenumber, props.street].filter(Boolean).join(' '),
    props.district,
    props.city,
    props.state,
    props.country,
  ].filter((part) => part && part.trim().length > 0);

  if (parts.length === 0) return undefined;
  return parts.join('، ');
}

function mapFeatureToLocation(feature: PhotonFeature, index: number): AppLocation | null {
  const coords = feature.geometry?.coordinates;
  const props = feature.properties;
  if (!coords || coords.length < 2 || !props) return null;

  const longitude = coords[0];
  const latitude = coords[1];
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const name = props.name?.trim() || props.street?.trim() || props.city?.trim();
  if (!name) return null;

  const address = buildAddress(props);
  const osmId = props.osm_id != null ? `${props.osm_type ?? 'n'}-${props.osm_id}` : `photon-${index}`;

  return {
    id: `place_${osmId}`,
    name,
    nameAr: name,
    nameEn: name,
    latitude,
    longitude,
    address,
    descriptionAr: address,
    descriptionEn: address,
  };
}

export async function searchPlaces(
  query: string,
  options: PlaceSearchOptions = {}
): Promise<AppLocation[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const params = new URLSearchParams({
    q: trimmed,
    limit: String(SEARCH_LIMIT),
    lang: 'en',
  });

  if (
    options.latitude != null &&
    options.longitude != null &&
    Number.isFinite(options.latitude) &&
    Number.isFinite(options.longitude)
  ) {
    params.set('lat', String(options.latitude));
    params.set('lon', String(options.longitude));
  }

  const response = await fetch(`${PHOTON_ENDPOINT}?${params.toString()}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal: options.signal,
  });

  if (!response.ok) {
    throw new Error(`Place search failed (${response.status})`);
  }

  const data = (await response.json()) as PhotonResponse;
  const features = data.features ?? [];

  const seen = new Set<string>();
  const results: AppLocation[] = [];

  for (let i = 0; i < features.length; i += 1) {
    const location = mapFeatureToLocation(features[i], i);
    if (!location) continue;
    if (seen.has(location.id)) continue;
    seen.add(location.id);
    results.push(location);
  }

  return results;
}
