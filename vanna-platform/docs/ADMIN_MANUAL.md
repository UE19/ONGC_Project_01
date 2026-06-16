# Admin Manual
## Vanna AI Database Query Intelligence Platform

---

## Admin Roles

| Role | Capabilities |
|------|-------------|
| **Super Admin** | Full platform control — manage all users, all profiles, all tokens, view all audit logs, change roles |
| **Admin** | Manage users and profiles — cannot elevate to super_admin |
| **User** | Create and query own profiles |
| **API Consumer** | Token-based API access only |

---

## User Management

Navigate to **Users** in the sidebar (Admin+ only).

### Deactivating a User
Click the **user-x icon** next to any active user. The user is deactivated immediately — all their sessions expire and API tokens remain but are tracked.

### Changing User Role (Super Admin only)
Use the role dropdown in the Users table to change any user's role.

---

## Connection Profile Administration

Admins can view and manage **all** connection profiles across all users.

### Security Best Practices
- Require users to use dedicated read-only database accounts
- Enable SSL for all production connections
- Use `allowed_tables` to restrict AI access to specific tables
- Use `allowed_schemas` to restrict cross-schema access

---

## API Token Governance

Monitor token usage in **API Tokens**:
- **Total requests**: how many queries have been made
- **Last used IP**: detect unusual access patterns
- **Status**: immediately revoke suspicious tokens

Rate limits (per-token, per-minute) prevent API abuse.

---

## Audit & Monitoring

All admin actions are logged. The **Audit Logs** page provides:
- **Audit Logs**: all user activity (login, profile changes, token operations)
- **Query History**: every SQL query with generated SQL, execution time, row count, IP
- **Failed Queries**: blocked or errored queries for security review
- **Token Usage**: per-token request statistics

### What is logged:
- User registrations, logins, failed logins (with IP)
- Password changes
- Connection profile create/update/delete/test
- Schema ingestions
- Token create/revoke/rotate
- Every query execution (success, failed, blocked)
- IP address and user agent for all API calls

---

## Dashboard Analytics

The **Dashboard** shows:
- Active users (last 30 days) and total users
- Database profile count
- Query statistics (total, today, failed, success rate)
- Average response time (target: <5 seconds)
- Active/total token count
- Most queried database types
- Query volume trend (last 7 days)

---

## Schema Ingestion Management

After users create connection profiles, admins can:
1. Trigger schema ingestion from Schema Manager
2. Correct metadata descriptions for better AI understanding
3. Add business glossary terms company-wide

Ingestion runs as a background task — the profile's `schema_ingested_at` timestamp updates on completion.

---

## Security Incident Response

If a token is compromised:
1. Go to **API Tokens** → find the token → click **Revoke** immediately
2. Review **Audit Logs** for queries made with that token
3. Check **Query History** for any unusual data access patterns
4. Issue a new rotated token to the legitimate application

---

## Maintenance

### Clearing old audit logs
Celery worker task `worker.archive_old_audit_logs` removes logs older than 90 days. Run manually:
```bash
docker exec vanna_worker celery -A tasks call worker.archive_old_audit_logs
```

### Cleaning expired tokens
Run `worker.cleanup_expired_tokens` to mark expired tokens:
```bash
docker exec vanna_worker celery -A tasks call worker.cleanup_expired_tokens
```
