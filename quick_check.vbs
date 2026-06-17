Option Explicit
Dim wsh, fso, out
Set wsh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
Set out = fso.CreateTextFile("D:\ONGC RAM proj\quick_result.txt", True)

Sub Run(label, cmd)
    Dim exec
    Set exec = wsh.Exec("cmd /c " & cmd)
    Do While exec.Status = 0 : WScript.Sleep 300 : Loop
    out.WriteLine "=== " & label & " ==="
    out.WriteLine exec.StdOut.ReadAll()
    If exec.StdErr.ReadAll() <> "" Then out.WriteLine "ERR: " & exec.StdErr.ReadAll()
End Sub

' Kill any stuck wscript running the old vbs
wsh.Run "cmd /c taskkill /F /IM wscript.exe /FI ""WINDOWTITLE ne quick_check*""", 0, False
WScript.Sleep 1000

' Check all tokens in DB
Run "DB TOKENS", "docker exec vanna_postgres psql -U vanna_admin -d vanna_db -c ""SELECT name, token_hash, is_active FROM api_tokens ORDER BY name;"""

' Check Finance token specifically - raw hash check
Run "FINANCE HASH CHECK", "docker exec vanna_postgres psql -U vanna_admin -d vanna_db -c ""SELECT name, is_active, LEFT(token_hash,16) as hash_prefix FROM api_tokens WHERE name ILIKE '%finance%' OR name ILIKE '%001%';"""

' Check container status
Run "CONTAINER STATUS", "docker ps --filter name=vanna --format ""{{.Names}} {{.Status}}"""

out.Close
WScript.Echo "Done. Check quick_result.txt"
