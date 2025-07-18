
CREATE OR REPLACE FUNCTION deduct_credits(session_id_param UUID)
RETURNS void
AS $$
DECLARE
  learner_id UUID;
  credits_to_deduct INT;
BEGIN
  -- Get the learner_id and duration from the session
  SELECT partner_id, duration INTO learner_id, credits_to_deduct
  FROM sessions
  WHERE id = session_id_param;

  -- Deduct credits from the learner
  UPDATE profiles
  SET credits = credits - credits_to_deduct
  WHERE user_id = learner_id;

  -- Log the transaction
  INSERT INTO transactions (user_id, amount, description)
  VALUES (learner_id, -credits_to_deduct, 'Credits deducted for completed session');
END;
$$ LANGUAGE plpgsql;
