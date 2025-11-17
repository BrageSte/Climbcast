# Supabase Setup Guide

This guide will walk you through setting up the Supabase database for Klatrevaer.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js and npm installed locally

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in the project details:
   - **Name**: klatrevaer (or your preferred name)
   - **Database Password**: Choose a strong password (save this securely)
   - **Region**: Choose the region closest to your users (Europe West for Norway)
4. Click "Create new project"
5. Wait for the project to finish provisioning (1-2 minutes)

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")
3. Add these to your `.env` file:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 3: Run Database Migrations

The project includes all necessary migrations in `supabase/migrations/`. You need to run these to set up your database schema.

### Option A: Using Supabase Dashboard (Recommended)

1. Go to **SQL Editor** in your Supabase dashboard
2. Run each migration file in order (sorted by timestamp):

   1. `20251104105934_create_crags_and_feedback_tables.sql`
   2. `20251104110943_add_unique_constraint_for_osm_imports.sql`
   3. `20251104111104_allow_anonymous_crag_inserts.sql`
   4. `20251104114326_add_rock_type_fields_to_crags.sql`
   5. `20251104130915_allow_upsert_crags.sql`
   6. `20251105105347_create_user_favorites_table.sql`
   7. `20251105105958_create_user_favorites_table.sql` (if different from previous)
   8. `20251113180915_create_crag_change_requests_table.sql`
   9. `20251113222048_create_automatic_aspect_calculation_trigger.sql`
   10. `20251113222106_update_aspect_calculation_approach.sql`
   11. `20251113223001_cleanup_unused_indexes_and_fix_security.sql`

3. Copy and paste the contents of each file into the SQL Editor
4. Click "Run" for each migration
5. Verify no errors occurred

### Option B: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase link --project-ref your-project-ref
supabase db push
```

## Step 4: Verify Database Schema

After running migrations, verify the following tables exist:

1. **crags** - Stores climbing crag locations and metadata
   - Columns: id, name, latitude, longitude, aspect, climbing_types, region, description, source, rock_type, rock_type_raw, rock_type_source, osm_id, created_at

2. **user_favorites** - Stores user favorite crags
   - Columns: id, user_id, crag_id, created_at

3. **user_feedback** - Stores user friction feedback
   - Columns: id, crag_id, perceived_quality, timestamp, created_at

4. **crag_change_requests** - Stores suggested changes to crags
   - Columns: id, crag_id, field_name, old_value, new_value, reason, status, created_at, updated_at

You can verify this in the **Table Editor** section of your Supabase dashboard.

## Step 5: Deploy Edge Functions

The project uses two Supabase Edge Functions:

### 1. Aspect Calculator

This function calculates wall orientations for crags.

### 2. Weather Proxy

This function proxies weather data requests to comply with API rate limits.

**Note**: Edge Functions deployment requires the Supabase CLI or can be done through the dashboard. If you're not using Edge Functions immediately, you can skip this step.

To deploy using the Supabase CLI:

```bash
supabase functions deploy aspect-calculator
supabase functions deploy weather-proxy
```

## Step 6: Import Initial Data (Optional)

### Import Crags from OpenStreetMap

The project includes a script to import climbing crags from OpenStreetMap:

```bash
npm run import-osm
```

This will populate your database with climbing locations from OpenStreetMap's database.

### Calculate Wall Aspects

After importing crags, calculate their wall orientations:

```bash
npm run calculate-aspects
```

This script analyzes the geometry of each crag to determine optimal climbing times.

## Database Schema Overview

### Tables

#### crags
Stores all climbing locations with geographical and geological data.

**Key Fields**:
- `aspect`: Wall orientation in degrees (0=North, 90=East, 180=South, 270=West)
- `rock_type`: Normalized rock type (granite, limestone, gneiss, etc.)
- `rock_type_raw`: Original rock type from geological survey
- `climbing_types`: Array of climbing styles available

#### user_favorites
Tracks which crags users have favorited (requires authentication).

#### user_feedback
Collects user reports on friction conditions at crags.

#### crag_change_requests
Stores community-submitted corrections and additions to crag data.

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- **crags**: Public read access, restricted write access
- **user_favorites**: Users can only manage their own favorites
- **user_feedback**: Public read, anonymous insert allowed
- **crag_change_requests**: Public read, anonymous insert allowed

### Indexes

Performance indexes are automatically created on:
- Crag locations (latitude, longitude)
- Foreign key relationships
- Timestamp fields for efficient sorting

## Troubleshooting

### "Missing Supabase environment variables" Error

Make sure your `.env` file exists and contains valid values:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### Migration Errors

- Ensure you run migrations in order (sorted by timestamp)
- Check for any existing tables that might conflict
- Review error messages in the SQL Editor

### RLS Policy Issues

If you can't access data:
- Verify RLS policies are created correctly
- Check that anonymous access is allowed where needed
- Review policy definitions in migration files

### Connection Issues

- Verify your Supabase URL and anon key are correct
- Check that your Supabase project is not paused (free tier pauses after inactivity)
- Ensure your network allows connections to Supabase

## Security Notes

- **Never commit your `.env` file** - it contains sensitive credentials
- The anon key is safe to use in client-side code (it's rate-limited and restricted by RLS)
- For admin operations, use the service role key (not included in this setup)
- RLS policies protect your data even with the anon key exposed

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase SQL Reference](https://supabase.com/docs/guides/database/tables)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Edge Functions Documentation](https://supabase.com/docs/guides/functions)
