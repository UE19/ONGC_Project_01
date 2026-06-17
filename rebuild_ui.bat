@echo off
title Rebuild UI + Backend (Theme + Delete Token)

echo ============================================================
echo  STEP 1: Rebuild backend (added DELETE /tokens endpoint)
echo ============================================================
cd /d "D:\ONGC RAM proj\vanna-platform"
docker compose build backend-api
docker compose up -d backend-api
echo Waiting 15 seconds for backend…
timeout /t 15 /nobreak

echo.
echo ============================================================
echo  STEP 2: Rebuild frontend (UI/UX redesign)
echo ============================================================
docker compose build frontend
docker compose up -d frontend
echo Waiting 20 seconds for frontend…
timeout /t 20 /nobreak

echo.
echo ============================================================
echo  STEP 3: Health check
echo ============================================================
curl -s http://localhost/health
echo.

echo ============================================================
echo  DONE! Open http://localhost to see the new UI
echo ============================================================
echo   - Dark/Light theme toggle in sidebar and login page
echo   - Delete buttons on API tokens
echo   - Bright backgrounds with stable text
echo   - Top-notch ONGC branding
echo ============================================================
pause
