Set oShell = CreateObject("WScript.Shell")
Dim outFile
outFile = "D:\ONGC RAM proj\apply_fixes_result.txt"

' ── Step 1: Clear fake allowed_schemas ────────────────────────────────────────
oShell.Run "cmd /c docker exec -i vanna_postgres psql -U vanna_admin -d vanna_platform -c """ & _
    "UPDATE connection_profiles SET allowed_schemas = '[]'::jsonb, allowed_tables = '[]'::jsonb " & _
    "WHERE allowed_schemas != '[]'::jsonb;" & _
    "SELECT id, profile_name, allowed_schemas FROM connection_profiles ORDER BY id;" & _
    """ > """ & outFile & """ 2>&1", 0, True

' ── Step 2: Copy fixed vanna_engine.py into vanna_ai_service ──────────────────
oShell.Run "cmd /c docker cp """ & _
    "D:\ONGC RAM proj\vanna-platform\vanna-service\vanna_engine.py" & _
    """ vanna_ai_service:/app/vanna_engine.py >> """ & outFile & """ 2>&1", 0, True

' ── Step 3: Copy fixed query_validator.py into vanna_backend ──────────────────
oShell.Run "cmd /c docker cp """ & _
    "D:\ONGC RAM proj\vanna-platform\backend\services\query_validator.py" & _
    """ vanna_backend:/app/services/query_validator.py >> """ & outFile & """ 2>&1", 0, True

' ── Step 4: Restart both containers to pick up changes ────────────────────────
oShell.Run "cmd /c docker restart vanna_ai_service >> """ & outFile & """ 2>&1", 0, True
oShell.Run "cmd /c docker restart vanna_backend >> """ & outFile & """ 2>&1", 0, True

' ── Step 5: Wait for containers to be healthy, then verify ────────────────────
oShell.Run "cmd /c timeout /t 12 /nobreak >> """ & outFile & """ 2>&1", 0, True
oShell.Run "cmd /c docker ps --format ""table {{.Names}}\t{{.Status}}"" >> """ & outFile & """ 2>&1", 0, True

' ── Step 6: Confirm new functions exist in container ─────────────────────────
oShell.Run "cmd /c docker exec vanna_ai_service grep -c ""_fix_sql_tables\|schema_section\|table_hint"" /app/vanna_engine.py >> """ & outFile & """ 2>&1", 0, True

MsgBox "All fixes applied! See apply_fixes_result.txt", vbInformation, "Done"
