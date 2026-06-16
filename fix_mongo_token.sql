-- Fix: insert MongoDB token with correct column names
INSERT INTO api_tokens (
  id, name, token_hash, profile_id, owner_id,
  status, rate_limit_per_minute, expires_at, created_at, updated_at
)
VALUES (
  gen_random_uuid(),
  'MongoDB Field Ops Token v2',
  encode(sha256('ongc_mongo_v2_tok'::bytea), 'hex'),
  '10000000-0000-0000-0000-000000000009',
  (SELECT id FROM users WHERE email='admin@ongc.com' LIMIT 1),
  'active', 60, NOW() + INTERVAL '1 year', NOW(), NOW()
)
ON CONFLICT (token_hash) DO NOTHING;

-- Verify
SELECT name, status FROM api_tokens WHERE name='MongoDB Field Ops Token v2';
