interface SunriseSunsetResponse {
  results: {
    sunrise: string;
    sunset: string;
    solar_noon: string;
    day_length: number;
    civil_twilight_begin: string;
    civil_twilight_end: string;
    nautical_twilight_begin: string;
    nautical_twilight_end: string;
    astronomical_twilight_begin: string;
    astronomical_twilight_end: string;
  };
  status: string;
}

export interface SunriseSunsetData {
  date: string;
  sunrise: string;
  sunset: string;
}

export async function fetchSunriseSunset(
  latitude: number,
  longitude: number,
  date: string
): Promise<SunriseSunsetData> {
  const url = `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&date=${date}&formatted=0`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Sunrise/Sunset API error: ${response.status} ${response.statusText}`);
  }

  const data: SunriseSunsetResponse = await response.json();

  if (data.status !== 'OK') {
    throw new Error(`Sunrise/Sunset API returned status: ${data.status}`);
  }

  return {
    date,
    sunrise: data.results.sunrise,
    sunset: data.results.sunset,
  };
}

export async function fetchMultipleDaysSunriseSunset(
  latitude: number,
  longitude: number,
  dates: string[]
): Promise<Map<string, SunriseSunsetData>> {
  const promises = dates.map(date =>
    fetchSunriseSunset(latitude, longitude, date)
  );

  const results = await Promise.all(promises);

  const map = new Map<string, SunriseSunsetData>();
  results.forEach(result => {
    map.set(result.date, result);
  });

  return map;
}
