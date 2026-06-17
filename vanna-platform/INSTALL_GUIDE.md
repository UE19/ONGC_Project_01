# Installation & Setup Guide
## Centralized AI-Powered Database Query Intelligence Platform

Everything you need to download and configure before running the platform.

---

## QUICK OVERVIEW

The platform runs entirely in Docker. You only need 3 things installed on your machine:
1. **Docker Desktop** (includes Docker + Docker Compose)
2. **Git** (to clone/manage the project)
3. **An OpenAI API Key** (for Vanna AI SQL generation)

Everything else (Python, Node.js, PostgreSQL, Redis, Nginx) runs inside containers automatically.

---

## PART 1 — MANDATORY DOWNLOADS

### 1.1 Docker Desktop ⭐ REQUIRED

Docker Desktop is the core requirement. It bundles Docker Engine + Docker Compose.

| OS | Download URL | Minimum Version |
|----|-------------|-----------------|
| Windows 10/11 (64-bit) | https://docs.docker.com/desktop/install/windows-install/ | Docker Desktop 4.20+ |
| macOS (Intel) | https://docs.docker.com/desktop/install/mac-install/ | Docker Desktop 4.20+ |
| macOS (Apple Silicon M1/M2/M3) | https://docs.docker.com/desktop/install/mac-install/ | Docker Desktop 4.20+ |
| Ubuntu / Debian Linux | https://docs.docker.com/desktop/install/linux-install/ | Docker Desktop 4.20+ |

**Post-install verification:**
```bash
docker --version          # Should show: Docker version 24.x or higher
docker compose version    # Should show: Docker Compose version v2.x or higher
```

**Windows-specific notes:**
- Enable WSL 2 backend during Docker Desktop installation (recommended)
- WSL 2 download: https://aka.ms/wsl2kernel
- Ensure "Use the WSL 2 based engine" is checked in Docker Desktop settings

---

### 1.2 Git ⭐ REQUIRED

For version control and project management.

| OS | Download URL |
|----|-------------|
| Windows | https://git-scm.com/download/win |
| macOS | https://git-scm.com/download/mac (or `brew install git`) |
| Linux | `sudo apt install git` or `sudo yum install git` |

**Post-install verification:**
```bash
git --version    # Should show: git version 2.x
```

---

### 1.3 OpenAI API Key ⭐ REQUIRED

Vanna AI uses OpenAI GPT to convert natural language to SQL.

**Steps:**
1. Go to: https://platform.openai.com/signup
2. Create an account or log in
3. Navigate to: https://platform.openai.com/api-keys
4. Click **"Create new secret key"**
5. Copy the key (starts with `sk-...`)
6. Paste it in your `.env` file as `OPENAI_API_KEY=sk-...`

**Cost estimate:** Uses `gpt-4o-mini` by default. Approximately $0.00015 per 1K input tokens.
**Recommended:** Add a usage limit at https://platform.openai.com/account/limits

---

## PART 2 — OPTIONAL BUT RECOMMENDED

### 2.1 Visual Studio Code (Code Editor)

For viewing and editing project files.

- Download: https://code.visualstudio.com/
- Recommended extensions:
  - Docker (ms-azuretools.vscode-docker)
  - Python (ms-python.python)
  - ES7+ React/Redux (dsznajder.es7-react-js-snippets)
  - REST Client (humao.rest-client) — for testing APIs

---

### 2.2 DBeaver (Database GUI)

For viewing the PostgreSQL metadata database visually.

- Download: https://dbeaver.io/download/
- Connect to: `localhost:5432` with credentials from your `.env` file

---

### 2.3 Postman or Bruno (API Testing)

For testing the REST API endpoints directly.

| Tool | Download |
|------|---------|
| Postman | https://www.postman.com/downloads/ |
| Bruno (offline, free) | https://www.usebruno.com/ |

---

## PART 3 — ACCOUNTS & CREDENTIALS NEEDED

| Service | Purpose | Where to Get |
|---------|---------|--------------|
| OpenAI Account | Vanna AI SQL generation | https://platform.openai.com |
| Docker Hub (optional) | Pull base images | Pre-configured, no login needed for public images |

**No other cloud accounts are required.** The entire platform runs locally.

---

## PART 4 — SYSTEM REQUIREMENTS

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 8 GB | 16 GB |
| Free Disk Space | 10 GB | 20 GB |
| CPU | 4 cores | 8 cores |
| OS | Windows 10 (2004+), macOS 12+, Ubuntu 20.04+ | Latest version |
| Internet | Required for initial Docker image pull + OpenAI API calls | Stable broadband |

---

## PART 5 — STEP-BY-STEP SETUP

### Step 1: Verify Docker is Running

Open a terminal and run:
```bash
docker info
```
You should see Docker system information. If you see "Cannot connect to the Docker daemon", open Docker Desktop first.

---

### Step 2: Copy and Configure the Environment File

Navigate to the project folder:
```bash
cd "D:\ONGC RAM proj\vanna-platform"
```

Copy the example env file:
```bash
# Windows (Command Prompt)
copy .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

Open `.env` in any text editor and fill in:

```env
# REQUIRED — Generate a random 256-bit key:
# Run: python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=paste_your_generated_key_here

# REQUIRED — Generate a Fernet encryption key:
# Run: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
ENCRYPTION_KEY=paste_your_fernet_key_here

# REQUIRED — Your OpenAI API key
OPENAI_API_KEY=sk-your-openai-api-key-here

# CHANGE — Strong database password
POSTGRES_PASSWORD=choose_a_strong_db_password

# CHANGE — Strong Redis password
REDIS_PASSWORD=choose_a_strong_redis_password
```

**Quick key generation (if Python is installed):**
```bash
# SECRET_KEY
python -c "import secrets; print(secrets.token_hex(32))"

# ENCRYPTION_KEY (requires cryptography package)
pip install cryptography
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

**If Python is NOT installed locally**, you can generate them after Docker is running:
```bash
docker run --rm python:3.11-alpine python -c "import secrets; print(secrets.token_hex(32))"
docker run --rm python:3.11-alpine sh -c "pip install cryptography -q && python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\""
```

---

### Step 3: Start All Services

```bash
cd "D:\ONGC RAM proj\vanna-platform"
docker compose up -d
```

This will:
1. Pull base images (postgres:15-alpine, redis:7-alpine) — one-time, ~500 MB
2. Build all 5 custom images (backend, frontend, vanna-service, worker, nginx) — ~5 min first time
3. Start all 7 containers
4. Initialize the PostgreSQL database with `database/init.sql` automatically

**Expected output:**
```
✔ Container vanna_postgres       Started
✔ Container vanna_redis          Started
✔ Container vanna_backend        Started
✔ Container vanna_ai_service     Started
✔ Container vanna_worker         Started
✔ Container vanna_frontend       Started
✔ Container vanna_nginx          Started
```

---

### Step 4: Verify Everything is Running

```bash
docker compose ps
```

All containers should show `Up` or `Up (healthy)`.

Check backend health:
```bash
curl http://localhost/health
# Response: {"status":"ok","service":"vanna-backend-api"}
```

Check Vanna AI service health:
```bash
curl http://localhost/api/v1/health/vanna
# Response: {"vanna_service":"ok"}
```

---

### Step 5: Access the Platform

| Service | URL | Notes |
|---------|-----|-------|
| **Admin Portal** | http://localhost | Main web interface |
| **API Swagger Docs** | http://localhost/api/docs | Interactive API documentation |
| **API ReDoc** | http://localhost/api/redoc | Alternative API docs |
| **Backend direct** | http://localhost:8000 | Direct backend (bypass nginx) |
| **Vanna Service** | http://localhost:8001 | AI microservice direct |

---

### Step 6: First Login

Default super admin credentials (change immediately):

| Field | Value |
|-------|-------|
| Email | `admin@vanna-platform.local` |
| Password | `ChangeMe@123` |

**After first login:**
1. Go to **Settings** → Change password immediately
2. Create your first database connection profile
3. Run schema ingestion
4. Generate an API token

---

## PART 6 — WHAT EACH CONTAINER DOWNLOADS AUTOMATICALLY

When you run `docker compose up -d`, Docker automatically downloads these:

| Container | Base Image | Size | Downloads From |
|-----------|-----------|------|----------------|
| postgres | `postgres:15-alpine` | ~80 MB | Docker Hub |
| redis | `redis:7-alpine` | ~30 MB | Docker Hub |
| backend-api | `python:3.11-slim` | ~130 MB | Docker Hub |
| vanna-service | `python:3.11-slim` | ~130 MB | Docker Hub |
| worker | `python:3.11-slim` | ~130 MB | Docker Hub |
| frontend | `node:20-alpine` | ~170 MB | Docker Hub |
| nginx | `nginx:1.25-alpine` | ~20 MB | Docker Hub |

**Python packages installed automatically inside containers:**

Backend (`backend/requirements.txt`):
```
fastapi, uvicorn, sqlalchemy[asyncio], asyncpg, psycopg2-binary,
alembic, pydantic, python-jose[cryptography], passlib[bcrypt],
cryptography, redis, celery, httpx, openpyxl, pandas,
sqlparse, pymysql, pymssql, cx_Oracle, pymongo, structlog,
python-multipart, python-dotenv, slowapi
```

Vanna AI Service (`vanna-service/requirements.txt`):
```
vanna, chromadb, openai, fastapi, uvicorn, httpx, structlog
```

Worker (`worker/requirements.txt`):
```
celery, redis, sqlalchemy, asyncpg, psycopg2-binary, vanna, structlog
```

**Frontend packages installed automatically:**
```
react, react-dom, react-router-dom, @tanstack/react-query,
axios, tailwindcss, recharts, react-syntax-highlighter, lucide-react
```

---

## PART 7 — DATABASE DRIVERS FOR TARGET DATABASES

The platform connects to your enterprise databases. Drivers are pre-installed inside containers, but the **target databases** must be reachable from Docker:

| Database | Driver Used | Connection Format |
|----------|------------|-------------------|
| PostgreSQL | asyncpg | `postgresql+asyncpg://user:pass@host:5432/dbname` |
| MySQL / MariaDB | pymysql | `mysql+pymysql://user:pass@host:3306/dbname` |
| Microsoft SQL Server | pymssql | `mssql+pymssql://user:pass@host:1433/dbname` |
| Oracle Database | cx_Oracle | `oracle+cx_oracle://user:pass@host:1521/servicename` |
| MongoDB | pymongo | Direct URI: `mongodb://user:pass@host:27017/dbname` |

**Oracle-specific note:** cx_Oracle requires Oracle Instant Client libraries. These are installed inside the worker/backend containers. If you encounter Oracle connection issues, check the `oracle_instantclient` layer in `backend/Dockerfile`.

---

## PART 8 — FIREWALL / NETWORK PORTS

Ensure these ports are available on your machine:

| Port | Service | Required |
|------|---------|----------|
| 80 | Nginx (main entry point) | ✅ Yes |
| 443 | Nginx HTTPS (if TLS enabled) | Optional |
| 8000 | Backend API (direct) | Optional |
| 8001 | Vanna AI Service (direct) | Optional |
| 5432 | PostgreSQL | Internal only |
| 6379 | Redis | Internal only |

**To check if ports are free:**
```bash
# Windows
netstat -ano | findstr ":80"

# Linux / macOS
lsof -i :80
```

---

## PART 9 — STOPPING & RESTARTING

```bash
# Stop all containers (data preserved)
docker compose down

# Stop and remove all data (DESTRUCTIVE — deletes database)
docker compose down -v

# Restart a single container
docker compose restart backend-api

# View logs
docker compose logs -f backend-api
docker compose logs -f vanna-service
docker compose logs -f worker

# Rebuild after code changes
docker compose build backend-api
docker compose up -d backend-api
```

---

## PART 10 — TROUBLESHOOTING

### Container won't start
```bash
docker compose logs <container_name>
# Example: docker compose logs vanna-service
```

### Port 80 already in use
Edit `docker-compose.yml`, change nginx ports from `"80:80"` to e.g. `"8080:80"`, then access at `http://localhost:8080`.

### OpenAI API errors
- Verify `OPENAI_API_KEY` in `.env` is correct
- Check OpenAI usage limits at https://platform.openai.com/account/usage
- Ensure the API key has access to `gpt-4o-mini` model

### Database connection test fails
- Ensure the target database is accessible from the Docker network
- If database is on the same machine, use `host.docker.internal` instead of `localhost` as the host
- Example: Host = `host.docker.internal`, Port = `5432`

### Backend shows "ENCRYPTION_KEY invalid"
The `ENCRYPTION_KEY` must be a valid Fernet key (44 characters, base64 URL-safe).
Generate correctly with:
```bash
docker run --rm python:3.11-alpine sh -c "pip install cryptography -q && python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\""
```

### Vanna AI service shows "model not found"
The default model is `gpt-4o-mini`. If you want to use a different model, set `OLLAMA_MODEL=gpt-4o` in `.env`.

---

## PART 11 — PRODUCTION HARDENING CHECKLIST

Before deploying to production:

- [ ] Change `SECRET_KEY` to a cryptographically random 256-bit value
- [ ] Change `ENCRYPTION_KEY` to a new Fernet key
- [ ] Change `POSTGRES_PASSWORD` to a strong password
- [ ] Change `REDIS_PASSWORD` to a strong password
- [ ] Change default admin password (`ChangeMe@123`) immediately after first login
- [ ] Set `ENVIRONMENT=production` in `.env`
- [ ] Enable TLS — add SSL cert paths to `nginx/nginx.conf` (see `docs/SECURITY.md`)
- [ ] Set `CORS_ORIGINS` to your actual domain(s)
- [ ] Set `RATE_LIMIT_PER_MINUTE` appropriate for your load
- [ ] Configure log rotation for Docker container logs
- [ ] Set up database backups for the PostgreSQL `vanna_platform` database

---

## PART 12 — SUMMARY: MINIMUM DOWNLOAD CHECKLIST

| # | Item | Download From | Time |
|---|------|--------------|------|
| ✅ 1 | Docker Desktop | https://docs.docker.com/desktop/ | ~10 min |
| ✅ 2 | Git | https://git-scm.com/downloads | ~2 min |
| ✅ 3 | OpenAI Account + API Key | https://platform.openai.com | ~5 min |
| ✅ 4 | Configure `.env` file | In project folder | ~3 min |
| ✅ 5 | Run `docker compose up -d` | Auto-downloads everything else | ~10 min (first time) |

**Total setup time: ~30 minutes for first-time setup.**
**Subsequent starts: `docker compose up -d` in ~10 seconds.**
