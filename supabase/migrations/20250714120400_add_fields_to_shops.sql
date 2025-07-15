-- supabase/migrations/20250714120400_add_fields_to_shops.sql

ALTER TABLE public.shops
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS contact_info TEXT;
