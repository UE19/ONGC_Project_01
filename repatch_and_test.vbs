Set oShell = CreateObject("WScript.Shell")
Dim outFile
outFile = "D:\ONGC RAM proj\repatch_result.txt"

' Copy fixed vanna_engine.py into container
oShell.Run "cmd /c docker cp """ & _
    "D:\ONGC RAM proj\vanna-platform\vanna-service\vanna_engine.py" & _
    """ vanna_ai_service:/app/vanna_engine.py > """ & outFile & """ 2>&1", 0, True

' Restart only vanna_ai_service
oShell.Run "cmd /c docker restart vanna_ai_service >> """ & outFile & """ 2>&1", 0, True

' Wait 15 seconds for service to be ready
oShell.Run "cmd /c timeout /t 15 /nobreak >> """ & outFile & """ 2>&1", 0, True

' Confirm new code in container (should NOT find "EXACT" as table hint)
oShell.Run "cmd /c docker exec vanna_ai_service grep -c ""SQL:"" /app/vanna_engine.py >> """ & outFile & """ 2>&1", 0, True

' Run Finance test
oShell.Run "cmd /c curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_fin_v2_tok"" -d ""{""""question"""":""""show total budget for each department""""}"" > ""D:\ONGC RAM proj\api_test_result.txt"" 2>&1", 0, True

' Run HR test
oShell.Run "cmd /c curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_hr_v2_tok"" -d ""{""""question"""":""""list all employees with their grade and salary""""}"" >> ""D:\ONGC RAM proj\api_test_result.txt"" 2>&1", 0, True

' Run Operations test
oShell.Run "cmd /c curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_ops_v2_tok"" -d ""{""""question"""":""""show all active wells""""}"" >> ""D:\ONGC RAM proj\api_test_result.txt"" 2>&1", 0, True

' Run Assets test
oShell.Run "cmd /c curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_assets_v2_tok"" -d ""{""""question"""":""""list all active equipment assets""""}"" >> ""D:\ONGC RAM proj\api_test_result.txt"" 2>&1", 0, True

' Run Procurement test
oShell.Run "cmd /c curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_proc_v2_tok"" -d ""{""""question"""":""""show all active vendors""""}"" >> ""D:\ONGC RAM proj\api_test_result.txt"" 2>&1", 0, True

' Run Safety test
oShell.Run "cmd /c curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_safe_v2_tok"" -d ""{""""question"""":""""list all unresolved incidents""""}"" >> ""D:\ONGC RAM proj\api_test_result.txt"" 2>&1", 0, True

' Run Refinery test
oShell.Run "cmd /c curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_refinery_v2_tok"" -d ""{""""question"""":""""show all assets""""}"" >> ""D:\ONGC RAM proj\api_test_result.txt"" 2>&1", 0, True

MsgBox "Done! See api_test_result.txt", vbInformation, "Test Complete"
