-- supabase/migrations/20250714120500_add_onboarding_status_to_profiles.sql

CREATE TYPE onboarding_step AS ENUM ('profile_pending', 'inventory_pending', 'completed');

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_status onboarding_step NOT NULL DEFAULT 'profile_pending';
