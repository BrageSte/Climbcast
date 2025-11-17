import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GeometryPoint {
  lat: number;
  lon: number;
}

interface DEMProvider {
  fetchElevationGrid(lat: number, lon: number, gridSize: number): Promise<number[][]>;
}

class OpenTopoDataProvider implements DEMProvider {
  private baseUrl = 'https://api.opentopodata.org/v1/aster30m';

  async fetchElevationGrid(lat: number, lon: number, gridSize: number): Promise<number[][]> {
    const spacing = 0.00027;
    const offset = spacing * Math.floor(gridSize / 2);

    const locations: string[] = [];
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const lat_i = lat + offset - (i * spacing);
        const lon_j = lon - offset + (j * spacing);
        locations.push(`${lat_i.toFixed(6)},${lon_j.toFixed(6)}`);
      }
    }

    const url = `${this.baseUrl}?locations=${locations.join('|')}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Klatrevaer/1.0 (Norwegian climbing weather app)',
      },
    });

    if (!response.ok) {
      throw new Error(`OpenTopoData API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' || !data.results) {
      throw new Error(`OpenTopoData returned error status: ${data.status}`);
    }

    const grid: number[][] = [];
    let idx = 0;

    for (let i = 0; i < gridSize; i++) {
      const row: number[] = [];
      for (let j = 0; j < gridSize; j++) {
        const result = data.results[idx];
        const elevation = result?.elevation;

        if (elevation === null || elevation === undefined) {
          throw new Error(`Missing elevation data at grid position [${i},${j}]`);
        }

        row.push(elevation);
        idx++;
      }
      grid.push(row);
    }

    return grid;
  }
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

function normalizeAngle(angle: number): number {
  let normalized = angle % 360;
  if (normalized < 0) normalized += 360;
  return normalized;
}

function calculateBearing(point1: GeometryPoint, point2: GeometryPoint): number {
  const lat1 = toRadians(point1.lat);
  const lat2 = toRadians(point2.lat);
  const dLon = toRadians(point2.lon - point1.lon);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  const bearing = toDegrees(Math.atan2(y, x));
  return normalizeAngle(bearing);
}

function calculateDistance(point1: GeometryPoint, point2: GeometryPoint): number {
  const R = 6371000;
  const lat1 = toRadians(point1.lat);
  const lat2 = toRadians(point2.lat);
  const dLat = toRadians(point2.lat - point1.lat);
  const dLon = toRadians(point2.lon - point1.lon);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function degreesToDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

function calculateAspectFromGeometry(
  geometry: GeometryPoint[],
  centerPoint: GeometryPoint
): { aspectDeg: number; aspectDir: string; method: string; confidence: number } | null {
  if (!geometry || geometry.length < 2) {
    return null;
  }

  const segments: Array<{ bearing: number; length: number; faceAspect: number }> = [];

  for (let i = 0; i < geometry.length - 1; i++) {
    const point1 = geometry[i];
    const point2 = geometry[i + 1];

    const bearing = calculateBearing(point1, point2);
    const distance = calculateDistance(point1, point2);

    if (distance > 1) {
      const perpRight = normalizeAngle(bearing + 90);
      const perpLeft = normalizeAngle(bearing - 90);

      const midpoint = {
        lat: (point1.lat + point2.lat) / 2,
        lon: (point1.lon + point2.lon) / 2
      };

      const bearingToCenter = calculateBearing(midpoint, centerPoint);

      const diffRight = Math.abs(normalizeAngle(perpRight - bearingToCenter));
      const diffLeft = Math.abs(normalizeAngle(perpLeft - bearingToCenter));
      const minDiffRight = Math.min(diffRight, 360 - diffRight);
      const minDiffLeft = Math.min(diffLeft, 360 - diffLeft);

      const faceAspect = minDiffRight < minDiffLeft ? perpRight : perpLeft;

      segments.push({
        bearing,
        length: distance,
        faceAspect
      });
    }
  }

  if (segments.length === 0) {
    return null;
  }

  const totalLength = segments.reduce((sum, seg) => sum + seg.length, 0);

  let sumX = 0;
  let sumY = 0;

  for (const segment of segments) {
    const weight = segment.length / totalLength;
    const radians = toRadians(segment.faceAspect);
    sumX += Math.cos(radians) * weight;
    sumY += Math.sin(radians) * weight;
  }

  const averageFaceAspect = normalizeAngle(toDegrees(Math.atan2(sumY, sumX)));

  const aspectDeg = Math.round(averageFaceAspect);
  const aspectDir = degreesToDirection(aspectDeg);

  const variance = segments.reduce((sum, seg) => {
    const diff = Math.abs(normalizeAngle(seg.faceAspect - averageFaceAspect));
    const minDiff = Math.min(diff, 360 - diff);
    return sum + minDiff;
  }, 0) / segments.length;

  const confidence = Math.max(0, Math.min(1, 1 - (variance / 90)));

  return {
    aspectDeg,
    aspectDir,
    method: 'geometry',
    confidence: Math.round(confidence * 100) / 100
  };
}

function calculateAspectFromElevationGrid(
  grid: number[][],
  useCliffDetection: boolean = true
): { aspectDeg: number; aspectDir: string; method: string; confidence: number } {
  const gridSize = grid.length;
  const centerIdx = Math.floor(gridSize / 2);
  const spacing = 30;

  if (useCliffDetection && gridSize >= 5) {
    const elevationDiffs: Array<{ direction: number; drop: number }> = [];

    for (let direction = 0; direction < 360; direction += 45) {
      const radians = toRadians(direction);
      const dx = Math.round(Math.sin(radians) * 2);
      const dy = Math.round(-Math.cos(radians) * 2);

      const targetX = centerIdx + dx;
      const targetY = centerIdx + dy;

      if (targetX >= 0 && targetX < gridSize && targetY >= 0 && targetY < gridSize) {
        const elevationDrop = grid[centerIdx][centerIdx] - grid[targetY][targetX];
        elevationDiffs.push({ direction, drop: elevationDrop });
      }
    }

    const maxDrop = Math.max(...elevationDiffs.map(d => d.drop));
    const minDrop = Math.min(...elevationDiffs.map(d => d.drop));

    if (maxDrop > 20 && (maxDrop - minDrop) > 15) {
      const cliffDirection = elevationDiffs.find(d => d.drop === maxDrop);

      if (cliffDirection) {
        const wallFaceDirection = normalizeAngle(cliffDirection.direction + 180);
        const aspectDeg = Math.round(wallFaceDirection);
        const aspectDir = degreesToDirection(aspectDeg);
        const confidence = Math.min(1, maxDrop / 50);

        return {
          aspectDeg,
          aspectDir,
          method: 'cliff_detection',
          confidence: Math.round(confidence * 100) / 100
        };
      }
    }
  }

  const dz_dx = (grid[centerIdx][centerIdx + 1] - grid[centerIdx][centerIdx - 1]) / (2 * spacing);
  const dz_dy = (grid[centerIdx - 1][centerIdx] - grid[centerIdx + 1][centerIdx]) / (2 * spacing);

  if (Math.abs(dz_dx) < 0.0001 && Math.abs(dz_dy) < 0.0001) {
    return {
      aspectDeg: 0,
      aspectDir: 'N',
      method: 'terrain',
      confidence: 0.1
    };
  }

  let aspectRad = Math.atan2(dz_dy, -dz_dx);
  let slopeDirection = (90 - toDegrees(aspectRad)) % 360;
  if (slopeDirection < 0) {
    slopeDirection += 360;
  }

  const aspectDeg = (slopeDirection + 90) % 360;
  const aspectDir = degreesToDirection(aspectDeg);
  const gradient = Math.sqrt(dz_dx * dz_dx + dz_dy * dz_dy);
  const confidence = Math.min(1, gradient * 2);

  return {
    aspectDeg: Math.round(aspectDeg),
    aspectDir,
    method: 'terrain',
    confidence: Math.round(confidence * 100) / 100
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const lat = url.searchParams.get('lat');
    const lon = url.searchParams.get('lon');
    const geometryParam = url.searchParams.get('geometry');
    const provider = url.searchParams.get('provider') || 'opentopodata';

    if (!lat || !lon) {
      return new Response(
        JSON.stringify({ error: 'Missing latitude or longitude parameters' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return new Response(
        JSON.stringify({ error: 'Invalid latitude or longitude values' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return new Response(
        JSON.stringify({ error: 'Latitude must be between -90 and 90, longitude between -180 and 180' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    let geometry: GeometryPoint[] | null = null;
    if (geometryParam) {
      try {
        geometry = JSON.parse(geometryParam);
      } catch {
        console.warn('Failed to parse geometry parameter');
      }
    }

    if (geometry && geometry.length >= 2) {
      const geometryResult = calculateAspectFromGeometry(geometry, { lat: latitude, lon: longitude });

      if (geometryResult && geometryResult.confidence > 0.3) {
        return new Response(
          JSON.stringify({
            lat: latitude,
            lon: longitude,
            aspectDeg: geometryResult.aspectDeg,
            aspectDir: geometryResult.aspectDir,
            method: geometryResult.method,
            confidence: geometryResult.confidence,
            provider: 'geometry'
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }

    let demProvider: DEMProvider;

    if (provider === 'opentopodata') {
      demProvider = new OpenTopoDataProvider();
    } else {
      return new Response(
        JSON.stringify({ error: `Unknown provider: ${provider}. Supported providers: opentopodata` }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const elevationGrid = await demProvider.fetchElevationGrid(latitude, longitude, 7);

    const result = calculateAspectFromElevationGrid(elevationGrid, true);

    return new Response(
      JSON.stringify({
        lat: latitude,
        lon: longitude,
        aspectDeg: result.aspectDeg,
        aspectDir: result.aspectDir,
        method: result.method,
        confidence: result.confidence,
        provider
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Aspect calculator error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = errorMessage.includes('API error') ? 502 : 500;

    return new Response(
      JSON.stringify({
        error: 'Error calculating wall aspect',
        details: errorMessage
      }),
      {
        status: statusCode,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});