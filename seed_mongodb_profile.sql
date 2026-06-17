-- ============================================================
-- ONGC MongoDB Profile Seed
-- Profile 009 — ONGC Field Operations (MongoDB)
-- Collections: sensor_readings, field_reports, maintenance_logs
-- ============================================================

-- Connection Profile
INSERT INTO connection_profiles (
  id, owner_id, profile_name, description, db_type,
  host, port, database_name, username, encrypted_password,
  ssl_mode, allowed_schemas, allowed_tables, read_only,
  is_active, last_tested_at, last_test_success, created_at, updated_at
)
VALUES (
  '10000000-0000-0000-0000-000000000009',
  (SELECT id FROM users WHERE email='admin@ongc.com' LIMIT 1),
  'ONGC Field Operations (MongoDB)',
  'Field ops MongoDB — sensor readings, field reports, maintenance logs',
  'mongodb',
  'vanna_mongodb', 27017, 'ongc_fieldops', 'ongc_mongo',
  'gAAAAABqMPa-hHhcG398w7j6tjJMMDeH_osYAtFDPpS4vMPC2XeTQeZ8du5hyJAIK3Em-mCXz6A38irdg103yFtbINLcAr3BTw==',
  'disable', '[]', '[]', true, true, NOW(), true, NOW(), NOW()
)
ON CONFLICT (id) DO NOTHING;

-- API Token
INSERT INTO api_tokens (
  id, name, token_hash, profile_id, created_by,
  status, rate_limit_per_min, expires_at, created_at, updated_at
)
VALUES (
  gen_random_uuid(),
  'MongoDB Field Ops Token v2',
  encode(sha256('ongc_mongo_v2_tok'::bytea), 'hex'),
  '10000000-0000-0000-0000-000000000009',
  (SELECT id FROM users WHERE email='admin@ongc.com' LIMIT 1),
  'active', 60, NOW() + INTERVAL '1 year', NOW(), NOW()
)
ON CONFLICT DO NOTHING;

-- Schema Metadata — sensor_readings
INSERT INTO schema_metadata (id, profile_id, schema_name, table_name, column_definitions, relationships, sample_values, description, is_manually_corrected, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '10000000-0000-0000-0000-000000000009',
  'ongc_fieldops', 'sensor_readings',
  '{"columns":[
    {"name":"sensor_id","type":"STRING"},
    {"name":"well_id","type":"STRING"},
    {"name":"sensor_type","type":"STRING"},
    {"name":"value","type":"DECIMAL"},
    {"name":"unit","type":"STRING"},
    {"name":"recorded_at","type":"DATETIME"},
    {"name":"location","type":"STRING"},
    {"name":"status","type":"STRING"}
  ]}'::jsonb,
  '{}'::jsonb, '{}'::jsonb,
  'IoT sensor readings from oil wells — pressure, temperature, flow rate, gas detection',
  false, NOW(), NOW()
)
ON CONFLICT DO NOTHING;

-- Schema Metadata — field_reports
INSERT INTO schema_metadata (id, profile_id, schema_name, table_name, column_definitions, relationships, sample_values, description, is_manually_corrected, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '10000000-0000-0000-0000-000000000009',
  'ongc_fieldops', 'field_reports',
  '{"columns":[
    {"name":"report_id","type":"STRING"},
    {"name":"well_id","type":"STRING"},
    {"name":"inspector","type":"STRING"},
    {"name":"inspection_date","type":"DATE"},
    {"name":"location","type":"STRING"},
    {"name":"type","type":"STRING"},
    {"name":"findings","type":"STRING"},
    {"name":"action_required","type":"BOOLEAN"},
    {"name":"priority","type":"STRING"},
    {"name":"status","type":"STRING"}
  ]}'::jsonb,
  '{}'::jsonb, '{}'::jsonb,
  'Field inspection reports from engineers — safety audits, pressure tests, routine checks',
  false, NOW(), NOW()
)
ON CONFLICT DO NOTHING;

-- Schema Metadata — maintenance_logs
INSERT INTO schema_metadata (id, profile_id, schema_name, table_name, column_definitions, relationships, sample_values, description, is_manually_corrected, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '10000000-0000-0000-0000-000000000009',
  'ongc_fieldops', 'maintenance_logs',
  '{"columns":[
    {"name":"log_id","type":"STRING"},
    {"name":"asset_id","type":"STRING"},
    {"name":"asset_name","type":"STRING"},
    {"name":"well_id","type":"STRING"},
    {"name":"technician","type":"STRING"},
    {"name":"maintenance_type","type":"STRING"},
    {"name":"start_date","type":"DATE"},
    {"name":"end_date","type":"DATE"},
    {"name":"duration_hours","type":"INT"},
    {"name":"cost_inr","type":"DECIMAL"},
    {"name":"parts_replaced","type":"ARRAY"},
    {"name":"status","type":"STRING"},
    {"name":"location","type":"STRING"}
  ]}'::jsonb,
  '{}'::jsonb, '{}'::jsonb,
  'Equipment maintenance logs — preventive, corrective, emergency maintenance records',
  false, NOW(), NOW()
)
ON CONFLICT DO NOTHING;

-- Verify
SELECT 'Profile' as item, count(*) FROM connection_profiles WHERE id='10000000-0000-0000-0000-000000000009'
UNION ALL
SELECT 'Token', count(*) FROM api_tokens WHERE name='MongoDB Field Ops Token v2'
UNION ALL
SELECT 'Schema rows', count(*) FROM schema_metadata WHERE profile_id='10000000-0000-0000-0000-000000000009';
