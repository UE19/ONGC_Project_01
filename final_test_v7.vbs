Dim fso, outFile
Dim baseUrl, logFile

baseUrl = "http://localhost"
logFile = "D:\ONGC RAM proj\final_test_v7_result.txt"

Set fso = CreateObject("Scripting.FileSystemObject")
Set outFile = fso.CreateTextFile(logFile, True)

Sub Log(msg)
    outFile.WriteLine msg
End Sub

Function CallAPI(token, question)
    On Error Resume Next
    Dim req, body
    Set req = CreateObject("WinHttp.WinHttpRequest.5.1")
    req.SetTimeouts 10000, 10000, 90000, 90000
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

Function ParseResult(label, resp)
    Dim msg
    If Left(resp, 5) = "ERROR" Then
        msg = "TIMEOUT/NETWORK: " & resp
    ElseIf InStr(resp, "generated_sql") > 0 Then
        Dim rcPos, sqlPos, rowNum, sqlSnip
        rcPos = InStr(resp, """row_count"":")
        sqlPos = InStr(resp, """generated_sql"":""")
        rowNum = Mid(resp, rcPos + 12, 6)
        Dim comma
        comma = InStr(rowNum, ",")
        If comma > 0 Then rowNum = Left(rowNum, comma - 1)
        If sqlPos > 0 Then
            sqlSnip = Mid(resp, sqlPos + 16, 200)
            Dim endQ
            endQ = InStr(sqlSnip, """")
            If endQ > 0 Then sqlSnip = Left(sqlSnip, endQ - 1)
        End If
        msg = "OK rows=" & Trim(rowNum) & " | SQL: " & sqlSnip
    ElseIf InStr(resp, "detail") > 0 Then
        msg = "FAIL: " & Left(resp, 300)
    Else
        msg = "RESP: " & Left(resp, 300)
    End If
    ParseResult = msg
End Function

Log "ONGC Final Test v7 - " & Now()
Log "URL: " & baseUrl & "/api/query | Auth: Bearer <token>"
Log "============================================================"
Log ""

Dim tok, q, resp

' ── 001 FINANCE ─────────────────────────────────────────────────────────────
tok = "ongc_fin_v2_tok"
q = "show all budget allocations"
Log "--- 001 FINANCE ---"
Log "Q: " & q
resp = CallAPI(tok, q)
Log ParseResult("Finance", resp)
Log ""

' ── 002 HR ───────────────────────────────────────────────────────────────────
tok = "ongc_hr_v2_tok"
q = "list all employees with grade and base salary"
Log "--- 002 HR ---"
Log "Q: " & q
resp = CallAPI(tok, q)
Log ParseResult("HR", resp)
Log ""

' ── 003 ASSETS ───────────────────────────────────────────────────────────────
tok = "ongc_assets_v2_tok"
q = "show all equipment assets"
Log "--- 003 ASSETS ---"
Log "Q: " & q
resp = CallAPI(tok, q)
Log ParseResult("Assets", resp)
Log ""

' ── 004 OPERATIONS ───────────────────────────────────────────────────────────
tok = "ongc_ops_v2_tok"
q = "list all wells where is_active is true"
Log "--- 004 OPERATIONS ---"
Log "Q: " & q
resp = CallAPI(tok, q)
Log ParseResult("Operations", resp)
Log ""

' ── 005 PROCUREMENT ──────────────────────────────────────────────────────────
tok = "ongc_proc_v2_tok"
q = "list all vendors where is_active is true"
Log "--- 005 PROCUREMENT ---"
Log "Q: " & q
resp = CallAPI(tok, q)
Log ParseResult("Procurement", resp)
Log ""

' ── 006 SAFETY ───────────────────────────────────────────────────────────────
tok = "ongc_safe_v2_tok"
q = "show all incidents where is_resolved is false"
Log "--- 006 SAFETY ---"
Log "Q: " & q
resp = CallAPI(tok, q)
Log ParseResult("Safety", resp)
Log ""

' ── 007 REFINERY ─────────────────────────────────────────────────────────────
tok = "ongc_refinery_v2_tok"
q = "show all assets"
Log "--- 007 REFINERY ---"
Log "Q: " & q
resp = CallAPI(tok, q)
Log ParseResult("Refinery", resp)
Log ""

Log "============================================================"
Log "DONE - " & Now()
outFile.Close
WScript.Echo "Done! See: " & logFile
