import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ElevationPoint {
  latitude: number;
  longitude: number;
  elevation: number | null;
}

interface DEMProvider {
  fetchElevationGrid(lat: number, lon: number, gridSize: number): Promise<number[][]>;
}

class OpenTopoDataProvider implements DEMProvider {
  private baseUrl = 'https://api.opentopodata.org/v1/eudem';

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

function calculateAspectFromGrid(grid: number[][]): { aspectDeg: number; aspectDir: string } {
  const gridSize = grid.length;
  if (gridSize !== 3) {
    throw new Error('Grid must be 3x3 for aspect calculation');
  }

  const spacing = 30;

  const dz_dx = (grid[1][2] - grid[1][0]) / (2 * spacing);
  const dz_dy = (grid[0][1] - grid[2][1]) / (2 * spacing);

  if (Math.abs(dz_dx) < 0.0001 && Math.abs(dz_dy) < 0.0001) {
    return { aspectDeg: 0, aspectDir: 'N' };
  }

  let aspectRad = Math.atan2(dz_dy, -dz_dx);
  let aspectDeg = (aspectRad * 180 / Math.PI);

  aspectDeg = (90 - aspectDeg) % 360;
  if (aspectDeg < 0) {
    aspectDeg += 360;
  }

  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(aspectDeg / 45) % 8;
  const aspectDir = directions[index];

  return {
    aspectDeg: Math.round(aspectDeg),
    aspectDir,
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

    const elevationGrid = await demProvider.fetchElevationGrid(latitude, longitude, 3);

    const { aspectDeg, aspectDir } = calculateAspectFromGrid(elevationGrid);

    const result = {
      lat: latitude,
      lon: longitude,
      aspectDeg,
      aspectDir,
      provider,
    };

    return new Response(
      JSON.stringify(result),
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
        error: 'Error calculating terrain aspect',
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