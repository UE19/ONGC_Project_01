@echo off
title Diagnose and Fix
echo ============================================================
echo  STEP 1: Check Docker is running
echo ============================================================
docker --version
docker ps --format "table {{.Names}}\t{{.Status}}"
echo.

echo ============================================================
echo  STEP 2: Current token status
echo ============================================================
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "SELECT name, status, LEFT(token_hash,16) as hash_prefix FROM api_tokens WHERE name LIKE '%%v2%%' ORDER BY name;"
echo.

echo ============================================================
echo  STEP 3: Fix revoked tokens via SQL file
echo ============================================================
echo UPDATE api_tokens SET status='active' WHERE name IN ('Assets Test Token v2','Operations Test Token v2'); > "%TEMP%\fix_tokens.sql"
echo SELECT name, status FROM api_tokens WHERE name LIKE '%%v2%%' ORDER BY name; >> "%TEMP%\fix_tokens.sql"
docker exec -i vanna_postgres psql -U vanna_admin -d vanna_platform < "%TEMP%\fix_tokens.sql"
echo.

echo ============================================================
echo  STEP 4: Verify token fix
echo ============================================================
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "SELECT name, status FROM api_tokens WHERE name LIKE '%%v2%%' ORDER BY name;"
echo.

echo ============================================================
echo  STEP 5: Deploy vanna_engine.py
echo ============================================================
docker cp "D:\ONGC RAM proj\vanna-platform\vanna-service\vanna_engine.py" vanna_ai_service:/app/vanna_engine.py
if %ERRORLEVEL% EQU 0 (
    echo SUCCESS: vanna_engine.py deployed
) else (
    echo ERROR: docker cp failed!
)
echo.

echo ============================================================
echo  STEP 6: Verify engine file (check for 'summarize' method)
echo ============================================================
docker exec vanna_ai_service grep -c "def summarize" /app/vanna_engine.py
echo (should print 2 - both summarize and summarize_results)
echo.

echo ============================================================
echo  STEP 7: Restart AI service
echo ============================================================
docker restart vanna_ai_service
echo Waiting 10 seconds...
timeout /t 10 /nobreak >nul
curl -s http://localhost/api/v1/health/vanna
echo.

echo ============================================================
echo  STEP 8: Run tests
echo ============================================================
del /f /q "D:\ONGC RAM proj\final_test_v7_result.txt" 2>nul
cscript //NoLogo "D:\ONGC RAM proj\final_test_v7.vbs"
echo.
echo --- RESULTS ---
type "D:\ONGC RAM proj\final_test_v7_result.txt"
echo.
pause
