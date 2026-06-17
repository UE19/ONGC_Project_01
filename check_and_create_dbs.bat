@echo off
echo === LIST ALL POSTGRES DATABASES === > "D:\ONGC RAM proj\db_check_result.txt"
docker exec vanna_postgres psql -U vanna_admin -d vanna_platform -c "\l" >> "D:\ONGC RAM proj\db_check_result.txt" 2>&1

echo === CHECK TABLES IN EACH DB === >> "D:\ONGC RAM proj\db_check_result.txt"
docker exec vanna_postgres psql -U vanna_admin -d ongc_finance -c "\dt" >> "D:\ONGC RAM proj\db_check_result.txt" 2>&1
docker exec vanna_postgres psql -U vanna_admin -d ongc_hr -c "\dt" >> "D:\ONGC RAM proj\db_check_result.txt" 2>&1
docker exec vanna_postgres psql -U vanna_admin -d ongc_assets -c "\dt" >> "D:\ONGC RAM proj\db_check_result.txt" 2>&1
docker exec vanna_postgres psql -U vanna_admin -d ongc_operations -c "\dt" >> "D:\ONGC RAM proj\db_check_result.txt" 2>&1
docker exec vanna_postgres psql -U vanna_admin -d ongc_procurement -c "\dt" >> "D:\ONGC RAM proj\db_check_result.txt" 2>&1
docker exec vanna_postgres psql -U vanna_admin -d ongc_safety -c "\dt" >> "D:\ONGC RAM proj\db_check_result.txt" 2>&1
docker exec vanna_postgres psql -U vanna_admin -d ongc_refinery -c "\dt" >> "D:\ONGC RAM proj\db_check_result.txt" 2>&1

echo Done >> "D:\ONGC RAM proj\db_check_result.txt"
