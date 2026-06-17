@echo off
echo === CONNECTION PROFILES === > "D:\ONGC RAM proj\check_profiles_result.txt"
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "SELECT id, name, db_type, db_host, db_port, db_name, db_user FROM connection_profiles ORDER BY name;" >> "D:\ONGC RAM proj\check_profiles_result.txt" 2>&1

echo === BACKEND LOGS (last 40) === >> "D:\ONGC RAM proj\check_profiles_result.txt"
docker logs vanna_backend --tail 40 >> "D:\ONGC RAM proj\check_profiles_result.txt" 2>&1

echo === AI SERVICE LOGS (last 20) === >> "D:\ONGC RAM proj\check_profiles_result.txt"
docker logs vanna_ai_service --tail 20 >> "D:\ONGC RAM proj\check_profiles_result.txt" 2>&1

echo Done >> "D:\ONGC RAM proj\check_profiles_result.txt"
