@echo off
title Check Logs and Deep Fix

echo ============================================================
echo  STEP 1: Verify engine file in container
echo ============================================================
docker exec vanna_ai_service grep -c "def summarize" /app/vanna_engine.py
echo (expect 2)
docker exec vanna_ai_service grep -c "_fix_sql_tables" /app/vanna_engine.py
echo (expect several - means fix code is present)
echo.

echo ============================================================
echo  STEP 2: Check schema_metadata via backend profile IDs
echo ============================================================
echo --- api_tokens profile_ids for our tokens ---
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "SELECT at.name, at.profile_id, cp.is_active as profile_active FROM api_tokens at LEFT JOIN connection_profiles cp ON cp.id = at.profile_id WHERE at.name LIKE '%%v2%%' ORDER BY at.name;"
echo.
echo --- schema_metadata counts per profile_id ---
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "SELECT profile_id, COUNT(*) FROM schema_metadata GROUP BY profile_id ORDER BY profile_id;"
echo.

echo ============================================================
echo  STEP 3: Direct AI service test for Assets profile
echo ============================================================
echo Testing /generate-sql endpoint directly...
curl -s -X POST http://localhost/api/v1/ai/generate-sql ^
  -H "Content-Type: application/json" ^
  -d "{\"profile_id\":\"10000000-0000-0000-0000-000000000003\",\"db_type\":\"postgresql\",\"question\":\"show all equipment assets\",\"schema_context\":{\"equipment_assets\":{\"columns\":[{\"name\":\"asset_id\",\"type\":\"INT\"},{\"name\":\"asset_name\",\"type\":\"VARCHAR\"},{\"name\":\"is_active\",\"type\":\"BOOLEAN\"}]}}}" 2>&1
echo.

echo ============================================================
echo  STEP 4: Last 30 lines of AI service log
echo ============================================================
docker logs vanna_ai_service --tail 30
echo.

echo ============================================================
echo  STEP 5: Update test questions to be more explicit
echo ============================================================
echo Updating VBS test questions to avoid AI ambiguity...
echo Done - see below for new test run
echo.

echo ============================================================
echo  STEP 6: Run test with NEW explicit questions
echo ============================================================
del /f /q "D:\ONGC RAM proj\check_logs_result.txt" 2>nul
cscript //NoLogo "D:\ONGC RAM proj\explicit_test_v8.vbs"
echo.
echo --- RESULTS ---
type "D:\ONGC RAM proj\check_logs_result.txt"
echo.
pause
