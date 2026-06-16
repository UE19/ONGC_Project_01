Dim http, fso, outFile, result
Dim baseUrl, logFile

baseUrl = "http://localhost:8000"
logFile = "D:\ONGC RAM proj\final_test_v5_result.txt"

Set fso = CreateObject("Scripting.FileSystemObject")
Set outFile = fso.CreateTextFile(logFile, True)

Sub Log(msg)
    outFile.WriteLine msg
    WScript.Echo msg
End Sub

Function NowStr()
    NowStr = Now()
End Function

Function CallAPI(token, question)
    Dim req, body, resp
    Set req = CreateObject("WinHttp.WinHttpRequest.5.1")
    req.Open "POST", baseUrl & "/api/v1/query/ask", False
    req.SetRequestHeader "Content-Type", "application/json"
    req.SetRequestHeader "X-API-Token", token
    req.SetRequestHeader "Accept", "application/json"
    body = "{""question"":""" & question & """}"
    req.Send body
    CallAPI = req.ResponseText
End Function

Function RunSql(sqlStr)
    Dim sh, cmd, tmp
    tmp = "D:\ONGC RAM proj\sql_tmp_result.txt"
    Set sh = CreateObject("WScript.Shell")
    cmd = "docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c """ & sqlStr & """ "
    sh.Run "cmd /c " & cmd & " > """ & tmp & """ 2>&1", 0, True
    Dim f, txt
    Set f = fso.OpenTextFile(tmp, 1)
    txt = f.ReadAll
    f.Close
    RunSql = txt
End Function

Log "ONGC Vanna Platform - Final Test v5"
Log "========================================"
Log "Time: " & NowStr()
Log ""

' ── Step 1: Check DB tokens ──────────────────────────────────────────────────
Log "=== DB TOKEN STATUS ==="
Log RunSql("SELECT name, status, LEFT(token_hash,16) FROM api_tokens WHERE name LIKE '%v2%' AND status='active' ORDER BY name;")
Log ""

' ── Step 2: Run all 7 queries ────────────────────────────────────────────────
Log "========================================"
Log "=== RUNNING 7 PROFILE QUERIES ==="
Log "========================================"
Log ""

' --- 001 FINANCE ---
Log "--- 001 FINANCE ---"
result = CallAPI("ongc_fin_v2_tok", "show budget allocations by department")
Log "Q: show budget allocations by department"
If InStr(result, """rows""") > 0 Or InStr(result, "rows") > 0 Then
    Dim rowsPos, sqlPos, snippet
    rowsPos = InStr(result, """row_count"":")
    sqlPos = InStr(result, """sql"":")
    Dim rowNum
    rowNum = Mid(result, rowsPos + 12, 5)
    Log "SUCCESS - rows=" & Left(rowNum, InStr(rowNum, ",") - 1)
    If sqlPos > 0 Then Log "SQL: " & Mid(result, sqlPos + 7, 120)
ElseIf InStr(result, "detail") > 0 Then
    Log "FAIL: " & result
Else
    Log "RESPONSE: " & Left(result, 300)
End If
Log ""

' --- 002 HR ---
Log "--- 002 HR ---"
result = CallAPI("ongc_hr_v2_tok", "list all employees with their grade and base salary")
Log "Q: list all employees with their grade and base salary"
If InStr(result, "row_count") > 0 Then
    rowsPos = InStr(result, """row_count"":")
    sqlPos = InStr(result, """sql"":")
    rowNum = Mid(result, rowsPos + 12, 5)
    Log "SUCCESS - rows=" & Left(rowNum, InStr(rowNum, ",") - 1)
    If sqlPos > 0 Then Log "SQL: " & Mid(result, sqlPos + 7, 120)
ElseIf InStr(result, "detail") > 0 Then
    Log "FAIL: " & result
Else
    Log "RESPONSE: " & Left(result, 300)
End If
Log ""

' --- 003 ASSETS ---
Log "--- 003 ASSETS ---"
result = CallAPI("ongc_assets_v2_tok", "show all equipment assets")
Log "Q: show all equipment assets"
If InStr(result, "row_count") > 0 Then
    rowsPos = InStr(result, """row_count"":")
    sqlPos = InStr(result, """sql"":")
    rowNum = Mid(result, rowsPos + 12, 5)
    Log "SUCCESS - rows=" & Left(rowNum, InStr(rowNum, ",") - 1)
    If sqlPos > 0 Then Log "SQL: " & Mid(result, sqlPos + 7, 120)
ElseIf InStr(result, "detail") > 0 Then
    Log "FAIL: " & result
Else
    Log "RESPONSE: " & Left(result, 300)
End If
Log ""

' --- 004 OPERATIONS (explicit column name) ---
Log "--- 004 OPERATIONS ---"
result = CallAPI("ongc_ops_v2_tok", "list all wells where is_active is true")
Log "Q: list all wells where is_active is true"
If InStr(result, "row_count") > 0 Then
    rowsPos = InStr(result, """row_count"":")
    sqlPos = InStr(result, """sql"":")
    rowNum = Mid(result, rowsPos + 12, 5)
    Log "SUCCESS - rows=" & Left(rowNum, InStr(rowNum, ",") - 1)
    If sqlPos > 0 Then Log "SQL: " & Mid(result, sqlPos + 7, 120)
ElseIf InStr(result, "detail") > 0 Then
    Log "FAIL: " & result
Else
    Log "RESPONSE: " & Left(result, 300)
End If
Log ""

' --- 005 PROCUREMENT (explicit column name) ---
Log "--- 005 PROCUREMENT ---"
result = CallAPI("ongc_proc_v2_tok", "list all vendors where is_active is true")
Log "Q: list all vendors where is_active is true"
If InStr(result, "row_count") > 0 Then
    rowsPos = InStr(result, """row_count"":")
    sqlPos = InStr(result, """sql"":")
    rowNum = Mid(result, rowsPos + 12, 5)
    Log "SUCCESS - rows=" & Left(rowNum, InStr(rowNum, ",") - 1)
    If sqlPos > 0 Then Log "SQL: " & Mid(result, sqlPos + 7, 120)
ElseIf InStr(result, "detail") > 0 Then
    Log "FAIL: " & result
Else
    Log "RESPONSE: " & Left(result, 300)
End If
Log ""

' --- 006 SAFETY (explicit column name, correct table) ---
Log "--- 006 SAFETY ---"
result = CallAPI("ongc_safe_v2_tok", "show all incidents where is_resolved is false")
Log "Q: show all incidents where is_resolved is false"
If InStr(result, "row_count") > 0 Then
    rowsPos = InStr(result, """row_count"":")
    sqlPos = InStr(result, """sql"":")
    rowNum = Mid(result, rowsPos + 12, 5)
    Log "SUCCESS - rows=" & Left(rowNum, InStr(rowNum, ",") - 1)
    If sqlPos > 0 Then Log "SQL: " & Mid(result, sqlPos + 7, 120)
ElseIf InStr(result, "detail") > 0 Then
    Log "FAIL: " & result
Else
    Log "RESPONSE: " & Left(result, 300)
End If
Log ""

' --- 007 REFINERY ---
Log "--- 007 REFINERY ---"
result = CallAPI("ongc_refinery_v2_tok", "show all refinery units and their capacity")
Log "Q: show all refinery units and their capacity"
If InStr(result, "row_count") > 0 Then
    rowsPos = InStr(result, """row_count"":")
    sqlPos = InStr(result, """sql"":")
    rowNum = Mid(result, rowsPos + 12, 5)
    Log "SUCCESS - rows=" & Left(rowNum, InStr(rowNum, ",") - 1)
    If sqlPos > 0 Then Log "SQL: " & Mid(result, sqlPos + 7, 120)
ElseIf InStr(result, "detail") > 0 Then
    Log "FAIL: " & result
Else
    Log "RESPONSE: " & Left(result, 300)
End If
Log ""

' ── Step 3: Grab AI service logs to see raw Ollama output ────────────────────
Log "========================================"
Log "=== AI SERVICE LOGS (last 50 lines) ==="
Log "========================================"
Log RunSql("SELECT 1;")  ' dummy to reuse RunSql for docker logs below

Dim sh2, tmpLog
tmpLog = "D:\ONGC RAM proj\ai_logs_tmp.txt"
Set sh2 = CreateObject("WScript.Shell")
sh2.Run "cmd /c docker logs vanna_ai_service --tail 50 > """ & tmpLog & """ 2>&1", 0, True
Dim fLog
Set fLog = fso.OpenTextFile(tmpLog, 1)
Log fLog.ReadAll
fLog.Close

Log ""
Log "DONE - " & NowStr()
outFile.Close
WScript.Echo "Test complete. See: " & logFile
