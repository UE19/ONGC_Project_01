Set oShell = CreateObject("WScript.Shell")

' Check if new vanna_engine.py is in the container
oShell.Run "cmd /c docker exec vanna_ai_service grep -c ""_build_schema_ddl\|_fix_sql_columns"" /app/vanna_engine.py > ""D:\ONGC RAM proj\container_check.txt"" 2>&1", 0, True

' Also check tail of rebuild_result.txt for completion status
oShell.Run "cmd /c more +400 ""D:\ONGC RAM proj\rebuild_result.txt"" >> ""D:\ONGC RAM proj\container_check.txt"" 2>&1", 0, True

MsgBox "Done! See container_check.txt", vbInformation, "Check"
