const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

interface OSMElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  geometry?: Array<{
    lat: number;
    lon: number;
  }>;
  tags?: {
    name?: string;
    'sport:climbing'?: string;
    'climbing:sport'?: string;
    'climbing:boulder'?: string;
    'climbing:trad'?: string;
    description?: string;
    'climbing:orientation'?: string;
    [key: string]: string | undefined;
  };
}

interface OSMResponse {
  elements: OSMElement[];
}

export interface OSMCrag {
  name: string;
  latitude: number;
  longitude: number;
  aspect: number | null;
  climbingTypes: string[];
  description: string | null;
  osmId: number;
  osmType: string;
  rockType: string | null;
  rockTagName: string | null;
  geometry: Array<{ lat: number; lon: number }> | null;
}

function parseAspect(orientation: string | undefined): number | null {
  if (!orientation) return null;

  const directionMap: Record<string, number> = {
    'N': 0,
    'NE': 45,
    'E': 90,
    'SE': 135,
    'S': 180,
    'SW': 225,
    'W': 270,
    'NW': 315,
  };

  const upper = orientation.toUpperCase();
  if (directionMap[upper] !== undefined) {
    return directionMap[upper];
  }

  const degrees = parseInt(orientation, 10);
  if (!isNaN(degrees) && degrees >= 0 && degrees < 360) {
    return degrees;
  }

  return null;
}

function isIndoorFacility(tags: OSMElement['tags']): boolean {
  if (!tags) return false;

  if (tags['leisure'] === 'sports_centre') return true;
  if (tags['leisure'] === 'sports_hall') return true;
  if (tags['building'] === 'yes' && tags['sport'] === 'climbing') return true;
  if (tags['indoor'] === 'yes') return true;

  return false;
}

function isClimbingPark(tags: OSMElement['tags']): boolean {
  if (!tags) return false;

  if (tags['sport'] === 'climbing_adventure') return true;
  if (tags['playground'] === 'climbingwall') return true;
  if (tags['attraction'] === 'climbing_wall') return true;
  if (tags['leisure'] === 'climbing_park') return true;

  return false;
}

function extractClimbingTypes(tags: OSMElement['tags']): string[] {
  if (!tags) return [];

  const types: string[] = [];

  if (tags['climbing:sport'] === 'yes' || tags['sport:climbing'] === 'sport') {
    types.push('sport');
  }
  if (tags['climbing:boulder'] === 'yes' || tags['sport:climbing'] === 'boulder') {
    types.push('boulder');
  }
  if (tags['climbing:trad'] === 'yes' || tags['sport:climbing'] === 'trad') {
    types.push('trad');
  }

  if (types.length === 0 && tags['sport'] === 'climbing') {
    types.push('sport');
  }

  return types;
}

function extractRockType(tags: OSMElement['tags']): { rockType: string | null; rockTagName: string | null } {
  if (!tags) return { rockType: null, rockTagName: null };

  if (tags['rock']) {
    return { rockType: tags['rock'], rockTagName: 'rock' };
  }
  if (tags['rock:type']) {
    return { rockType: tags['rock:type'], rockTagName: 'rock:type' };
  }
  if (tags['geology']) {
    return { rockType: tags['geology'], rockTagName: 'geology' };
  }
  if (tags['surface'] && tags['natural'] === 'cliff') {
    return { rockType: tags['surface'], rockTagName: 'surface' };
  }

  return { rockType: null, rockTagName: null };
}

function elementToCrag(element: OSMElement): OSMCrag | null {
  if (!element.tags?.name) return null;

  if (isIndoorFacility(element.tags)) return null;
  if (isClimbingPark(element.tags)) return null;

  let lat: number | undefined;
  let lon: number | undefined;

  if (element.type === 'node') {
    lat = element.lat;
    lon = element.lon;
  } else if (element.center) {
    lat = element.center.lat;
    lon = element.center.lon;
  }

  if (!lat || !lon) return null;

  const climbingTypes = extractClimbingTypes(element.tags);
  if (climbingTypes.length === 0) return null;

  const { rockType, rockTagName } = extractRockType(element.tags);

  const geometry = element.geometry && element.geometry.length >= 2 ? element.geometry : null;

  return {
    name: element.tags.name,
    latitude: lat,
    longitude: lon,
    aspect: parseAspect(element.tags['climbing:orientation']),
    climbingTypes,
    description: element.tags.description || null,
    osmId: element.id,
    osmType: element.type,
    rockType,
    rockTagName,
    geometry,
  };
}

export async function fetchClimbingCragsInBounds(
  south: number,
  west: number,
  north: number,
  east: number
): Promise<OSMCrag[]> {
  const query = `
    [out:json][timeout:25];
    (
      node["sport"="climbing"](${south},${west},${north},${east});
      way["sport"="climbing"](${south},${west},${north},${east});
      relation["sport"="climbing"](${south},${west},${north},${east});
    );
    out center geom;
  `;

  const response = await fetch(OVERPASS_API, {
    method: 'POST',
    body: query,
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
  }

  const data: OSMResponse = await response.json();

  const crags = data.elements
    .map(elementToCrag)
    .filter((crag): crag is OSMCrag => crag !== null);

  return crags;
}

export async function fetchClimbingCragsInNorway(): Promise<OSMCrag[]> {
  const regions = [
    { name: 'Southern Norway', bounds: [57.5, 4.0, 60.0, 12.0] },
    { name: 'Eastern Norway', bounds: [60.0, 8.0, 62.5, 13.0] },
    { name: 'Western Norway', bounds: [59.0, 4.0, 62.5, 8.0] },
    { name: 'Central Norway', bounds: [62.5, 6.0, 65.5, 14.0] },
    { name: 'Northern Norway (South)', bounds: [65.5, 11.0, 68.5, 18.0] },
    { name: 'Northern Norway (North)', bounds: [68.5, 15.0, 71.5, 31.5] },
    { name: 'Bohuslan, Sweden', bounds: [57.8, 11.0, 58.6, 11.9] },
    { name: 'Southern Sweden', bounds: [55.3, 12.5, 58.0, 14.5] },
    { name: 'Stockholm, Sweden', bounds: [58.8, 17.5, 59.8, 18.8] },
  ];

  const allCrags: OSMCrag[] = [];

  for (const region of regions) {
    console.log(`Fetching ${region.name}...`);
    try {
      const [south, west, north, east] = region.bounds;
      const crags = await fetchClimbingCragsInBounds(south, west, north, east);
      console.log(`  Found ${crags.length} crags in ${region.name}`);
      allCrags.push(...crags);

      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`  Error fetching ${region.name}:`, error);
    }
  }

  const uniqueCrags = Array.from(
    new Map(allCrags.map(crag => [`${crag.osmId}-${crag.osmType}`, crag])).values()
  );

  return uniqueCrags;
}

export async function fetchClimbingCragsInSouthernNorway(): Promise<OSMCrag[]> {
  return fetchClimbingCragsInBounds(
    58.0,
    5.0,
    62.0,
    12.0
  );
}

export async function fetchClimbingCragsNearOslo(): Promise<OSMCrag[]> {
  return fetchClimbingCragsInBounds(
    59.5,
    10.0,
    60.5,
    12.0
  );
}
