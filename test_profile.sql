-- ── TEST PROFILE: Platform DB (real PostgreSQL inside Docker) ─────────────────
-- This points to vanna_postgres — the only real DB in the Docker stack.
-- Use this profile to test natural language queries in Query Console.

INSERT INTO connection_profiles (
  id, owner_id, profile_name, description,
  db_type, host, port, database_name, username, encrypted_password,
  ssl_mode, allowed_schemas, allowed_tables, read_only, is_active,
  last_tested_at, last_test_success, created_at, updated_at
) VALUES (
  '10000000-0000-0000-0000-000000000007',
  (SELECT id FROM users WHERE email='admin@ongc.com' LIMIT 1),
  'Platform DB (Test)',
  'Vanna platform PostgreSQL — use this to test NL queries (users, tokens, query history)',
  'postgresql',
  'postgres',   -- Docker internal hostname of vanna_postgres container
  5432,
  'vanna_platform',
  'vanna_admin',
  'gAAAAABqL8qFNfc0QBZtsXaFNohmoo1SYyauC3_TnubPPWolGWsWkHbL1UK348xY_uOoRfOQTD4msX7DOQclKD-f7nMi8ctjqw==',
  'disable',
  '[]', '[]',
  true, true,
  NOW(), true, NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

-- ── API TOKEN for the test profile ───────────────────────────────────────────
-- Raw token: vanna_test_platform_token_001
-- SHA-256 hash of above:
INSERT INTO api_tokens (
  id, owner_id, profile_id, name, description,
  token_hash, permissions, allowed_schemas, allowed_tables,
  status, rate_limit_per_minute, total_requests, created_at, updated_at
) VALUES (
  '20000000-0000-0000-0000-000000000007',
  (SELECT id FROM users WHERE email='admin@ongc.com' LIMIT 1),
  '10000000-0000-0000-0000-000000000007',
  'Test Console Token',
  'Token for testing Query Console against Platform DB',
  'a80c87e565fde40132173adf2162229dbd77e920776929887dea2c12a000d70c',
  '["query"]', '[]', '[]',
  'active', 60, 0,
  NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

-- ── Verify ────────────────────────────────────────────────────────────────────
SELECT profile_name, host, database_name, is_active
FROM connection_profiles
WHERE id = '10000000-0000-0000-0000-000000000007';
