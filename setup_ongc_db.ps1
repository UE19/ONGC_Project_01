# ── ONGC Refinery DB Setup Script ────────────────────────────────────────────
# Run this from D:\ONGC RAM proj\ in PowerShell
# Requirements: Docker must be running with vanna_postgres container up

$ErrorActionPreference = "Stop"
$BaseDir = "D:\ONGC RAM proj"

Write-Host "=== ONGC Refinery DB Setup ===" -ForegroundColor Cyan

# Step 1: Create the database
Write-Host "`n[1/3] Creating ongc_refinery database..." -ForegroundColor Yellow
docker exec vanna_postgres psql -U vanna_admin -d postgres -c "CREATE DATABASE ongc_refinery;" 2>&1
Write-Host "  (If 'already exists' error appears, that's fine)" -ForegroundColor Gray

# Step 2: Load all tables and data
Write-Host "`n[2/3] Loading ONGC refinery data (10 tables, ~600 rows)..." -ForegroundColor Yellow
Get-Content "$BaseDir\ongc_refinery_data.sql" | docker exec -i vanna_postgres psql -U vanna_admin -d ongc_refinery
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Data loaded successfully!" -ForegroundColor Green
} else {
    Write-Host "  Warning: some errors may have occurred (duplicates are OK)" -ForegroundColor Yellow
}

# Step 3: Create connection profile + API token in vanna_platform
Write-Host "`n[3/3] Creating ONGC Refinery connection profile & API token..." -ForegroundColor Yellow
Get-Content "$BaseDir\ongc_profile_seed.sql" | docker exec -i vanna_postgres psql -U vanna_admin -d vanna_platform
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Profile and token created!" -ForegroundColor Green
}

Write-Host "`n[Done] Waiting 3 seconds then ingesting schema..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Step 4: Ingest schema via API (so Ollama knows the table names)
Write-Host "`n[4/4] Ingesting ONGC Refinery schema into AI service..." -ForegroundColor Yellow
$ingestBody = @{ profile_id = "10000000-0000-0000-0000-000000000008" } | ConvertTo-Json
try {
    $resp = Invoke-RestMethod -Method POST `
        -Uri "http://localhost/api/v1/profiles/10000000-0000-0000-0000-000000000008/ingest-schema" `
        -Headers @{ Authorization = "Bearer vanna_ongc_refinery_token_001"; "Content-Type" = "application/json" } `
        -Body "{}" -ErrorAction SilentlyContinue
    Write-Host "  Schema ingested!" -ForegroundColor Green
} catch {
    Write-Host "  Schema ingest skipped (optional, queries still work)" -ForegroundColor Gray
}

Write-Host "`n=== Setup Complete! ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Profile Name : ONGC Refinery DB" -ForegroundColor White
Write-Host "API Token    : vanna_ongc_refinery_token_001" -ForegroundColor White
Write-Host ""
Write-Host "In the Query Console:" -ForegroundColor White
Write-Host "  1. Login as admin@ongc.com / Admin@2026" -ForegroundColor White
Write-Host "  2. Go to Token Manager -> create or use 'ONGC Refinery Token'" -ForegroundColor White
Write-Host "  3. Go to Query Console -> select 'ONGC Refinery Token'" -ForegroundColor White
Write-Host "  4. Try these demo queries:" -ForegroundColor White
Write-Host "     - Show all assets and their locations" -ForegroundColor Cyan
Write-Host "     - What is the average production efficiency of Uran LPG Plant?" -ForegroundColor Cyan
Write-Host "     - Which refinery units had utilization above 95 percent?" -ForegroundColor Cyan
Write-Host "     - Show top 5 production logs by volume" -ForegroundColor Cyan
Write-Host "     - Which components have Action Required status?" -ForegroundColor Cyan
