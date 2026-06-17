Option Explicit
Dim wsh, fso, outFile
Set wsh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
Set outFile = fso.CreateTextFile("D:\ONGC RAM proj\final_test_v3_result.txt", True)

Sub RunQuery(label, token, question)
    Dim exec, out, t0
    Dim jsonBody
    jsonBody = "{""question"":""" & question & """}"
    Dim cmd
    cmd = "curl -s --max-time 90 -X POST http://localhost/api/query " & _
          "-H ""Content-Type: application/json"" " & _
          "-H ""Authorization: Bearer " & token & """ " & _
          "-d """ & jsonBody & """"
    outFile.WriteLine ""
    outFile.WriteLine "--- " & label & " ---"
    outFile.WriteLine "TOKEN: " & token
    outFile.WriteLine "QUESTION: " & question
    Set exec = wsh.Exec("cmd /c " & cmd)
    Do While exec.Status = 0 : WScript.Sleep 500 : Loop
    out = exec.StdOut.ReadAll()
    outFile.WriteLine "RESPONSE: " & Left(out, 500)
    ' Check for success
    If InStr(out, """row_count""") > 0 Then
        outFile.WriteLine "==> SUCCESS"
    ElseIf InStr(out, """detail""") > 0 Then
        outFile.WriteLine "==> FAIL: " & out
    ElseIf out = "" Then
        outFile.WriteLine "==> TIMEOUT or empty"
    Else
        outFile.WriteLine "==> UNKNOWN"
    End If
End Sub

outFile.WriteLine "ONGC Vanna Platform - Final Test v3"
outFile.WriteLine "======================================"
outFile.WriteLine "Time: " & Now()

' First verify v2 tokens exist in DB
outFile.WriteLine ""
outFile.WriteLine "=== VERIFY V2 TOKENS IN DB ==="
Dim exec2
Set exec2 = wsh.Exec("cmd /c docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c ""SELECT name, status FROM api_tokens WHERE name LIKE '%v2%' ORDER BY name;""")
Do While exec2.Status = 0 : WScript.Sleep 300 : Loop
outFile.WriteLine exec2.StdOut.ReadAll()

' Verify schema_metadata counts
outFile.WriteLine "=== SCHEMA METADATA COUNTS ==="
Set exec2 = wsh.Exec("cmd /c docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c ""SELECT profile_id, COUNT(*) FROM schema_metadata GROUP BY profile_id ORDER BY profile_id;""")
Do While exec2.Status = 0 : WScript.Sleep 300 : Loop
outFile.WriteLine exec2.StdOut.ReadAll()

outFile.WriteLine ""
outFile.WriteLine "======================================"
outFile.WriteLine "=== RUNNING 7 PROFILE QUERIES ==="
outFile.WriteLine "======================================"

' Correct token strings from seed_tokens_v2.sql comments:
' ongc_fin_v2_tok, ongc_hr_v2_tok, ongc_assets_v2_tok,
' ongc_ops_v2_tok, ongc_proc_v2_tok, ongc_safe_v2_tok, ongc_refinery_v2_tok

RunQuery "001 FINANCE", "ongc_fin_v2_tok", "show budget allocations by department"
RunQuery "002 HR", "ongc_hr_v2_tok", "list employees with their grade and base salary"
RunQuery "003 ASSETS", "ongc_assets_v2_tok", "show all equipment assets"
RunQuery "004 OPERATIONS", "ongc_ops_v2_tok", "show all active wells"
RunQuery "005 PROCUREMENT", "ongc_proc_v2_tok", "list all active vendors"
RunQuery "006 SAFETY", "ongc_safe_v2_tok", "show all unresolved safety incidents"
RunQuery "007 REFINERY", "ongc_refinery_v2_tok", "show all refinery assets"

outFile.WriteLine ""
outFile.WriteLine "======================================"
outFile.WriteLine "=== VANNA_AI LOGS (last 50 lines) ==="
outFile.WriteLine "======================================"
Set exec2 = wsh.Exec("cmd /c docker logs --tail 50 vanna_ai_service")
Do While exec2.Status = 0 : WScript.Sleep 300 : Loop
outFile.WriteLine exec2.StdOut.ReadAll()
outFile.WriteLine exec2.StdErr.ReadAll()

outFile.WriteLine ""
outFile.WriteLine "ALL DONE - " & Now()
outFile.Close
WScript.Echo "Done! Check final_test_v3_result.txt"
