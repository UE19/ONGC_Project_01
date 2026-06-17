@echo off
setlocal
title ONGC Vanna Platform - Master Fix

echo.
echo ============================================================
echo  ONGC VANNA PLATFORM - COMPLETE DEMO FIX
echo ============================================================
echo.
echo Step 1: Creating all demo databases...
echo.

:: Create all databases (ignore if already exists)
docker exec -i vanna_postgres psql -U vanna_admin -d postgres -c "CREATE DATABASE ongc_finance;" 2>nul
docker exec -i vanna_postgres psql -U vanna_admin -d postgres -c "CREATE DATABASE ongc_hr;" 2>nul
docker exec -i vanna_postgres psql -U vanna_admin -d postgres -c "CREATE DATABASE ongc_assets;" 2>nul
docker exec -i vanna_postgres psql -U vanna_admin -d postgres -c "CREATE DATABASE ongc_operations;" 2>nul
docker exec -i vanna_postgres psql -U vanna_admin -d postgres -c "CREATE DATABASE ongc_procurement;" 2>nul
docker exec -i vanna_postgres psql -U vanna_admin -d postgres -c "CREATE DATABASE ongc_safety;" 2>nul

echo Step 2: Loading Finance data...
docker exec -i vanna_postgres psql -U vanna_admin -d ongc_finance < "D:\ONGC RAM proj\db_finance.sql"

echo Step 3: Loading HR data...
docker exec -i vanna_postgres psql -U vanna_admin -d ongc_hr < "D:\ONGC RAM proj\db_hr.sql"

echo Step 4: Loading Asset Management data...
docker exec -i vanna_postgres psql -U vanna_admin -d ongc_assets < "D:\ONGC RAM proj\db_assets.sql"

echo Step 5: Loading Operations data...
docker exec -i vanna_postgres psql -U vanna_admin -d ongc_operations < "D:\ONGC RAM proj\db_operations.sql"

echo Step 6: Loading Procurement data...
docker exec -i vanna_postgres psql -U vanna_admin -d ongc_procurement < "D:\ONGC RAM proj\db_procurement.sql"

echo Step 7: Loading Safety data...
docker exec -i vanna_postgres psql -U vanna_admin -d ongc_safety < "D:\ONGC RAM proj\db_safety.sql"

echo.
echo Step 8: Updating all connection profiles to local postgres...
docker exec -i vanna_postgres psql -U vanna_admin -d vanna_platform < "D:\ONGC RAM proj\update_all_profiles.sql"

echo.
echo Step 9: Seeding schema metadata for all profiles...
docker exec -i vanna_postgres psql -U vanna_admin -d vanna_platform < "D:\ONGC RAM proj\seed_all_schemas.sql"

echo.
echo Step 10: Rebuilding AI service with improved Ollama prompt...
cd /d "D:\ONGC RAM proj\vanna-platform"
docker compose build vanna_ai_service --no-cache
docker compose up -d vanna_ai_service

echo.
echo Step 11: Verifying databases have data...
echo.
echo --- Finance budget_allocations ---
docker exec -i vanna_postgres psql -U vanna_admin -d ongc_finance -c "SELECT COUNT(*) as budget_rows FROM budget_allocations;"
echo --- HR employees ---
docker exec -i vanna_postgres psql -U vanna_admin -d ongc_hr -c "SELECT COUNT(*) as employee_rows FROM employees;"
echo --- Assets equipment_assets ---
docker exec -i vanna_postgres psql -U vanna_admin -d ongc_assets -c "SELECT COUNT(*) as asset_rows FROM equipment_assets;"
echo --- Operations wells ---
docker exec -i vanna_postgres psql -U vanna_admin -d ongc_operations -c "SELECT COUNT(*) as well_rows FROM wells;"
echo --- Procurement vendors ---
docker exec -i vanna_postgres psql -U vanna_admin -d ongc_procurement -c "SELECT COUNT(*) as vendor_rows FROM vendors;"
echo --- Safety incidents ---
docker exec -i vanna_postgres psql -U vanna_admin -d ongc_safety -c "SELECT COUNT(*) as incident_rows FROM incidents;"
echo --- Schema metadata rows ---
docker exec -i vanna_postgres psql -U vanna_admin -d vanna_platform -c "SELECT profile_id, COUNT(*) as tables FROM schema_metadata GROUP BY profile_id ORDER BY profile_id;"

echo.
echo ============================================================
echo  ALL DONE! All 6 databases loaded, profiles updated,
echo  schema metadata seeded, AI service rebuilt.
echo ============================================================
echo.
pause
