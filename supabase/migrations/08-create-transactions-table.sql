
-- Create the transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
