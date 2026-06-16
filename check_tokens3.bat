@echo off
echo === API TOKENS === > "D:\ONGC RAM proj\tokens_result.txt"
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "SELECT name, is_active, LEFT(token_hash,20) as hash_prefix FROM api_tokens ORDER BY name;" >> "D:\ONGC RAM proj\tokens_result.txt" 2>&1

echo === CONNECTION PROFILES === >> "D:\ONGC RAM proj\tokens_result.txt"
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "SELECT id, name, is_active FROM connection_profiles ORDER BY name;" >> "D:\ONGC RAM proj\tokens_result.txt" 2>&1

echo === SCHEMA METADATA COUNTS === >> "D:\ONGC RAM proj\tokens_result.txt"
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "SELECT profile_id, COUNT(*) as tables FROM schema_metadata GROUP BY profile_id ORDER BY profile_id;" >> "D:\ONGC RAM proj\tokens_result.txt" 2>&1

echo Done >> "D:\ONGC RAM proj\tokens_result.txt"
