-- Redirect ALL demo profiles to local vanna_postgres
-- Encrypted password = VannaDB2026 with key ZQ2rDqUvPgMvul85O2GgzSNrrmBCTDMG4otxhG-W_Sg=

-- Finance DB (profile 001)
UPDATE connection_profiles SET
    host = 'vanna_postgres',
    port = 5432,
    db_type = 'postgresql',
    database_name = 'ongc_finance',
    username = 'vanna_admin',
    encrypted_password = 'gAAAAABqMAXwRwe1Pw4HT7eJYDrLeW8gqtfuogf4zFHdxHgC-E465uUTJ9wZR1egee0lIqZMvPhsRcw87Q0Ydr0dHusI7NO2Rw=='
WHERE id = '10000000-0000-0000-0000-000000000001';

-- HR DB (profile 002)
UPDATE connection_profiles SET
    host = 'vanna_postgres',
    port = 5432,
    db_type = 'postgresql',
    database_name = 'ongc_hr',
    username = 'vanna_admin',
    encrypted_password = 'gAAAAABqMAXwRwe1Pw4HT7eJYDrLeW8gqtfuogf4zFHdxHgC-E465uUTJ9wZR1egee0lIqZMvPhsRcw87Q0Ydr0dHusI7NO2Rw=='
WHERE id = '10000000-0000-0000-0000-000000000002';

-- Asset Management DB (profile 003)
UPDATE connection_profiles SET
    host = 'vanna_postgres',
    port = 5432,
    db_type = 'postgresql',
    database_name = 'ongc_assets',
    username = 'vanna_admin',
    encrypted_password = 'gAAAAABqMAXwRwe1Pw4HT7eJYDrLeW8gqtfuogf4zFHdxHgC-E465uUTJ9wZR1egee0lIqZMvPhsRcw87Q0Ydr0dHusI7NO2Rw=='
WHERE id = '10000000-0000-0000-0000-000000000003';

-- Operations DB (profile 004)
UPDATE connection_profiles SET
    host = 'vanna_postgres',
    port = 5432,
    db_type = 'postgresql',
    database_name = 'ongc_operations',
    username = 'vanna_admin',
    encrypted_password = 'gAAAAABqMAXwRwe1Pw4HT7eJYDrLeW8gqtfuogf4zFHdxHgC-E465uUTJ9wZR1egee0lIqZMvPhsRcw87Q0Ydr0dHusI7NO2Rw=='
WHERE id = '10000000-0000-0000-0000-000000000004';

-- Procurement DB (profile 005)
UPDATE connection_profiles SET
    host = 'vanna_postgres',
    port = 5432,
    db_type = 'postgresql',
    database_name = 'ongc_procurement',
    username = 'vanna_admin',
    encrypted_password = 'gAAAAABqMAXwRwe1Pw4HT7eJYDrLeW8gqtfuogf4zFHdxHgC-E465uUTJ9wZR1egee0lIqZMvPhsRcw87Q0Ydr0dHusI7NO2Rw=='
WHERE id = '10000000-0000-0000-0000-000000000005';

-- Safety DB (profile 006)
UPDATE connection_profiles SET
    host = 'vanna_postgres',
    port = 5432,
    db_type = 'postgresql',
    database_name = 'ongc_safety',
    username = 'vanna_admin',
    encrypted_password = 'gAAAAABqMAXwRwe1Pw4HT7eJYDrLeW8gqtfuogf4zFHdxHgC-E465uUTJ9wZR1egee0lIqZMvPhsRcw87Q0Ydr0dHusI7NO2Rw=='
WHERE id = '10000000-0000-0000-0000-000000000006';

-- Platform Test DB (profile 007) — points to vanna_platform itself
UPDATE connection_profiles SET
    host = 'vanna_postgres',
    port = 5432,
    db_type = 'postgresql',
    database_name = 'vanna_platform',
    username = 'vanna_admin',
    encrypted_password = 'gAAAAABqMAXwRwe1Pw4HT7eJYDrLeW8gqtfuogf4zFHdxHgC-E465uUTJ9wZR1egee0lIqZMvPhsRcw87Q0Ydr0dHusI7NO2Rw=='
WHERE id = '10000000-0000-0000-0000-000000000007';

-- Verify
SELECT id, profile_name, host, database_name, db_type FROM connection_profiles ORDER BY id;
