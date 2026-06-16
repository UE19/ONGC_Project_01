@echo off
echo === LIST ALL DATABASES ===
docker exec vanna_postgres psql -U vanna_admin -c "\l" > "D:\ONGC RAM proj\tokens_result.txt" 2>&1
echo === LIST TABLES IN DEFAULT DB ===
docker exec vanna_postgres psql -U vanna_admin -c "\dt" >> "D:\ONGC RAM proj\tokens_result.txt" 2>&1
echo === API TOKENS ===
docker exec vanna_postgres psql -U vanna_admin -c "SELECT name, is_active, LEFT(token_hash,20) as hash_prefix FROM api_tokens ORDER BY name;" >> "D:\ONGC RAM proj\tokens_result.txt" 2>&1
echo Done
