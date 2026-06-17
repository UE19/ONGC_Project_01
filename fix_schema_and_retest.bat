@echo off
title Fix Schema and Retest

echo ============================================================
echo  STEP 1: Check schema_metadata counts per profile
echo ============================================================
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "SELECT profile_id, COUNT(*) as table_count FROM schema_metadata GROUP BY profile_id ORDER BY profile_id;"
echo.

echo ============================================================
echo  STEP 2: Seed ALL schema metadata (HR, Assets, Procurement)
echo ============================================================
docker exec -i vanna_postgres psql -U vanna_admin -d vanna_platform < "D:\ONGC RAM proj\seed_all_schemas.sql"
echo.

echo ============================================================
echo  STEP 3: Verify counts after seeding
echo ============================================================
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "SELECT profile_id, COUNT(*) as table_count FROM schema_metadata GROUP BY profile_id ORDER BY profile_id;"
echo (expect 4 tables each for profiles 001-006, 10 for 008)
echo.

echo ============================================================
echo  STEP 4: Run final test (no redeploy needed - engine ok)
echo ============================================================
del /f /q "D:\ONGC RAM proj\final_test_v7_result.txt" 2>nul
cscript //NoLogo "D:\ONGC RAM proj\final_test_v7.vbs"

echo.
echo --- RESULTS ---
type "D:\ONGC RAM proj\final_test_v7_result.txt"
echo.
pause
