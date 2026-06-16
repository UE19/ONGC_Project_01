@echo off
echo === FIX FINANCE TOKEN === > "D:\ONGC RAM proj\fix_all_result.txt"
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "UPDATE api_tokens SET status='revoked', revoked_at=NOW() WHERE name='Finance Test Token v2' AND token_hash LIKE '76c9674e%%';" >> "D:\ONGC RAM proj\fix_all_result.txt" 2>&1
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "UPDATE api_tokens SET status='active', revoked_at=NULL WHERE name='Finance Test Token v2' AND token_hash LIKE 'a939a27f%%';" >> "D:\ONGC RAM proj\fix_all_result.txt" 2>&1

echo === FIX REFINERY TOKEN === >> "D:\ONGC RAM proj\fix_all_result.txt"
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "UPDATE api_tokens SET status='revoked', revoked_at=NOW() WHERE name='Refinery Test Token v2' AND token_hash LIKE '7d64545e%%';" >> "D:\ONGC RAM proj\fix_all_result.txt" 2>&1
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "UPDATE api_tokens SET status='active', revoked_at=NULL WHERE name='Refinery Test Token v2' AND token_hash LIKE 'de590923%%';" >> "D:\ONGC RAM proj\fix_all_result.txt" 2>&1

echo === VERIFY TOKENS === >> "D:\ONGC RAM proj\fix_all_result.txt"
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "SELECT name, status, LEFT(token_hash,16) FROM api_tokens WHERE name LIKE '%%v2%%' AND status='active' ORDER BY name;" >> "D:\ONGC RAM proj\fix_all_result.txt" 2>&1

echo === CHECK VANNA ENGINE _fix_sql_columns === >> "D:\ONGC RAM proj\fix_all_result.txt"
docker exec vanna_ai_service grep -n "is_active\|status.*active\|all_cols" /app/vanna_engine.py >> "D:\ONGC RAM proj\fix_all_result.txt" 2>&1

echo Done >> "D:\ONGC RAM proj\fix_all_result.txt"
