-- Fresh tokens with known values for all 7 profiles
-- Token values: ongc_fin_v2_tok, ongc_hr_v2_tok, ongc_assets_v2_tok,
--               ongc_ops_v2_tok, ongc_proc_v2_tok, ongc_safe_v2_tok, ongc_refinery_v2_tok

INSERT INTO api_tokens (
  id, owner_id, profile_id, name, description,
  token_hash, permissions, allowed_schemas, allowed_tables,
  status, rate_limit_per_minute, total_requests, created_at, updated_at
) VALUES
(
  '3ef4fca2-4bbe-400b-a495-09f999dc3a37',
  (SELECT id FROM users WHERE email='admin@ongc.com' LIMIT 1),
  '10000000-0000-0000-0000-000000000001',
  'Finance Test Token v2', 'Known test token for Finance',
  'a939a27f0307962fb29daf791658fd3da022c1d0d047e25b814d4b792cff9c75',
  '["query"]', '[]', '[]', 'active', 60, 0, NOW(), NOW()
),
(
  'f311c168-b1b7-45d7-ad99-eb9dd64a7f19',
  (SELECT id FROM users WHERE email='admin@ongc.com' LIMIT 1),
  '10000000-0000-0000-0000-000000000002',
  'HR Test Token v2', 'Known test token for HR',
  'e11e56b143b50076c3cb3fee5bb4094b95ea32c37475b2fbc03af9959e7e6d5e',
  '["query"]', '[]', '[]', 'active', 60, 0, NOW(), NOW()
),
(
  'd83f04f6-a186-4314-81b1-31dc39164dfa',
  (SELECT id FROM users WHERE email='admin@ongc.com' LIMIT 1),
  '10000000-0000-0000-0000-000000000003',
  'Assets Test Token v2', 'Known test token for Assets',
  '2f34e912264eb34098dbe9dcaa271bdf2673a906178160195fc8086b41e7cabd',
  '["query"]', '[]', '[]', 'active', 60, 0, NOW(), NOW()
),
(
  '1c81abd6-5440-4b87-a1d9-471b8b3a616c',
  (SELECT id FROM users WHERE email='admin@ongc.com' LIMIT 1),
  '10000000-0000-0000-0000-000000000004',
  'Operations Test Token v2', 'Known test token for Operations',
  '34da2ac03daeb05c39415c2140dcda06b20e257dd48e5f43d014f8f3c75e9163',
  '["query"]', '[]', '[]', 'active', 60, 0, NOW(), NOW()
),
(
  '776b1e85-9a9f-468b-8ad6-ef1a100adbc0',
  (SELECT id FROM users WHERE email='admin@ongc.com' LIMIT 1),
  '10000000-0000-0000-0000-000000000005',
  'Procurement Test Token v2', 'Known test token for Procurement',
  '993ea828280cf0acccecbb8ef50a86639fbea5b1ccfae059ce6e7752ae488ad2',
  '["query"]', '[]', '[]', 'active', 60, 0, NOW(), NOW()
),
(
  'ee1bf548-81cf-42ed-8fe5-70933eac4a64',
  (SELECT id FROM users WHERE email='admin@ongc.com' LIMIT 1),
  '10000000-0000-0000-0000-000000000006',
  'Safety Test Token v2', 'Known test token for Safety',
  '03028ff128e6f0aef6ca70215eb6212b61a8c2b05e1b5dd2fc8c7e5caae7a63c',
  '["query"]', '[]', '[]', 'active', 60, 0, NOW(), NOW()
),
(
  '0fd9a0ba-28d0-4c28-bd1d-51caf0caadca',
  (SELECT id FROM users WHERE email='admin@ongc.com' LIMIT 1),
  '10000000-0000-0000-0000-000000000008',
  'Refinery Test Token v2', 'Known test token for Refinery',
  'de590923012be883e29df9d4f9a2d89ca799842247c6868cde4f7aed42877c0a',
  '["query"]', '[]', '[]', 'active', 60, 0, NOW(), NOW()
)
ON CONFLICT (id) DO NOTHING;

SELECT t.name, t.status, p.profile_name FROM api_tokens t
JOIN connection_profiles p ON t.profile_id = p.id
WHERE t.name LIKE '%v2%' ORDER BY p.id;
