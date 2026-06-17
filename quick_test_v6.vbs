Dim http, fso, outFile, result
Dim baseUrl, logFile

baseUrl = "http://localhost:8000"
logFile = "D:\ONGC RAM proj\quick_test_v6_result.txt"

Set fso = CreateObject("Scripting.FileSystemObject")
Set outFile = fso.CreateTextFile(logFile, True)

Sub Log(msg)
    outFile.WriteLine msg
End Sub

Function CallAPI(token, question)
    On Error Resume Next
    Dim req, body
    Set req = CreateObject("WinHttp.WinHttpRequest.5.1")
    ' Set 45 second timeout: resolve, connect, send, receive
    req.SetTimeouts 15000, 15000, 45000, 45000
    req.Open "POST", baseUrl & "/api/v1/query/ask", False
    req.SetRequestHeader "Content-Type", "application/json"
    req.SetRequestHeader "X-API-Token", token
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

Log "ONGC Quick Test v6 - " & Now()
Log "========================="
Log ""

' Test each profile
Dim profiles(6, 1)
profiles(0, 0) = "ongc_fin_v2_tok"
profiles(0, 1) = "show all budget allocations"
profiles(1, 0) = "ongc_hr_v2_tok"
profiles(1, 1) = "list all employees"
profiles(2, 0) = "ongc_assets_v2_tok"
profiles(2, 1) = "show all equipment assets"
profiles(3, 0) = "ongc_ops_v2_tok"
profiles(3, 1) = "list all wells where is_active is true"
profiles(4, 0) = "ongc_proc_v2_tok"
profiles(4, 1) = "list all vendors where is_active is true"
profiles(5, 0) = "ongc_safe_v2_tok"
profiles(5, 1) = "show all incidents where is_resolved is false"
profiles(6, 0) = "ongc_refinery_v2_tok"
profiles(6, 1) = "show all refinery units"

Dim i, tok, q, resp
For i = 0 To 6
    tok = profiles(i, 0)
    q = profiles(i, 1)
    Log "--- Token: " & tok & " ---"
    Log "Q: " & q
    Log "Sending..."
    outFile.Flush
    resp = CallAPI(tok, q)
    If Left(resp, 5) = "ERROR" Then
        Log "TIMEOUT/ERROR: " & resp
    ElseIf InStr(resp, "row_count") > 0 Then
        Dim rcPos, sqlPos
        rcPos = InStr(resp, """row_count"":")
        sqlPos = InStr(resp, """sql"":")
        Dim rowNum
        rowNum = Mid(resp, rcPos + 12, 6)
        Dim comma
        comma = InStr(rowNum, ",")
        If comma > 0 Then rowNum = Left(rowNum, comma - 1)
        Log "SUCCESS rows=" & Trim(rowNum)
        If sqlPos > 0 Then Log "SQL: " & Mid(resp, sqlPos + 7, 150)
    ElseIf InStr(resp, "detail") > 0 Then
        Log "FAIL: " & Left(resp, 200)
    Else
        Log "RESP: " & Left(resp, 200)
    End If
    Log ""
Next

Log "DONE " & Now()
outFile.Close
WScript.Echo "Done. See: " & logFile
