
CREATE OR REPLACE FUNCTION find_matching_users(session_id_param UUID)
RETURNS TABLE (user_profile profiles)
AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM profiles p, sessions s
  WHERE s.id = session_id_param
    AND p.user_id != s.proposer_id
    AND s.skill_offered = ANY(p.skills_sought)
    AND s.skill_sought = ANY(p.skills_offered)
    AND (s.language IS NULL OR s.language = p.language)
    AND (s.accessibility_needs IS NULL OR s.accessibility_needs = p.accessibility_needs);
END;
$$ LANGUAGE plpgsql;
