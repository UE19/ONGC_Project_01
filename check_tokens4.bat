@echo off
echo === API_TOKENS COLUMNS === > "D:\ONGC RAM proj\tokens_result.txt"
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "\d api_tokens" >> "D:\ONGC RAM proj\tokens_result.txt" 2>&1

echo === CONNECTION_PROFILES COLUMNS === >> "D:\ONGC RAM proj\tokens_result.txt"
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "\d connection_profiles" >> "D:\ONGC RAM proj\tokens_result.txt" 2>&1

echo === ALL TOKENS (first 5 cols) === >> "D:\ONGC RAM proj\tokens_result.txt"
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "SELECT * FROM api_tokens LIMIT 3;" >> "D:\ONGC RAM proj\tokens_result.txt" 2>&1

echo Done >> "D:\ONGC RAM proj\tokens_result.txt"
