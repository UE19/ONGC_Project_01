Set oShell = CreateObject("WScript.Shell")

' Clear allowed_schemas for all profiles (all DBs now use public schema on PostgreSQL)
oShell.Run "cmd /c docker exec -i vanna_postgres psql -U vanna_admin -d vanna_platform -c ""UPDATE connection_profiles SET allowed_schemas = '[]'::jsonb WHERE allowed_schemas != '[]'::jsonb; SELECT id, profile_name, allowed_schemas FROM connection_profiles;"" > ""D:\ONGC RAM proj\fix_schemas_result.txt"" 2>&1", 0, True

MsgBox "Done! See fix_schemas_result.txt", vbInformation, "Fixed"
