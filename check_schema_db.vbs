Set oShell = CreateObject("WScript.Shell")
Dim out
out = "D:\ONGC RAM proj\schema_check_result.txt"

' Check schema_metadata rows per profile
oShell.Run "cmd /c docker exec vanna_postgres psql -U vanna_admin -d vanna_db -c ""SELECT profile_id, table_name, LEFT(column_definitions::text, 80) as col_def_preview FROM schema_metadata ORDER BY profile_id, table_name;"" > """ & out & """ 2>&1", 0, True

' Also check connection_profiles ids
oShell.Run "cmd /c docker exec vanna_postgres psql -U vanna_admin -d vanna_db -c ""SELECT id, name FROM connection_profiles ORDER BY name;"" >> """ & out & """ 2>&1", 0, True

' Check api_tokens with profile_id for assets token
oShell.Run "cmd /c docker exec vanna_postgres psql -U vanna_admin -d vanna_db -c ""SELECT t.name, t.profile_id, p.name as profile_name FROM api_tokens t JOIN connection_profiles p ON t.profile_id = p.id WHERE t.name LIKE '%asset%' OR t.name LIKE '%safe%' OR t.name LIKE '%fin%';"" >> """ & out & """ 2>&1", 0, True

MsgBox "Done! See schema_check_result.txt", vbInformation, "DB Check"
