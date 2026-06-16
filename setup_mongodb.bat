@echo off
title Setup MongoDB for ONGC Platform

echo ============================================================
echo  STEP 1: Start MongoDB container
echo ============================================================
cd /d "D:\ONGC RAM proj\vanna-platform"
docker compose up -d mongodb
echo Waiting 20 seconds for MongoDB to initialize...
timeout /t 20 /nobreak
echo.

echo ============================================================
echo  STEP 2: Verify MongoDB container is running
echo ============================================================
docker ps --filter "name=vanna_mongodb" --format "table {{.Names}}\t{{.Status}}"
echo.

echo ============================================================
echo  STEP 3: Check MongoDB collections and data
echo ============================================================
docker exec vanna_mongodb mongosh ongc_fieldops -u ongc_mongo -p mongoadmin123 --authenticationDatabase ongc_fieldops --quiet --eval "print('sensor_readings: ' + db.sensor_readings.countDocuments()); print('field_reports: ' + db.field_reports.countDocuments()); print('maintenance_logs: ' + db.maintenance_logs.countDocuments());"
echo.

echo ============================================================
echo  STEP 4: Seed connection profile + token + schema metadata
echo ============================================================
docker exec -i vanna_postgres psql -U vanna_admin -d vanna_platform < "D:\ONGC RAM proj\seed_mongodb_profile.sql"
echo.

echo ============================================================
echo  STEP 5: Verify profile seeded
echo ============================================================
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "SELECT profile_name, db_type, host, database_name FROM connection_profiles WHERE id='10000000-0000-0000-0000-000000000009';"
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "SELECT name, status FROM api_tokens WHERE name='MongoDB Field Ops Token v2';"
echo.

echo ============================================================
echo  DONE - MongoDB setup complete!
echo ============================================================
echo Token to use: ongc_mongo_v2_tok
echo Test question: show all sensor readings where status is warning
echo ============================================================
pause
