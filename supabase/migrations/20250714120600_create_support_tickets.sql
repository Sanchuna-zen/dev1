-- supabase/migrations/20250714120600_create_support_tickets.sql

-- 1. Create an ENUM type for ticket statuses
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'closed');

-- 2. Create the support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status ticket_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security on the table
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for the support_tickets table

-- Allow users to create tickets for themselves
CREATE POLICY "Users can create their own support tickets."
  ON public.support_tickets FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

-- Allow users to view their own tickets
CREATE POLICY "Users can view their own support tickets."
  ON public.support_tickets FOR SELECT
  USING ( auth.uid() = user_id );

-- Allow users to update their own tickets
CREATE POLICY "Users can update their own support tickets."
  ON public.support_tickets FOR UPDATE
  USING ( auth.uid() = user_id );

-- Allow users to delete their own tickets
CREATE POLICY "Users can delete their own support tickets."
  ON public.support_tickets FOR DELETE
  USING ( auth.uid() = user_id );
