/*
  # Create Crag Change Requests Table

  ## Overview
  This migration creates a system for users to submit requests for changes to existing crag data.
  Change requests are stored for review and can be approved or rejected.

  ## New Tables
  
  ### `crag_change_requests`
  Stores user-submitted requests to modify crag information
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier for each request
  - `crag_id` (uuid, foreign key -> crags.id) - Reference to the crag being modified
  - `requested_changes` (jsonb, not null) - JSON object containing proposed changes with field names as keys
  - `user_comment` (text, nullable) - Optional explanation from the user about why changes are needed
  - `status` (text, not null) - Request status: 'pending', 'approved', 'rejected'
  - `reviewed_at` (timestamptz, nullable) - Timestamp when request was reviewed
  - `created_at` (timestamptz, default now()) - When request was submitted

  ## Security
  
  ### Row Level Security (RLS)
  - Enable RLS on crag_change_requests table
  - Allow public SELECT to view all change requests
  - Allow anonymous INSERT to submit change requests
  - No UPDATE/DELETE for public users (admin only via direct DB access)

  ## Indexes
  - Index on crag_id for efficient lookup of requests per crag
  - Index on status for filtering pending/approved/rejected requests
  - Index on created_at for chronological ordering

  ## Notes
  - requested_changes is stored as JSONB to flexibly accommodate any field updates
  - Example format: {"aspect": 180, "rock_type": "granite", "description": "New description"}
  - Status field uses CHECK constraint to ensure only valid values
*/

-- Create crag_change_requests table
CREATE TABLE IF NOT EXISTS crag_change_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crag_id uuid NOT NULL REFERENCES crags(id) ON DELETE CASCADE,
  requested_changes jsonb NOT NULL,
  user_comment text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE crag_change_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view change requests"
  ON crag_change_requests
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can submit change requests"
  ON crag_change_requests
  FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_change_requests_crag_id ON crag_change_requests(crag_id);
CREATE INDEX IF NOT EXISTS idx_change_requests_status ON crag_change_requests(status);
CREATE INDEX IF NOT EXISTS idx_change_requests_created_at ON crag_change_requests(created_at DESC);