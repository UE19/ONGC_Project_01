Set oShell = CreateObject("WScript.Shell")
' Run schema seed + rebuild with visible window (wait for completion)
oShell.Run "cmd /c docker exec -i vanna_postgres psql -U vanna_admin -d vanna_platform < ""D:\ONGC RAM proj\seed_all_schemas.sql"" > ""D:\ONGC RAM proj\schema_seed_result.txt"" 2>&1", 0, True

' Now rebuild the vanna-service
oShell.Run "cmd /c cd /d ""D:\ONGC RAM proj\vanna-platform"" && docker compose build vanna-service --no-cache > ""D:\ONGC RAM proj\rebuild_result.txt"" 2>&1", 0, True

' Restart the service
oShell.Run "cmd /c cd /d ""D:\ONGC RAM proj\vanna-platform"" && docker compose up -d vanna-service >> ""D:\ONGC RAM proj\rebuild_result.txt"" 2>&1", 0, True

MsgBox "Done! Check schema_seed_result.txt and rebuild_result.txt in D:\ONGC RAM proj", vbInformation, "Fix Complete"
