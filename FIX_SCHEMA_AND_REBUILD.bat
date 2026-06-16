@echo off
title ONGC - Seed Schemas + Rebuild AI Service

echo Step 1: Seeding schema metadata for all profiles...
docker exec -i vanna_postgres psql -U vanna_admin -d vanna_platform < "D:\ONGC RAM proj\seed_all_schemas.sql"

echo.
echo Step 2: Rebuilding vanna-service with improved Ollama prompt...
cd /d "D:\ONGC RAM proj\vanna-platform"
docker compose build vanna-service --no-cache
docker compose up -d vanna-service

echo.
echo Step 3: Verifying schema metadata...
docker exec -i vanna_postgres psql -U vanna_admin -d vanna_platform -c "SELECT profile_id, COUNT(*) AS tables FROM schema_metadata GROUP BY profile_id ORDER BY profile_id;"

echo.
echo DONE!
pause
