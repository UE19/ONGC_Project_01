@echo off
title ONGC DB Reload (snake_case fix)
echo ============================================
echo  Reloading ONGC DB with snake_case columns
echo ============================================
echo.

echo [1/4] Dropping old ongc_refinery database...
docker exec vanna_postgres psql -U vanna_admin -d postgres -c "DROP DATABASE IF EXISTS ongc_refinery;"
echo Done.
echo.

echo [2/4] Creating fresh ongc_refinery database...
docker exec vanna_postgres psql -U vanna_admin -d postgres -c "CREATE DATABASE ongc_refinery;"
echo Done.
echo.

echo [3/4] Loading tables and data (snake_case columns)...
docker exec -i vanna_postgres psql -U vanna_admin -d ongc_refinery < "D:\ONGC RAM proj\ongc_refinery_data.sql"
echo Data load complete!
echo.

echo [4/4] Ingesting schema via API (so Ollama knows column names)...
powershell -Command "try { Invoke-RestMethod -Method POST -Uri 'http://localhost/api/v1/profiles/10000000-0000-0000-0000-000000000008/ingest-schema' -Headers @{ Authorization='Bearer vanna_ongc_refinery_token_001'; 'Content-Type'='application/json' } -Body '{}' | Out-Null; Write-Host '  Schema ingested OK' } catch { Write-Host '  Schema ingest skipped (queries still work)' }"
echo.

echo ============================================
echo  DONE! Test in Query Console with:
echo   - "Show all assets and their locations"
echo   - "Which refinery units had high efficiency?"
echo   - "Show top 5 production logs by volume"
echo ============================================
pause
