@echo off
REM Kill stuck wscript.exe
taskkill /F /IM wscript.exe >> "D:\ONGC RAM proj\fix_check_result.txt" 2>&1

echo === CONNECTION_PROFILES TABLE COLUMNS === > "D:\ONGC RAM proj\fix_check_result.txt"
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "\d connection_profiles" >> "D:\ONGC RAM proj\fix_check_result.txt" 2>&1

echo === ALL PROFILE DATA === >> "D:\ONGC RAM proj\fix_check_result.txt"
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "SELECT * FROM connection_profiles ORDER BY created_at;" >> "D:\ONGC RAM proj\fix_check_result.txt" 2>&1

echo === BACKEND LOGS (last 100) === >> "D:\ONGC RAM proj\fix_check_result.txt"
docker logs vanna_backend --tail 100 >> "D:\ONGC RAM proj\fix_check_result.txt" 2>&1

echo Done >> "D:\ONGC RAM proj\fix_check_result.txt"
