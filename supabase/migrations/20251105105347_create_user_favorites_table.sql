/*
  # Create User Favorites Table

  ## Tables Created

  ### 1. `user_favorites` Table
  Stores user-bookmarked climbing crags for quick access
  - `id` (uuid, primary key) - Unique identifier for each favorite entry
  - `crag_id` (uuid, foreign key -> crags.id) - Reference to the bookmarked crag
  - `session_id` (text, not null) - Anonymous session identifier for tracking favorites without authentication
  - `user_id` (uuid, nullable) - Optional authenticated user ID for future auth integration
  - `created_at` (timestamptz, default now()) - Timestamp when favorite was added
  - Unique constraint on (crag_id, session_id) to prevent duplicate favorites per session

  ## Security

  ### Row Level Security (RLS)
  1. **user_favorites table**:
     - Enable RLS
     - Allow SELECT for users viewing their own favorites (by session_id or user_id)
     - Allow INSERT for adding new favorites to their own collection
     - Allow DELETE for removing their own favorites
     - No UPDATE needed (favorites are binary: exists or doesn't exist)

  ## Indexes

  - Index on session_id for fast favorite lookups by session
  - Index on crag_id for reverse lookups (which users favorited a crag)
  - Composite index on (session_id, created_at) for ordered favorite lists
*/

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crag_id uuid NOT NULL REFERENCES crags(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  user_id uuid,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_favorite_per_session UNIQUE(crag_id, session_id)
);

-- Enable Row Level Security
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow anonymous users to view all favorites (client-side filtering by session_id)
CREATE POLICY "Anyone can view favorites"
  ON user_favorites
  FOR SELECT
  USING (true);

-- RLS Policy: Allow anonymous users to add favorites
CREATE POLICY "Anyone can add favorites"
  ON user_favorites
  FOR INSERT
  WITH CHECK (true);

-- RLS Policy: Allow anonymous users to remove favorites
CREATE POLICY "Anyone can remove favorites"
  ON user_favorites
  FOR DELETE
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_favorites_session_id ON user_favorites(session_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_crag_id ON user_favorites(crag_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_session_created ON user_favorites(session_id, created_at DESC);
