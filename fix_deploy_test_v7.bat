@echo off
title Fix Deploy Test v7
echo.
echo ============================================================
echo  Step 1: Re-activate revoked tokens (Assets + Operations)
echo ============================================================
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c ^
  "UPDATE api_tokens SET status='active' WHERE token_hash IN ('2f34e912264eb34098dbe9dcaa271bdf2673a906178160195fc8086b41e7cabd','34da2ac03daeb05c39415c2140dcda06b20e257dd48e5f43d014f8f3c75e9163');"
echo Verifying token status:
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c ^
  "SELECT name, status FROM api_tokens WHERE name LIKE '%%v2%%' ORDER BY name;"

echo.
echo ============================================================
echo  Step 2: Re-seed schema metadata for all profiles
echo ============================================================
docker exec -i vanna_postgres psql -U vanna_admin -d vanna_platform < "D:\ONGC RAM proj\seed_all_schemas.sql"
echo Schema seeded.

echo.
echo ============================================================
echo  Step 3: Deploy updated vanna_engine.py
echo ============================================================
docker cp "D:\ONGC RAM proj\vanna-platform\vanna-service\vanna_engine.py" vanna_ai_service:/app/vanna_engine.py
echo Copied vanna_engine.py to container.

echo.
echo ============================================================
echo  Step 4: Restart AI service
echo ============================================================
docker restart vanna_ai_service
echo Waiting 8 seconds for startup...
timeout /t 8 /nobreak >nul
curl -s http://localhost/api/v1/health/vanna
echo.

echo.
echo ============================================================
echo  Step 5: Run full 7-profile test
echo ============================================================
del /f /q "D:\ONGC RAM proj\final_test_v7_result.txt" 2>nul
cscript //NoLogo "D:\ONGC RAM proj\final_test_v7.vbs"

echo.
echo --- RESULTS ---
type "D:\ONGC RAM proj\final_test_v7_result.txt"
echo.
pause
