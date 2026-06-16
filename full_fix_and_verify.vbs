Set oShell = CreateObject("WScript.Shell")
Dim out
out = "D:\ONGC RAM proj\full_verify_result.txt"

' ─── Step 1: Check current schema_metadata count ─────────────────────────────
oShell.Run "cmd /c echo === SCHEMA_METADATA COUNT (before reseed) === > """ & out & """ 2>&1", 0, True
oShell.Run "cmd /c docker exec vanna_postgres psql -U vanna_admin -d vanna_db -c ""SELECT COUNT(*) as total_rows FROM schema_metadata;"" >> """ & out & """ 2>&1", 0, True

' ─── Step 2: Reseed schema_metadata with correct format ──────────────────────
oShell.Run "cmd /c echo === RESEEDING SCHEMA_METADATA === >> """ & out & """ 2>&1", 0, True
oShell.Run "cmd /c docker exec -i vanna_postgres psql -U vanna_admin -d vanna_db < """ & _
    "D:\ONGC RAM proj\reseed_schema_metadata.sql"" >> """ & out & """ 2>&1", 0, True

' ─── Step 3: Verify count after reseed ───────────────────────────────────────
oShell.Run "cmd /c echo === SCHEMA_METADATA COUNT (after reseed) === >> """ & out & """ 2>&1", 0, True
oShell.Run "cmd /c docker exec vanna_postgres psql -U vanna_admin -d vanna_db -c ""SELECT profile_id, COUNT(*) as tables FROM schema_metadata GROUP BY profile_id ORDER BY profile_id;"" >> """ & out & """ 2>&1", 0, True

' ─── Step 4: Deploy updated vanna_engine.py ──────────────────────────────────
oShell.Run "cmd /c echo === DEPLOYING UPDATED VANNA_ENGINE.PY === >> """ & out & """ 2>&1", 0, True
oShell.Run "cmd /c docker cp """ & _
    "D:\ONGC RAM proj\vanna-platform\vanna-service\vanna_engine.py"" " & _
    "vanna_ai_service:/app/vanna_engine.py >> """ & out & """ 2>&1", 0, True

' ─── Step 5: Restart vanna_ai_service ────────────────────────────────────────
oShell.Run "cmd /c echo === RESTARTING VANNA_AI_SERVICE === >> """ & out & """ 2>&1", 0, True
oShell.Run "cmd /c docker restart vanna_ai_service >> """ & out & """ 2>&1", 0, True
oShell.Run "cmd /c timeout /t 20 /nobreak >> """ & out & """ 2>&1", 0, True

' ─── Step 6: Verify fix cases count ─────────────────────────────────────────
oShell.Run "cmd /c echo === VERIFY CODE IN CONTAINER === >> """ & out & """ 2>&1", 0, True
oShell.Run "cmd /c docker exec vanna_ai_service grep -c ""Case 3\|Case 4\|endswith"" /app/vanna_engine.py >> """ & out & """ 2>&1", 0, True

' ─── Step 7: Run all 7 tests ─────────────────────────────────────────────────
oShell.Run "cmd /c echo. >> """ & out & """ 2>&1", 0, True
oShell.Run "cmd /c echo === PROFILE TESTS === >> """ & out & """ 2>&1", 0, True

' Finance - use question that mentions budget allocations directly
oShell.Run "cmd /c echo --- Finance --- >> """ & out & """ 2>&1", 0, True
oShell.Run "cmd /c curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_fin_v2_tok"" -d ""{""""question"""":""""show budget allocations by department""""}"" >> """ & out & """ 2>&1", 0, True

' HR
oShell.Run "cmd /c echo --- HR --- >> """ & out & """ 2>&1", 0, True
oShell.Run "cmd /c curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_hr_v2_tok"" -d ""{""""question"""":""""list employees with grade and base salary""""}"" >> """ & out & """ 2>&1", 0, True

' Operations
oShell.Run "cmd /c echo --- Operations --- >> """ & out & """ 2>&1", 0, True
oShell.Run "cmd /c curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_ops_v2_tok"" -d ""{""""question"""":""""show all active wells""""}"" >> """ & out & """ 2>&1", 0, True

' Assets - simpler question
oShell.Run "cmd /c echo --- Assets --- >> """ & out & """ 2>&1", 0, True
oShell.Run "cmd /c curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_assets_v2_tok"" -d ""{""""question"""":""""show all assets""""}"" >> """ & out & """ 2>&1", 0, True

' Procurement
oShell.Run "cmd /c echo --- Procurement --- >> """ & out & """ 2>&1", 0, True
oShell.Run "cmd /c curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_proc_v2_tok"" -d ""{""""question"""":""""show all vendors""""}"" >> """ & out & """ 2>&1", 0, True

' Safety - simpler question
oShell.Run "cmd /c echo --- Safety --- >> """ & out & """ 2>&1", 0, True
oShell.Run "cmd /c curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_safe_v2_tok"" -d ""{""""question"""":""""show all incidents""""}"" >> """ & out & """ 2>&1", 0, True

' Refinery
oShell.Run "cmd /c echo --- Refinery --- >> """ & out & """ 2>&1", 0, True
oShell.Run "cmd /c curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_refinery_v2_tok"" -d ""{""""question"""":""""show all assets""""}"" >> """ & out & """ 2>&1", 0, True

' ─── Step 8: Show last 50 lines of vanna_ai_service logs ─────────────────────
oShell.Run "cmd /c echo. >> """ & out & """ 2>&1", 0, True
oShell.Run "cmd /c echo === VANNA_AI_SERVICE LOGS (last 40 lines) === >> """ & out & """ 2>&1", 0, True
oShell.Run "cmd /c docker logs --tail 40 vanna_ai_service >> """ & out & """ 2>&1", 0, True

MsgBox "All done! See full_verify_result.txt", vbInformation, "Full Fix & Verify"
