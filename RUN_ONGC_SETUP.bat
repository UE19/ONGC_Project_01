@echo off
title ONGC Database Setup
echo ============================================
echo  ONGC Refinery DB Setup
echo ============================================
echo.

echo [1/3] Creating ongc_refinery database...
docker exec vanna_postgres psql -U vanna_admin -d postgres -c "CREATE DATABASE ongc_refinery;" 2>nul
echo Done (ignore 'already exists' if shown)
echo.

echo [2/3] Loading ONGC tables and data...
docker exec -i vanna_postgres psql -U vanna_admin -d ongc_refinery < "D:\ONGC RAM proj\ongc_refinery_data.sql"
echo.
echo Data load complete!
echo.

echo [3/3] Creating connection profile and API token...
docker exec -i vanna_postgres psql -U vanna_admin -d vanna_platform < "D:\ONGC RAM proj\ongc_profile_seed.sql"
echo.
echo Profile and token created!
echo.

echo ============================================
echo  All done! Now rebuilding Docker containers
echo  (this takes 3-5 minutes)...
echo ============================================
echo.

cd /d "D:\ONGC RAM proj\vanna-platform"
docker build --no-cache -t vanna-vanna-service ./vanna-service
docker build --no-cache -t vanna-backend ./backend
docker compose up -d

echo.
echo ============================================
echo  SETUP COMPLETE!
echo.
echo  Token: vanna_ongc_refinery_token_001
echo  Use in Query Console to query ONGC data
echo ============================================
pause
