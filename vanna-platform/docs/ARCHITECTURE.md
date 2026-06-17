# Architecture Document
## Centralized AI-Powered Database Query Intelligence Platform

---

## Overview

The platform is a centralized backend intelligence layer that:
1. Allows users to configure **database connection profiles**
2. Generates **API tokens** bound to specific profiles
3. Exposes natural language querying capabilities to **multiple external applications** simultaneously
4. Maintains complete **audit trails** of all activity

---

## High-Level Architecture Diagram

```
External Applications / Digital Assistants
  ┌────────────┐  ┌─────────────────┐  ┌──────────────────┐
  │HR Assistant│  │Finance Assistant│  │Asset Assistant   │
  │(MySQL)     │  │(PostgreSQL)     │  │(MSSQL)           │
  └─────┬──────┘  └────────┬────────┘  └────────┬─────────┘
        │ Bearer Token      │ Bearer Token       │ Bearer Token
        └──────────────────┬┘                   │
                           ▼                    │
                    ┌──────────────┐            │
                    │    Nginx     │◄───────────┘
                    │ Reverse Proxy│
                    │ Rate Limiting│
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐  ┌──────────┐     │
        │ Frontend │  │ Backend  │     │
        │ (React)  │  │  API     │     │
        │ Admin UI │  │(FastAPI) │     │
        └──────────┘  └────┬─────┘     │
                           │           │
              ┌────────────┼───────┐   │
              ▼            ▼       ▼   │
        ┌──────────┐  ┌──────┐  ┌──────────────┐
        │PostgreSQL│  │Redis │  │Vanna AI      │
        │Metadata  │  │Cache │  │Service       │
        │DB        │  │Queue │  │(per-profile  │
        └──────────┘  └──────┘  │ instances)   │
                                └──────────────┘
                                        │
                              AI trains on schema,
                              generates SQL, explains,
                              summarizes per profile
                                        │
                    ┌───────────────────┼────────────────────────┐
                    ▼                   ▼                        ▼
              ┌──────────┐      ┌────────────┐         ┌──────────────┐
              │PostgreSQL│      │  MySQL /   │         │ MSSQL /      │
              │(target)  │      │  MariaDB   │         │ Oracle /     │
              │          │      │  (target)  │         │ MongoDB      │
              └──────────┘      └────────────┘         └──────────────┘
```

---

## Components

### 4.1 Administrative Portal (React Frontend)
- Web-based management interface
- User management, RBAC
- Connection profile creation (all 11 required fields)
- API token generation, revocation, rotation
- Schema ingestion & training trigger
- Query audit monitoring
- Usage analytics dashboard

### 4.2 Centralized Vanna AI Service
- Standalone Python microservice
- Maintains one Vanna instance per connection profile (schema-isolated)
- Handles: schema understanding, metadata ingestion, NL interpretation, SQL generation, query optimization, explanation, contextual response generation
- Serves multiple applications simultaneously

### 4.3 Query Execution Gateway (FastAPI Backend)
- API token validation and profile mapping
- Query validation (blocks INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, EXEC, stored procedures)
- SQL injection detection
- Table/schema-level access control
- Result formatting (JSON, paginated)
- CSV/Excel export
- Response summarization

### 4.4 External Applications / Digital Assistants
Each application uses an API token that uniquely identifies:
- The user (owner)
- The database profile (connection target)
- The database type
- Permissions and access scope

Applications remain fully isolated — HR Assistant can only access MySQL HR data, Finance Assistant can only access PostgreSQL finance data.

---

## Security Architecture

```
Request → Nginx (TLS, Rate Limit) 
       → FastAPI (JWT/Token Auth) 
       → Query Validator (SQL Injection, DML Block)
       → DB Connector (Read-Only, SSL)
       → Audit Logger (every action)
```

- Passwords encrypted with AES-256 (Fernet) at rest
- API tokens stored as SHA-256 hashes
- JWT for portal sessions (HS256, configurable TTL)
- Read-only enforcement at both application and SQL validation layers
- Per-token and per-IP rate limiting via Redis

---

## Data Flow: Natural Language Query

```
User/App: "Show total orders this month"
    │
    ▼
POST /api/query  (Bearer: api_token)
    │
    ▼
1. Token validation → profile resolution
2. Rate limit check (per-token, per-IP)
3. NL sanitization (remove control chars, length check)
    │
    ▼
4. Vanna AI Service: NL → SQL
   (uses trained schema context for this profile)
    │
    ▼
5. SQL Validation Layer:
   - Block DML/DDL keywords
   - SQL injection pattern detection
   - Table/schema access control
    │
    ▼
6. Execute SQL on target DB (read-only connection)
    │
    ▼
7. Format results (JSON, paginated)
8. Generate AI summary: "248 orders were placed this month"
    │
    ▼
9. Log to query_history + audit_logs
    │
    ▼
Response: {generated_sql, summary, data[], columns, execution_time_ms}
```

---

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Backend API | FastAPI (Python 3.11), SQLAlchemy 2 (async) |
| AI Engine | Vanna AI + OpenAI (gpt-4o-mini) |
| Metadata Database | PostgreSQL 15 |
| Cache / Queue | Redis 7 |
| Reverse Proxy | Nginx 1.25 |
| Containerization | Docker + Docker Compose |
| Orchestration | Kubernetes (optional) |
| Authentication | JWT (python-jose) + OAuth2 |
| ORM | SQLAlchemy 2 (async) |
| Password Hashing | bcrypt (passlib) |
| Field Encryption | AES-256 via Fernet (cryptography) |
| Async Tasks | Celery + Redis |
