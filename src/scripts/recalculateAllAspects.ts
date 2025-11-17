import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ASPECT_CALCULATOR_URL = `${supabaseUrl}/functions/v1/aspect-calculator`;
const BATCH_SIZE = 10;
const DELAY_BETWEEN_BATCHES_MS = 2000;
const REQUEST_TIMEOUT_MS = 20000;

interface AspectResult {
  lat: number;
  lon: number;
  aspectDeg: number;
  aspectDir: string;
  method: string;
  confidence: number;
  provider: string;
}

interface Crag {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  aspect: number | null;
  wall_geometry: Array<{ lat: number; lon: number }> | null;
  aspect_calculation_method: string | null;
}

async function calculateAspect(
  latitude: number,
  longitude: number,
  geometry: Array<{ lat: number; lon: number }> | null
): Promise<AspectResult | null> {
  const params = new URLSearchParams({
    lat: latitude.toString(),
    lon: longitude.toString(),
    provider: 'opentopodata',
  });

  if (geometry && geometry.length >= 2) {
    params.set('geometry', JSON.stringify(geometry));
  }

  const url = `${ASPECT_CALCULATOR_URL}?${params.toString()}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.warn(`  ⚠️  API error: ${errorData.error || errorData.details || response.statusText}`);
      return null;
    }

    const data: AspectResult = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn(`  ⚠️  Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s`);
      } else {
        console.warn(`  ⚠️  Error: ${error.message}`);
      }
    }
    return null;
  }
}

async function processBatch(crags: Crag[]): Promise<{ success: number; failed: number; methods: Record<string, number> }> {
  let successCount = 0;
  let failedCount = 0;
  const methods: Record<string, number> = {};

  for (const crag of crags) {
    const hasGeometry = crag.wall_geometry && crag.wall_geometry.length >= 2;
    const geometryInfo = hasGeometry ? ` [geometry: ${crag.wall_geometry!.length} points]` : '';
    process.stdout.write(`  ${crag.name}${geometryInfo}...`);

    const result = await calculateAspect(crag.latitude, crag.longitude, crag.wall_geometry);

    if (result) {
      const { error } = await supabase
        .from('crags')
        .update({
          aspect: result.aspectDeg,
          aspect_calculation_method: result.method
        })
        .eq('id', crag.id);

      if (error) {
        console.log(` ❌ DB update failed: ${error.message}`);
        failedCount++;
      } else {
        methods[result.method] = (methods[result.method] || 0) + 1;
        const confidenceStr = result.confidence ? ` (conf: ${(result.confidence * 100).toFixed(0)}%)` : '';
        console.log(` ✅ ${result.aspectDeg}° (${result.aspectDir}) [${result.method}]${confidenceStr}`);
        successCount++;
      }
    } else {
      console.log(` ❌ Failed to calculate`);
      failedCount++;
    }
  }

  return { success: successCount, failed: failedCount, methods };
}

async function recalculateAllAspects() {
  console.log('🧭 Recalculating wall aspects for all crags with improved algorithm...\n');
  console.log('Priority: geometry > cliff_detection > terrain\n');

  const { data: crags, error: fetchError } = await supabase
    .from('crags')
    .select('id, name, latitude, longitude, aspect, wall_geometry, aspect_calculation_method')
    .order('name');

  if (fetchError) {
    console.error('❌ Error fetching crags:', fetchError);
    throw fetchError;
  }

  if (!crags || crags.length === 0) {
    console.log('⚠️  No crags found in database.');
    return;
  }

  console.log(`Found ${crags.length} crags to recalculate\n`);

  const cragsWithGeometry = crags.filter(c => c.wall_geometry && c.wall_geometry.length >= 2);
  console.log(`  📍 ${cragsWithGeometry.length} crags have wall geometry data`);
  console.log(`  📍 ${crags.length - cragsWithGeometry.length} crags will use DEM-based calculation\n`);

  const batches: Crag[][] = [];
  for (let i = 0; i < crags.length; i += BATCH_SIZE) {
    batches.push(crags.slice(i, i + BATCH_SIZE));
  }

  let totalSuccess = 0;
  let totalFailed = 0;
  const totalMethods: Record<string, number> = {};

  for (let i = 0; i < batches.length; i++) {
    console.log(`\n📦 Batch ${i + 1}/${batches.length} (${batches[i].length} crags):`);

    const { success, failed, methods } = await processBatch(batches[i]);
    totalSuccess += success;
    totalFailed += failed;

    for (const [method, count] of Object.entries(methods)) {
      totalMethods[method] = (totalMethods[method] || 0) + count;
    }

    if (i < batches.length - 1) {
      console.log(`\n⏳ Waiting ${DELAY_BETWEEN_BATCHES_MS / 1000}s before next batch...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS));
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('📊 Summary:');
  console.log(`   ✅ Successfully calculated: ${totalSuccess}`);
  console.log(`   ❌ Failed: ${totalFailed}`);
  console.log(`   📈 Success rate: ${((totalSuccess / crags.length) * 100).toFixed(1)}%`);
  console.log('\n   Calculation Methods Used:');
  for (const [method, count] of Object.entries(totalMethods).sort((a, b) => b[1] - a[1])) {
    const percentage = ((count / totalSuccess) * 100).toFixed(1);
    console.log(`   ${method.padEnd(20)} ${count.toString().padStart(4)} (${percentage}%)`);
  }
  console.log('='.repeat(70));

  const referenceCregs = [
    { name: 'Kolsås', expected: 225 },
    { name: 'Damtjern', expected: 135 }
  ];

  console.log('\n🔍 Validation - Reference Crags:');
  for (const ref of referenceCregs) {
    const { data: refCrag } = await supabase
      .from('crags')
      .select('name, aspect, aspect_calculation_method')
      .ilike('name', `%${ref.name}%`)
      .limit(1)
      .maybeSingle();

    if (refCrag) {
      const diff = refCrag.aspect ? Math.abs(refCrag.aspect - ref.expected) : null;
      const diffStr = diff !== null ? ` (diff: ${diff}°)` : '';
      const status = diff !== null && diff <= 30 ? '✅' : '⚠️';
      console.log(`   ${status} ${refCrag.name}: ${refCrag.aspect}° (expected ~${ref.expected}°)${diffStr} [${refCrag.aspect_calculation_method || 'unknown'}]`);
    } else {
      console.log(`   ⚠️  ${ref.name}: Not found in database`);
    }
  }
}

recalculateAllAspects()
  .then(() => {
    console.log('\n✨ Aspect recalculation complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
