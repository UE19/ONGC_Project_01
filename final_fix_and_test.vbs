Set oShell = CreateObject("WScript.Shell")
Dim out
out = "D:\ONGC RAM proj\final_test_result.txt"

' 1. Copy new vanna_engine.py into container
oShell.Run "cmd /c docker cp """ & _
    "D:\ONGC RAM proj\vanna-platform\vanna-service\vanna_engine.py" & _
    """ vanna_ai_service:/app/vanna_engine.py > """ & out & """ 2>&1", 0, True

' 2. Restart vanna_ai_service
oShell.Run "cmd /c docker restart vanna_ai_service >> """ & out & """ 2>&1", 0, True

' 3. Wait for container to start
oShell.Run "cmd /c timeout /t 18 /nobreak >> """ & out & """ 2>&1", 0, True

' 4. Confirm key functions in container
oShell.Run "cmd /c docker exec vanna_ai_service grep -c ""_fix_sql_tables\|_fix_sql_columns\|all_cols"" /app/vanna_engine.py >> """ & out & """ 2>&1", 0, True

' 5. Run all 7 profile tests
oShell.Run "cmd /c echo === Finance === >> """ & out & """ 2>&1", 0, True
oShell.Run "cmd /c curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_fin_v2_tok"" -d ""{""""question"""":""""show total allocated amount for each department""""}"" >> """ & out & """ 2>&1", 0, True

oShell.Run "cmd /c echo === HR === >> """ & out & """ 2>&1", 0, True
oShell.Run "cmd /c curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_hr_v2_tok"" -d ""{""""question"""":""""list employees with their grade and base salary""""}"" >> """ & out & """ 2>&1", 0, True

oShell.Run "cmd /c echo === Operations === >> """ & out & """ 2>&1", 0, True
oShell.Run "cmd /c curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_ops_v2_tok"" -d ""{""""question"""":""""show all wells where is_active is true""""}"" >> """ & out & """ 2>&1", 0, True

oShell.Run "cmd /c echo === Assets === >> """ & out & """ 2>&1", 0, True
oShell.Run "cmd /c curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_assets_v2_tok"" -d ""{""""question"""":""""list all equipment assets""""}"" >> """ & out & """ 2>&1", 0, True

oShell.Run "cmd /c echo === Procurement === >> """ & out & """ 2>&1", 0, True
oShell.Run "cmd /c curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_proc_v2_tok"" -d ""{""""question"""":""""show all vendors""""}"" >> """ & out & """ 2>&1", 0, True

oShell.Run "cmd /c echo === Safety === >> """ & out & """ 2>&1", 0, True
oShell.Run "cmd /c curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_safe_v2_tok"" -d ""{""""question"""":""""list all safety incidents""""}"" >> """ & out & """ 2>&1", 0, True

oShell.Run "cmd /c echo === Refinery === >> """ & out & """ 2>&1", 0, True
oShell.Run "cmd /c curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_refinery_v2_tok"" -d ""{""""question"""":""""show all assets""""}"" >> """ & out & """ 2>&1", 0, True

MsgBox "All tests done! See final_test_result.txt", vbInformation, "Done"
