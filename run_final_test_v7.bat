@echo off
title ONGC Final Test v7
echo.
echo ============================================================
echo  ONGC Refinery Query Console - Final Verification Test v7
echo  URL: http://localhost/api/query
echo  Auth: Bearer token (correct header)
echo  Tests all 7 profiles
echo ============================================================
echo.

del /f /q "D:\ONGC RAM proj\final_test_v7_result.txt" 2>nul

echo Running all 7 profile tests (each may take up to 60s for Ollama)...
echo Please wait...
echo.
cscript //NoLogo "D:\ONGC RAM proj\final_test_v7.vbs"

echo.
echo --- RESULTS ---
type "D:\ONGC RAM proj\final_test_v7_result.txt"
echo.
pause
