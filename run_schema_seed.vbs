Set oShell = CreateObject("WScript.Shell")
oShell.Run "cmd /c docker exec -i vanna_postgres psql -U vanna_admin -d vanna_platform < ""D:\ONGC RAM proj\seed_schema_meta.sql""", 0, True
MsgBox "Schema metadata updated with is_active column!", vbInformation, "Done"
