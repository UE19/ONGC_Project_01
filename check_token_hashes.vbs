Set oShell = CreateObject("WScript.Shell")

' Check what token hashes exist for each profile, and test our known tokens
oShell.Run "cmd /c docker exec -i vanna_postgres psql -U vanna_admin -d vanna_platform -c ""SELECT t.id, t.name, t.token_hash, t.status, p.profile_name FROM api_tokens t JOIN connection_profiles p ON t.profile_id = p.id WHERE t.status = 'active' ORDER BY p.id;"" > ""D:\ONGC RAM proj\hash_check.txt"" 2>&1", 0, True

MsgBox "Done! See hash_check.txt", vbInformation, "Hash Check"
