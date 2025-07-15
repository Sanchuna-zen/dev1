-- supabase/migrations/20250714120700_enable_postgis_and_add_shop_location.sql

-- 1. Enable the PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- 2. Add a location column to the shops table
ALTER TABLE public.shops
ADD COLUMN IF NOT EXISTS location extensions.geography(Point, 4326);
