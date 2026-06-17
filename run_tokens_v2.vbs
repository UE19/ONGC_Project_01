Set oShell = CreateObject("WScript.Shell")
oShell.Run "cmd /c docker exec -i vanna_postgres psql -U vanna_admin -d vanna_platform < ""D:\ONGC RAM proj\seed_tokens_v2.sql"" > ""D:\ONGC RAM proj\tokens_v2_result.txt"" 2>&1", 0, True
MsgBox "Done! See tokens_v2_result.txt", vbInformation, "Done"
