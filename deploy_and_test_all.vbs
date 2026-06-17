Option Explicit
Dim wsh, fso, outFile, outPath
Set wsh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

outPath = "D:\ONGC RAM proj\deploy_test_result.txt"
Set outFile = fso.CreateTextFile(outPath, True)

Sub Run(cmd)
    Dim exec, out, err
    Set exec = wsh.Exec("cmd /c " & cmd)
    Do While exec.Status = 0 : WScript.Sleep 200 : Loop
    out = exec.StdOut.ReadAll()
    err = exec.StdErr.ReadAll()
    If out <> "" Then outFile.WriteLine out
    If err <> "" Then outFile.WriteLine "ERR: " & err
End Sub

Sub RunAndWait(cmd, secs)
    wsh.Run "cmd /c " & cmd, 0, True
    WScript.Sleep secs * 1000
End Sub

outFile.WriteLine "========================================="
outFile.WriteLine "STEP 1: Deploy latest vanna_engine.py"
outFile.WriteLine "========================================="

Run "docker cp ""D:\ONGC RAM proj\vanna-platform\vanna-service\vanna_engine.py"" vanna_ai_service:/app/vanna_engine.py"

outFile.WriteLine ""
outFile.WriteLine "STEP 2: Verify new code in container"
Run "docker exec vanna_ai_service grep -c ""Case 3\|Case 4\|endswith"" /app/vanna_engine.py"
Run "docker exec vanna_ai_service grep -n ""Case 3\|Case 4\|endswith"" /app/vanna_engine.py"

outFile.WriteLine ""
outFile.WriteLine "STEP 3: Restart vanna_ai_service"
Run "docker restart vanna_ai_service"
outFile.WriteLine "Waiting 20 seconds for startup..."
WScript.Sleep 20000
Run "docker ps --filter name=vanna --format ""{{.Names}} {{.Status}}"""

outFile.WriteLine ""
outFile.WriteLine "========================================="
outFile.WriteLine "STEP 4: Run test for each profile"
outFile.WriteLine "========================================="

' Token map: profile -> (token, question)
' Profile 001 Finance
outFile.WriteLine ""
outFile.WriteLine "--- [001] FINANCE: show budget allocations by department ---"
Run "curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_finance_v2_tok"" -d ""{""""question"""":""""show budget allocations by department""""}"" "

' Profile 002 HR
outFile.WriteLine ""
outFile.WriteLine "--- [002] HR: list employees with their grade and base salary ---"
Run "curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_hr_v2_tok"" -d ""{""""question"""":""""list employees with their grade and base salary""""}"" "

' Profile 003 Assets
outFile.WriteLine ""
outFile.WriteLine "--- [003] ASSETS: show all equipment assets ---"
Run "curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_assets_v2_tok"" -d ""{""""question"""":""""show all equipment assets""""}"" "

' Profile 004 Operations
outFile.WriteLine ""
outFile.WriteLine "--- [004] OPERATIONS: show all active wells ---"
Run "curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_ops_v2_tok"" -d ""{""""question"""":""""show all active wells""""}"" "

' Profile 005 Procurement
outFile.WriteLine ""
outFile.WriteLine "--- [005] PROCUREMENT: list all active vendors ---"
Run "curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_proc_v2_tok"" -d ""{""""question"""":""""list all active vendors""""}"" "

' Profile 006 Safety
outFile.WriteLine ""
outFile.WriteLine "--- [006] SAFETY: show all unresolved safety incidents ---"
Run "curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_safety_v2_tok"" -d ""{""""question"""":""""show all unresolved safety incidents""""}"" "

' Profile 007 Refinery (postgres default DB)
outFile.WriteLine ""
outFile.WriteLine "--- [007] REFINERY: show all refinery assets ---"
Run "curl -s -X POST http://localhost/api/query -H ""Content-Type: application/json"" -H ""Authorization: Bearer ongc_refinery_v2_tok"" -d ""{""""question"""":""""show all refinery assets""""}"" "

outFile.WriteLine ""
outFile.WriteLine "========================================="
outFile.WriteLine "STEP 5: Verify generated SQL from container logs"
outFile.WriteLine "========================================="
Run "docker logs --tail 80 vanna_ai_service"

outFile.WriteLine ""
outFile.WriteLine "========================================="
outFile.WriteLine "ALL DONE"
outFile.WriteLine "========================================="
outFile.Close

WScript.Echo "Done. Results in deploy_test_result.txt"
