#!/usr/bin/env bash
set -euo pipefail

# Smoke test for Vanna platform (docker-compose based)
# Usage:
#   ./smoke_test.sh [--no-up] [--admin-jwt TOKEN]
# Requires: docker and docker compose available locally.

NO_UP=0
ADMIN_JWT=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-up) NO_UP=1; shift ;;
    --admin-jwt) ADMIN_JWT="$2"; shift 2 ;;
    -h|--help) echo "Usage: $0 [--no-up] [--admin-jwt TOKEN]"; exit 0 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_FILE="docker-compose.yml"

if [[ $NO_UP -eq 0 ]]; then
  echo "Bringing up containers... (this may take a while)"
  docker compose -f "$COMPOSE_FILE" up -d --build
fi

# Wait helper
wait_for_http() {
  url="$1"
  timeout=${2:-120}
  echo "Waiting for $url (timeout ${timeout}s) ..."
  start=$(date +%s)
  while true; do
    if curl -fsS --max-time 5 "$url" > /dev/null 2>&1; then
      echo "OK: $url"
      return 0
    fi
    now=$(date +%s)
    if (( now - start > timeout )); then
      echo "TIMEOUT waiting for $url" >&2
      return 1
    fi
    sleep 2
  done
}

# Check endpoints
wait_for_http "http://localhost/" 60 || true
wait_for_http "http://localhost/api/openapi.json" 120
wait_for_http "http://localhost/api/v1/health/vanna" 60 || true
wait_for_http "http://localhost/health" 60
wait_for_http "http://localhost:3000/health" 60 || true

# Basic API checks
echo "Fetching OpenAPI title..."
curl -s http://localhost/api/openapi.json | jq -r '.info.title' || true

echo "Checking backend health..."
curl -s http://localhost/api/v1/health/vanna | jq . || true

# If ADMIN_JWT provided, run authenticated checks
if [[ -n "$ADMIN_JWT" ]]; then
  echo "Running authenticated checks (using provided ADMIN_JWT)"
  echo "Calling /api/v1/audit/logs (first page)"
  curl -s -H "Authorization: Bearer $ADMIN_JWT" "http://localhost/api/v1/audit/logs?page=1&page_size=3" | jq . || true
  echo "Calling /api/v1/tokens/validate"
  curl -s -H "Authorization: Bearer $ADMIN_JWT" "http://localhost/api/v1/tokens/validate" | jq . || true
else
  echo "No ADMIN_JWT provided; skipping authenticated checks."
fi

echo "Smoke test completed."

# Optionally show container status
echo "Containers status summary:"
docker compose -f "$COMPOSE_FILE" ps
