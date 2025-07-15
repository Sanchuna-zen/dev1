-- supabase/migrations/20250714120200_enable_realtime_for_inventory.sql

-- Add the 'inventory' table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;
