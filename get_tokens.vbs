Set oShell = CreateObject("WScript.Shell")

' Get all API tokens with their profile bindings
oShell.Run "cmd /c docker exec -i vanna_postgres psql -U vanna_admin -d vanna_platform -c ""SELECT t.token_value, t.name, t.status, p.profile_name, p.database_name FROM api_tokens t JOIN connection_profiles p ON t.profile_id = p.id ORDER BY p.id;"" > ""D:\ONGC RAM proj\tokens_result.txt"" 2>&1", 0, True

MsgBox "Done! See tokens_result.txt", vbInformation, "Tokens"
