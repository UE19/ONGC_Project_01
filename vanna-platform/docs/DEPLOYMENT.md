# Deployment Guide
## Centralized AI-Powered Database Query Intelligence Platform

---

## Prerequisites

- Docker Engine 24+ and Docker Compose v2+
- OpenAI API key (for Vanna AI)
- (Optional) Kubernetes 1.28+ for orchestration

---

## Quick Start

### 1. Clone and Configure

```bash
cd vanna-platform
cp .env.example .env
```

Edit `.env` and fill in:
- `SECRET_KEY` — generate with `python -c "import secrets; print(secrets.token_hex(32))"`
- `ENCRYPTION_KEY` — generate with `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`
- `POSTGRES_PASSWORD` — strong password
- `REDIS_PASSWORD` — strong password
- `OPENAI_API_KEY` — your OpenAI key

### 2. Build and Launch

```bash
docker compose up -d --build
```

### 3. Access

| Service | URL |
|---------|-----|
| Frontend Portal | http://localhost |
| API Docs (Swagger) | http://localhost/api/docs |
| API Docs (Redoc) | http://localhost/api/redoc |
| Health Check | http://localhost/health |

### 4. Default Credentials

**IMPORTANT: Change immediately after first login.**

- Email: `admin@vanna-platform.local`
- Password: `ChangeMe@123`

---

## Container Architecture

| Container | Image | Port | Purpose |
|-----------|-------|------|---------|
| nginx | nginx:1.25 | 80, 443 | Reverse proxy, rate limiting, TLS termination |
| frontend | node:20 | 3000 | React UI portal |
| backend-api | python:3.11 | 8000 | FastAPI main API |
| vanna-service | python:3.11 | 8001 | Vanna AI engine |
| worker | python:3.11 | — | Celery async worker |
| postgres | postgres:15 | 5432 | Platform metadata database |
| redis | redis:7 | 6379 | Cache, rate limits, task queue |
|ollama | ollama:latest | 11434 | LLM for SQL Generation |

---

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `SECRET_KEY` | JWT signing key (256-bit hex) | Yes |
| `ALGORITHM` | JWT algorithm (default: HS256) | Yes |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT access token TTL | Yes |
| `ENCRYPTION_KEY` | AES-256 Fernet key for DB passwords | Yes |
| `DATABASE_URL` | Async PostgreSQL connection URL | Yes |
| `REDIS_URL` | Redis connection URL | Yes |
| `OPENAI_API_KEY` | OpenAI API key for Vanna | Yes |
|`OLLAMA_BASE_URL` | OpenAI compatible URL | Yes|
| `OLLAMA_MODEL` | OpenAI model name (default: gpt-4o-mini) | No |
| `POSTGRES_USER` | PostgreSQL admin username | Yes |
| `POSTGRES_PASSWORD` | PostgreSQL admin password | Yes |
| `POSTGRES_DB` | PostgreSQL database name | Yes |
| `REDIS_PASSWORD` | Redis auth password | Yes |
|`TRUST_X_FORWARDED` | trust X-Forwarded-For header for logging purposes | No |
|`TRUSTED_PROXIES` | comma-divided list of ip address to trust the X-Forwarded-For from | No |

---

## Production Hardening

1. **TLS**: Mount SSL certificates in `nginx/certs/` and update `nginx.conf` to enable HTTPS on port 443.
2. **Secrets Management**: Use Docker Secrets or Vault instead of `.env` files in production.
3. **Backup**: Set up scheduled PostgreSQL backups via `pg_dump`.
4. **Monitoring**: Mount Prometheus/Grafana alongside the stack for metrics collection.
5. **IP Restrictions**: Set `IP_WHITELIST` in nginx.conf for administrative endpoints.

---

## Scaling

### Horizontal scaling of backend-api:
```yaml
backend-api:
  deploy:
    replicas: 3
```

### Kubernetes (optional):
Convert `docker-compose.yml` to Kubernetes manifests using `kompose convert`, or use the Helm chart (see `k8s/` directory).
