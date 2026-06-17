@echo off
title ONGC - Full Verification

echo ============================================================
echo  STEP 1: VERIFY ALL DATABASES HAVE DATA
echo ============================================================

echo.
echo [Finance DB - ongc_finance]
docker exec -i vanna_postgres psql -U vanna_admin -d ongc_finance -c "SELECT 'budget_allocations' as tbl, COUNT(*) FROM budget_allocations UNION ALL SELECT 'procurement_orders', COUNT(*) FROM procurement_orders UNION ALL SELECT 'purchase_orders', COUNT(*) FROM purchase_orders UNION ALL SELECT 'gl_entries', COUNT(*) FROM gl_entries;"

echo.
echo [HR DB - ongc_hr]
docker exec -i vanna_postgres psql -U vanna_admin -d ongc_hr -c "SELECT 'departments' as tbl, COUNT(*) FROM departments UNION ALL SELECT 'employees', COUNT(*) FROM employees UNION ALL SELECT 'payroll_records', COUNT(*) FROM payroll_records UNION ALL SELECT 'attendance', COUNT(*) FROM attendance;"

echo.
echo [Assets DB - ongc_assets]
docker exec -i vanna_postgres psql -U vanna_admin -d ongc_assets -c "SELECT 'equipment_assets' as tbl, COUNT(*) FROM equipment_assets UNION ALL SELECT 'maintenance_schedules', COUNT(*) FROM maintenance_schedules UNION ALL SELECT 'spare_parts', COUNT(*) FROM spare_parts UNION ALL SELECT 'asset_conditions', COUNT(*) FROM asset_conditions;"

echo.
echo [Operations DB - ongc_operations]
docker exec -i vanna_postgres psql -U vanna_admin -d ongc_operations -c "SELECT 'wells' as tbl, COUNT(*) FROM wells UNION ALL SELECT 'production_data', COUNT(*) FROM production_data UNION ALL SELECT 'drilling_records', COUNT(*) FROM drilling_records UNION ALL SELECT 'reservoir_data', COUNT(*) FROM reservoir_data;"

echo.
echo [Procurement DB - ongc_procurement]
docker exec -i vanna_postgres psql -U vanna_admin -d ongc_procurement -c "SELECT 'vendors' as tbl, COUNT(*) FROM vendors UNION ALL SELECT 'purchase_requests', COUNT(*) FROM purchase_requests UNION ALL SELECT 'contracts', COUNT(*) FROM contracts UNION ALL SELECT 'invoices', COUNT(*) FROM invoices;"

echo.
echo [Safety DB - ongc_safety]
docker exec -i vanna_postgres psql -U vanna_admin -d ongc_safety -c "SELECT 'incidents' as tbl, COUNT(*) FROM incidents UNION ALL SELECT 'safety_inspections', COUNT(*) FROM safety_inspections UNION ALL SELECT 'risk_assessments', COUNT(*) FROM risk_assessments UNION ALL SELECT 'training_records', COUNT(*) FROM training_records;"

echo.
echo [Refinery DB - ongc_refinery]
docker exec -i vanna_postgres psql -U vanna_admin -d ongc_refinery -c "SELECT 'assets' as tbl, COUNT(*) FROM assets UNION ALL SELECT 'refineryunits', COUNT(*) FROM refineryunits UNION ALL SELECT 'productionlogs', COUNT(*) FROM productionlogs;"

echo.
echo ============================================================
echo  STEP 2: VERIFY CONNECTION PROFILES
echo ============================================================
docker exec -i vanna_postgres psql -U vanna_admin -d vanna_platform -c "SELECT id, profile_name, host, database_name, db_type FROM connection_profiles ORDER BY id;"

echo.
echo ============================================================
echo  STEP 3: VERIFY SCHEMA METADATA (all profiles)
echo ============================================================
docker exec -i vanna_postgres psql -U vanna_admin -d vanna_platform -c "SELECT profile_id, COUNT(*) as table_count FROM schema_metadata GROUP BY profile_id ORDER BY profile_id;"

echo.
echo ============================================================
echo  STEP 4: VERIFY AI SERVICE CONTAINER STATUS
echo ============================================================
docker ps --filter name=vanna --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"

echo.
echo ============================================================
echo  STEP 5: SPOT-CHECK QUERIES - COLUMN NAMES
echo ============================================================
echo [Finance: verify balance_amount column exists]
docker exec -i vanna_postgres psql -U vanna_admin -d ongc_finance -c "SELECT budget_id, department, allocated_amount, spent_amount, balance_amount FROM budget_allocations LIMIT 3;"

echo.
echo [HR: verify full_name, grade, base_salary columns]
docker exec -i vanna_postgres psql -U vanna_admin -d ongc_hr -c "SELECT emp_code, full_name, grade, base_salary, status FROM employees LIMIT 3;"

echo.
echo [Operations: verify is_active column on wells]
docker exec -i vanna_postgres psql -U vanna_admin -d ongc_operations -c "SELECT well_name, well_type, basin, is_active FROM wells WHERE is_active = TRUE LIMIT 3;"

echo.
echo [Safety: verify is_resolved column on incidents]
docker exec -i vanna_postgres psql -U vanna_admin -d ongc_safety -c "SELECT incident_type, severity, location, is_resolved FROM incidents LIMIT 3;"

echo.
echo [Assets: verify is_active, condition_status columns]
docker exec -i vanna_postgres psql -U vanna_admin -d ongc_assets -c "SELECT asset_code, asset_name, is_active, condition_status FROM equipment_assets LIMIT 3;"

echo.
echo ============================================================
echo  ALL VERIFICATION DONE!
echo ============================================================
pause
