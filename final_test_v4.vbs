Option Explicit
Dim fso, outFile
Set fso = CreateObject("Scripting.FileSystemObject")
Set outFile = fso.CreateTextFile("D:\ONGC RAM proj\final_test_v4_result.txt", True)

Function PostQuery(token, question)
    Dim http, url, body, resp
    url = "http://localhost/api/query"
    body = "{""question"":""" & question & """}"
    Set http = CreateObject("WinHttp.WinHttpRequest.5.1")
    http.Open "POST", url, False
    http.SetRequestHeader "Content-Type", "application/json"
    http.SetRequestHeader "Authorization", "Bearer " & token
    http.SetTimeouts 10000, 10000, 120000, 120000
    On Error Resume Next
    http.Send body
    If Err.Number <> 0 Then
        PostQuery = "ERROR: " & Err.Description
        On Error GoTo 0
        Exit Function
    End If
    On Error GoTo 0
    PostQuery = http.ResponseText
End Function

outFile.WriteLine "ONGC Vanna Platform - Final Test v4 (WinHttp)"
outFile.WriteLine "================================================"
outFile.WriteLine "Time: " & Now()
outFile.WriteLine ""

Dim wsh, exec
Set wsh = CreateObject("WScript.Shell")

' Check v2 tokens
outFile.WriteLine "=== V2 TOKENS IN DB ==="
Set exec = wsh.Exec("cmd /c docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c ""SELECT name, status FROM api_tokens WHERE name LIKE '%v2%' ORDER BY name;""")
Do While exec.Status = 0 : WScript.Sleep 300 : Loop
outFile.WriteLine exec.StdOut.ReadAll()

' Check schema metadata
outFile.WriteLine "=== SCHEMA METADATA COUNTS ==="
Set exec = wsh.Exec("cmd /c docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c ""SELECT profile_id, COUNT(*) FROM schema_metadata GROUP BY profile_id ORDER BY profile_id;""")
Do While exec.Status = 0 : WScript.Sleep 300 : Loop
outFile.WriteLine exec.StdOut.ReadAll()

outFile.WriteLine ""
outFile.WriteLine "================================================"
outFile.WriteLine "=== RUNNING 7 PROFILE QUERIES ==="
outFile.WriteLine "================================================"

Dim tests(6, 2)
tests(0, 0) = "001 FINANCE"        : tests(0, 1) = "ongc_fin_v2_tok"      : tests(0, 2) = "show budget allocations by department"
tests(1, 0) = "002 HR"             : tests(1, 1) = "ongc_hr_v2_tok"       : tests(1, 2) = "list employees with their grade and base salary"
tests(2, 0) = "003 ASSETS"         : tests(2, 1) = "ongc_assets_v2_tok"   : tests(2, 2) = "show all equipment assets"
tests(3, 0) = "004 OPERATIONS"     : tests(3, 1) = "ongc_ops_v2_tok"      : tests(3, 2) = "show all active wells"
tests(4, 0) = "005 PROCUREMENT"    : tests(4, 1) = "ongc_proc_v2_tok"     : tests(4, 2) = "list all active vendors"
tests(5, 0) = "006 SAFETY"         : tests(5, 1) = "ongc_safe_v2_tok"     : tests(5, 2) = "show all unresolved safety incidents"
tests(6, 0) = "007 REFINERY"       : tests(6, 1) = "ongc_refinery_v2_tok" : tests(6, 2) = "show all refinery assets"

Dim i, resp
For i = 0 To 6
    outFile.WriteLine ""
    outFile.WriteLine "--- " & tests(i, 0) & " ---"
    outFile.WriteLine "Q: " & tests(i, 2)
    resp = PostQuery(tests(i, 1), tests(i, 2))
    ' Extract key fields
    If InStr(resp, """row_count""") > 0 Then
        ' Extract row_count
        Dim pos1, pos2, rc, sql
        pos1 = InStr(resp, """row_count"":") + 12
        pos2 = InStr(pos1, resp, ",")
        If pos2 = 0 Then pos2 = InStr(pos1, resp, "}")
        rc = Mid(resp, pos1, pos2 - pos1)
        ' Extract generated_sql
        pos1 = InStr(resp, """generated_sql"":""") + 16
        pos2 = InStr(pos1, resp, """,""")
        sql = Mid(resp, pos1, pos2 - pos1)
        outFile.WriteLine "SUCCESS - rows=" & rc
        outFile.WriteLine "SQL: " & sql
    ElseIf InStr(resp, """detail""") > 0 Then
        outFile.WriteLine "FAIL: " & Left(resp, 300)
    ElseIf resp = "" Or Left(resp, 5) = "ERROR" Then
        outFile.WriteLine "TIMEOUT/ERROR: " & resp
    Else
        outFile.WriteLine "UNKNOWN: " & Left(resp, 200)
    End If
Next

outFile.WriteLine ""
outFile.WriteLine "================================================"
outFile.WriteLine "=== VANNA AI SERVICE LOGS (last 30 lines) ==="
outFile.WriteLine "================================================"
Set exec = wsh.Exec("cmd /c docker logs --tail 30 vanna_ai_service")
Do While exec.Status = 0 : WScript.Sleep 300 : Loop
outFile.WriteLine exec.StdOut.ReadAll()
outFile.WriteLine exec.StdErr.ReadAll()

outFile.WriteLine ""
outFile.WriteLine "DONE - " & Now()
outFile.Close
WScript.Echo "Done! Check final_test_v4_result.txt"
