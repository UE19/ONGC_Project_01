Set oShell = CreateObject("WScript.Shell")

oShell.Run "cmd /c docker exec -i vanna_postgres psql -U vanna_admin -d vanna_platform < ""D:\ONGC RAM proj\seed_tokens.sql"" > ""D:\ONGC RAM proj\seed_tokens_result.txt"" 2>&1", 0, True

MsgBox "Tokens seeded! See seed_tokens_result.txt", vbInformation, "Done"
