@echo off
title Explicit Test v8

echo ============================================================
echo  STEP 1: Verify engine in container (expect 2 + check fix)
echo ============================================================
docker exec vanna_ai_service grep -c "def summarize" /app/vanna_engine.py
docker exec vanna_ai_service grep -c "_fix_sql_tables" /app/vanna_engine.py
echo.

echo ============================================================
echo  STEP 2: Verify profile IDs match between tokens + schema
echo ============================================================
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "SELECT at.name, at.profile_id FROM api_tokens at WHERE at.name LIKE '%%v2%%' AND at.status='active' ORDER BY at.name;"
echo.
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "SELECT sm.profile_id, COUNT(*) FROM schema_metadata sm GROUP BY sm.profile_id ORDER BY sm.profile_id;"
echo.

echo ============================================================
echo  STEP 3: Last 60 lines of AI service log
echo ============================================================
docker logs vanna_ai_service --tail 60
echo.

echo ============================================================
echo  STEP 4: Run explicit test v8 (table names in questions)
echo ============================================================
del /f /q "D:\ONGC RAM proj\check_logs_result.txt" 2>nul
cscript //NoLogo "D:\ONGC RAM proj\explicit_test_v8.vbs"
echo.
echo --- RESULTS ---
type "D:\ONGC RAM proj\check_logs_result.txt"
echo.
pause
