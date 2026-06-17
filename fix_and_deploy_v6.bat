@echo off
title Fix and Deploy v6
echo.
echo ============================================================
echo  Step 1: Re-seed schema metadata for all 6 profiles
echo ============================================================
docker exec -i vanna_postgres psql -U vanna_admin -d vanna_platform < "D:\ONGC RAM proj\seed_all_schemas.sql"
echo Schema metadata seeded.

echo.
echo ============================================================
echo  Step 2: Verify schema metadata row counts
echo ============================================================
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c ^
  "SELECT profile_id, COUNT(*) as tables FROM schema_metadata GROUP BY profile_id ORDER BY profile_id;"

echo.
echo ============================================================
echo  Step 3: Deploy fixed vanna_engine.py to container
echo ============================================================
docker cp "D:\ONGC RAM proj\vanna-platform\vanna-service\vanna_engine.py" vanna_ai_service:/app/vanna_engine.py
echo Copied.

echo.
echo ============================================================
echo  Step 4: Restart AI service
echo ============================================================
docker restart vanna_ai_service
echo Waiting 8 seconds...
timeout /t 8 /nobreak >nul

echo.
echo ============================================================
echo  Step 5: Health check
echo ============================================================
curl -s http://localhost/api/v1/health/vanna
echo.

echo.
echo ============================================================
echo  Step 6: Quick test - Assets profile (the failing query)
echo ============================================================
curl -s -X POST http://localhost/api/query ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer ongc_assets_v2_tok" ^
  -d "{\"question\":\"how many assets are there\"}" > "D:\ONGC RAM proj\assets_test_result.txt" 2>&1
echo Assets test result:
type "D:\ONGC RAM proj\assets_test_result.txt"

echo.
echo ============================================================
echo  DONE!
echo ============================================================
pause
