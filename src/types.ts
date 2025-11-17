export interface Crag {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  aspect: number | null;
  climbing_types: string[];
  region: string;
  description: string | null;
  source: string;
  rock_type: string | null;
  rock_source: string | null;
  rock_confidence: number | null;
  rock_raw: string | null;
  wall_geometry: Array<{ lat: number; lon: number }> | null;
  aspect_calculation_method: 'osm_tag' | 'geometry' | 'cliff_detection' | 'terrain' | null;
  created_at: string;
}

export interface FrictionFeedback {
  id: string;
  crag_id: string;
  perceived_quality: 'perfect' | 'ok' | 'poor';
  timestamp: string;
  created_at: string;
}

export interface HourPoint {
  time: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  cloudCover: number;
  precipitation: number;
}

export interface FrictionScore {
  score: number;
  label: 'Perfect' | 'OK' | 'Poor';
  reasons: string[];
  hasAspectData: boolean;
}

export interface BestWindow {
  startHour: number;
  endHour: number;
  avgScore: number;
}

export interface DayAggregate {
  date: string;
  rating: 'Perfect' | 'OK' | 'Poor';
  bestWindow: BestWindow | null;
  heatbar: Array<{ hour: number; quality: 'perfect' | 'ok' | 'poor'; isDaylight: boolean }>;
  minTemp: number;
  maxTemp: number;
  totalPrecipitation: number;
  sunrise: string | null;
  sunset: string | null;
}

export interface METTimeseries {
  time: string;
  data: {
    instant: {
      details: {
        air_temperature: number;
        relative_humidity: number;
        wind_from_direction: number;
        wind_speed: number;
        cloud_area_fraction: number;
      };
    };
    next_1_hours?: {
      summary: {
        symbol_code: string;
      };
      details: {
        precipitation_amount: number;
      };
    };
  };
}

export interface METResponse {
  properties: {
    timeseries: METTimeseries[];
  };
}
