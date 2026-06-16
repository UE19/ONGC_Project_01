Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

strFolder = objFSO.GetParentFolderName(WScript.ScriptFullName)
strSQL = strFolder & "\seed_data.sql"
strLog = strFolder & "\seed_output.log"

' Run seed SQL
strCmd = "cmd /c docker exec -i vanna_postgres psql -U vanna_admin -d vanna_platform < """ & strSQL & """"
objShell.Run strCmd, 1, True

' Run row count check and save to log
strCmd2 = "cmd /c docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c ""SELECT 'users' AS tbl,COUNT(*) FROM users UNION ALL SELECT 'connection_profiles',COUNT(*) FROM connection_profiles UNION ALL SELECT 'api_tokens',COUNT(*) FROM api_tokens UNION ALL SELECT 'query_history',COUNT(*) FROM query_history UNION ALL SELECT 'schema_metadata',COUNT(*) FROM schema_metadata UNION ALL SELECT 'business_glossary',COUNT(*) FROM business_glossary;"" > """ & strLog & """ 2>&1"
objShell.Run strCmd2, 0, True

MsgBox "Seed complete! Check seed_output.log in the same folder.", 64, "Vanna AI Seed"
