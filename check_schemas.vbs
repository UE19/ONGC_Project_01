Set oShell = CreateObject("WScript.Shell")
oShell.Run "cmd /c docker exec -i vanna_postgres psql -U vanna_admin -d vanna_platform -c ""SELECT id, profile_name, allowed_schemas, allowed_tables FROM connection_profiles ORDER BY id;"" > ""D:\ONGC RAM proj\schemas_check.txt"" 2>&1", 0, True
MsgBox "Done!", vbInformation, "Check"
