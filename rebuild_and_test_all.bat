@echo off
title Rebuild Backend + Full 8-Profile Test

echo ============================================================
echo  STEP 1: Rebuild backend with MongoDB fix
echo ============================================================
cd /d "D:\ONGC RAM proj\vanna-platform"
docker compose build backend-api
echo.

echo ============================================================
echo  STEP 2: Restart backend container
echo ============================================================
docker compose up -d backend-api
echo Waiting 20 seconds for backend to be healthy...
timeout /t 20 /nobreak
echo.

echo ============================================================
echo  STEP 3: Verify backend health
echo ============================================================
curl -s http://localhost/health
echo.

echo ============================================================
echo  STEP 4: Run full 8-profile test
echo ============================================================
del /f /q "D:\ONGC RAM proj\full_test_8profiles_result.txt" 2>nul
cscript //NoLogo "D:\ONGC RAM proj\full_test_8profiles.vbs"
echo.
echo --- RESULTS ---
type "D:\ONGC RAM proj\full_test_8profiles_result.txt"
echo.
pause
