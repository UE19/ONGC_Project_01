# API Documentation
## Vanna AI Database Query Intelligence Platform — v1.0.0

Base URL: `http://your-host/api/v1`
Query Endpoint: `http://your-host/api/query`

All authenticated endpoints require: `Authorization: Bearer <jwt_or_api_token>`

---

## Authentication

### POST /auth/register
Register a new user account.

**Request:**
```json
{ "email": "user@company.com", "username": "johndoe", "full_name": "John Doe", "password": "securepass123" }
```

### POST /auth/login
```json
{ "email": "user@company.com", "password": "securepass123" }
```
**Response:**
```json
{ "access_token": "eyJ...", "refresh_token": "eyJ...", "token_type": "bearer", "user": {...} }
```

### POST /auth/refresh
Refresh access token. Send refresh_token as Bearer in header.

### POST /auth/logout
Invalidate current session.

### POST /auth/change-password
```json
{ "current_password": "old", "new_password": "new_secure_password" }
```

---

## Connection Profiles

### POST /profiles
Create a database connection profile.
```json
{
  "profile_name": "HR Database",
  "db_type": "mysql",
  "host": "db.internal.company.com",
  "port": 3306,
  "database_name": "hr_db",
  "username": "readonly_user",
  "password": "db_password",
  "ssl_mode": "require",
  "allowed_schemas": [],
  "allowed_tables": []
}
```

### GET /profiles
List all connection profiles (owned by user; all for admin).

### GET /profiles/{id}
Get a specific profile.

### PUT /profiles/{id}
Update a profile.

### DELETE /profiles/{id}
Delete a profile and its associated tokens.

### POST /profiles/{id}/test
Test the database connection.
```json
{ "success": true, "message": "Connection successful", "latency_ms": 12.3 }
```

### GET /profiles/{id}/schema
Get ingested schema metadata for a profile.

---

## API Token Management

### POST /tokens
Generate a new API token bound to a profile.
```json
{
  "name": "HR Assistant Token",
  "profile_id": "uuid",
  "permissions": ["query"],
  "rate_limit_per_minute": 60,
  "expires_at": "2025-12-31T00:00:00Z"
}
```
**Response includes `raw_token` — shown only once. Copy immediately.**

### GET /tokens
List all tokens.

### POST /tokens/{id}/revoke
Revoke a token immediately.

### POST /tokens/{id}/rotate
Revoke and issue a new token with same settings.

### GET /tokens/validate
Validate an API token (use API token as Bearer). Returns token metadata.

---

## Query Engine (External Application Endpoint)

### POST /api/query
**Primary endpoint consumed by external applications.**

Headers: `Authorization: Bearer <api_token>`

```json
{
  "question": "Show total gatepasses created this month",
  "page": 1,
  "page_size": 100,
  "explain": false
}
```

**Response:**
```json
{
  "query_id": "uuid",
  "question": "Show total gatepasses created this month",
  "generated_sql": "SELECT COUNT(*) FROM gatepasses WHERE created_at >= '2024-06-01'",
  "sql_explanation": "This query counts all records in the gatepasses table created since June 1st",
  "summary": "248 gatepasses were created this month.",
  "data": [{ "count": 248 }],
  "columns": ["count"],
  "row_count": 1,
  "total_rows": 1,
  "page": 1,
  "page_size": 100,
  "execution_time_ms": 143.5,
  "db_type": "mysql"
}
```

### GET /api/query/history
Query history (JWT auth). Paginated.

### GET /api/query/{query_id}/export/csv
Export query result as CSV.

### GET /api/query/{query_id}/export/excel
Export query result as Excel (.xlsx).

---

## Schema Ingestion & Training

### POST /schema/ingest/{profile_id}
Trigger automatic schema discovery and Vanna AI training. Runs as background task.

### GET /schema/metadata/{profile_id}
Get ingested schema metadata (tables, columns, relationships).

### PUT /schema/metadata/{meta_id}
Manually correct schema metadata.

### POST /schema/glossary
Add a business glossary term to improve AI query understanding.
```json
{
  "profile_id": "uuid",
  "term": "gatepass",
  "definition": "An authorization document for entry/exit",
  "maps_to_table": "gatepasses",
  "maps_to_column": null
}
```

### GET /schema/glossary/{profile_id}
List glossary terms for a profile.

---

## Audit & Monitoring

All audit endpoints require Admin role.

### GET /audit/logs?page=1&page_size=50
Full audit log with all user actions, IP tracking, timestamps.

### GET /audit/query-history
Detailed query history with SQL logs, execution times, row counts.

### GET /audit/token-usage
Per-token usage statistics.

### GET /audit/failed-queries
Failed and blocked query list.

---

## Dashboard

### GET /dashboard/stats
Returns platform analytics:
- Active users, total users
- Database profile count
- Query statistics (total, today, failed, success rate)
- Average response time
- Token usage
- Most queried databases
- Query volume last 7 days

---

## Error Responses

| Code | Meaning |
|------|---------|
| 400 | Bad request / validation error |
| 401 | Authentication required or invalid token |
| 403 | Insufficient permissions or query blocked |
| 404 | Resource not found |
| 422 | Could not generate SQL for question |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
| 503 | AI service unavailable |
