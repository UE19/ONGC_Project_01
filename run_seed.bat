@echo off
set LOG=%~dp0seed_output.log
echo Running seed... > "%LOG%"
docker exec -i vanna_postgres psql -U vanna_admin -d vanna_platform < "%~dp0seed_data.sql" >> "%LOG%" 2>&1
echo. >> "%LOG%"
echo === ROW COUNTS === >> "%LOG%"
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "SELECT 'users' AS tbl,COUNT(*) FROM users UNION ALL SELECT 'connection_profiles',COUNT(*) FROM connection_profiles UNION ALL SELECT 'api_tokens',COUNT(*) FROM api_tokens UNION ALL SELECT 'query_history',COUNT(*) FROM query_history UNION ALL SELECT 'schema_metadata',COUNT(*) FROM schema_metadata UNION ALL SELECT 'business_glossary',COUNT(*) FROM business_glossary;" >> "%LOG%" 2>&1
echo. >> "%LOG%"
echo DONE >> "%LOG%"
type "%LOG%"
pause
