-- Seed API tokens for all profiles 001-006
-- Token values: ongc_finance_token_001, ongc_hr_token_001, etc.

INSERT INTO api_tokens (
  id, owner_id, profile_id, name, description,
  token_hash, permissions, allowed_schemas, allowed_tables,
  status, rate_limit_per_minute, total_requests, created_at, updated_at
) VALUES
(
  '20000000-0000-0000-0000-000000000001',
  (SELECT id FROM users WHERE email='admin@ongc.com' LIMIT 1),
  '10000000-0000-0000-0000-000000000001',
  'ONGC Finance Token',
  'API token for ONGC Finance DB',
  '8e10f34fab4d4b93290a0cce7792d11bd0498bfe0eefc3fa6665308193ee5f6c',
  '["query"]', '[]', '[]', 'active', 60, 0, NOW(), NOW()
),
(
  '20000000-0000-0000-0000-000000000002',
  (SELECT id FROM users WHERE email='admin@ongc.com' LIMIT 1),
  '10000000-0000-0000-0000-000000000002',
  'ONGC HR Token',
  'API token for ONGC HR DB',
  '0d7e49d473e8432d1d2e23bf6d237f060db761fa5bd56aaff48712e322bbbbf1',
  '["query"]', '[]', '[]', 'active', 60, 0, NOW(), NOW()
),
(
  '20000000-0000-0000-0000-000000000003',
  (SELECT id FROM users WHERE email='admin@ongc.com' LIMIT 1),
  '10000000-0000-0000-0000-000000000003',
  'ONGC Assets Token',
  'API token for ONGC Asset Management DB',
  '5d45f0f686ecc332d8553bdff1039c0fed1424f1d4c6641cfd1245a4083fe9de',
  '["query"]', '[]', '[]', 'active', 60, 0, NOW(), NOW()
),
(
  '20000000-0000-0000-0000-000000000004',
  (SELECT id FROM users WHERE email='admin@ongc.com' LIMIT 1),
  '10000000-0000-0000-0000-000000000004',
  'ONGC Operations Token',
  'API token for ONGC Operations DB',
  '0277a6757cc01324cf0577da268bd7ce9120b4a266516f8c69f2664564b650b3',
  '["query"]', '[]', '[]', 'active', 60, 0, NOW(), NOW()
),
(
  '20000000-0000-0000-0000-000000000005',
  (SELECT id FROM users WHERE email='admin@ongc.com' LIMIT 1),
  '10000000-0000-0000-0000-000000000005',
  'ONGC Procurement Token',
  'API token for ONGC Procurement DB',
  '90c81199c4bc5a7dbb7e254a3b40a591436b05804fd8ad4aa80c0dee04f82b58',
  '["query"]', '[]', '[]', 'active', 60, 0, NOW(), NOW()
),
(
  '20000000-0000-0000-0000-000000000006',
  (SELECT id FROM users WHERE email='admin@ongc.com' LIMIT 1),
  '10000000-0000-0000-0000-000000000006',
  'ONGC Safety Token',
  'API token for ONGC Safety DB',
  '512fcf9165d4ba1f69b4adccc50d1ea47fec6e4f34bd912e382baf5acc6b0777',
  '["query"]', '[]', '[]', 'active', 60, 0, NOW(), NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Verify
SELECT t.name, t.status, p.profile_name, p.database_name
FROM api_tokens t
JOIN connection_profiles p ON t.profile_id = p.id
ORDER BY p.id;
