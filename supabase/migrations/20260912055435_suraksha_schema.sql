/*
# SURAKSHA AI - Core Schema

## Overview
Creates the full database schema for the SURAKSHA AI hyper-local disaster intelligence platform.
Covers grid cells, weather records, predictions, risk zones, infrastructure, population exposure,
alerts, historical events, model metrics, and user profiles with role-based access.

## New Tables
1. profiles - User profile data linked to Supabase auth, with role (CITIZEN/AUTHORITY/ADMIN)
2. grid_cells - Geographic grid cells covering Mangaluru area with terrain attributes
3. weather_records - Time-series weather observations per grid cell
4. predictions - Forecasted weather and risk metrics per grid cell with time horizon
5. risk_zones - Computed composite risk scores with severity levels and sub-scores
6. infrastructure - Critical infrastructure points (hospitals, schools, police, etc.)
7. population_exposure - Population demographics per grid cell
8. alerts - Early warning alert messages with audience targeting and language
9. historical_events - Past disaster events for comparison and analytics
10. model_results - ML model evaluation metrics (MAE, RMSE, R2, precision, recall, F1)

## Security
- RLS enabled on all tables
- profiles: owner-scoped CRUD (authenticated users manage their own profile)
- All other tables: public read (anon + authenticated) since this is a demo disaster intelligence platform
  where data is intentionally shared with all citizens and authorities
- Write operations (INSERT/UPDATE/DELETE) restricted to authenticated users for operational tables
*/

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============ PROFILES ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'CITIZEN' CHECK (role IN ('CITIZEN', 'AUTHORITY', 'ADMIN')),
  home_lat double precision,
  home_lng double precision,
  preferred_language text NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'kn', 'hi')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============ GRID CELLS ============
CREATE TABLE IF NOT EXISTS grid_cells (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cell_code text UNIQUE NOT NULL,
  label text NOT NULL DEFAULT '',
  center_lat double precision NOT NULL,
  center_lng double precision NOT NULL,
  min_lat double precision NOT NULL,
  max_lat double precision NOT NULL,
  min_lng double precision NOT NULL,
  max_lng double precision NOT NULL,
  elevation_m double precision DEFAULT 0,
  drainage_score double precision DEFAULT 0 CHECK (drainage_score >= 0 AND drainage_score <= 1),
  historical_flood_flag boolean DEFAULT false,
  near_coast boolean DEFAULT false,
  urban_density double precision DEFAULT 0.5 CHECK (urban_density >= 0 AND urban_density <= 1),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE grid_cells ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gc_select" ON grid_cells;
CREATE POLICY "gc_select" ON grid_cells FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "gc_insert" ON grid_cells;
CREATE POLICY "gc_insert" ON grid_cells FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "gc_update" ON grid_cells;
CREATE POLICY "gc_update" ON grid_cells FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ============ WEATHER RECORDS ============
CREATE TABLE IF NOT EXISTS weather_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grid_cell_id uuid NOT NULL REFERENCES grid_cells(id) ON DELETE CASCADE,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  rainfall_mm double precision DEFAULT 0,
  temperature_c double precision DEFAULT 28,
  humidity_pct double precision DEFAULT 75,
  wind_speed_kmph double precision DEFAULT 10,
  pressure_hpa double precision DEFAULT 1010,
  source text DEFAULT 'SIMULATED',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE weather_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wr_select" ON weather_records;
CREATE POLICY "wr_select" ON weather_records FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "wr_insert" ON weather_records;
CREATE POLICY "wr_insert" ON weather_records FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "wr_update" ON weather_records;
CREATE POLICY "wr_update" ON weather_records FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_weather_cell_time ON weather_records(grid_cell_id, recorded_at DESC);

-- ============ PREDICTIONS ============
CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grid_cell_id uuid NOT NULL REFERENCES grid_cells(id) ON DELETE CASCADE,
  predicted_at timestamptz NOT NULL DEFAULT now(),
  horizon_minutes integer NOT NULL DEFAULT 60,
  rainfall_forecast_mm double precision DEFAULT 0,
  flood_probability double precision DEFAULT 0 CHECK (flood_probability >= 0 AND flood_probability <= 1),
  lightning_probability double precision DEFAULT 0 CHECK (lightning_probability >= 0 AND lightning_probability <= 1),
  wind_forecast_kmph double precision DEFAULT 10,
  confidence_score double precision DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pred_select" ON predictions;
CREATE POLICY "pred_select" ON predictions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "pred_insert" ON predictions;
CREATE POLICY "pred_insert" ON predictions FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "pred_update" ON predictions;
CREATE POLICY "pred_update" ON predictions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_pred_cell_horizon ON predictions(grid_cell_id, horizon_minutes);

-- ============ RISK ZONES ============
CREATE TABLE IF NOT EXISTS risk_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grid_cell_id uuid NOT NULL REFERENCES grid_cells(id) ON DELETE CASCADE,
  risk_score double precision NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  severity_level text NOT NULL DEFAULT 'SAFE' CHECK (severity_level IN ('SAFE', 'MODERATE', 'HIGH', 'CRITICAL')),
  rain_score double precision DEFAULT 0,
  flood_score double precision DEFAULT 0,
  lightning_score double precision DEFAULT 0,
  wind_score double precision DEFAULT 0,
  population_score double precision DEFAULT 0,
  vulnerability_score double precision DEFAULT 0,
  explanation jsonb DEFAULT '[]'::jsonb,
  computed_at timestamptz DEFAULT now()
);

ALTER TABLE risk_zones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rz_select" ON risk_zones;
CREATE POLICY "rz_select" ON risk_zones FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "rz_insert" ON risk_zones;
CREATE POLICY "rz_insert" ON risk_zones FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "rz_update" ON risk_zones;
CREATE POLICY "rz_update" ON risk_zones FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "rz_delete" ON risk_zones;
CREATE POLICY "rz_delete" ON risk_zones FOR DELETE TO authenticated USING (true);

-- ============ INFRASTRUCTURE ============
CREATE TABLE IF NOT EXISTS infrastructure (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('hospital','school','police','fire_station','shelter','bridge','road','railway','airport','power')),
  name text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  grid_cell_id uuid REFERENCES grid_cells(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE infrastructure ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inf_select" ON infrastructure;
CREATE POLICY "inf_select" ON infrastructure FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "inf_insert" ON infrastructure;
CREATE POLICY "inf_insert" ON infrastructure FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "inf_update" ON infrastructure;
CREATE POLICY "inf_update" ON infrastructure FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ============ POPULATION EXPOSURE ============
CREATE TABLE IF NOT EXISTS population_exposure (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grid_cell_id uuid NOT NULL REFERENCES grid_cells(id) ON DELETE CASCADE,
  total_population integer DEFAULT 0,
  children integer DEFAULT 0,
  elderly integer DEFAULT 0,
  estimated_at timestamptz DEFAULT now()
);

ALTER TABLE population_exposure ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pe_select" ON population_exposure;
CREATE POLICY "pe_select" ON population_exposure FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "pe_insert" ON population_exposure;
CREATE POLICY "pe_insert" ON population_exposure FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "pe_update" ON population_exposure;
CREATE POLICY "pe_update" ON population_exposure FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ============ ALERTS ============
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grid_cell_id uuid REFERENCES grid_cells(id) ON DELETE SET NULL,
  audience_role text NOT NULL DEFAULT 'CITIZEN' CHECK (audience_role IN ('CITIZEN', 'FARMER', 'SCHOOL_ADMIN', 'AUTHORITY', 'ALL')),
  severity text NOT NULL DEFAULT 'MODERATE' CHECK (severity IN ('SAFE', 'MODERATE', 'HIGH', 'CRITICAL')),
  message text NOT NULL,
  language text NOT NULL DEFAULT 'en',
  sent_at timestamptz DEFAULT now()
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "al_select" ON alerts;
CREATE POLICY "al_select" ON alerts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "al_insert" ON alerts;
CREATE POLICY "al_insert" ON alerts FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "al_delete" ON alerts;
CREATE POLICY "al_delete" ON alerts FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_alerts_sent_at ON alerts(sent_at DESC);

-- ============ HISTORICAL EVENTS ============
CREATE TABLE IF NOT EXISTS historical_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN ('flood','lightning','landslide','cyclone','heavy_rain','thunderstorm')),
  event_date date NOT NULL,
  affected_grid_cells integer DEFAULT 0,
  severity text NOT NULL DEFAULT 'MODERATE' CHECK (severity IN ('SAFE', 'MODERATE', 'HIGH', 'CRITICAL')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE historical_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "he_select" ON historical_events;
CREATE POLICY "he_select" ON historical_events FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "he_insert" ON historical_events;
CREATE POLICY "he_insert" ON historical_events FOR INSERT TO authenticated WITH CHECK (true);

-- ============ MODEL RESULTS ============
CREATE TABLE IF NOT EXISTS model_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name text NOT NULL,
  metric_name text NOT NULL,
  metric_value double precision NOT NULL,
  evaluated_at timestamptz DEFAULT now()
);

ALTER TABLE model_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mr_select" ON model_results;
CREATE POLICY "mr_select" ON model_results FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "mr_insert" ON model_results;
CREATE POLICY "mr_insert" ON model_results FOR INSERT TO authenticated WITH CHECK (true);
