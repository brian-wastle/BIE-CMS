CREATE OR REPLACE VIEW user_public AS
SELECT
  id,
  email,
  username,
  first_name,
  last_name,
  btrim(concat_ws(' ', first_name, last_name)) AS display_name,
  created_at
FROM users;