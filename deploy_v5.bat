@echo off
echo === DEPLOY VANNA ENGINE v5 === > "D:\ONGC RAM proj\deploy_v5_result.txt"

REM Copy updated vanna_engine.py to container
docker cp "D:\ONGC RAM proj\vanna-platform\vanna-service\vanna_engine.py" vanna_ai_service:/app/vanna_engine.py >> "D:\ONGC RAM proj\deploy_v5_result.txt" 2>&1

REM Restart the AI service to reload code
docker restart vanna_ai_service >> "D:\ONGC RAM proj\deploy_v5_result.txt" 2>&1

REM Wait for it to come back up
timeout /t 8 /nobreak >> "D:\ONGC RAM proj\deploy_v5_result.txt" 2>&1

REM Verify key lines in deployed file
echo === VERIFY BOOL COMMENT IN _build_schema_ddl === >> "D:\ONGC RAM proj\deploy_v5_result.txt"
docker exec vanna_ai_service grep -n "use.*TRUE.*FALSE\|BOOLEAN.*BOOL\|is_active.*all_cols\|is_resolved.*all_cols\|Double quotes\|Backtick\|Unquoted\|resolved.*FALSE\|fix_columns.*all_cols" /app/vanna_engine.py >> "D:\ONGC RAM proj\deploy_v5_result.txt" 2>&1

REM Verify health endpoint
echo === HEALTH CHECK === >> "D:\ONGC RAM proj\deploy_v5_result.txt"
docker exec vanna_ai_service curl -s http://localhost:8001/health >> "D:\ONGC RAM proj\deploy_v5_result.txt" 2>&1

echo Done >> "D:\ONGC RAM proj\deploy_v5_result.txt"
