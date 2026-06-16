Set oShell = CreateObject("WScript.Shell")

' Step 1: Check Docker container status
oShell.Run "cmd /c docker ps --filter name=vanna --format ""table {{.Names}}\t{{.Status}}\t{{.Image}}"" > ""D:\ONGC RAM proj\docker_status.txt"" 2>&1", 0, True

' Step 2: Run full verification (without pause)
oShell.Run "cmd /c docker exec -i vanna_postgres psql -U vanna_admin -d ongc_finance -c ""SELECT 'budget_allocations' as tbl, COUNT(*) FROM budget_allocations UNION ALL SELECT 'procurement_orders', COUNT(*) FROM procurement_orders UNION ALL SELECT 'purchase_orders', COUNT(*) FROM purchase_orders UNION ALL SELECT 'gl_entries', COUNT(*) FROM gl_entries;"" >> ""D:\ONGC RAM proj\docker_status.txt"" 2>&1", 0, True

oShell.Run "cmd /c docker exec -i vanna_postgres psql -U vanna_admin -d ongc_hr -c ""SELECT 'departments' as tbl, COUNT(*) FROM departments UNION ALL SELECT 'employees', COUNT(*) FROM employees UNION ALL SELECT 'payroll_records', COUNT(*) FROM payroll_records UNION ALL SELECT 'attendance', COUNT(*) FROM attendance;"" >> ""D:\ONGC RAM proj\docker_status.txt"" 2>&1", 0, True

oShell.Run "cmd /c docker exec -i vanna_postgres psql -U vanna_admin -d ongc_operations -c ""SELECT well_name, well_type, is_active FROM wells WHERE is_active = TRUE LIMIT 3;"" >> ""D:\ONGC RAM proj\docker_status.txt"" 2>&1", 0, True

oShell.Run "cmd /c docker exec -i vanna_postgres psql -U vanna_admin -d ongc_safety -c ""SELECT incident_type, severity, is_resolved FROM incidents LIMIT 3;"" >> ""D:\ONGC RAM proj\docker_status.txt"" 2>&1", 0, True

oShell.Run "cmd /c docker exec -i vanna_postgres psql -U vanna_admin -d ongc_assets -c ""SELECT asset_code, asset_name, is_active, condition_status FROM equipment_assets LIMIT 3;"" >> ""D:\ONGC RAM proj\docker_status.txt"" 2>&1", 0, True

oShell.Run "cmd /c docker exec -i vanna_postgres psql -U vanna_admin -d ongc_procurement -c ""SELECT vendor_name, is_active FROM vendors LIMIT 3;"" >> ""D:\ONGC RAM proj\docker_status.txt"" 2>&1", 0, True

' Step 3: Check schema_metadata
oShell.Run "cmd /c docker exec -i vanna_postgres psql -U vanna_admin -d vanna_platform -c ""SELECT profile_id, COUNT(*) as table_count FROM schema_metadata GROUP BY profile_id ORDER BY profile_id;"" >> ""D:\ONGC RAM proj\docker_status.txt"" 2>&1", 0, True

' Step 4: Check connection profiles
oShell.Run "cmd /c docker exec -i vanna_postgres psql -U vanna_admin -d vanna_platform -c ""SELECT id, profile_name, host, database_name FROM connection_profiles ORDER BY id;"" >> ""D:\ONGC RAM proj\docker_status.txt"" 2>&1", 0, True

MsgBox "Check complete! See docker_status.txt", vbInformation, "Done"
