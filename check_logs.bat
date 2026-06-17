@echo off
echo === BACKEND LOGS (last 30 lines) === > "D:\ONGC RAM proj\check_logs_result.txt"
docker logs vanna_backend --tail 30 >> "D:\ONGC RAM proj\check_logs_result.txt" 2>&1

echo === AI SERVICE LOGS (last 20 lines) === >> "D:\ONGC RAM proj\check_logs_result.txt"
docker logs vanna_ai_service --tail 20 >> "D:\ONGC RAM proj\check_logs_result.txt" 2>&1

echo === FINANCE PROFILE DB CHECK === >> "D:\ONGC RAM proj\check_logs_result.txt"
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "SELECT id, name, db_type, db_host, db_port, db_name FROM connection_profiles WHERE id='10000000-0000-0000-0000-000000000001';" >> "D:\ONGC RAM proj\check_logs_result.txt" 2>&1

echo === FINANCE TABLES IN DB === >> "D:\ONGC RAM proj\check_logs_result.txt"
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;" >> "D:\ONGC RAM proj\check_logs_result.txt" 2>&1

echo Done >> "D:\ONGC RAM proj\check_logs_result.txt"
