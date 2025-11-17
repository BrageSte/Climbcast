import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fetchClimbingCragsInNorway } from '../api/osmOverpass';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function importCrags() {
  console.log('Fetching all climbing crags in Norway from OpenStreetMap...');
  console.log('This may take a minute or two due to the large area covered...\n');

  try {
    const osmCrags = await fetchClimbingCragsInNorway();
    console.log(`Found ${osmCrags.length} climbing crags in Norway from OSM`);

    if (osmCrags.length === 0) {
      console.log('No crags found. Exiting.');
      return;
    }

    console.log('\nSample crags:');
    osmCrags.slice(0, 5).forEach((crag, i) => {
      console.log(`${i + 1}. ${crag.name} (${crag.latitude}, ${crag.longitude}) - Types: ${crag.climbingTypes.join(', ')}`);
    });

    console.log('\nInserting crags into database...');

    const cragsToInsert = osmCrags.map(crag => ({
      name: crag.name,
      latitude: crag.latitude,
      longitude: crag.longitude,
      aspect: crag.aspect,
      climbing_types: crag.climbingTypes,
      region: 'Norway',
      description: crag.description,
      source: 'osm',
      wall_geometry: crag.geometry,
      aspect_calculation_method: crag.aspect ? 'osm_tag' : null,
    }));

    const { error } = await supabase
      .from('crags')
      .upsert(cragsToInsert, {
        onConflict: 'name,latitude,longitude',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error('Error inserting crags:', error);
      throw error;
    }

    console.log(`\nSuccessfully imported ${osmCrags.length} crags!`);

    const { count } = await supabase
      .from('crags')
      .select('*', { count: 'exact', head: true });

    console.log(`Total crags in database: ${count}`);

  } catch (error) {
    console.error('Error during import:', error);
    throw error;
  }
}

importCrags()
  .then(() => {
    console.log('\nImport complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nImport failed:', error);
    process.exit(1);
  });
