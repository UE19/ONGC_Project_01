@echo off
title Check Token and Tables

echo === New token profile linkage ===
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "SELECT at.name, at.token_hash, at.status, at.profile_id, cp.profile_name FROM api_tokens at LEFT JOIN connection_profiles cp ON cp.id=at.profile_id ORDER BY at.created_at DESC LIMIT 10;"
echo.

echo === Tables in ongc_operations ===
docker exec vanna_postgres psql -U vanna_admin -d ongc_operations -c "\dt"
echo.

echo === Schema metadata for Operations (004) ===
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "SELECT table_name FROM schema_metadata WHERE profile_id='10000000-0000-0000-0000-000000000004';"
echo.

pause
