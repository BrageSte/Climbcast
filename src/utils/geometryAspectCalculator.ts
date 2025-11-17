export interface GeometryPoint {
  lat: number;
  lon: number;
}

export interface AspectCalculationResult {
  aspectDeg: number;
  aspectDir: string;
  method: 'geometry' | 'cliff_detection' | 'terrain';
  confidence: number;
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

export function calculateAspectFromGeometry(
  geometry: GeometryPoint[],
  centerPoint: GeometryPoint
): AspectCalculationResult | null {
  if (!geometry || geometry.length < 2) {
    return null;
  }

  const segments: Array<{ bearing: number; length: number; perpendicular: number }> = [];

  for (let i = 0; i < geometry.length - 1; i++) {
    const point1 = geometry[i];
    const point2 = geometry[i + 1];

    const bearing = calculateBearing(point1, point2);
    const distance = calculateDistance(point1, point2);

    if (distance > 1) {
      const perpendicular1 = normalizeAngle(bearing + 90);
      const perpendicular2 = normalizeAngle(bearing - 90);

      const dist1 = calculateDistance(centerPoint, point1);
      const dist2 = calculateDistance(centerPoint, point2);
      const avgDist = (dist1 + dist2) / 2;

      const toCenter1 = calculateBearing(point1, centerPoint);
      const toCenter2 = calculateBearing(point2, centerPoint);

      const angleDiff1 = Math.abs(normalizeAngle(perpendicular1 - toCenter1));
      const angleDiff2 = Math.abs(normalizeAngle(perpendicular2 - toCenter2));
      const minAngleDiff1 = Math.min(angleDiff1, 360 - angleDiff1);
      const minAngleDiff2 = Math.min(angleDiff2, 360 - angleDiff2);

      const perpendicularAspect = minAngleDiff1 < minAngleDiff2 ? perpendicular1 : perpendicular2;

      segments.push({
        bearing,
        length: distance,
        perpendicular: perpendicularAspect
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
    const radians = toRadians(segment.perpendicular);
    sumX += Math.cos(radians) * weight;
    sumY += Math.sin(radians) * weight;
  }

  const averageBearing = normalizeAngle(toDegrees(Math.atan2(sumY, sumX)));

  const aspectDeg = Math.round(averageBearing);
  const aspectDir = degreesToDirection(aspectDeg);

  const variance = segments.reduce((sum, seg) => {
    const diff = Math.abs(normalizeAngle(seg.perpendicular - averageBearing));
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

export function calculateAspectFromElevationGrid(
  grid: number[][],
  useCliffDetection: boolean = true
): AspectCalculationResult | null {
  const gridSize = grid.length;

  if (gridSize < 3) {
    return null;
  }

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
        const aspectDeg = Math.round(cliffDirection.direction);
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
  let aspectDeg = (90 - toDegrees(aspectRad)) % 360;
  if (aspectDeg < 0) {
    aspectDeg += 360;
  }

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
