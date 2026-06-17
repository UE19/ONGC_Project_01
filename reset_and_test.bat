@echo off
echo === KILL STUCK WSCRIPT === > "D:\ONGC RAM proj\reset_result.txt"
taskkill /F /IM wscript.exe >> "D:\ONGC RAM proj\reset_result.txt" 2>&1

echo === RESTART AI SERVICE (clear stuck Ollama calls) === >> "D:\ONGC RAM proj\reset_result.txt"
docker restart vanna_ai_service >> "D:\ONGC RAM proj\reset_result.txt" 2>&1
timeout /t 8 /nobreak > nul

echo === HEALTH CHECK === >> "D:\ONGC RAM proj\reset_result.txt"
docker exec vanna_ai_service curl -s http://localhost:8001/health >> "D:\ONGC RAM proj\reset_result.txt" 2>&1

echo === TEST FINANCE WITH CURL (30s timeout) === >> "D:\ONGC RAM proj\reset_result.txt"
curl -s -m 60 -X POST http://localhost:8000/api/v1/query/ask -H "Content-Type: application/json" -H "X-API-Token: ongc_fin_v2_tok" -d "{\"question\":\"show all budget allocations\"}" >> "D:\ONGC RAM proj\reset_result.txt" 2>&1

echo === TEST HR WITH CURL (sanity check) === >> "D:\ONGC RAM proj\reset_result.txt"
curl -s -m 60 -X POST http://localhost:8000/api/v1/query/ask -H "Content-Type: application/json" -H "X-API-Token: ongc_hr_v2_tok" -d "{\"question\":\"list all employees\"}" >> "D:\ONGC RAM proj\reset_result.txt" 2>&1

echo === BACKEND LOGS (last 30) === >> "D:\ONGC RAM proj\reset_result.txt"
docker logs vanna_backend --tail 30 >> "D:\ONGC RAM proj\reset_result.txt" 2>&1

echo Done >> "D:\ONGC RAM proj\reset_result.txt"
