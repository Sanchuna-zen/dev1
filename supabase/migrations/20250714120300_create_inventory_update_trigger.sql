-- supabase/migrations/20250714120300_create_inventory_update_trigger.sql

-- Create the trigger function
CREATE OR REPLACE FUNCTION handle_inventory_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Asynchronously invoke the Edge Function
  PERFORM net.http_post(
    url := 'http://localhost:54321/functions/v1/inventory-webhook-handler',  -- Supabase local dev URL
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := json_build_object('record', NEW)::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER on_inventory_update
  AFTER INSERT OR UPDATE ON public.inventory
  FOR EACH ROW
  EXECUTE FUNCTION handle_inventory_update();
