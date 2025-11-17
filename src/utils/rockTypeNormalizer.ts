export type NormalizedRockType =
  | 'granitt'
  | 'gneis'
  | 'kalkstein'
  | 'sandstein'
  | 'skifer'
  | 'basalt'
  | 'konglomerat'
  | 'annet'
  | 'ukjent';

export type RockSource = 'NGU' | 'OSM' | 'Manual' | 'Inferred';

export interface RockTypeInfo {
  type: NormalizedRockType;
  source: RockSource;
  confidence: number;
  raw: string;
}

const ROCK_TYPE_MAPPINGS: Record<string, NormalizedRockType> = {
  granitt: 'granitt',
  granite: 'granitt',
  'granitt/granodioritt': 'granitt',
  granodioritt: 'granitt',

  gneis: 'gneis',
  gneiss: 'gneis',
  'gneis/migmatitt': 'gneis',
  migmatitt: 'gneis',

  kalkstein: 'kalkstein',
  limestone: 'kalkstein',
  kalk: 'kalkstein',
  marmor: 'kalkstein',
  marble: 'kalkstein',

  sandstein: 'sandstein',
  sandstone: 'sandstein',
  kvarts: 'sandstein',
  quartz: 'sandstein',
  kvartsitt: 'sandstein',
  quartzite: 'sandstein',

  skifer: 'skifer',
  slate: 'skifer',
  glimmerskifer: 'skifer',
  fylitt: 'skifer',
  phyllite: 'skifer',

  basalt: 'basalt',
  diabas: 'basalt',
  gabbro: 'basalt',
  dolerite: 'basalt',

  konglomerat: 'konglomerat',
  conglomerate: 'konglomerat',
  brekksje: 'konglomerat',
  breccia: 'konglomerat',
};

export function normalizeRockType(rawValue: string): NormalizedRockType {
  const normalized = rawValue.toLowerCase().trim();

  if (ROCK_TYPE_MAPPINGS[normalized]) {
    return ROCK_TYPE_MAPPINGS[normalized];
  }

  for (const [key, value] of Object.entries(ROCK_TYPE_MAPPINGS)) {
    if (normalized.includes(key)) {
      return value;
    }
  }

  return 'ukjent';
}

export function normalizeNGURockType(rawValue: string): RockTypeInfo {
  const type = normalizeRockType(rawValue);
  const confidence = type === 'ukjent' ? 50 : 85;

  return {
    type,
    source: 'NGU',
    confidence,
    raw: rawValue,
  };
}

export function normalizeOSMRockType(rawValue: string, tagName: string): RockTypeInfo {
  const type = normalizeRockType(rawValue);

  let confidence: number;
  if (tagName === 'rock' || tagName === 'rock:type') {
    confidence = type === 'ukjent' ? 60 : 85;
  } else {
    confidence = type === 'ukjent' ? 40 : 60;
  }

  return {
    type,
    source: 'OSM',
    confidence,
    raw: rawValue,
  };
}

export function getRockTypeDisplayName(type: NormalizedRockType): string {
  const displayNames: Record<NormalizedRockType, string> = {
    granitt: 'Granitt',
    gneis: 'Gneis',
    kalkstein: 'Kalkstein',
    sandstein: 'Sandstein',
    skifer: 'Skifer',
    basalt: 'Basalt',
    konglomerat: 'Konglomerat',
    annet: 'Annet',
    ukjent: 'Ukjent',
  };

  return displayNames[type];
}

export function getRockTypeFrictionCharacteristics(type: NormalizedRockType): string {
  const characteristics: Record<NormalizedRockType, string> = {
    granitt: 'Granitt gir best friksjon i kjølige og tørre forhold. Unngå varme dager og høy luftfuktighet.',
    gneis: 'Gneis ligner granitt og foretrekker kjølige, tørre forhold. Godt grep når det er tørt.',
    kalkstein: 'Kalkstein kan bli glatt ved høy luftfuktighet. Best på tørre dager med lav fuktighet.',
    sandstein: 'Sandstein er sårbar rett etter regn. Vent minst 24-48 timer etter nedbør før klatring.',
    skifer: 'Skifer kan være skarp og gir ofte godt grep, men vær obs på løse flak. Unngå våte forhold.',
    basalt: 'Basalt gir stabilt grep i de fleste forhold, men kan bli glatt når det er vått.',
    konglomerat: 'Konglomerat gir varierende friksjon avhengig av sammensetning. Tørre forhold foretrukket.',
    annet: 'Ukjent bergtype. Vurder forholdene nøye og test grepet før klatring.',
    ukjent: 'Bergtype ikke identifisert. Bidra med informasjon hvis du kjenner berggrunnen her.',
  };

  return characteristics[type];
}
