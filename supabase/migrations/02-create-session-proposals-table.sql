
-- Create the session_proposals table
CREATE TABLE session_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_offered VARCHAR(255),
  skill_sought VARCHAR(255),
  duration INT,
  time_slots TIMESTAMPTZ[],
  language VARCHAR(255),
  accessibility_needs TEXT,
  message TEXT,
  status VARCHAR(255) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_session_proposals_updated_at
BEFORE UPDATE ON session_proposals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
