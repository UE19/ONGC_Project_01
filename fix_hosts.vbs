Set oShell = CreateObject("WScript.Shell")

' Fix all connection profiles to use correct Docker service hostname "postgres"
oShell.Run "cmd /c docker exec -i vanna_postgres psql -U vanna_admin -d vanna_platform -c ""UPDATE connection_profiles SET host = 'postgres', port = 5432 WHERE host = 'vanna_postgres';"" > ""D:\ONGC RAM proj\fix_hosts_result.txt"" 2>&1", 0, True

' Verify the fix
oShell.Run "cmd /c docker exec -i vanna_postgres psql -U vanna_admin -d vanna_platform -c ""SELECT id, profile_name, host, port, database_name FROM connection_profiles ORDER BY id;"" >> ""D:\ONGC RAM proj\fix_hosts_result.txt"" 2>&1", 0, True

MsgBox "Host fix done! See fix_hosts_result.txt", vbInformation, "Done"
