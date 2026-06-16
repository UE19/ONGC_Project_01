@echo off
title Seed Schema Metadata
echo Seeding schema metadata for ONGC Refinery profile...
docker exec -i vanna_postgres psql -U vanna_admin -d vanna_platform < "D:\ONGC RAM proj\seed_schema_meta.sql"
echo.
echo Done! Schema metadata inserted.
pause
