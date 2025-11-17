import { config } from 'dotenv';

config();

const ASPECT_CALCULATOR_URL = `${process.env.VITE_SUPABASE_URL}/functions/v1/aspect-calculator`;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

async function calculateAspect(latitude: number, longitude: number) {
  const params = new URLSearchParams({
    lat: latitude.toString(),
    lon: longitude.toString(),
    provider: 'opentopodata',
  });

  const url = `${ASPECT_CALCULATOR_URL}?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.details || errorData.error || `Aspect API error: ${response.status}`);
  }

  return await response.json();
}

async function testDamtjern() {
  const damtjernLat = 59.8041553;
  const damtjernLon = 10.2836618;

  console.log('Testing Damtjern aspect calculation...');
  console.log(`Coordinates: ${damtjernLat}, ${damtjernLon}`);
  console.log('Expected aspect: ~135° (SE)\n');

  try {
    const result = await calculateAspect(damtjernLat, damtjernLon);

    console.log('Result:');
    console.log(`  Aspect: ${result.aspectDeg}° ${result.aspectDir}`);
    console.log(`  Method: ${result.method}`);
    console.log(`  Confidence: ${result.confidence}`);
    console.log(`  Provider: ${result.provider}`);

    const expectedAspect = 135;
    const difference = Math.abs(result.aspectDeg - expectedAspect);
    const minDifference = Math.min(difference, 360 - difference);

    console.log(`\nDifference from expected: ${minDifference}°`);

    if (minDifference <= 30) {
      console.log('✅ SUCCESS: Aspect is within acceptable range!');
    } else {
      console.log('⚠️  WARNING: Aspect differs significantly from expected value');
    }

  } catch (error) {
    console.error('Error calculating aspect:', error);
  }
}

testDamtjern()
  .then(() => {
    console.log('\nTest complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nTest failed:', error);
    process.exit(1);
  });
