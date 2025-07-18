
-- Create the session_requests table
CREATE TABLE session_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(255) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_session_requests_updated_at
BEFORE UPDATE ON session_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
