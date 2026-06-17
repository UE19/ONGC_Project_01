@echo off
echo Adding is_active column to assets table...
docker exec -i vanna_postgres psql -U vanna_admin -d ongc_refinery < "D:\ONGC RAM proj\fix_assets_schema.sql"
echo Done.
pause
