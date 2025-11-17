/*
  # Create Klatrevær Database Schema

  ## Tables Created
  
  ### 1. `crags` Table
  Stores climbing crag location and metadata
  - `id` (uuid, primary key) - Unique identifier for each crag
  - `name` (text, not null) - Name of the climbing crag
  - `latitude` (double precision, not null) - GPS latitude coordinate
  - `longitude` (double precision, not null) - GPS longitude coordinate
  - `aspect` (integer, nullable) - Wall orientation in degrees (0-360, where 0=North, 90=East, 180=South, 270=West)
  - `climbing_types` (text array, not null) - Types of climbing available (e.g., ['sport', 'boulder', 'trad'])
  - `region` (text, not null) - Geographic region or area name
  - `description` (text, nullable) - Additional information about access, routes, etc.
  - `source` (text, default 'manual') - Data source origin (manual, osm, community)
  - `created_at` (timestamptz, default now()) - Record creation timestamp
  
  ### 2. `friction_feedback` Table
  Stores user feedback on perceived friction conditions
  - `id` (uuid, primary key) - Unique identifier for each feedback entry
  - `crag_id` (uuid, foreign key -> crags.id) - Reference to the crag
  - `perceived_quality` (text, not null) - User's friction assessment (perfect, ok, poor)
  - `timestamp` (timestamptz, default now()) - When feedback was submitted
  - `created_at` (timestamptz, default now()) - Record creation timestamp

  ## Security
  
  ### Row Level Security (RLS)
  1. **crags table**:
     - Enable RLS
     - Allow public SELECT access (anyone can view crags)
     - No INSERT/UPDATE/DELETE for public (admin only via direct DB access)
  
  2. **friction_feedback table**:
     - Enable RLS  
     - Allow public SELECT access (view feedback)
     - Allow anonymous INSERT (submit feedback without auth)
     - No UPDATE/DELETE for public (prevent manipulation)

  ## Initial Data
  
  Seeds the database with Utsikten crag in Akershus, Norway
*/

-- Create crags table
CREATE TABLE IF NOT EXISTS crags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  aspect integer CHECK (aspect IS NULL OR (aspect >= 0 AND aspect < 360)),
  climbing_types text[] NOT NULL DEFAULT '{}',
  region text NOT NULL,
  description text,
  source text NOT NULL DEFAULT 'manual',
  created_at timestamptz DEFAULT now()
);

-- Create friction_feedback table
CREATE TABLE IF NOT EXISTS friction_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crag_id uuid NOT NULL REFERENCES crags(id) ON DELETE CASCADE,
  perceived_quality text NOT NULL CHECK (perceived_quality IN ('perfect', 'ok', 'poor')),
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE crags ENABLE ROW LEVEL SECURITY;
ALTER TABLE friction_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crags table
CREATE POLICY "Anyone can view crags"
  ON crags
  FOR SELECT
  USING (true);

-- RLS Policies for friction_feedback table
CREATE POLICY "Anyone can view friction feedback"
  ON friction_feedback
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can submit friction feedback"
  ON friction_feedback
  FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_crags_location ON crags(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_friction_feedback_crag_id ON friction_feedback(crag_id);
CREATE INDEX IF NOT EXISTS idx_friction_feedback_timestamp ON friction_feedback(timestamp DESC);

-- Seed initial data: Utsikten crag
INSERT INTO crags (name, latitude, longitude, aspect, climbing_types, region, description, source)
VALUES (
  'Utsikten',
  60.035226,
  11.048964,
  NULL,
  ARRAY['sport'],
  'Akershus',
  'Sport climbing crag with 20 documented routes. Park 500m north after Hvalsberget crag. Small trail leads directly to the crag.',
  'manual'
)
ON CONFLICT DO NOTHING;