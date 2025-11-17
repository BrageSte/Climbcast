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
const REQUEST_TIMEOUT_MS = 15000;

interface AspectResult {
  lat: number;
  lon: number;
  aspectDeg: number;
  aspectDir: string;
  provider: string;
}

interface Crag {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  aspect: number | null;
}

async function calculateAspect(
  latitude: number,
  longitude: number
): Promise<AspectResult | null> {
  const params = new URLSearchParams({
    lat: latitude.toString(),
    lon: longitude.toString(),
    provider: 'opentopodata',
  });

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

async function processBatch(crags: Crag[]): Promise<{ success: number; failed: number }> {
  let successCount = 0;
  let failedCount = 0;

  for (const crag of crags) {
    process.stdout.write(`  Processing: ${crag.name} (${crag.latitude.toFixed(4)}, ${crag.longitude.toFixed(4)})...`);

    const result = await calculateAspect(crag.latitude, crag.longitude);

    if (result) {
      const { error } = await supabase
        .from('crags')
        .update({ aspect: result.aspectDeg })
        .eq('id', crag.id);

      if (error) {
        console.log(` ❌ DB update failed: ${error.message}`);
        failedCount++;
      } else {
        console.log(` ✅ ${result.aspectDeg}° (${result.aspectDir})`);
        successCount++;
      }
    } else {
      console.log(` ❌ Failed to calculate`);
      failedCount++;
    }
  }

  return { success: successCount, failed: failedCount };
}

async function calculateMissingAspects() {
  console.log('🧭 Calculating missing terrain aspects for crags...\n');

  const { data: crags, error: fetchError } = await supabase
    .from('crags')
    .select('id, name, latitude, longitude, aspect')
    .is('aspect', null)
    .order('name');

  if (fetchError) {
    console.error('❌ Error fetching crags:', fetchError);
    throw fetchError;
  }

  if (!crags || crags.length === 0) {
    console.log('✅ All crags already have aspect data. Nothing to do!');
    return;
  }

  console.log(`Found ${crags.length} crags without aspect data\n`);

  const batches: Crag[][] = [];
  for (let i = 0; i < crags.length; i += BATCH_SIZE) {
    batches.push(crags.slice(i, i + BATCH_SIZE));
  }

  let totalSuccess = 0;
  let totalFailed = 0;

  for (let i = 0; i < batches.length; i++) {
    console.log(`\n📦 Batch ${i + 1}/${batches.length} (${batches[i].length} crags):`);

    const { success, failed } = await processBatch(batches[i]);
    totalSuccess += success;
    totalFailed += failed;

    if (i < batches.length - 1) {
      console.log(`\n⏳ Waiting ${DELAY_BETWEEN_BATCHES_MS / 1000}s before next batch...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`   ✅ Successfully calculated: ${totalSuccess}`);
  console.log(`   ❌ Failed: ${totalFailed}`);
  console.log(`   📈 Success rate: ${((totalSuccess / crags.length) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));

  const { count: remainingCount } = await supabase
    .from('crags')
    .select('*', { count: 'exact', head: true })
    .is('aspect', null);

  console.log(`\n🔍 Crags still missing aspect data: ${remainingCount || 0}`);
}

calculateMissingAspects()
  .then(() => {
    console.log('\n✨ Aspect calculation complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
