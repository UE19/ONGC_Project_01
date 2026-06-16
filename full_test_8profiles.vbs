Dim fso, outFile
Dim baseUrl, logFile

baseUrl = "http://localhost"
logFile = "D:\ONGC RAM proj\full_test_8profiles_result.txt"

Set fso = CreateObject("Scripting.FileSystemObject")
Set outFile = fso.CreateTextFile(logFile, True)

Sub Log(msg)
    outFile.WriteLine msg
End Sub

Function CallAPI(token, question)
    On Error Resume Next
    Dim req, body
    Set req = CreateObject("WinHttp.WinHttpRequest.5.1")
    req.SetTimeouts 10000, 10000, 120000, 120000
    req.Open "POST", baseUrl & "/api/query", False
    req.SetRequestHeader "Content-Type", "application/json"
    req.SetRequestHeader "Authorization", "Bearer " & token
    body = "{""question"":""" & question & """}"
    req.Send body
    If Err.Number <> 0 Then
        CallAPI = "ERROR: " & Err.Description
        Err.Clear
    Else
        CallAPI = req.ResponseText
    End If
    On Error GoTo 0
End Function

Function ParseResult(resp)
    Dim msg
    If Left(resp, 5) = "ERROR" Then
        msg = "TIMEOUT/NETWORK: " & resp
    ElseIf InStr(resp, """row_count"":") > 0 Then
        ' Success — has row_count key
        Dim rcPos, rowNum
        rcPos = InStr(resp, """row_count"":")
        rowNum = Mid(resp, rcPos + 12, 6)
        Dim comma : comma = InStr(rowNum, ",")
        If comma > 0 Then rowNum = Left(rowNum, comma - 1)
        msg = "OK rows=" & Trim(rowNum)
    ElseIf InStr(resp, """detail"":") > 0 Then
        ' Error — has detail key (JSON error response)
        msg = "FAIL: " & Left(resp, 500)
    Else
        msg = "RESP: " & Left(resp, 300)
    End If
    ParseResult = msg
End Function

Log "ONGC Full Test - All 8 Profiles - " & Now()
Log "============================================================"
Log ""

Dim tok, q, resp, result
Dim passCount : passCount = 0
Dim failCount : failCount = 0

' ── 001 FINANCE ──────────────────────────────────────────────
tok = "ongc_fin_v2_tok"
q = "list all records from budget_allocations table"
Log "--- 001 FINANCE (PostgreSQL) ---"
Log "Q: " & q
resp = CallAPI(tok, q)
result = ParseResult(resp)
Log result
If Left(result, 2) = "OK" Then passCount = passCount + 1 Else failCount = failCount + 1
Log ""

' ── 002 HR ───────────────────────────────────────────────────
tok = "ongc_hr_v2_tok"
q = "list all records from employees table"
Log "--- 002 HR (PostgreSQL) ---"
Log "Q: " & q
resp = CallAPI(tok, q)
result = ParseResult(resp)
Log result
If Left(result, 2) = "OK" Then passCount = passCount + 1 Else failCount = failCount + 1
Log ""

' ── 003 ASSETS ───────────────────────────────────────────────
tok = "ongc_assets_v2_tok"
q = "list all records from equipment_assets table"
Log "--- 003 ASSETS (PostgreSQL) ---"
Log "Q: " & q
resp = CallAPI(tok, q)
result = ParseResult(resp)
Log result
If Left(result, 2) = "OK" Then passCount = passCount + 1 Else failCount = failCount + 1
Log ""

' ── 004 OPERATIONS ───────────────────────────────────────────
tok = "ongc_ops_v2_tok"
q = "list all records from wells table"
Log "--- 004 OPERATIONS (PostgreSQL) ---"
Log "Q: " & q
resp = CallAPI(tok, q)
result = ParseResult(resp)
Log result
If Left(result, 2) = "OK" Then passCount = passCount + 1 Else failCount = failCount + 1
Log ""

' ── 005 PROCUREMENT ──────────────────────────────────────────
tok = "ongc_proc_v2_tok"
q = "list all records from vendors table"
Log "--- 005 PROCUREMENT (PostgreSQL) ---"
Log "Q: " & q
resp = CallAPI(tok, q)
result = ParseResult(resp)
Log result
If Left(result, 2) = "OK" Then passCount = passCount + 1 Else failCount = failCount + 1
Log ""

' ── 006 SAFETY ───────────────────────────────────────────────
tok = "ongc_safe_v2_tok"
q = "list all records from incidents table"
Log "--- 006 SAFETY (PostgreSQL) ---"
Log "Q: " & q
resp = CallAPI(tok, q)
result = ParseResult(resp)
Log result
If Left(result, 2) = "OK" Then passCount = passCount + 1 Else failCount = failCount + 1
Log ""

' ── 007 REFINERY ─────────────────────────────────────────────
tok = "ongc_refinery_v2_tok"
q = "list all records from refinery_assets table"
Log "--- 007 REFINERY (PostgreSQL) ---"
Log "Q: " & q
resp = CallAPI(tok, q)
result = ParseResult(resp)
Log result
If Left(result, 2) = "OK" Then passCount = passCount + 1 Else failCount = failCount + 1
Log ""

' ── 008 MONGODB ──────────────────────────────────────────────
tok = "ongc_mongo_v2_tok"
q = "list all records from sensor_readings collection"
Log "--- 008 MONGODB (Field Operations) ---"
Log "Q: " & q
resp = CallAPI(tok, q)
result = ParseResult(resp)
Log result
If Left(result, 2) = "OK" Then passCount = passCount + 1 Else failCount = failCount + 1
Log ""

Log "============================================================"
Log "FINAL SCORE: " & passCount & "/8 PASSED | " & failCount & " FAILED"
Log "DONE - " & Now()
outFile.Close
WScript.Echo "Done! Results in: " & logFile
