Set oShell = CreateObject("WScript.Shell")

' Test Finance profile (token: ongc_fin_v2_tok)
oShell.Run "cmd /c curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_fin_v2_tok"" -d ""{""""question"""":""""show total budget for each department""""}"" > ""D:\ONGC RAM proj\api_test_result.txt"" 2>&1", 0, True

' Test HR profile (token: ongc_hr_v2_tok)
oShell.Run "cmd /c curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_hr_v2_tok"" -d ""{""""question"""":""""list all employees with their grade and salary""""}"" >> ""D:\ONGC RAM proj\api_test_result.txt"" 2>&1", 0, True

' Test Operations profile (token: ongc_ops_v2_tok)
oShell.Run "cmd /c curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_ops_v2_tok"" -d ""{""""question"""":""""show all active wells""""}"" >> ""D:\ONGC RAM proj\api_test_result.txt"" 2>&1", 0, True

' Test Assets profile (token: ongc_assets_v2_tok)
oShell.Run "cmd /c curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_assets_v2_tok"" -d ""{""""question"""":""""list all active equipment assets""""}"" >> ""D:\ONGC RAM proj\api_test_result.txt"" 2>&1", 0, True

' Test Procurement profile (token: ongc_proc_v2_tok)
oShell.Run "cmd /c curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_proc_v2_tok"" -d ""{""""question"""":""""show all active vendors""""}"" >> ""D:\ONGC RAM proj\api_test_result.txt"" 2>&1", 0, True

' Test Safety profile (token: ongc_safe_v2_tok)
oShell.Run "cmd /c curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_safe_v2_tok"" -d ""{""""question"""":""""list all unresolved incidents""""}"" >> ""D:\ONGC RAM proj\api_test_result.txt"" 2>&1", 0, True

' Test Refinery profile (token: ongc_refinery_v2_tok)
oShell.Run "cmd /c curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_refinery_v2_tok"" -d ""{""""question"""":""""show all assets""""}"" >> ""D:\ONGC RAM proj\api_test_result.txt"" 2>&1", 0, True

MsgBox "API tests complete! See api_test_result.txt", vbInformation, "Done"
