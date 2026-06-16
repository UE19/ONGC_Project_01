@echo off
echo === V2 TOKEN DETAILS === > "D:\ONGC RAM proj\diagnose_result.txt"
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "SELECT name, status, LEFT(token_hash,16) as hash16, profile_id FROM api_tokens WHERE name LIKE '%%v2%%' ORDER BY name, status;" >> "D:\ONGC RAM proj\diagnose_result.txt" 2>&1

echo === SCHEMA_METADATA for profile 004 (Operations) === >> "D:\ONGC RAM proj\diagnose_result.txt"
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "SELECT table_name, column_definitions::text FROM schema_metadata WHERE profile_id='10000000-0000-0000-0000-000000000004' ORDER BY table_name;" >> "D:\ONGC RAM proj\diagnose_result.txt" 2>&1

echo === SCHEMA_METADATA for profile 006 (Safety) === >> "D:\ONGC RAM proj\diagnose_result.txt"
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "SELECT table_name, column_definitions::text FROM schema_metadata WHERE profile_id='10000000-0000-0000-0000-000000000006' ORDER BY table_name;" >> "D:\ONGC RAM proj\diagnose_result.txt" 2>&1

echo === ACTIVE FINANCE V2 TOKEN HASH === >> "D:\ONGC RAM proj\diagnose_result.txt"
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "SELECT name, status, token_hash FROM api_tokens WHERE name='Finance Test Token v2' AND status='active';" >> "D:\ONGC RAM proj\diagnose_result.txt" 2>&1

echo === ACTIVE REFINERY V2 TOKEN HASH === >> "D:\ONGC RAM proj\diagnose_result.txt"
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "SELECT name, status, token_hash FROM api_tokens WHERE name='Refinery Test Token v2' AND status='active';" >> "D:\ONGC RAM proj\diagnose_result.txt" 2>&1

echo Done >> "D:\ONGC RAM proj\diagnose_result.txt"
