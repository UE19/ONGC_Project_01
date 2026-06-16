@echo off
echo === BACKEND LOGS NOW === > "D:\ONGC RAM proj\live_debug_result.txt"
docker logs vanna_backend --tail 50 >> "D:\ONGC RAM proj\live_debug_result.txt" 2>&1

echo === AI SERVICE LOGS NOW === >> "D:\ONGC RAM proj\live_debug_result.txt"
docker logs vanna_ai_service --tail 30 >> "D:\ONGC RAM proj\live_debug_result.txt" 2>&1

echo === ONGC_FINANCE LOCKS/QUERIES === >> "D:\ONGC RAM proj\live_debug_result.txt"
docker exec vanna_postgres psql -U vanna_admin -d ongc_finance -c "SELECT pid, state, wait_event_type, wait_event, query FROM pg_stat_activity WHERE datname='ongc_finance';" >> "D:\ONGC RAM proj\live_debug_result.txt" 2>&1

echo === BACKEND CONTAINER PROCESSES === >> "D:\ONGC RAM proj\live_debug_result.txt"
docker exec vanna_backend ps aux >> "D:\ONGC RAM proj\live_debug_result.txt" 2>&1

echo Done >> "D:\ONGC RAM proj\live_debug_result.txt"
