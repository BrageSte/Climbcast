import type { RockTypeInfo, NormalizedRockType } from './rockTypeNormalizer';

interface Region {
  name: string;
  bounds: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
  rockTypes: NormalizedRockType[];
  confidence: number;
}

const SWEDISH_REGIONS: Region[] = [
  {
    name: 'Bohuslan',
    bounds: { minLat: 57.8, maxLat: 58.6, minLon: 11.0, maxLon: 11.9 },
    rockTypes: ['granitt'],
    confidence: 45,
  },
  {
    name: 'Västra Götaland',
    bounds: { minLat: 57.5, maxLat: 59.0, minLon: 11.5, maxLon: 14.0 },
    rockTypes: ['granitt', 'gneis'],
    confidence: 40,
  },
  {
    name: 'Stockholm',
    bounds: { minLat: 58.8, maxLat: 59.8, minLon: 17.5, maxLon: 18.8 },
    rockTypes: ['granitt'],
    confidence: 42,
  },
  {
    name: 'Dalarna',
    bounds: { minLat: 60.3, maxLat: 61.9, minLon: 13.0, maxLon: 16.0 },
    rockTypes: ['granitt', 'gneis'],
    confidence: 38,
  },
  {
    name: 'Jämtland',
    bounds: { minLat: 62.0, maxLat: 64.5, minLon: 12.0, maxLon: 15.5 },
    rockTypes: ['gneis'],
    confidence: 35,
  },
];

const NORWEGIAN_REGIONS: Region[] = [
  {
    name: 'Oslo og Akershus',
    bounds: { minLat: 59.6, maxLat: 60.3, minLon: 10.3, maxLon: 11.5 },
    rockTypes: ['gneis'],
    confidence: 40,
  },
  {
    name: 'Østfold',
    bounds: { minLat: 58.8, maxLat: 59.7, minLon: 10.7, maxLon: 11.8 },
    rockTypes: ['gneis', 'granitt'],
    confidence: 35,
  },
  {
    name: 'Buskerud',
    bounds: { minLat: 59.5, maxLat: 61.0, minLon: 8.0, maxLon: 10.5 },
    rockTypes: ['gneis', 'granitt'],
    confidence: 35,
  },
  {
    name: 'Telemark',
    bounds: { minLat: 58.8, maxLat: 59.9, minLon: 7.8, maxLon: 9.5 },
    rockTypes: ['gneis', 'granitt'],
    confidence: 35,
  },
  {
    name: 'Vestfold',
    bounds: { minLat: 58.9, maxLat: 59.5, minLon: 9.8, maxLon: 10.6 },
    rockTypes: ['gneis'],
    confidence: 35,
  },
  {
    name: 'Aust-Agder',
    bounds: { minLat: 58.2, maxLat: 59.2, minLon: 7.5, maxLon: 9.3 },
    rockTypes: ['gneis', 'granitt'],
    confidence: 35,
  },
  {
    name: 'Vest-Agder (Kristiansand)',
    bounds: { minLat: 58.0, maxLat: 58.8, minLon: 6.8, maxLon: 8.5 },
    rockTypes: ['gneis', 'granitt'],
    confidence: 35,
  },
  {
    name: 'Rogaland (Stavanger)',
    bounds: { minLat: 58.5, maxLat: 59.8, minLon: 5.0, maxLon: 6.8 },
    rockTypes: ['granitt'],
    confidence: 42,
  },
  {
    name: 'Hordaland (Bergen)',
    bounds: { minLat: 59.8, maxLat: 61.0, minLon: 4.8, maxLon: 6.8 },
    rockTypes: ['gneis'],
    confidence: 38,
  },
  {
    name: 'Sogn og Fjordane',
    bounds: { minLat: 60.8, maxLat: 62.0, minLon: 4.8, maxLon: 7.8 },
    rockTypes: ['gneis'],
    confidence: 35,
  },
  {
    name: 'Møre og Romsdal',
    bounds: { minLat: 62.0, maxLat: 63.2, minLon: 5.5, maxLon: 9.0 },
    rockTypes: ['gneis'],
    confidence: 38,
  },
  {
    name: 'Sør-Trøndelag (Trondheim)',
    bounds: { minLat: 62.8, maxLat: 63.8, minLon: 9.0, maxLon: 12.0 },
    rockTypes: ['gneis', 'kalkstein'],
    confidence: 35,
  },
  {
    name: 'Nord-Trøndelag',
    bounds: { minLat: 63.8, maxLat: 65.0, minLon: 10.5, maxLon: 13.5 },
    rockTypes: ['gneis'],
    confidence: 32,
  },
  {
    name: 'Nordland (Bodø)',
    bounds: { minLat: 65.0, maxLat: 67.5, minLon: 11.5, maxLon: 16.0 },
    rockTypes: ['granitt', 'gneis'],
    confidence: 35,
  },
  {
    name: 'Lofoten',
    bounds: { minLat: 67.7, maxLat: 68.5, minLon: 13.0, maxLon: 15.0 },
    rockTypes: ['granitt'],
    confidence: 45,
  },
  {
    name: 'Vesterålen',
    bounds: { minLat: 68.4, maxLat: 69.1, minLon: 14.0, maxLon: 16.5 },
    rockTypes: ['granitt'],
    confidence: 40,
  },
  {
    name: 'Troms (Tromsø)',
    bounds: { minLat: 68.5, maxLat: 70.1, minLon: 16.5, maxLon: 21.0 },
    rockTypes: ['gneis', 'granitt'],
    confidence: 35,
  },
  {
    name: 'Finnmark',
    bounds: { minLat: 69.5, maxLat: 71.2, minLon: 23.0, maxLon: 31.0 },
    rockTypes: ['gneis'],
    confidence: 32,
  },
  {
    name: 'Lyngen',
    bounds: { minLat: 69.3, maxLat: 70.0, minLon: 19.5, maxLon: 21.0 },
    rockTypes: ['gneis'],
    confidence: 38,
  },
  {
    name: 'Sunnmøre',
    bounds: { minLat: 62.0, maxLat: 62.8, minLon: 6.0, maxLon: 7.5 },
    rockTypes: ['gneis'],
    confidence: 38,
  },
  {
    name: 'Nordmøre',
    bounds: { minLat: 62.8, maxLat: 63.5, minLon: 7.5, maxLon: 9.5 },
    rockTypes: ['gneis'],
    confidence: 35,
  },
  {
    name: 'Hardanger',
    bounds: { minLat: 59.8, maxLat: 60.7, minLon: 6.0, maxLon: 7.5 },
    rockTypes: ['gneis', 'granitt'],
    confidence: 38,
  },
  {
    name: 'Setesdal',
    bounds: { minLat: 58.5, maxLat: 59.5, minLon: 7.0, maxLon: 8.5 },
    rockTypes: ['gneis', 'granitt'],
    confidence: 35,
  },
  {
    name: 'Hallingdal',
    bounds: { minLat: 60.3, maxLat: 61.2, minLon: 7.5, maxLon: 9.5 },
    rockTypes: ['gneis'],
    confidence: 35,
  },
  {
    name: 'Valdres',
    bounds: { minLat: 60.7, maxLat: 61.5, minLon: 8.5, maxLon: 10.0 },
    rockTypes: ['gneis'],
    confidence: 35,
  },
  {
    name: 'Gudbrandsdalen',
    bounds: { minLat: 61.2, maxLat: 62.0, minLon: 9.0, maxLon: 10.5 },
    rockTypes: ['gneis'],
    confidence: 35,
  },
  {
    name: 'Dovre/Rondane',
    bounds: { minLat: 61.8, maxLat: 62.3, minLon: 9.0, maxLon: 10.0 },
    rockTypes: ['gneis'],
    confidence: 35,
  },
  {
    name: 'Helgeland',
    bounds: { minLat: 65.5, maxLat: 66.5, minLon: 12.5, maxLon: 14.5 },
    rockTypes: ['granitt', 'gneis'],
    confidence: 35,
  },
  {
    name: 'Salten',
    bounds: { minLat: 66.8, maxLat: 67.8, minLon: 14.0, maxLon: 16.5 },
    rockTypes: ['granitt', 'gneis'],
    confidence: 35,
  },
  {
    name: 'Jotunheimen',
    bounds: { minLat: 61.3, maxLat: 61.8, minLon: 7.8, maxLon: 9.0 },
    rockTypes: ['gneis'],
    confidence: 38,
  },
];

function isInRegion(latitude: number, longitude: number, region: Region): boolean {
  return (
    latitude >= region.bounds.minLat &&
    latitude <= region.bounds.maxLat &&
    longitude >= region.bounds.minLon &&
    longitude <= region.bounds.maxLon
  );
}

export function inferRockTypeFromRegion(
  latitude: number,
  longitude: number
): RockTypeInfo | null {
  const allRegions = [...SWEDISH_REGIONS, ...NORWEGIAN_REGIONS];

  for (const region of allRegions) {
    if (isInRegion(latitude, longitude, region)) {
      return {
        type: region.rockTypes[0],
        source: 'Inferred',
        confidence: region.confidence,
        raw: `Inferred from ${region.name} region`,
      };
    }
  }

  return null;
}

export function isNorwegianCoordinate(latitude: number, longitude: number): boolean {
  return latitude >= 57.5 && latitude <= 71.5 && longitude >= 4.0 && longitude <= 31.5;
}

export function isSwedishCoordinate(latitude: number, longitude: number): boolean {
  return latitude >= 55.0 && latitude <= 69.5 && longitude >= 10.5 && longitude <= 24.5;
}

export function isScandinavianCoordinate(latitude: number, longitude: number): boolean {
  return isNorwegianCoordinate(latitude, longitude) || isSwedishCoordinate(latitude, longitude);
}

export function needsMoreData(confidence: number | null | undefined): boolean {
  if (confidence === null || confidence === undefined) {
    return true;
  }
  return confidence < 30;
}
