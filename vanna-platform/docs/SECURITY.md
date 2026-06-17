# Security Configuration Guide
## Vanna AI Database Query Intelligence Platform

---

## Security Overview

The platform implements enterprise-grade security across all layers:

| Layer | Mechanism |
|-------|-----------|
| Transport | TLS/HTTPS (Nginx) |
| Authentication | JWT (HS256) + API Token (SHA-256 hash) |
| Password Storage | bcrypt (cost factor 12) |
| DB Password Storage | AES-256 Fernet encryption |
| Authorization | RBAC (4 roles) |
| Query Security | DML/DDL blocking + SQL injection detection |
| Rate Limiting | Redis-based per-IP and per-token limits |
| Audit | Full immutable audit trail |

---

## TLS/HTTPS Configuration

1. Obtain SSL certificates (Let's Encrypt or corporate CA):
```bash
certbot certonly --standalone -d your-domain.com
```

2. Mount in nginx:
```yaml
volumes:
  - /etc/letsencrypt/live/your-domain.com/fullchain.pem:/etc/nginx/certs/cert.pem
  - /etc/letsencrypt/live/your-domain.com/privkey.pem:/etc/nginx/certs/key.pem
```

3. Update `nginx.conf` to add HTTPS server block with `ssl_certificate` directives.

---

## Password Encryption

User passwords are hashed using bcrypt with cost factor 12:
```python
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
hashed = pwd_context.hash(plain_password)
```

Database connection passwords are encrypted using AES-256 (Fernet) before storage. The `ENCRYPTION_KEY` in `.env` must be kept secret and backed up — losing it means database profiles cannot be decrypted.

---

## API Token Security

- Raw tokens are prefixed with `vanna_` and contain 40 bytes of cryptographic randomness (URL-safe base64)
- Only the SHA-256 hash of the token is stored in the database
- Raw token is shown exactly once at creation — it cannot be recovered
- Tokens can be revoked instantly and rotated (old revoked, new issued)
- Tokens have configurable expiry dates and per-minute rate limits

---

## Query Security Layer

The following SQL operations are **blocked by default** (Phase-1):

```
INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, EXEC, EXECUTE,
CALL, CREATE, RENAME, REPLACE, MERGE, UPSERT, GRANT, REVOKE,
ATTACH, DETACH, LOAD, COPY, BULK, xp_*, sp_*
```

Additionally blocked:
- Multiline SQL injection comments (`/* ... */`)
- Timing attacks (`SLEEP`, `BENCHMARK`, `PG_SLEEP`)
- File operations (`LOAD_FILE`, `INTO OUTFILE`)
- Extended stored procedures (`xp_cmdshell` etc.)

---

## Rate Limiting

| Limit | Value | Configurable |
|-------|-------|-------------|
| Global API | 100 req/min per IP | `RATE_LIMIT_PER_MINUTE` |
| Auth endpoints | 20 req/min per IP | Nginx config |
| Per-token | 60 req/min (default) | Per-token setting |

---

## Role-Based Access Control

| Role | Portal | Profiles | Tokens | Audit | Users |
|------|--------|----------|--------|-------|-------|
| super_admin | Full | All | All | All | All |
| admin | Full | All | All | All | Limited |
| user | Limited | Own only | Own only | None | None |
| api_consumer | None | None | None | None | None |

---

## Audit Trail

Every security-relevant action is logged with:
- Timestamp (UTC)
- User ID
- Action type (enum)
- Resource type and ID
- IP address
- Success/failure status
- Additional details (JSON)

Audit logs are append-only and should be backed up to external storage regularly.

---

## Database Security

1. **Read-only enforcement**: `read_only = True` is always set in Phase-1. The SQL validation layer double-checks this.
2. **Credential isolation**: Each profile uses independent credentials. Compromise of one token cannot affect other profiles.
3. **SSL**: Configure `ssl_mode = require` or higher for production databases.
4. **Allowed tables/schemas**: Restrict token access to specific tables to minimize blast radius.

---

## IP Restrictions (Optional)

To restrict admin portal access to specific IPs, add to `nginx.conf`:
```nginx
location /api/v1/admin/ {
    allow 10.0.0.0/8;
    allow 192.168.0.0/16;
    deny all;
}
```

---

## Incident Response

1. **Compromised API token**: Revoke immediately via `/tokens/{id}/revoke`
2. **Compromised user account**: Deactivate via Users page; review audit logs for the user
3. **SQL injection attempt**: Check failed-queries audit log; the validation layer blocks attempts and logs them
4. **Brute force on login**: Auth rate limit triggers 429; review login_failed audit entries

---

## Security Checklist for Production

- [ ] Change default super_admin password immediately
- [ ] Set a strong, unique `SECRET_KEY` (256-bit)
- [ ] Set a unique `ENCRYPTION_KEY` and back it up securely
- [ ] Enable TLS in nginx
- [ ] Set strong passwords for PostgreSQL and Redis
- [ ] Restrict CORS origins to your known domains
- [ ] Use read-only database users in all connection profiles
- [ ] Enable SSL on all production database connections
- [ ] Configure rate limits appropriate for your load
- [ ] Set up regular audit log backups
- [ ] Monitor the failed-queries and login_failed audit logs
