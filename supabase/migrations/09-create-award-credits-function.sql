
CREATE OR REPLACE FUNCTION award_credits(session_id_param UUID)
RETURNS void
AS $$
DECLARE
  teacher_id UUID;
  credits_to_award INT;
BEGIN
  -- Get the teacher_id and duration from the session
  SELECT proposer_id, duration INTO teacher_id, credits_to_award
  FROM sessions
  WHERE id = session_id_param;

  -- Award credits to the teacher
  UPDATE profiles
  SET credits = credits + credits_to_award
  WHERE user_id = teacher_id;

  -- Log the transaction
  INSERT INTO transactions (user_id, amount, description)
  VALUES (teacher_id, credits_to_award, 'Credits awarded for completed session');
END;
$$ LANGUAGE plpgsql;
