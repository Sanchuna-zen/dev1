
-- Create the notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create a function to create a notification
CREATE OR REPLACE FUNCTION create_notification()
RETURNS TRIGGER AS $$
DECLARE
  proposer_id_var UUID;
  message_var TEXT;
BEGIN
  -- Get the proposer_id from the session
  SELECT proposer_id INTO proposer_id_var
  FROM sessions
  WHERE id = NEW.session_id;

  -- Create a notification for the proposer when a new request is made
  IF TG_OP = 'INSERT' THEN
    message_var := 'You have a new request for your session.';
    INSERT INTO notifications (user_id, message)
    VALUES (proposer_id_var, message_var);
  END IF;

  -- Create a notification for the requester when the request is updated
  IF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'accepted' THEN
      message_var := 'Your request has been accepted.';
    ELSE
      message_var := 'Your request has been rejected.';
    END IF;
    INSERT INTO notifications (user_id, message)
    VALUES (NEW.requester_id, message_var);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function
CREATE TRIGGER session_request_notification
AFTER INSERT OR UPDATE ON session_requests
FOR EACH ROW
EXECUTE FUNCTION create_notification();
