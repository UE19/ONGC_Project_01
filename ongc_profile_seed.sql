-- ── ONGC Refinery DB — Connection Profile & API Token ────────────────────────
-- Run this against vanna_platform DB AFTER loading ongc_refinery_data.sql

INSERT INTO connection_profiles (
  id, owner_id, profile_name, description,
  db_type, host, port, database_name, username, encrypted_password,
  ssl_mode, allowed_schemas, allowed_tables, read_only, is_active,
  last_tested_at, last_test_success, created_at, updated_at
) VALUES (
  '10000000-0000-0000-0000-000000000008',
  (SELECT id FROM users WHERE email='admin@ongc.com' LIMIT 1),
  'ONGC Refinery DB',
  'ONGC Refinery & Asset Production data — 10 tables: Assets, RefineryUnits, ProductionLogs, PipelineMetrics, etc.',
  'postgresql',
  'postgres',
  5432,
  'ongc_refinery',
  'vanna_admin',
  'gAAAAABqMAXwRwe1Pw4HT7eJYDrLeW8gqtfuogf4zFHdxHgC-E465uUTJ9wZR1egee0lIqZMvPhsRcw87Q0Ydr0dHusI7NO2Rw==',
  'disable',
  '[]', '[]',
  true, true,
  NOW(), true, NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  profile_name = EXCLUDED.profile_name,
  description = EXCLUDED.description,
  database_name = EXCLUDED.database_name,
  is_active = true,
  last_test_success = true,
  updated_at = NOW();

INSERT INTO api_tokens (
  id, owner_id, profile_id, name, description,
  token_hash, permissions, allowed_schemas, allowed_tables,
  status, rate_limit_per_minute, total_requests, created_at, updated_at
) VALUES (
  '20000000-0000-0000-0000-000000000008',
  (SELECT id FROM users WHERE email='admin@ongc.com' LIMIT 1),
  '10000000-0000-0000-0000-000000000008',
  'ONGC Refinery Token',
  'API token for querying ONGC Refinery DB',
  '7b49003515b8f86b0ebb67e1eb3caf8d5700c27bc73338e3dff957bdfb417421',
  '["query"]', '[]', '[]',
  'active', 60, 0,
  NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

-- Verify
SELECT profile_name, host, database_name, is_active, last_test_success
FROM connection_profiles
WHERE id = '10000000-0000-0000-0000-000000000008';
