const NGU_WMS_BASE = 'https://geo.ngu.no/geoserver/wms';

interface NGUFeatureInfo {
  properties?: {
    HOVEDBERGART?: string;
    hovedbergart?: string;
    Hovedbergart?: string;
    BERGART?: string;
    bergart?: string;
    Bergart?: string;
    [key: string]: string | undefined;
  };
}

interface NGUWMSResponse {
  features?: NGUFeatureInfo[];
}

export async function fetchNGURockType(
  latitude: number,
  longitude: number
): Promise<string | null> {
  const params = new URLSearchParams({
    SERVICE: 'WMS',
    VERSION: '1.1.1',
    REQUEST: 'GetFeatureInfo',
    LAYERS: 'NGU:Bedrock',
    QUERY_LAYERS: 'NGU:Bedrock',
    STYLES: '',
    FORMAT: 'image/png',
    BBOX: `${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}`,
    HEIGHT: '101',
    WIDTH: '101',
    SRS: 'EPSG:4326',
    INFO_FORMAT: 'application/json',
    X: '50',
    Y: '50',
  });

  const url = `${NGU_WMS_BASE}?${params.toString()}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`NGU WMS request failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: NGUWMSResponse = await response.json();

    if (!data.features || data.features.length === 0) {
      return null;
    }

    const feature = data.features[0];
    const props = feature.properties;

    if (!props) {
      return null;
    }

    const rockType =
      props.HOVEDBERGART ||
      props.hovedbergart ||
      props.Hovedbergart ||
      props.BERGART ||
      props.bergart ||
      props.Bergart;

    return rockType || null;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('NGU WMS request timed out');
    } else {
      console.error('Error fetching NGU rock type:', error);
    }
    return null;
  }
}
